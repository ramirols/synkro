-- ==============================================================================
-- SYNKRO — MIGRACIÓN INCREMENTAL: PLAN GRATUITO Y ACTIVACIÓN MEJORADA DEL PORTAL
-- 1. Incorporación del Plan Gratuito ('free') en public.subscriptions
-- 2. Restricciones reales de pacientes (5 máx) y terapeutas (1 máx) para Plan Gratuito
-- 3. Asignación del Plan Gratuito por defecto al registrarse
-- 4. Extensión de funciones de activación del portal para sincronizar datos del paciente
-- ==============================================================================

-- 1. Actualizar restricción de planes en subscriptions
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check 
  CHECK (plan IN ('free', 'starter', 'professional', 'clinic'));

-- 2. Actualizar triggers de límites de pacientes
CREATE OR REPLACE FUNCTION public.enforce_plan_patient_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_plan text;
  v_current_count integer;
begin
  if public.is_superadmin() then
    return new;
  end if;

  select plan into v_plan from public.subscriptions where organization_id = new.organization_id;

  -- 1. Plan Gratuito: Permite hasta 5 pacientes activos (protege recursos en Supabase Free Tier)
  if v_plan = 'free' then
    select count(*) into v_current_count
    from public.patients
    where organization_id = new.organization_id;

    if v_current_count >= 5 then
      raise exception 'Límite alcanzado: El Plan Gratuito permite hasta 5 pacientes activos. Para registrar más pacientes y expandir tu práctica, actualiza a Plan Starter o Professional en /suscripcion.';
    end if;

  -- 2. Plan Starter: Permite hasta 20 pacientes activos
  elsif v_plan = 'starter' then
    select count(*) into v_current_count
    from public.patients
    where organization_id = new.organization_id;

    if v_current_count >= 20 then
      raise exception 'Límite alcanzado: El Plan Starter permite hasta 20 pacientes activos. Para registrar más pacientes, actualiza al Plan Professional en /suscripcion.';
    end if;
  end if;

  return new;
end;
$$;

-- 3. Actualizar trigger de límite de profesionales
CREATE OR REPLACE FUNCTION public.enforce_plan_professional_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_plan text;
  v_current_count integer;
begin
  if public.is_superadmin() then
    return new;
  end if;

  select plan into v_plan from public.subscriptions where organization_id = new.organization_id;

  -- Free, Starter y Professional: 1 único profesional titular
  if v_plan in ('free', 'starter', 'professional') then
    select count(*) into v_current_count
    from public.professionals
    where organization_id = new.organization_id;

    if v_current_count >= 1 then
      raise exception 'Límite alcanzado: Tu plan actual admite 1 único profesional titular. Para incorporar más terapeutas a tu equipo, actualiza al Plan Clínica en /suscripcion.';
    end if;

  -- Clinic: Hasta 10 profesionales
  elsif v_plan = 'clinic' then
    select count(*) into v_current_count
    from public.professionals
    where organization_id = new.organization_id;

    if v_current_count >= 10 then
      raise exception 'Límite alcanzado: El Plan Clínica incluye hasta 10 profesionales activos. Contáctanos para ampliar la capacidad de tu centro.';
    end if;
  end if;

  return new;
end;
$$;

-- 4. Actualizar create_default_workspace para registrar por defecto en Plan Gratuito ('free')
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
  v_plan text;
begin
  -- Si el usuario ya posee una membresía organizativa previa, no duplicar espacio
  if exists (
    select 1 from public.organization_members where user_id = new.id
  ) then
    return new;
  end if;

  -- Extraer metadata del usuario de forma segura desde auth.users
  select raw_user_meta_data into user_meta from auth.users where id = new.id;

  -- Si el usuario es un paciente, omitir la creación de consultorios
  if new.role = 'patient' or lower(trim(coalesce(user_meta->>'role', ''))) = 'patient' then
    return new;
  end if;

  meta_clinic_name := trim(user_meta->>'clinic_name');
  meta_org_type := trim(user_meta->>'organization_type');

  if meta_org_type not in ('independent', 'clinic') then
    meta_org_type := 'independent';
  end if;

  base_name := coalesce(nullif(meta_clinic_name, ''), nullif(trim(new.full_name), ''), 'Mi Consulta');
  
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

  -- 4. Asignar Suscripción: Plan Gratuito ('free') por defecto en periodo de prueba de 14 días
  v_plan := lower(trim(coalesce(user_meta->>'requested_plan', user_meta->>'plan', 'free')));
  if v_plan not in ('free', 'starter', 'professional', 'clinic') then
    v_plan := 'free';
  end if;

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
    v_plan,
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

-- 5. Actualizar get_org_subscription_details
CREATE OR REPLACE FUNCTION public.get_org_subscription_details(p_org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  sub record;
  org record;
  p_count integer;
  prof_count integer;
  eff_status text;
  days_rem integer;
  target_date timestamptz;
begin
  if p_org_id is null then
    return null;
  end if;

  if not (public.is_member_of(p_org_id) or public.is_superadmin()) then
    raise exception 'Operación no autorizada: No tienes acceso a los datos comerciales de esta organización.';
  end if;

  select * into org from public.organizations where id = p_org_id;
  select * into sub from public.subscriptions where organization_id = p_org_id;

  if not found then
    return null;
  end if;

  select count(*) into p_count from public.patients where organization_id = p_org_id;
  select count(*) into prof_count from public.professionals where organization_id = p_org_id;

  -- Determinar estado efectivo y fecha objetivo
  if sub.status = 'active' then
    target_date := coalesce(sub.current_period_end, sub.trial_end_at);
    if sub.current_period_end is not null and sub.current_period_end < now() then
      eff_status := 'past_due';
    else
      eff_status := 'active';
    end if;
  elsif sub.status = 'trialing' then
    target_date := sub.trial_end_at;
    if target_date < now() then
      eff_status := 'expired';
    else
      eff_status := 'trialing';
    end if;
  else
    eff_status := sub.status;
    target_date := coalesce(sub.current_period_end, sub.trial_end_at);
  end if;

  if target_date is not null and target_date > now() then
    days_rem := ceil(extract(epoch from (target_date - now())) / 86400.0)::integer;
  else
    days_rem := 0;
  end if;

  return jsonb_build_object(
    'id', sub.id,
    'organization_id', sub.organization_id,
    'organization_name', org.name,
    'organization_type', coalesce(org.organization_type, 'independent'),
    'plan', sub.plan,
    'status', sub.status,
    'effective_status', eff_status,
    'trial_start_at', sub.trial_start_at,
    'trial_end_at', sub.trial_end_at,
    'current_period_start', sub.current_period_start,
    'current_period_end', sub.current_period_end,
    'cancel_at_period_end', sub.cancel_at_period_end,
    'last_payment_date', sub.last_payment_date,
    'payment_method', sub.payment_method,
    'days_remaining', days_rem,
    'is_active', public.is_org_subscription_active(p_org_id),
    'patient_count', p_count,
    'professional_count', prof_count
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.get_org_subscription_details(uuid) TO authenticated, anon;

-- 6. Actualizar get_patient_portal_invitation_info para incluir teléfono y fecha de nacimiento
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
    'phone', v_patient.phone,
    'birth_date', v_patient.birth_date,
    'organization_name', coalesce(v_org.name, 'Consultorio Psicológico')
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.get_patient_portal_invitation_info(text) TO anon, authenticated;

-- 7. Eliminar versiones anteriores sobrecargadas para evitar ambigüedades
DROP FUNCTION IF EXISTS public.accept_patient_portal_invitation(text);
DROP FUNCTION IF EXISTS public.accept_patient_portal_invitation(text, text, text, text, date);

-- 8. Crear la función única de aceptación de invitación
CREATE OR REPLACE FUNCTION public.accept_patient_portal_invitation(
  p_token text,
  p_first_name text default null,
  p_last_name text default null,
  p_phone text default null,
  p_birth_date date default null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
declare
  v_patient record;
  v_auth_email text;
  v_caller_uid uuid;
begin
  v_caller_uid := auth.uid();
  if v_caller_uid is null then
    raise exception 'Debes iniciar sesión con tu cuenta de paciente para aceptar la invitación.';
  end if;

  v_auth_email := lower(public.get_auth_email());
  if v_auth_email is null then
    raise exception 'No se pudo verificar el correo electrónico de tu cuenta autenticada.';
  end if;

  -- Buscar paciente con el token provisto
  select * into v_patient
  from public.patients
  where portal_invitation_token = p_token
    and portal_status = 'invited';

  if not found then
    raise exception 'Enlace de invitación inválido, ya utilizado o caducado.';
  end if;

  -- Validar vigencia (máximo 7 días)
  if v_patient.portal_invitation_sent_at < now() - interval '7 days' then
    raise exception 'La invitación ha expirado. Solicita a tu consultorio un nuevo enlace de acceso.';
  end if;

  -- Validar coincidencia si el paciente ya tenía correo registrado por el psicólogo
  if v_patient.email is not null and length(trim(v_patient.email)) > 0 then
    if lower(trim(v_patient.email)) <> v_auth_email then
      raise exception 'El correo de tu cuenta activa (%s) no coincide con el correo invitado (%s).', v_auth_email, v_patient.email;
    end if;
  end if;

  -- Validar que el usuario no esté ya vinculado a otro paciente en esta misma clínica
  if exists (
    select 1 from public.patients
    where organization_id = v_patient.organization_id
      and user_id = v_caller_uid
      and id <> v_patient.id
  ) then
    raise exception 'Tu cuenta ya se encuentra vinculada a otro expediente en este centro clínico.';
  end if;

  -- Vincular formalmente y actualizar datos verificados del paciente
  update public.patients
  set user_id = v_caller_uid,
      portal_status = 'active',
      portal_invitation_token = null,
      portal_invitation_accepted_at = now(),
      email = v_auth_email,
      first_name = coalesce(nullif(trim(p_first_name), ''), first_name),
      last_name = coalesce(nullif(trim(p_last_name), ''), last_name),
      phone = coalesce(nullif(trim(p_phone), ''), phone),
      birth_date = coalesce(p_birth_date, birth_date)
  where id = v_patient.id;

  -- Asegurar que el usuario tenga el rol de 'patient' en profiles
  update public.profiles
  set role = 'patient',
      full_name = coalesce(nullif(trim(coalesce(p_first_name, '') || ' ' || coalesce(p_last_name, '')), ''), profiles.full_name)
  where id = v_caller_uid;

  -- Asegurar que exista membresía del paciente en la organización
  insert into public.organization_members (organization_id, user_id, role)
  values (v_patient.organization_id, v_caller_uid, 'patient')
  on conflict (organization_id, user_id)
  do update set role = 'patient';

  -- Registrar en auditoría
  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) values (
    v_caller_uid,
    'PORTAL_INVITATION_ACCEPTED',
    'patients',
    v_patient.id,
    jsonb_build_object(
      'patient_id', v_patient.id,
      'user_id', v_caller_uid,
      'email', v_auth_email,
      'organization_id', v_patient.organization_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'patient_id', v_patient.id,
    'organization_id', v_patient.organization_id,
    'email', v_auth_email
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.accept_patient_portal_invitation(text, text, text, text, date) TO authenticated;
