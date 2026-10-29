-- ==============================================================================
-- SYNKRO - MIGRACIÓN INCREMENTAL FASE 4: ESTABILIZACIÓN Y REFORZAMIENTO
-- ==============================================================================
-- Timestamp de migración: 20261028240000
-- Autor: Synkro Architecture (VelyonSoft)
-- Entorno: Local PostgreSQL / Supabase
--
-- Objetivos:
-- 1. Identidad explícita y verificada del paciente: user_id en public.patients,
--    invitación criptográfica con token temporal y aceptación formal.
-- 2. Eliminación de acceso rutinario de superadmin a datos clínicos (PHI):
--    superadmin solo accede a métricas operativas/comerciales vía admin_list_organizations.
-- 3. Reforzamiento de políticas RLS en patients, patient_files y appointments
--    exigiendo patients.user_id = auth.uid() y portal_status = 'active'.
-- 4. Reforzamiento de políticas de Storage en bucket 'patient-files' vinculadas a
--    paciente activo con archivo compartido explícitamente.
-- 5. Limpieza de tablas temporales residuales.
-- ==============================================================================

-- 1. IDENTIDAD Y VINCULACIÓN EXPLÍCITA DEL PACIENTE
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS portal_invitation_token text,
  ADD COLUMN IF NOT EXISTS portal_invitation_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS portal_invitation_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS portal_status text NOT NULL DEFAULT 'not_invited';

-- Asegurar constraint de estado del portal
ALTER TABLE public.patients
  DROP CONSTRAINT IF EXISTS chk_patients_portal_status;

ALTER TABLE public.patients
  ADD CONSTRAINT chk_patients_portal_status
  CHECK (portal_status IN ('not_invited', 'invited', 'active', 'revoked'));

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_portal_token ON public.patients (portal_invitation_token)
  WHERE portal_invitation_token IS NOT NULL;

-- 2. FUNCIONES RPC DE INVITACIÓN Y ACEPTACIÓN DEL PORTAL DEL PACIENTE

-- 2.1 Generar invitación segura al portal
CREATE OR REPLACE FUNCTION public.create_patient_portal_invitation(p_patient_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
declare
  v_patient record;
  v_token text;
begin
  if auth.uid() is null then
    raise exception 'Sesión requerida: Debes estar autenticado para invitar pacientes.';
  end if;

  select * into v_patient from public.patients where id = p_patient_id;
  if not found then
    raise exception 'Paciente no encontrado.';
  end if;

  -- Verificar que el usuario tenga rol clínico o administrativo en la organización
  if not public.has_role_in_org(v_patient.organization_id, ARRAY['owner', 'psychologist', 'admin']) then
    raise exception 'Operación no permitida: Solo el personal clínico o administrativo puede generar invitaciones al portal.';
  end if;

  if v_patient.email is null or length(trim(v_patient.email)) = 0 then
    raise exception 'El paciente no cuenta con correo electrónico registrado. Actualiza sus datos antes de invitarlo.';
  end if;

  -- Generar token aleatorio criptográfico (64 caracteres hex / 256 bits)
  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  update public.patients
  set portal_invitation_token = v_token,
      portal_invitation_sent_at = now(),
      portal_status = 'invited'
  where id = p_patient_id;

  -- Registrar en log de auditoría
  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) values (
    auth.uid(),
    'PORTAL_INVITATION_CREATED',
    'patients',
    p_patient_id,
    jsonb_build_object(
      'patient_id', p_patient_id,
      'email', v_patient.email,
      'organization_id', v_patient.organization_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'patient_id', p_patient_id,
    'email', v_patient.email,
    'token', v_token,
    'expires_at', now() + interval '7 days'
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.create_patient_portal_invitation(uuid) TO authenticated;

-- 2.2 Aceptación segura de la invitación por el paciente autenticado
CREATE OR REPLACE FUNCTION public.accept_patient_portal_invitation(p_token text)
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

  -- Validar que el correo del usuario coincida con el del paciente
  if lower(trim(v_patient.email)) <> v_auth_email then
    raise exception 'El correo de tu cuenta activa (%s) no coincide con el correo invitado (%s).', v_auth_email, v_patient.email;
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

  -- Vincular explícitamente el paciente a la cuenta
  update public.patients
  set user_id = v_caller_uid,
      portal_status = 'active',
      portal_invitation_accepted_at = now(),
      portal_invitation_token = NULL -- Invalidación de un solo uso
  where id = v_patient.id;

  -- Asegurar membresía con rol 'patient' en la organización
  insert into public.organization_members (organization_id, user_id, role)
  values (v_patient.organization_id, v_caller_uid, 'patient')
  on conflict (organization_id, user_id)
  do update set role = 'patient';

  -- Registrar en log de auditoría
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
      'organization_id', v_patient.organization_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'patient_id', v_patient.id,
    'first_name', v_patient.first_name,
    'last_name', v_patient.last_name,
    'organization_id', v_patient.organization_id
  );
end;
$$;

GRANT EXECUTE ON FUNCTION public.accept_patient_portal_invitation(text) TO authenticated;

-- 2.3 Revocación de acceso al portal
CREATE OR REPLACE FUNCTION public.revoke_patient_portal_access(p_patient_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
declare
  v_patient record;
begin
  if auth.uid() is null then
    raise exception 'Sesión requerida.';
  end if;

  select * into v_patient from public.patients where id = p_patient_id;
  if not found then
    raise exception 'Paciente no encontrado.';
  end if;

  if not public.has_role_in_org(v_patient.organization_id, ARRAY['owner', 'psychologist', 'admin']) then
    raise exception 'Operación no permitida.';
  end if;

  -- Revocar en tabla patients
  update public.patients
  set portal_status = 'revoked',
      user_id = NULL,
      portal_invitation_token = NULL
  where id = p_patient_id;

  -- Si tenía membresía de paciente, retirarla
  if v_patient.user_id is not null then
    delete from public.organization_members
    where organization_id = v_patient.organization_id
      and user_id = v_patient.user_id
      and role = 'patient';
  end if;

  -- Registrar en auditoría
  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) values (
    auth.uid(),
    'PORTAL_ACCESS_REVOKED',
    'patients',
    p_patient_id,
    jsonb_build_object('patient_id', p_patient_id, 'organization_id', v_patient.organization_id)
  );

  return true;
end;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_patient_portal_access(uuid) TO authenticated;

-- 3. REFORZAMIENTO DE POLÍTICAS RLS EN PUBLIC.PATIENTS
-- Se elimina el acceso rutinario de superadmin a expedientes individuales.
-- El paciente accede ÚNICAMENTE si está vinculado explícitamente (user_id = auth.uid() Y portal_status = 'active').
DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
CREATE POLICY "patients_select_policy" ON public.patients
  FOR SELECT USING (
    -- Personal clínico de la clínica
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist', 'assistant'])
    OR
    -- Paciente con relación explícita y activa verificada
    (
      user_id = auth.uid()
      AND portal_status = 'active'
    )
  );

-- 4. REFORZAMIENTO DE POLÍTICAS RLS EN PUBLIC.PATIENT_FILES
-- Se elimina el acceso rutinario de superadmin a archivos clínicos.
-- El paciente accede ÚNICAMENTE si el archivo está compartido Y su relación está activa.
DROP POLICY IF EXISTS "patient_files_select_policy" ON public.patient_files;
CREATE POLICY "patient_files_select_policy" ON public.patient_files
  FOR SELECT USING (
    -- Personal clínico de la clínica
    public.has_role_in_org(organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant'])
    OR
    -- Paciente viendo únicamente sus archivos compartidos explícitamente
    (
      patient_files.shared_with_patient = true
      AND EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = patient_files.patient_id
          AND p.user_id = auth.uid()
          AND p.portal_status = 'active'
      )
    )
  );

-- 5. REFORZAMIENTO DE POLÍTICAS RLS EN PUBLIC.APPOINTMENTS
-- Se elimina el acceso rutinario de superadmin a citas clínicas.
-- El paciente accede ÚNICAMENTE a sus propias citas verificadas.
DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
CREATE POLICY "appointments_select_policy" ON public.appointments
  FOR SELECT USING (
    -- Personal clínico y de recepción de la clínica
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist', 'assistant'])
    OR
    -- Paciente consultando exclusivamente sus propias citas
    (
      EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = appointments.patient_id
          AND p.user_id = auth.uid()
          AND p.portal_status = 'active'
      )
    )
  );

-- 6. REFORZAMIENTO DE POLÍTICAS DE STORAGE EN BUCKET 'patient-files'
-- Se elimina el acceso rutinario de superadmin a los binarios del bucket.
DROP POLICY IF EXISTS "storage_patient_files_select" ON storage.objects;
CREATE POLICY "storage_patient_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-files'
    AND (
      -- Personal clínico de la organización a la que pertenece el expediente
      EXISTS (
        SELECT 1 FROM public.patients p
        WHERE (p.id::text = (storage.foldername(name))[1] OR p.id::text = (storage.foldername(name))[2])
          AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant'])
      )
      OR
      -- Paciente activo con archivo expresamente compartido
      EXISTS (
        SELECT 1 FROM public.patient_files pf
        JOIN public.patients p ON p.id = pf.patient_id
        WHERE pf.storage_path = name
          AND pf.shared_with_patient = true
          AND p.user_id = auth.uid()
          AND p.portal_status = 'active'
      )
    )
  );

-- 7. LIMPIEZA DE TABLAS TEMPORALES
DROP TABLE IF EXISTS public.result;

-- 8. REGISTRO DE MIGRACIÓN EN TABLA DE CONTROL
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20261028240000', 'phase4_stabilization_and_hardening')
ON CONFLICT (version) DO NOTHING;
