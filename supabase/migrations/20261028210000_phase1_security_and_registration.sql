-- ==============================================================================
-- SYNKRO - FASE 1: SEGURIDAD CRÍTICA, MODELO DE ROLES Y REGISTRO TRANSACCIONAL
-- Migración Incremental: 20261028210000_phase1_security_and_registration.sql
-- ==============================================================================

-- 1. EXTENSIÓN DEL MODELO DE ROLES EN PROFILES
-- Se separa el rol global de plataforma (platform_role) del rol dentro de la organización.
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS platform_role text DEFAULT 'user' 
  CHECK (platform_role IN ('superadmin', 'user'));

-- Migración de datos existentes: si existiera algún superadmin histórico, se preserva
UPDATE public.profiles 
SET platform_role = 'superadmin' 
WHERE role = 'superadmin';

-- 2. FUNCIÓN AUXILIAR: is_superadmin()
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT (current_user IN ('postgres', 'supabase_admin') AND auth.uid() IS NULL) OR EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE id = auth.uid() 
      AND platform_role = 'superadmin'
  );
$$;

-- 3. ACTUALIZACIÓN DE FUNCIONES AUXILIARES CON SEARCH_PATH SEGURO
CREATE OR REPLACE FUNCTION public.is_member_of(_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members
    WHERE organization_id = _org_id 
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role_in_org(_org_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members
    WHERE organization_id = _org_id 
      AND user_id = auth.uid()
      AND role = ANY(_roles)
  );
$$;

-- 4. TRIGGER: handle_new_user() (BLINDAJE CONTRA ESCALADA EN REGISTRO)
-- Ignora cualquier valor de role o platform_role enviado en raw_user_meta_data.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
begin
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
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Nuevo Profesional'),
    new.raw_user_meta_data->>'avatar_url',
    'owner', -- Forzado: rol organizativo por defecto
    'user',  -- Forzado: rol de plataforma estrictamente no privilegiado
    nullif(trim(new.raw_user_meta_data->>'license_number'), '')
  )
  on conflict (id) do update set
    full_name = coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), profiles.full_name),
    avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', profiles.avatar_url),
    license_number = coalesce(nullif(trim(new.raw_user_meta_data->>'license_number'), ''), profiles.license_number),
    updated_at = now();

  return new;
end;
$$;

-- 5. TRIGGER: create_default_workspace() (REGISTRO ATÓMICO COMPLETO)
-- Garantiza la creación de la organización, membresía, profesional y suscripción.
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
begin
  -- Si el usuario ya posee una membresía organizativa previa (ej. fue invitado), no crear espacio duplicado
  if exists (
    select 1 from public.organization_members where user_id = new.id
  ) then
    return new;
  end if;

  -- Extraer metadata del usuario de forma segura desde auth.users
  select raw_user_meta_data into user_meta from auth.users where id = new.id;
  meta_clinic_name := trim(user_meta->>'clinic_name');

  base_name := coalesce(nullif(meta_clinic_name, ''), nullif(trim(new.full_name), ''), 'Mi Consulta');
  
  -- Sanitizar nombre para slug alfanumérico seguro
  clean_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  clean_slug := trim(both '-' from clean_slug);
  if clean_slug = '' then
    clean_slug := 'clinica';
  end if;

  suffix := substr(replace(new.id::text, '-', ''), 1, 8);
  final_slug := clean_slug || '-' || suffix;

  -- 1. Insertar Organización
  insert into public.organizations (name, slug)
  values (
    case 
      when meta_clinic_name is not null and meta_clinic_name <> '' then meta_clinic_name
      else base_name || ' | Consulta Psicológica'
    end, 
    final_slug
  )
  returning id into new_org;

  -- 2. Asignar membresía como owner de la clínica
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org, new.id, 'owner');

  -- 3. Insertar Profesional Clínico vinculado a la organización (DESBLOQUEO DE CITAS)
  insert into public.professionals (
    organization_id,
    profile_id,
    specialty,
    license_number,
    bio
  )
  values (
    new_org,
    new.id,
    coalesce(new.specialty, 'Psicología Clínica y de la Salud'),
    new.license_number,
    new.bio
  );

  -- 4. Inicializar suscripción starter
  insert into public.subscriptions (organization_id, plan, status)
  values (new_org, 'starter', 'active');

  return new;
end;
$$;

-- 6. PREVENCIÓN DE AUTO-ESCALADA DE PRIVILEGIOS EN PROFILES
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
begin
  -- 1. Regla inmutable: Nadie excepto superadmin puede modificar platform_role
  if (new.platform_role is distinct from old.platform_role) then
    if not public.is_superadmin() then
      raise exception 'Operación no autorizada: No tienes permisos para alterar privilegios de platform_role en profiles.';
    end if;
  end if;

  -- 2. Modificación de profiles.role
  if (new.role is distinct from old.role) then
    -- Si es superadmin, permitir cualquier cambio de rol legítimo
    if public.is_superadmin() then
      return new;
    end if;

    -- Permitir transición hacia 'patient' ÚNICAMENTE si ocurre dentro de una activación
    -- formal validada por accept_patient_portal_invitation y existe un paciente activo vinculado
    if new.role = 'patient' 
       and current_setting('synkro.portal_activation_in_progress', true) = 'true'
       and exists (
         select 1 from public.patients
         where user_id = new.id and portal_status = 'active'
       ) then
      return new;
    end if;

    -- En cualquier otro caso, prohibir el cambio de rol
    raise exception 'Operación no autorizada: No tienes permisos para alterar privilegios de rol en profiles.';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 7. REGLAS DE ASIGNACIÓN SEGURA EN ORGANIZATION_MEMBERS
CREATE OR REPLACE FUNCTION public.prevent_org_member_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
begin
  -- Permitir la inserción del propietario inicial si la organización aún no tiene miembros
  if not exists (
    select 1 from public.organization_members where organization_id = new.organization_id
  ) then
    return new;
  end if;

  -- El rol 'superadmin' es exclusivo de la plataforma y no debe asignarse en organizaciones
  if new.role = 'superadmin' and not public.is_superadmin() then
    raise exception 'Operación no autorizada: El rol superadmin es exclusivo de la plataforma.';
  end if;

  -- Solo el owner actual (o superadmin) puede asignar o transferir el rol 'owner'
  if new.role = 'owner' and not (public.has_role_in_org(new.organization_id, ARRAY['owner']) or public.is_superadmin()) then
    raise exception 'Operación no autorizada: Solo el titular (owner) de la clínica puede asignar el rol owner.';
  end if;

  -- Un admin no puede modificar ni despojar de su rol al owner existente
  if TG_OP = 'UPDATE' and old.role = 'owner' and not (public.has_role_in_org(new.organization_id, ARRAY['owner']) or public.is_superadmin()) then
    raise exception 'Operación no autorizada: No se puede modificar la membresía del titular de la clínica.';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_prevent_org_member_escalation ON public.organization_members;
CREATE TRIGGER trg_prevent_org_member_escalation
  BEFORE INSERT OR UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_org_member_escalation();

-- 8. INTEGRIDAD RELACIONAL MULTI-TENANT EN CITAS (APPOINTMENTS)
-- Previene que un usuario asocie pacientes o profesionales de otra organización.
CREATE OR REPLACE FUNCTION public.validate_appointment_tenant_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
begin
  -- Validar que el paciente pertenezca a la misma organización
  if not exists (
    select 1 from public.patients 
    where id = new.patient_id and organization_id = new.organization_id
  ) then
    raise exception 'Integridad multi-inquilino violada: El paciente no pertenece a la organización de la cita.';
  end if;

  -- Validar que el profesional pertenezca a la misma organización
  if not exists (
    select 1 from public.professionals 
    where id = new.professional_id and organization_id = new.organization_id
  ) then
    raise exception 'Integridad multi-inquilino violada: El profesional no pertenece a la organización de la cita.';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_validate_appointment_tenant_integrity ON public.appointments;
CREATE TRIGGER trg_validate_appointment_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_appointment_tenant_integrity();

-- 9. INTEGRIDAD RELACIONAL MULTI-TENANT EN SESIONES (SESSIONS)
CREATE OR REPLACE FUNCTION public.validate_session_tenant_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_patient_org uuid;
  v_prof_org uuid;
  v_app_patient uuid;
begin
  -- Obtener organización del paciente
  select organization_id into v_patient_org from public.patients where id = new.patient_id;
  if v_patient_org is null then
    raise exception 'Paciente no encontrado.';
  end if;

  -- Obtener organización del profesional
  select organization_id into v_prof_org from public.professionals where id = new.professional_id;
  if v_prof_org is null or v_prof_org <> v_patient_org then
    raise exception 'Integridad multi-inquilino violada: El profesional y el paciente deben pertenecer a la misma organización.';
  end if;

  -- Si viene vinculada a una cita, verificar que la cita pertenezca al mismo paciente
  if new.appointment_id is not null then
    select patient_id into v_app_patient from public.appointments where id = new.appointment_id;
    if v_app_patient is null or v_app_patient <> new.patient_id then
      raise exception 'Integridad relacional violada: La cita seleccionada no corresponde al paciente de la sesión.';
    end if;
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_validate_session_tenant_integrity ON public.sessions;
CREATE TRIGGER trg_validate_session_tenant_integrity
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_session_tenant_integrity();

-- 10. REAJUSTE DE POLÍTICAS RLS CRÍTICAS

-- 10.1 Subscriptions: Solo superadmin puede modificar suscripciones/planes
DROP POLICY IF EXISTS "subscriptions_update_policy" ON public.subscriptions;
CREATE POLICY "subscriptions_update_policy" ON public.subscriptions
  FOR UPDATE USING (
    public.is_superadmin()
  );

-- 10.2 Audit Logs: No permitir falsificación de user_id en logs
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Helper seguro para obtener el email del usuario autenticado sin violar permisos de auth.users
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT coalesce(nullif(auth.jwt() ->> 'email', ''), (SELECT email FROM auth.users WHERE id = auth.uid()));
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_email() TO authenticated, anon;

-- 10.3 Patients: Recepción y terapeutas gestionan pacientes; pacientes regulares no ven expedientes ajenos
DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
CREATE POLICY "patients_select_policy" ON public.patients
  FOR SELECT USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist', 'assistant'])
    OR public.is_superadmin()
    OR (
      public.has_role_in_org(organization_id, ARRAY['patient'])
      AND email = public.get_auth_email()
    )
  );

DROP POLICY IF EXISTS "patients_insert_policy" ON public.patients;
CREATE POLICY "patients_insert_policy" ON public.patients
  FOR INSERT WITH CHECK (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist', 'assistant'])
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "patients_update_policy" ON public.patients;
CREATE POLICY "patients_update_policy" ON public.patients
  FOR UPDATE USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist', 'assistant'])
    OR public.is_superadmin()
  );

DROP POLICY IF EXISTS "patients_delete_policy" ON public.patients;
CREATE POLICY "patients_delete_policy" ON public.patients
  FOR DELETE USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist'])
    OR public.is_superadmin()
  );

-- 10.4 Appointments: Recepción no puede eliminar citas históricas (solo cancelarlas)
DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;
CREATE POLICY "appointments_delete_policy" ON public.appointments
  FOR DELETE USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist'])
    OR public.is_superadmin()
  );

-- 10.5 Organization Members: No auto-eliminar el único owner
CREATE OR REPLACE FUNCTION public.prevent_delete_last_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
begin
  if old.role = 'owner' then
    if (
      select count(*) from public.organization_members 
      where organization_id = old.organization_id and role = 'owner'
    ) <= 1 and not public.is_superadmin() then
      raise exception 'Operación no permitida: Una organización debe contar con al menos un titular (owner).';
    end if;
  end if;
  return old;
end;
$$;

DROP TRIGGER IF EXISTS trg_prevent_delete_last_owner ON public.organization_members;
CREATE TRIGGER trg_prevent_delete_last_owner
  BEFORE DELETE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_delete_last_owner();

-- 11. REMEDIACIÓN RETROACTIVA DE DATOS
-- Asegura que cualquier perfil con membresía clínica preexistente cuente con su registro en professionals
INSERT INTO public.professionals (organization_id, profile_id, specialty, license_number, bio)
SELECT om.organization_id, om.user_id, p.specialty, p.license_number, p.bio
FROM public.organization_members om
JOIN public.profiles p ON p.id = om.user_id
LEFT JOIN public.professionals prof ON prof.organization_id = om.organization_id AND prof.profile_id = om.user_id
WHERE om.role IN ('owner', 'psychologist', 'admin') AND prof.id IS NULL
ON CONFLICT DO NOTHING;
