DROP POLICY IF EXISTS "Ver pacientes de mi organización" ON public.patients;
CREATE POLICY "Ver pacientes de mi organización" ON public.patients 
  FOR SELECT USING (
    organization_id = '9b15140b-c4af-4024-b457-e09922c5156a' 
    OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = patients.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Ver citas de mi organización" ON public.appointments;
CREATE POLICY "Ver citas de mi organización" ON public.appointments 
  FOR SELECT USING (
    organization_id = '9b15140b-c4af-4024-b457-e09922c5156a' 
    OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = appointments.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Ver sesiones de pacientes de mi organización" ON public.sessions;
CREATE POLICY "Ver sesiones de pacientes de mi organización" ON public.sessions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.patients p WHERE p.id = sessions.patient_id AND p.organization_id = '9b15140b-c4af-4024-b457-e09922c5156a')
    OR EXISTS (SELECT 1 FROM public.patients p JOIN public.organization_members om ON om.organization_id = p.organization_id WHERE p.id = sessions.patient_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Ver archivos de pacientes" ON public.patient_files;
CREATE POLICY "Ver archivos de pacientes" ON public.patient_files 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_files.patient_id AND p.organization_id = '9b15140b-c4af-4024-b457-e09922c5156a')
    OR EXISTS (SELECT 1 FROM public.patients p JOIN public.organization_members om ON om.organization_id = p.organization_id WHERE p.id = patient_files.patient_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Ver profesionales de mi organización" ON public.professionals;
CREATE POLICY "Ver profesionales de mi organización" ON public.professionals 
  FOR SELECT USING (
    organization_id = '9b15140b-c4af-4024-b457-e09922c5156a' 
    OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = professionals.organization_id AND om.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Ver organizaciones propias" ON public.organizations;
CREATE POLICY "Ver organizaciones propias" ON public.organizations 
  FOR SELECT USING (
    id = '9b15140b-c4af-4024-b457-e09922c5156a' 
    OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organizations.id AND om.user_id = auth.uid())
  );
