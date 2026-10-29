-- ==============================================================================
-- SYNKRO - MIGRACIÓN INCREMENTAL FASE 3: BÓVEDA DOCUMENTAL, NOTAS SOAP Y
-- AISLAMIENTO ESTRICTO DE NOTAS PRIVADAS BAJO SECRETO PROFESIONAL
-- ==============================================================================
-- Timestamp de migración: 20261028230000
-- Autor: Synkro Architecture (VelyonSoft)
-- Entorno: Local PostgreSQL / Supabase
--
-- Objetivos:
-- 1. Desacoplamiento de notas privadas a tabla independiente `session_private_notes`
--    con RLS estricto exclusivo para el terapeuta autor (author_id = auth.uid()).
-- 2. Migración no destructiva de notas privadas existentes y sanitización de `sessions.private_notes`.
-- 3. Trigger de redirección automática para compatibilidad retroactiva.
-- 4. Protección del registro de auditoría (audit_logs): ningún texto clínico plano en logs.
-- 5. Bóveda documental `patient_files`: multitenancy explícito, roles, categoría y compartición
--    granular con el paciente (shared_with_patient).
-- 6. Políticas de acceso de storage.objects en bucket privado 'patient-files' para URLs firmadas.
-- 7. Soporte oficial para notas clínicas estructuradas en formato SOAP (Subjetivo, Objetivo, Análisis, Plan).
-- 8. Actualización de políticas de citas y expedientes para visualización segura en portal del paciente.
-- ==============================================================================

-- 1. SOPORTE DE NOTAS SOAP EN SESIONES CLÍNICAS
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS soap_subjective text,
  ADD COLUMN IF NOT EXISTS soap_objective text,
  ADD COLUMN IF NOT EXISTS soap_assessment text,
  ADD COLUMN IF NOT EXISTS soap_plan text;

COMMENT ON COLUMN public.sessions.soap_subjective IS 'Formato SOAP - S: Motivo de consulta y reporte subjetivo del paciente';
COMMENT ON COLUMN public.sessions.soap_objective IS 'Formato SOAP - O: Observación conductual, signos y examen mental';
COMMENT ON COLUMN public.sessions.soap_assessment IS 'Formato SOAP - A: Análisis clínico, evolución y formulación terapéutica';
COMMENT ON COLUMN public.sessions.soap_plan IS 'Formato SOAP - P: Plan de intervención, acuerdos y tareas intersesión';

-- 2. TABLA AISLADA DE NOTAS PRIVADAS DE TERAPIA (SECRETO PROFESIONAL)
CREATE TABLE IF NOT EXISTS public.session_private_notes (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_private_notes_author ON public.session_private_notes (author_id);
CREATE INDEX IF NOT EXISTS idx_session_private_notes_session ON public.session_private_notes (session_id);
CREATE INDEX IF NOT EXISTS idx_session_private_notes_org ON public.session_private_notes (organization_id);

ALTER TABLE public.session_private_notes ENABLE ROW LEVEL SECURITY;

-- 2.1 Políticas RLS estrictas en session_private_notes: SOLO EL AUTOR
DROP POLICY IF EXISTS "session_private_notes_select_policy" ON public.session_private_notes;
CREATE POLICY "session_private_notes_select_policy" ON public.session_private_notes
  FOR SELECT USING (
    author_id = auth.uid()
  );

DROP POLICY IF EXISTS "session_private_notes_insert_policy" ON public.session_private_notes;
CREATE POLICY "session_private_notes_insert_policy" ON public.session_private_notes
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
    AND public.is_member_of(organization_id)
  );

DROP POLICY IF EXISTS "session_private_notes_update_policy" ON public.session_private_notes;
CREATE POLICY "session_private_notes_update_policy" ON public.session_private_notes
  FOR UPDATE USING (
    author_id = auth.uid()
  ) WITH CHECK (
    author_id = auth.uid()
  );

DROP POLICY IF EXISTS "session_private_notes_delete_policy" ON public.session_private_notes;
CREATE POLICY "session_private_notes_delete_policy" ON public.session_private_notes
  FOR DELETE USING (
    author_id = auth.uid()
  );

-- 3. MIGRACIÓN NO DESTRUCTIVA DE NOTAS PRIVADAS EXISTENTES
INSERT INTO public.session_private_notes (
  session_id,
  organization_id,
  author_id,
  content,
  created_at
)
SELECT 
  s.id,
  p.organization_id,
  prof.profile_id,
  s.private_notes,
  coalesce(s.created_at, now())
FROM public.sessions s
JOIN public.patients p ON p.id = s.patient_id
JOIN public.professionals prof ON prof.id = s.professional_id
WHERE s.private_notes IS NOT NULL AND length(trim(s.private_notes)) > 0
ON CONFLICT (session_id) DO NOTHING;

-- Vaciamos la columna antigua en sessions para evitar exposición en consultas generales
UPDATE public.sessions
SET private_notes = NULL
WHERE private_notes IS NOT NULL;

-- 4. TRIGGER DE REDIRECCIÓN AUTOMÁTICA EN SESSIONS
-- Si una consulta o frontend envía private_notes a public.sessions,
-- se inserta/actualiza en session_private_notes y se sanitiza en sessions.
CREATE OR REPLACE FUNCTION public.handle_session_private_notes_split()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
declare
  v_org_id uuid;
  v_author_id uuid;
begin
  if NEW.private_notes is not null and length(trim(NEW.private_notes)) > 0 then
    -- Obtener organización del paciente
    select organization_id into v_org_id from public.patients where id = NEW.patient_id;
    -- Obtener profile_id del profesional o fallback a auth.uid()
    select profile_id into v_author_id from public.professionals where id = NEW.professional_id;
    v_author_id := coalesce(v_author_id, auth.uid());

    if v_org_id is not null and v_author_id is not null then
      insert into public.session_private_notes (
        session_id,
        organization_id,
        author_id,
        content
      ) values (
        NEW.id,
        v_org_id,
        v_author_id,
        NEW.private_notes
      )
      on conflict (session_id) do update set
        content = excluded.content,
        updated_at = now();
    end if;

    -- Limpiar en sessions para garantizar confidencialidad (evitando recursión)
    update public.sessions
    set private_notes = null
    where id = NEW.id and private_notes is not null;
  end if;

  return NEW;
end;
$$;

DROP TRIGGER IF EXISTS trg_handle_session_private_notes_split ON public.sessions;
CREATE TRIGGER trg_handle_session_private_notes_split
  AFTER INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_session_private_notes_split();

-- 5. AUDITORÍA SEGURA PARA NOTAS PRIVADAS (SIN CONTENIDO PLANO)
CREATE OR REPLACE FUNCTION public.audit_session_private_notes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
begin
  insert into public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) values (
    auth.uid(),
    TG_OP,
    'session_private_notes',
    coalesce(NEW.id, OLD.id),
    jsonb_build_object(
      'session_id', coalesce(NEW.session_id, OLD.session_id),
      'author_id', coalesce(NEW.author_id, OLD.author_id),
      'organization_id', coalesce(NEW.organization_id, OLD.organization_id),
      'content_length', length(coalesce(NEW.content, '')),
      'confidentiality', 'SECRETO_PROFESIONAL_CONTENIDO_PROTEGIDO'
    )
  );
  return coalesce(NEW, OLD);
end;
$$;

DROP TRIGGER IF EXISTS trg_audit_session_private_notes ON public.session_private_notes;
CREATE TRIGGER trg_audit_session_private_notes
  AFTER INSERT OR UPDATE OR DELETE ON public.session_private_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_session_private_notes();

-- 6. ACTUALIZACIÓN DE BÓVEDA DOCUMENTAL (PATIENT_FILES)
ALTER TABLE public.patient_files
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS shared_with_patient boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS file_category text NOT NULL DEFAULT 'other';

-- Migrar organization_id de pacientes en archivos existentes
UPDATE public.patient_files pf
SET organization_id = p.organization_id
FROM public.patients p
WHERE pf.patient_id = p.id AND pf.organization_id IS NULL;

-- Normalizar file_category
UPDATE public.patient_files
SET file_category = CASE
  WHEN category ILIKE '%evalua%' THEN 'evaluation'
  WHEN category ILIKE '%consent%' THEN 'consent'
  WHEN category ILIKE '%informe%' OR category ILIKE '%report%' THEN 'report'
  WHEN category ILIKE '%receta%' OR category ILIKE '%prescrip%' THEN 'prescription'
  ELSE 'other'
END
WHERE file_category = 'other' AND category IS NOT NULL;

-- Asegurar constraint de categorías válidas
ALTER TABLE public.patient_files
  DROP CONSTRAINT IF EXISTS chk_patient_files_category;

ALTER TABLE public.patient_files
  ADD CONSTRAINT chk_patient_files_category
  CHECK (file_category IN ('evaluation', 'consent', 'report', 'prescription', 'other'));

CREATE INDEX IF NOT EXISTS idx_patient_files_org ON public.patient_files (organization_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_shared ON public.patient_files (shared_with_patient);

-- Trigger para autocompletar organization_id y uploaded_by si no vienen en el insert
CREATE OR REPLACE FUNCTION public.handle_patient_file_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
begin
  if NEW.organization_id is null then
    select organization_id into NEW.organization_id from public.patients where id = NEW.patient_id;
  end if;
  if NEW.uploaded_by is null then
    NEW.uploaded_by := auth.uid();
  end if;
  return NEW;
end;
$$;

DROP TRIGGER IF EXISTS trg_handle_patient_file_defaults ON public.patient_files;
CREATE TRIGGER trg_handle_patient_file_defaults
  BEFORE INSERT ON public.patient_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_patient_file_defaults();

-- 6.1 POLÍTICAS RLS EN PATIENT_FILES
DROP POLICY IF EXISTS "patient_files_select_policy" ON public.patient_files;
CREATE POLICY "patient_files_select_policy" ON public.patient_files
  FOR SELECT USING (
    -- Personal clínico y administrativo de la organización
    public.has_role_in_org(organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant', 'superadmin'])
    OR
    public.is_superadmin()
    OR
    -- Paciente solo puede ver archivos de su propio expediente si están explícitamente compartidos
    (
      patient_files.shared_with_patient = true
      AND EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = patient_files.patient_id
          AND lower(p.email) = public.get_auth_email()
      )
    )
  );

DROP POLICY IF EXISTS "patient_files_insert_policy" ON public.patient_files;
CREATE POLICY "patient_files_insert_policy" ON public.patient_files
  FOR INSERT WITH CHECK (
    public.has_role_in_org(organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant', 'superadmin'])
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_files.patient_id
        AND p.organization_id = patient_files.organization_id
    )
  );

DROP POLICY IF EXISTS "patient_files_update_policy" ON public.patient_files;
CREATE POLICY "patient_files_update_policy" ON public.patient_files
  FOR UPDATE USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant', 'superadmin'])
  ) WITH CHECK (
    public.has_role_in_org(organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant', 'superadmin'])
  );

DROP POLICY IF EXISTS "patient_files_delete_policy" ON public.patient_files;
CREATE POLICY "patient_files_delete_policy" ON public.patient_files
  FOR DELETE USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
  );

-- 7. REGLAS DE ALMACENAMIENTO (STORAGE.OBJECTS) EN BUCKET 'patient-files'
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "storage_patient_files_select" ON storage.objects;
CREATE POLICY "storage_patient_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-files'
    AND (
      -- Miembro activo del personal clínico de la organización
      EXISTS (
        SELECT 1 FROM public.patients p
        WHERE (p.id::text = (storage.foldername(name))[1] OR p.id::text = (storage.foldername(name))[2])
          AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant', 'superadmin'])
      )
      OR
      public.is_superadmin()
      OR
      -- Paciente con archivo compartido expresamente
      EXISTS (
        SELECT 1 FROM public.patient_files pf
        JOIN public.patients p ON p.id = pf.patient_id
        WHERE pf.storage_path = name
          AND pf.shared_with_patient = true
          AND lower(p.email) = public.get_auth_email()
      )
    )
  );

DROP POLICY IF EXISTS "storage_patient_files_insert" ON storage.objects;
CREATE POLICY "storage_patient_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patient-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE (p.id::text = (storage.foldername(name))[1] OR p.id::text = (storage.foldername(name))[2])
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'assistant', 'superadmin'])
    )
  );

DROP POLICY IF EXISTS "storage_patient_files_delete" ON storage.objects;
CREATE POLICY "storage_patient_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'patient-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE (p.id::text = (storage.foldername(name))[1] OR p.id::text = (storage.foldername(name))[2])
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
    )
  );

-- 8. ACTUALIZAR VERIFICACIÓN DE SUSCRIPCIÓN ACTIVA
CREATE OR REPLACE FUNCTION public.check_subscription_write_permission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
declare
  v_org_id uuid;
begin
  if public.is_superadmin() then
    return new;
  end if;

  if TG_TABLE_NAME = 'sessions' then
    select organization_id into v_org_id from public.patients where id = new.patient_id;
  elsif TG_TABLE_NAME = 'session_private_notes' then
    v_org_id := coalesce(new.organization_id, (select p.organization_id from public.sessions s join public.patients p on p.id = s.patient_id where s.id = new.session_id));
  elsif TG_TABLE_NAME = 'patient_files' then
    v_org_id := coalesce(new.organization_id, (select organization_id from public.patients where id = new.patient_id));
  else
    v_org_id := new.organization_id;
  end if;

  if v_org_id is not null and not public.is_org_subscription_active(v_org_id) then
    raise exception 'Operación restringida: La suscripción de la clínica se encuentra vencida o inactiva. Para continuar registrando o modificando datos clínicos, renueva tu plan en /suscripcion.';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_check_sub_write_session_private_notes ON public.session_private_notes;
CREATE TRIGGER trg_check_sub_write_session_private_notes
  BEFORE INSERT OR UPDATE ON public.session_private_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscription_write_permission();

-- 9. RESTRINGIR ACCESO A CITAS PARA PACIENTES (SOLO VEN SUS PROPIAS CITAS)
DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
CREATE POLICY "appointments_select_policy" ON public.appointments
  FOR SELECT USING (
    (
      public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist', 'assistant'])
      OR public.is_superadmin()
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = appointments.patient_id
          AND lower(p.email) = public.get_auth_email()
      )
    )
  );

-- Registrar migración en tabla de control
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version text PRIMARY KEY,
  statements text[],
  name text
);

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20261028230000', 'phase3_clinical_security_vault')
ON CONFLICT (version) DO NOTHING;
