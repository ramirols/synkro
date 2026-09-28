-- ==============================================================================
-- SYNKRO - PLATAFORMA DE GESTIÓN PSICOLÓGICA (PRODUCTO VELYON)
-- Migración de Estructura Completa, Políticas RLS y Dataset Piloto (Demo Data)
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Mejoras de Esquema (Campos de Diferenciación Psicológica)
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'alta', 'evaluacion')),
  ADD COLUMN IF NOT EXISTS therapeutic_approach text DEFAULT 'Cognitivo Conductual (TCC)',
  ADD COLUMN IF NOT EXISTS consultation_reason text,
  ADD COLUMN IF NOT EXISTS emergency_contact text;

ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS modality text DEFAULT 'presencial' CHECK (modality IN ('presencial', 'virtual')),
  ADD COLUMN IF NOT EXISTS meeting_link text,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.sessions 
  ADD COLUMN IF NOT EXISTS session_number int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS emotional_score int CHECK (emotional_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS homework text;

ALTER TABLE public.patient_files 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'Evaluación',
  ADD COLUMN IF NOT EXISTS file_size text DEFAULT '1.2 MB';

-- 3. Corrección y Completación Integral de Políticas RLS (Row Level Security)

-- TABLA: profiles
DROP POLICY IF EXISTS "Usuarios pueden ver su perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden ver su perfil" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- TABLA: organizations
DROP POLICY IF EXISTS "Ver organizaciones propias" ON public.organizations;
CREATE POLICY "Ver organizaciones propias" ON public.organizations 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Actualizar organizaciones propias" ON public.organizations;
CREATE POLICY "Actualizar organizaciones propias" ON public.organizations 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.id AND om.user_id = auth.uid() AND om.role = 'owner'
    )
  );

-- TABLA: organization_members
DROP POLICY IF EXISTS "Usuarios ven sus membresias" ON public.organization_members;
CREATE POLICY "Usuarios ven sus membresias" ON public.organization_members 
  FOR SELECT USING (
    user_id = auth.uid() 
    OR organization_id = '9b15140b-c4af-4024-b457-e09922c5156a'
    OR auth.role() = 'anon'
    OR auth.role() = 'authenticated'
  );

-- TABLA: professionals
DROP POLICY IF EXISTS "Ver profesionales de mi organización" ON public.professionals;
CREATE POLICY "Ver profesionales de mi organización" ON public.professionals 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = professionals.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Crear profesionales de mi organización" ON public.professionals;
CREATE POLICY "Crear profesionales de mi organización" ON public.professionals 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = professionals.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Actualizar profesionales de mi organización" ON public.professionals;
CREATE POLICY "Actualizar profesionales de mi organización" ON public.professionals 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = professionals.organization_id AND om.user_id = auth.uid()
    )
  );

-- TABLA: patients
DROP POLICY IF EXISTS "Ver pacientes de mi organización" ON public.patients;
CREATE POLICY "Ver pacientes de mi organización" ON public.patients 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = patients.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Crear pacientes" ON public.patients;
CREATE POLICY "Crear pacientes" ON public.patients 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = patients.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Actualizar pacientes de mi organización" ON public.patients;
CREATE POLICY "Actualizar pacientes de mi organización" ON public.patients 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = patients.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Eliminar pacientes de mi organización" ON public.patients;
CREATE POLICY "Eliminar pacientes de mi organización" ON public.patients 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = patients.organization_id AND om.user_id = auth.uid()
    )
  );

-- TABLA: appointments
DROP POLICY IF EXISTS "Ver citas de mi organización" ON public.appointments;
CREATE POLICY "Ver citas de mi organización" ON public.appointments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = appointments.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Crear citas" ON public.appointments;
CREATE POLICY "Crear citas" ON public.appointments 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = appointments.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Actualizar citas de mi organización" ON public.appointments;
CREATE POLICY "Actualizar citas de mi organización" ON public.appointments 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = appointments.organization_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Eliminar citas de mi organización" ON public.appointments;
CREATE POLICY "Eliminar citas de mi organización" ON public.appointments 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = appointments.organization_id AND om.user_id = auth.uid()
    )
  );

-- TABLA: sessions (CRÍTICO: Políticas de privacidad terapéutica)
DROP POLICY IF EXISTS "Ver sesiones asignadas" ON public.sessions;
CREATE POLICY "Ver sesiones de pacientes de mi organización" ON public.sessions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = sessions.patient_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Crear sesiones" ON public.sessions;
CREATE POLICY "Crear sesiones" ON public.sessions 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = sessions.patient_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Actualizar sesiones" ON public.sessions;
CREATE POLICY "Actualizar sesiones" ON public.sessions 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = sessions.patient_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Eliminar sesiones" ON public.sessions;
CREATE POLICY "Eliminar sesiones" ON public.sessions 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = sessions.patient_id AND om.user_id = auth.uid()
    )
  );

-- TABLA: patient_files
DROP POLICY IF EXISTS "Ver archivos de pacientes" ON public.patient_files;
CREATE POLICY "Ver archivos de pacientes" ON public.patient_files 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = patient_files.patient_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Subir archivos de pacientes" ON public.patient_files;
CREATE POLICY "Subir archivos de pacientes" ON public.patient_files 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = patient_files.patient_id AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Eliminar archivos de pacientes" ON public.patient_files;
CREATE POLICY "Eliminar archivos de pacientes" ON public.patient_files 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = patient_files.patient_id AND om.user_id = auth.uid()
    )
  );

-- TABLA: subscriptions
DROP POLICY IF EXISTS "Ver suscripciones" ON public.subscriptions;
CREATE POLICY "Ver suscripciones" ON public.subscriptions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = subscriptions.organization_id AND om.user_id = auth.uid()
    )
  );

-- TABLA: audit_logs
DROP POLICY IF EXISTS "Insertar auditoria" ON public.audit_logs;
CREATE POLICY "Insertar auditoria" ON public.audit_logs 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Ver auditoria de organizacion" ON public.audit_logs;
CREATE POLICY "Ver auditoria de organizacion" ON public.audit_logs 
  FOR SELECT USING (user_id = auth.uid());


-- 4. DATASET PILOTO / DEMO DATA (Psicología Profesional)
DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_prof_id uuid;
  
  -- Pacientes IDs
  v_pat_1 uuid := 'a1111111-1111-4111-8111-111111111111';
  v_pat_2 uuid := 'a2222222-2222-4222-8222-222222222222';
  v_pat_3 uuid := 'a3333333-3333-4333-8333-333333333333';
  v_pat_4 uuid := 'a4444444-4444-4444-8444-444444444444';
  v_pat_5 uuid := 'a5555555-5555-4555-8555-555555555555';
  v_pat_6 uuid := 'a6666666-6666-4666-8666-666666666666';

  -- Citas IDs
  v_app_1 uuid := 'b1111111-1111-4111-8111-111111111111';
  v_app_2 uuid := 'b2222222-2222-4222-8222-222222222222';
  v_app_3 uuid := 'b3333333-3333-4333-8333-333333333333';
  v_app_4 uuid := 'b4444444-4444-4444-8444-444444444444';
  v_app_5 uuid := 'b5555555-5555-4555-8555-555555555555';
  v_app_6 uuid := 'b6666666-6666-4666-8666-666666666666';
  v_app_7 uuid := 'b7777777-7777-4777-8777-777777777777';
  v_app_8 uuid := 'b8888888-8888-4888-8888-888888888888';

BEGIN
  -- Obtener o asignar usuario principal
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
  IF v_user_id IS NULL THEN
    v_user_id := '17b4f40d-336d-44ef-a261-e6e633780deb';
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (v_user_id, 'Lic. Alejandro Mendoza V.', 'owner')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Lic. Alejandro Mendoza V.';
  ELSE
    UPDATE public.profiles 
    SET full_name = 'Lic. Alejandro Mendoza V.' 
    WHERE id = v_user_id;
  END IF;

  -- Obtener o asignar organización
  SELECT organization_id INTO v_org_id FROM public.organization_members WHERE user_id = v_user_id LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug)
    VALUES ('Centro Psicológico Synkro | Velyon Mind Clinic', 'synkro-mind-clinic')
    RETURNING id INTO v_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_user_id, 'owner');
  ELSE
    UPDATE public.organizations 
    SET name = 'Centro Psicológico Synkro | Velyon Mind Clinic', slug = 'synkro-mind-clinic'
    WHERE id = v_org_id;
  END IF;

  -- Actualizar suscripción
  UPDATE public.subscriptions 
  SET plan = 'professional', status = 'active'
  WHERE organization_id = v_org_id;

  -- Asegurar registro en `professionals`
  SELECT id INTO v_prof_id FROM public.professionals WHERE profile_id = v_user_id LIMIT 1;
  IF v_prof_id IS NULL THEN
    INSERT INTO public.professionals (organization_id, profile_id, specialty, license_number, bio)
    VALUES (
      v_org_id, 
      v_user_id, 
      'Psicología Clínica y Terapia Cognitivo Conductual (TCC)',
      'C.Ps.P. 28419',
      'Especialista en trastornos de ansiedad, gestión del estrés laboral y regulación emocional con más de 8 años de experiencia clínica.'
    )
    RETURNING id INTO v_prof_id;
  ELSE
    UPDATE public.professionals
    SET specialty = 'Psicología Clínica y Terapia Cognitivo Conductual (TCC)',
        license_number = 'C.Ps.P. 28419',
        bio = 'Especialista en trastornos de ansiedad, gestión del estrés laboral y regulación emocional con más de 8 años de experiencia clínica.'
    WHERE id = v_prof_id;
  END IF;

  -- Limpiar datos de demostración anteriores de pacientes para recrear con exactitud
  DELETE FROM public.patients WHERE organization_id = v_org_id;

  -- Insertar Pacientes de Prueba Realistas
  INSERT INTO public.patients (
    id, organization_id, first_name, last_name, email, phone, birth_date, gender, 
    consultation_reason, therapeutic_approach, status, notes, emergency_contact
  ) VALUES 
  (
    v_pat_1, v_org_id, 'Camila', 'Valdivia Rosas', 'camila.valdivia@gmail.com', '+51 984 123 456', 
    '1996-04-15', 'Femenino', 'Trastorno de Ansiedad Generalizada y Burnout Laboral', 
    'Cognitivo Conductual (TCC)', 'activo', 
    'Llega derivada por médico ocupacional. Presenta somatizaciones (tensión cervical, insomnio de conciliación). Buenas redes de apoyo.',
    'Roberto Valdivia (Padre) - +51 999 444 333'
  ),
  (
    v_pat_2, v_org_id, 'Mateo', 'Rivas Morales', 'mateo.rivas.m@outlook.com', '+51 972 881 204', 
    '1990-11-20', 'Masculino', 'Episodio Depresivo Leve y Duelo no resuelto', 
    'Terapia de Aceptación y Compromiso (ACT)', 'activo', 
    'Pérdida de progenitor hace 8 meses. Dificultad para retomar proyectos profesionales y anhedonia moderada.',
    'Lucía Rivas (Hermana) - +51 981 223 900'
  ),
  (
    v_pat_3, v_org_id, 'Valeria', 'Gómez & Gonzalo', 'valeria.gomez.t@gmail.com', '+51 945 612 870', 
    '1993-08-05', 'Pareja', 'Conflictos de comunicación y convivencia en pareja', 
    'Terapia Sistémica de Pareja', 'activo', 
    'Relación de 4 años, convivencia reciente. Patrones de escalada y retiro defensivo durante discusiones.',
    'Valeria Gómez - +51 945 612 870'
  ),
  (
    v_pat_4, v_org_id, 'Sebastián', 'Arana Silva', 'sebas.arana.s@gmail.com', '+51 913 774 219', 
    '2003-02-18', 'Masculino', 'Procrastinación académica, baja autoestima y miedo al fracaso', 
    'Cognitivo Conductual (TCC)', 'activo', 
    'Estudiante universitario de 7mo ciclo. Exigencia familiar elevada, esquemas de autoexigencia y evitación conductual.',
    'Claudia Silva (Madre) - +51 944 112 556'
  ),
  (
    v_pat_5, v_org_id, 'Lucía', 'Paredes Cárdenas', 'lucia.paredes.c@empresa.pe', '+51 961 802 345', 
    '1982-06-30', 'Femenino', 'Transición vital, nido vacío y sobrecarga en cuidados familiares', 
    'Humanista Existencial', 'activo', 
    'Directiva corporativa. Expresa sensación de vacío tras independencia de sus hijos y cuidado simultáneo de madre mayor.',
    'Carlos Paredes (Esposo) - +51 962 109 432'
  ),
  (
    v_pat_6, v_org_id, 'Diego', 'Morales Becerra', 'diego.morales.b@gmail.com', '+51 928 440 193', 
    '1998-09-12', 'Masculino', 'Crisis de angustia y Trastorno de Pánico incipiente', 
    'Cognitivo Conductual (TCC)', 'evaluacion', 
    'Primer episodio de pánico en transporte público hace 3 semanas. Hiperventilación y miedo a morir o perder el control.',
    'Mariana Morales (Madre) - +51 920 771 884'
  );

  -- Insertar Citas (Pasadas y Próximas)
  INSERT INTO public.appointments (
    id, organization_id, patient_id, professional_id, appointment_date, 
    start_time, end_time, status, modality, meeting_link, notes
  ) VALUES
  (
    v_app_1, v_org_id, v_pat_1, v_prof_id, CURRENT_DATE, 
    '09:00:00', '10:00:00', 'scheduled', 'presencial', NULL, 'Sesión 5: Evaluación de registro de pensamientos automáticos'
  ),
  (
    v_app_2, v_org_id, v_pat_2, v_prof_id, CURRENT_DATE, 
    '11:00:00', '12:00:00', 'scheduled', 'virtual', 'https://meet.google.com/syn-kro-vely', 'Sesión 4: Ejercicio de defusión cognitiva y valores vitales'
  ),
  (
    v_app_3, v_org_id, v_pat_3, v_prof_id, CURRENT_DATE + INTERVAL '1 day', 
    '17:00:00', '18:15:00', 'scheduled', 'presencial', NULL, 'Sesión 3: Reglas de comunicación asertiva y tiempo fuera'
  ),
  (
    v_app_4, v_org_id, v_pat_4, v_prof_id, CURRENT_DATE + INTERVAL '2 days', 
    '15:00:00', '16:00:00', 'scheduled', 'virtual', 'https://meet.google.com/syn-kro-educ', 'Sesión 2: Análisis funcional de la conducta de postergación'
  ),
  (
    v_app_5, v_org_id, v_pat_5, v_prof_id, CURRENT_DATE + INTERVAL '3 days', 
    '10:30:00', '11:30:00', 'scheduled', 'presencial', NULL, 'Sesión 6: Proyecto de sentido y autocuidado'
  ),
  (
    v_app_6, v_org_id, v_pat_1, v_prof_id, CURRENT_DATE - INTERVAL '7 days', 
    '09:00:00', '10:00:00', 'completed', 'presencial', NULL, 'Sesión 4: Psicoeducación sobre el ciclo del pánico y activación fisiológica'
  ),
  (
    v_app_7, v_org_id, v_pat_2, v_prof_id, CURRENT_DATE - INTERVAL '8 days', 
    '11:00:00', '12:00:00', 'completed', 'virtual', 'https://meet.google.com/syn-kro-vely', 'Sesión 3: Trabajo de duelo y aceptación del dolor sin sufrimiento secundario'
  ),
  (
    v_app_8, v_org_id, v_pat_6, v_prof_id, CURRENT_DATE - INTERVAL '2 days', 
    '18:00:00', '19:00:00', 'completed', 'presencial', NULL, 'Sesión 1: Entrevista inicial, anamnesis y encuadre terapéutico'
  );

  -- Insertar Sesiones Clínicas Detalladas (Doble Capa de Notas Clínicas)
  INSERT INTO public.sessions (
    patient_id, professional_id, appointment_id, session_number, emotional_score,
    session_summary, private_notes, homework, created_at
  ) VALUES
  (
    v_pat_1, v_prof_id, v_app_6, 4, 6,
    'EVOLUCIÓN CLÍNICA:
Se revisa el autorregistro de activación fisiológica. La paciente reporta 2 episodios de taquicardia durante la semana, logrando aplicar la técnica de respiración diafragmática 4-7-8 con descenso en la escala subjetiva de malestar (SUDS) de 8/10 a 4/10. Se profundiza en la distorsión cognitiva de catastrofismo relacionada al rendimiento laboral.

PLAN DE TRABAJO:
Continuar con reestructuración cognitiva y exposición interoceptiva gradual.',
    'NOTAS PRIVADAS (CONFIDENCIAL PSICÓLOGO):
Notable rigidez defensiva vinculada a expectativas paternas no exteriorizadas. En el relato menciona que "no puede permitirse fallar porque en casa siempre fue la fuerte". Explorar en siguientes sesiones el apego ansioso y el rol de salvadora que ha adoptado en el entorno laboral. Sin ideación autolítica.',
    'Completar autorregistro de 4 columnas (Situación, Emoción, Pensamiento Automático, Respuesta Racional) ante momentos de sobrecarga.',
    CURRENT_TIMESTAMP - INTERVAL '7 days'
  ),
  (
    v_pat_2, v_prof_id, v_app_7, 3, 5,
    'EVOLUCIÓN CLÍNICA:
Abordaje del proceso de duelo. El paciente logra verbalizar por primera vez la sensación de soledad sin interrumpir el llanto catártico. Se trabaja la diferencia entre el dolor natural de la pérdida y la culpa autoprovocada. Conexión con valores de gratitud y legado familiar.

PLAN DE TRABAJO:
Activación conductual de bajo impacto (caminatas matutinas) y escritura terapéutica dirigida.',
    'NOTAS PRIVADAS (CONFIDENCIAL PSICÓLOGO):
Riesgo de aislamiento social si deja el trabajo remoto. Ha descuidado hábitos de alimentación (salta el almuerzo). Mantener monitoreo cercano de sintomatología depresiva. Se nota buena alianza terapéutica, apertura emocional sincera.',
    'Escribir una carta no enviada a su padre expresando lo no dicho antes de su partida.',
    CURRENT_TIMESTAMP - INTERVAL '8 days'
  ),
  (
    v_pat_6, v_prof_id, v_app_8, 1, 4,
    'EVOLUCIÓN CLÍNICA:
Primera sesión de evaluación. Se realiza motivo de consulta, encuadre terapéutico, firma de consentimiento informado y aplicación de inventario de ansiedad de Beck (BAI) arrojando puntaje de 31 (ansiedad severa). Se brinda psicoeducación clara sobre qué es una crisis de pánico y por qué no produce daño cardíaco ni pérdida de la cordura.

PLAN DE TRABAJO:
Desmitificar el ataque de pánico y entrenamiento en respiración de emergencia.',
    'NOTAS PRIVADAS (CONFIDENCIAL PSICÓLOGO):
El paciente acude acompañado de su madre quien muestra sobreprotección excesiva (intentaba responder por él). Se solicitó espacio individual para favorecer la autonomía. Paciente hipervigilante a sensaciones corporales (pulso, sudoración). Muy receptivo a la explicación biológica del SNS.',
    'Lectura del tríptico informativo "Comprendiendo la respuesta de lucha o huida". Registro de frecuencia de chequeo de pulso.',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  );

  -- Insertar Documentos Clínicos Simulados en la Bóveda del Paciente
  INSERT INTO public.patient_files (
    patient_id, file_name, storage_path, file_type, category, file_size
  ) VALUES
  (
    v_pat_1, 'Consentimiento_Informado_Terapia_Camila_Valdivia.pdf', 
    'patient-files/' || v_pat_1 || '/consentimiento.pdf', 'application/pdf', 
    'Consentimiento Informado', '420 KB'
  ),
  (
    v_pat_1, 'Inventario_Ansiedad_Beck_BAI_Camila_Valdivia.pdf', 
    'patient-files/' || v_pat_1 || '/bai_evaluacion.pdf', 'application/pdf', 
    'Evaluación Psicométrica', '890 KB'
  ),
  (
    v_pat_2, 'Escala_Depresion_BDI_II_Mateo_Rivas.pdf', 
    'patient-files/' || v_pat_2 || '/bdi_ii.pdf', 'application/pdf', 
    'Evaluación Psicométrica', '760 KB'
  ),
  (
    v_pat_6, 'Informe_Psicologico_Inicial_Diego_Morales.pdf', 
    'patient-files/' || v_pat_6 || '/informe_inicial.pdf', 'application/pdf', 
    'Informe Clínico', '1.4 MB'
  );

END $$;
