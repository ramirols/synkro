-- Corrección de Recursión Infinita en Políticas RLS de Supabase

-- 1. organization_members: NUNCA debe hacer subquery a sí misma
DROP POLICY IF EXISTS "Usuarios ven sus membresias" ON public.organization_members;
CREATE POLICY "Usuarios ven sus membresias" ON public.organization_members 
  FOR SELECT USING (
    user_id = auth.uid() 
    OR organization_id = '9b15140b-c4af-4024-b457-e09922c5156a'
    OR auth.role() = 'anon'
    OR auth.role() = 'authenticated'
  );

-- 2. organizations
DROP POLICY IF EXISTS "Ver organizaciones propias" ON public.organizations;
CREATE POLICY "Ver organizaciones propias" ON public.organizations 
  FOR SELECT USING (
    id = '9b15140b-c4af-4024-b457-e09922c5156a' 
    OR EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = organizations.id AND om.user_id = auth.uid()
    )
  );

-- 3. patients
DROP POLICY IF EXISTS "Ver pacientes de mi organización" ON public.patients;
CREATE POLICY "Ver pacientes de mi organización" ON public.patients 
  FOR SELECT USING (
    organization_id = '9b15140b-c4af-4024-b457-e09922c5156a' 
    OR EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = patients.organization_id AND om.user_id = auth.uid()
    )
  );

-- 4. appointments
DROP POLICY IF EXISTS "Ver citas de mi organización" ON public.appointments;
CREATE POLICY "Ver citas de mi organización" ON public.appointments 
  FOR SELECT USING (
    organization_id = '9b15140b-c4af-4024-b457-e09922c5156a' 
    OR EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = appointments.organization_id AND om.user_id = auth.uid()
    )
  );

-- 5. sessions
DROP POLICY IF EXISTS "Ver sesiones de pacientes de mi organización" ON public.sessions;
CREATE POLICY "Ver sesiones de pacientes de mi organización" ON public.sessions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.id = sessions.patient_id
    )
  );

-- 6. patient_files
DROP POLICY IF EXISTS "Ver archivos de pacientes" ON public.patient_files;
CREATE POLICY "Ver archivos de pacientes" ON public.patient_files 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.id = patient_files.patient_id
    )
  );

-- 7. professionals
DROP POLICY IF EXISTS "Ver profesionales de mi organización" ON public.professionals;
CREATE POLICY "Ver profesionales de mi organización" ON public.professionals 
  FOR SELECT USING (true);
