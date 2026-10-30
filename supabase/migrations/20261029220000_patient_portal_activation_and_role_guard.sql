-- ==============================================================================
-- SYNKRO — MIGRACIÓN INCREMENTAL: ACTIVACIÓN FLUIDA DEL PORTAL DE PACIENTES
-- 1. Consulta pública/segura del estado del token de invitación
-- 2. Guard para evitar la creación de organizaciones y profesionales fantasmas al registrar pacientes
-- 3. Reconocimiento seguro del rol 'patient' en la activación de cuentas
-- ==============================================================================

-- 1. Actualizar handle_new_user para admitir 'patient' explícito de forma segura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_role text;
  v_default_name text;
begin
  -- Solo permitimos 'patient' si viene explícitamente en metadata de activación;
  -- de lo contrario, por defecto para nuevos psicólogos en /registrarse es 'owner'.
  -- Roles privilegiados ('superadmin', 'admin', 'assistant') son bloqueados.
  if lower(trim(coalesce(new.raw_user_meta_data->>'role', ''))) = 'patient' then
    v_role := 'patient';
    v_default_name := 'Paciente';
  else
    v_role := 'owner';
    v_default_name := 'Nuevo Profesional';
  end if;

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    role,
    platform_role,
    license_number
  )
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), v_default_name),
    new.raw_user_meta_data->>'avatar_url',
    v_role,
    'user',  -- Forzado: rol de plataforma estrictamente no privilegiado
    nullif(trim(new.raw_user_meta_data->>'license_number'), '')
  )
  on conflict (id) do update set
    full_name = coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), profiles.full_name),
    avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', profiles.avatar_url),
    role = case
      when profiles.role = 'superadmin' then profiles.role
      else v_role
    end,
    license_number = coalesce(nullif(trim(new.raw_user_meta_data->>'license_number'), ''), profiles.license_number),
    updated_at = now();

  return new;
end;
$$;

-- 2. Actualizar create_default_workspace para omitir creación de consultorios a pacientes
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  new_org uuid;
  base_name text;
  clean_slug text;
  final_slug text;
  suffix text;
  user_meta jsonb;
  meta_clinic_name text;
  meta_org_type text;
begin
  -- Si el usuario ya posee una membresía organizativa previa, no duplicar espacio
  if exists (
    select 1 from public.organization_members where user_id = new.id
  ) then
    return new;
  end if;

  -- Extraer metadata del usuario de forma segura desde auth.users
  select raw_user_meta_data into user_meta from auth.users where id = new.id;

  -- Si el usuario es un paciente, no crear organización clínica, ni registro profesional, ni suscripción
  if new.role = 'patient' or lower(trim(coalesce(user_meta->>'role', ''))) = 'patient' then
    return new;
  end if;

  meta_clinic_name := trim(user_meta->>'clinic_name');
  meta_org_type := trim(user_meta->>'organization_type');

  if meta_org_type not in ('independent', 'clinic') then
    meta_org_type := 'independent';
  end if;

  base_name := coalesce(nullif(meta_clinic_name, ''), nullif(trim(new.full_name), ''), 'Mi Consulta');
  
  -- Sanitizar nombre para slug alfanumérico seguro
  clean_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  clean_slug := trim(both '-' from clean_slug);
  if clean_slug = '' then
    clean_slug := 'clinica';
  end if;

  suffix := substr(replace(new.id::text, '-', ''), 1, 8);
  final_slug := clean_slug || '-' || suffix;

  -- 1. Insertar Organización con tipo
  insert into public.organizations (name, slug, organization_type)
  values (
    case 
      when meta_clinic_name is not null and meta_clinic_name <> '' then meta_clinic_name
      when meta_org_type = 'clinic' then base_name || ' | Centro Psicológico'
      else base_name || ' | Consulta Privada'
    end,
    final_slug,
    meta_org_type
  )
  returning id into new_org;

  -- 2. Insertar Membresía como Propietario (owner)
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org, new.id, 'owner');

  -- 3. Crear Registro en public.professionals para el titular
  insert into public.professionals (
    organization_id,
    profile_id,
    specialty,
    license_number
  )
  values (
    new_org,
    new.id,
    coalesce(nullif(trim(user_meta->>'specialty'), ''), 'Psicología General'),
    nullif(trim(new.license_number), '')
  );

  -- 4. Crear Suscripción de Prueba de 14 días para la organización
  insert into public.subscriptions (
    organization_id,
    plan,
    status,
    trial_start_at,
    trial_end_at,
    created_at,
    updated_at
  )
  values (
    new_org,
    'starter',
    'trialing',
    now(),
    now() + interval '14 days',
    now(),
    now()
  )
  on conflict (organization_id) do nothing;

  return new;
end;
$$;

-- 3. Función segura para obtener información de la invitación antes de activar
CREATE OR REPLACE FUNCTION public.get_patient_portal_invitation_info(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
declare
  v_patient record;
  v_org record;
begin
  if p_token is null or length(trim(p_token)) < 16 then
    return jsonb_build_object('valid', false, 'error', 'Token de invitación no válido o inexistente.');
  end if;

  select * into v_patient
  from public.patients
  where portal_invitation_token = p_token
    and portal_status = 'invited';

  if not found then
    return jsonb_build_object('valid', false, 'error', 'La invitación no es válida, ya fue utilizada o fue cancelada.');
  end if;

  if v_patient.portal_invitation_sent_at < now() - interval '7 days' then
    return jsonb_build_object('valid', false, 'error', 'La invitación ha expirado (validez máxima de 7 días). Solicita a tu consultorio un nuevo enlace.');
  end if;

  select * into v_org
  from public.organizations
  where id = v_patient.organization_id;

  return jsonb_build_object(
    'valid', true,
    'patient_id', v_patient.id,
    'first_name', v_patient.first_name,
    'last_name', v_patient.last_name,
    'email', v_patient.email,
    'organization_name', coalesce(v_org.name, 'Consultorio Psicológico')
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.get_patient_portal_invitation_info(text) TO anon, authenticated;
