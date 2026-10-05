-- ==============================================================================
-- SYNKRO - MIGRACIÓN CANÓNICA INICIAL DE BASE DE DATOS
-- Versión: 20261003000000_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";

-- ==============================================================================
-- 2. TABLAS DEL SISTEMA
-- ==============================================================================

-- Perfil de Usuario (Extensión de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text DEFAULT 'owner' CHECK (role IN ('superadmin', 'admin', 'owner', 'psychologist', 'assistant', 'patient')),
    phone text,
    specialty text,
    license_number text,
    bio text,
    office_address text DEFAULT 'Av. Benavides 1570, Miraflores, Lima',
    default_meet_link text DEFAULT 'https://meet.google.com/syn-kro-vely',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Organizaciones / Clínicas (Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    logo_url text,
    created_at timestamptz DEFAULT now()
);

-- Miembros de la Organización (Vinculación Usuario <-> Clínica)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('superadmin', 'admin', 'owner', 'psychologist', 'assistant', 'patient')),
    created_at timestamptz DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

-- Profesionales Clínicos
CREATE TABLE IF NOT EXISTS public.professionals (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty text,
    license_number text,
    bio text,
    created_at timestamptz DEFAULT now()
);

-- Pacientes (Núcleo de expedientes clínicos)
CREATE TABLE IF NOT EXISTS public.patients (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    birth_date date,
    gender text,
    notes text,
    created_at timestamptz DEFAULT now(),
    status text DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'alta', 'evaluacion')),
    therapeutic_approach text DEFAULT 'Cognitivo Conductual (TCC)',
    consultation_reason text,
    emergency_contact text
);

-- Citas / Agenda Clínica
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    created_at timestamptz DEFAULT now(),
    modality text DEFAULT 'presencial' CHECK (modality IN ('presencial', 'virtual')),
    meeting_link text,
    notes text
);

-- Sesiones Clínicas (Historia, notas de evolución y diagnósticos confidenciales)
CREATE TABLE IF NOT EXISTS public.sessions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    session_summary text,
    private_notes text,
    created_at timestamptz DEFAULT now(),
    session_number integer DEFAULT 1,
    emotional_score integer CHECK (emotional_score >= 1 AND emotional_score <= 10),
    homework text
);

-- Archivos Clínicos y Bóveda Documental
CREATE TABLE IF NOT EXISTS public.patient_files (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_name text,
    storage_path text,
    file_type text,
    created_at timestamptz DEFAULT now(),
    category text DEFAULT 'Evaluación',
    file_size text DEFAULT '1.2 MB'
);

-- Suscripciones y Planes de la Clínica
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan text DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'clinic')),
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- Registro de Auditoría
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id),
    action text,
    table_name text,
    record_id uuid,
    created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 3. ÍNDICES DE RENDIMIENTO Y BÚSQUEDA
-- ==============================================================================

CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments USING btree (appointment_date);
CREATE INDEX IF NOT EXISTS patients_search_idx ON public.patients USING gin ((((first_name || ' '::text) || last_name)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS sessions_patient_idx ON public.sessions USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_patients_org ON public.patients (organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org ON public.appointments (organization_id);
CREATE INDEX IF NOT EXISTS idx_professionals_org ON public.professionals (organization_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_patient ON public.patient_files (patient_id);

-- ==============================================================================
-- 4. FUNCIONES Y TRIGGERS DE INFRAESTRUCTURA AUTH
-- ==============================================================================

-- 4.1 Función de alta automática de perfil al registrarse un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    role
  )
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Nuevo Profesional'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'owner')
  );

  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Función para inicializar espacio de trabajo de la clínica
-- Prevención de colisión en slug: utiliza sanitización alfanumérica y sufijo único determinista.
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  new_org uuid;
  base_name text;
  clean_slug text;
  final_slug text;
  suffix text;
begin
  base_name := coalesce(nullif(trim(new.full_name), ''), 'Mi Consulta');
  
  -- Sanitizar nombre para convertirlo en slug alfanumérico seguro
  clean_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  clean_slug := trim(both '-' from clean_slug);
  if clean_slug = '' then
    clean_slug := 'clinica';
  end if;

  -- Sufijo único determinista de 8 caracteres derivado del ID del usuario
  suffix := substr(replace(new.id::text, '-', ''), 1, 8);
  final_slug := clean_slug || '-' || suffix;

  -- Crear Organización
  insert into public.organizations (name, slug)
  values (base_name || ' | Consulta Psicológica', final_slug)
  returning id into new_org;

  -- Asignar membresía como owner
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org, new.id, 'owner');

  -- Inicializar suscripción starter
  insert into public.subscriptions (organization_id, plan, status)
  values (new_org, 'starter', 'active');

  return new;
end;
$$;

DROP TRIGGER IF EXISTS create_workspace_after_profile ON public.profiles;
CREATE TRIGGER create_workspace_after_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_workspace();

-- ==============================================================================
-- 5. FUNCIONES AUXILIARES PARA CONTROL DE ACCESO (RLS ANTI-RECURSIÓN)
-- ==============================================================================

-- Comprueba si el usuario autenticado pertenece a la organización dada
CREATE OR REPLACE FUNCTION public.is_member_of(_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members
    WHERE organization_id = _org_id 
      AND user_id = auth.uid()
  );
$$;

-- Comprueba si el usuario autenticado posee uno de los roles autorizados dentro de la organización
CREATE OR REPLACE FUNCTION public.has_role_in_org(_org_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

-- ==============================================================================
-- 6. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 TABLA: profiles
-- Los usuarios ven su propio perfil o el de colegas dentro de sus mismas organizaciones
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 
      FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = profiles.id AND om2.user_id = auth.uid()
    )
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6.2 TABLA: organizations
CREATE POLICY "organizations_select_policy" ON public.organizations
  FOR SELECT USING (public.is_member_of(id));

CREATE POLICY "organizations_update_policy" ON public.organizations
  FOR UPDATE USING (public.has_role_in_org(id, ARRAY['owner', 'admin', 'superadmin']));

-- 6.3 TABLA: organization_members
CREATE POLICY "org_members_select_policy" ON public.organization_members
  FOR SELECT USING (
    user_id = auth.uid() 
    OR public.is_member_of(organization_id)
  );

CREATE POLICY "org_members_insert_policy" ON public.organization_members
  FOR INSERT WITH CHECK (public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'superadmin']));

CREATE POLICY "org_members_update_policy" ON public.organization_members
  FOR UPDATE USING (public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'superadmin']));

CREATE POLICY "org_members_delete_policy" ON public.organization_members
  FOR DELETE USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'superadmin']) 
    OR user_id = auth.uid()
  );

-- 6.4 TABLA: professionals
-- Visibilidad estricta por organización (se elimina el USING (true) que existía previamente)
CREATE POLICY "professionals_select_policy" ON public.professionals
  FOR SELECT USING (public.is_member_of(organization_id));

CREATE POLICY "professionals_insert_policy" ON public.professionals
  FOR INSERT WITH CHECK (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'superadmin'])
    OR profile_id = auth.uid()
  );

CREATE POLICY "professionals_update_policy" ON public.professionals
  FOR UPDATE USING (
    public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'superadmin'])
    OR profile_id = auth.uid()
  );

CREATE POLICY "professionals_delete_policy" ON public.professionals
  FOR DELETE USING (public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'superadmin']));

-- 6.5 TABLA: patients
CREATE POLICY "patients_select_policy" ON public.patients
  FOR SELECT USING (public.is_member_of(organization_id));

CREATE POLICY "patients_insert_policy" ON public.patients
  FOR INSERT WITH CHECK (public.is_member_of(organization_id));

CREATE POLICY "patients_update_policy" ON public.patients
  FOR UPDATE USING (public.is_member_of(organization_id));

CREATE POLICY "patients_delete_policy" ON public.patients
  FOR DELETE USING (public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'psychologist', 'superadmin']));

-- 6.6 TABLA: appointments
CREATE POLICY "appointments_select_policy" ON public.appointments
  FOR SELECT USING (public.is_member_of(organization_id));

CREATE POLICY "appointments_insert_policy" ON public.appointments
  FOR INSERT WITH CHECK (public.is_member_of(organization_id));

CREATE POLICY "appointments_update_policy" ON public.appointments
  FOR UPDATE USING (public.is_member_of(organization_id));

CREATE POLICY "appointments_delete_policy" ON public.appointments
  FOR DELETE USING (public.is_member_of(organization_id));

-- 6.7 TABLA: sessions (Información clínica altamente confidencial)
-- Decisión de diseño SQL: El acceso a sesiones clínicas está restringido estrictamente
-- a profesionales de la salud mental autorizados (owner, psychologist, admin, superadmin).
-- El personal administrativo con rol 'assistant' o usuarios 'patient' no tienen acceso directo
-- a las notas confidenciales (session_summary, private_notes).
CREATE POLICY "sessions_select_policy" ON public.sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = sessions.patient_id 
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
    )
  );

CREATE POLICY "sessions_insert_policy" ON public.sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = sessions.patient_id 
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
    )
  );

CREATE POLICY "sessions_update_policy" ON public.sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = sessions.patient_id 
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
    )
  );

CREATE POLICY "sessions_delete_policy" ON public.sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = sessions.patient_id 
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'admin', 'superadmin'])
    )
  );

-- 6.8 TABLA: patient_files
CREATE POLICY "patient_files_select_policy" ON public.patient_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = patient_files.patient_id 
        AND public.is_member_of(p.organization_id)
    )
  );

CREATE POLICY "patient_files_insert_policy" ON public.patient_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = patient_files.patient_id 
        AND public.is_member_of(p.organization_id)
    )
  );

CREATE POLICY "patient_files_update_policy" ON public.patient_files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = patient_files.patient_id 
        AND public.is_member_of(p.organization_id)
    )
  );

CREATE POLICY "patient_files_delete_policy" ON public.patient_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE p.id = patient_files.patient_id 
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
    )
  );

-- 6.9 TABLA: subscriptions
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
  FOR SELECT USING (public.is_member_of(organization_id));

CREATE POLICY "subscriptions_update_policy" ON public.subscriptions
  FOR UPDATE USING (public.has_role_in_org(organization_id, ARRAY['owner', 'admin', 'superadmin']));

-- 6.10 TABLA: audit_logs
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- 7. BUCKETS DE ALMACENAMIENTO Y POLÍTICAS DE STORAGE
-- ==============================================================================

-- 7.1 Creación de Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('patient-files', 'patient-files', false)
ON CONFLICT (id) DO UPDATE 
SET public = excluded.public;

-- 7.2 Políticas de storage.objects para el bucket 'avatars'
-- Lectura pública para optimizar renderizado de imágenes de perfil en web
CREATE POLICY "storage_avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Subida y modificación restringida al propietario del avatar
CREATE POLICY "storage_avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7.3 Políticas de storage.objects para el bucket 'patient-files'
-- Estructura de carpetas: patient-files/{patientId}/{timestamp}_{filename} o {patientId}/{filename}
-- Valida que el paciente pertenezca a la organización del usuario autenticado.
CREATE POLICY "storage_patient_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE (p.id::text = (storage.foldername(name))[1] OR p.id::text = (storage.foldername(name))[2])
        AND public.is_member_of(p.organization_id)
    )
  );

CREATE POLICY "storage_patient_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patient-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE (p.id::text = (storage.foldername(name))[1] OR p.id::text = (storage.foldername(name))[2])
        AND public.is_member_of(p.organization_id)
    )
  );

CREATE POLICY "storage_patient_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'patient-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 
      FROM public.patients p
      WHERE (p.id::text = (storage.foldername(name))[1] OR p.id::text = (storage.foldername(name))[2])
        AND public.has_role_in_org(p.organization_id, ARRAY['owner', 'psychologist', 'admin', 'superadmin'])
    )
  );
