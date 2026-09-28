-- ==============================================================================
-- SYNKRO & VELYON - SISTEMA DE ROLES Y MULTI-USUARIO (ADMIN, PSICÓLOGO, PACIENTE)
-- ==============================================================================

-- 1. Ampliar roles permitidos
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('superadmin', 'admin', 'owner', 'psychologist', 'assistant', 'patient'));

ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;
ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_role_check 
  CHECK (role IN ('superadmin', 'admin', 'owner', 'psychologist', 'assistant', 'patient'));

-- 2. Añadir campos adicionales a perfiles (para que el psicólogo tenga su perfil completo)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS specialty text,
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS office_address text DEFAULT 'Av. Benavides 1570, Miraflores, Lima',
  ADD COLUMN IF NOT EXISTS default_meet_link text DEFAULT 'https://meet.google.com/syn-kro-vely';

-- 3. Crear Usuarios de Autenticación para los 3 Roles:
-- A) ADMIN VELYON (Tú como creador/administrador de la plataforma)
-- B) PSICÓLOGO TITULAR (Cliente que compra el software para atender)
-- C) PACIENTE (Portal del paciente con tareas y citas)

DO $$
DECLARE
  v_admin_id uuid := 'c0000000-0000-4000-8000-000000000001';
  v_psych_id uuid := '17b4f40d-336d-44ef-a261-e6e633780deb';
  v_patient_user_id uuid := 'c0000000-0000-4000-8000-000000000003';
  v_org_id uuid := '9b15140b-c4af-4024-b457-e09922c5156a';
BEGIN
  -- A) USUARIO ADMIN VELYON
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@velyonsoft.com', crypt('admin123456', gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Admin Velyon (Plataforma)"}', now(), now()
  ) ON CONFLICT (id) DO UPDATE 
    SET email = 'admin@velyonsoft.com', 
        encrypted_password = crypt('admin123456', gen_salt('bf'));

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (v_admin_id, v_admin_id, '{"sub": "c0000000-0000-4000-8000-000000000001", "email": "admin@velyonsoft.com"}', 'email', 'admin@velyonsoft.com', now(), now(), now())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Perfil de Admin
  INSERT INTO public.profiles (id, full_name, role, specialty, bio)
  VALUES (
    v_admin_id, 
    'Administrador General Velyon', 
    'superadmin', 
    'Superadministrador del Sistema',
    'Control global de la infraestructura, clientes, base de datos y migración Cloud.'
  ) ON CONFLICT (id) DO UPDATE SET role = 'superadmin', full_name = 'Administrador General Velyon';

  -- Membresía Admin en organización
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_admin_id, 'superadmin')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'superadmin';

  -- B) PERFIL DE PSICÓLOGO TITULAR (demo@synkro.com)
  UPDATE public.profiles
  SET full_name = 'Lic. Alejandro Mendoza V.',
      role = 'owner',
      specialty = 'Psicología Clínica y TCC',
      license_number = 'C.Ps.P. 28419',
      phone = '+51 984 555 123',
      bio = 'Especialista en trastornos de ansiedad, estrés y regulación emocional. Director del Centro Psicológico Synkro.'
  WHERE id = v_psych_id;

  -- C) USUARIO PACIENTE (Camila Valdivia para el Portal del Paciente)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    v_patient_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'paciente@synkro.com', crypt('paciente123456', gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}', '{"full_name": "Camila Valdivia"}', now(), now()
  ) ON CONFLICT (id) DO UPDATE 
    SET email = 'paciente@synkro.com', 
        encrypted_password = crypt('paciente123456', gen_salt('bf'));

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (v_patient_user_id, v_patient_user_id, '{"sub": "c0000000-0000-4000-8000-000000000003", "email": "paciente@synkro.com"}', 'email', 'paciente@synkro.com', now(), now(), now())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Perfil de Paciente
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (v_patient_user_id, 'Camila Valdivia Rosas', 'patient', '+51 984 123 456')
  ON CONFLICT (id) DO UPDATE SET role = 'patient', full_name = 'Camila Valdivia Rosas';

  -- Membresía de Paciente en la organización
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_patient_user_id, 'patient')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'patient';

END $$;
