import { Patient, Appointment, Session, PatientFile } from "@/lib/types/clinical";

export const DEMO_PROFILE = {
  id: "prof-demo-001",
  email: "demo@synkro.com",
  full_name: "Lic. Alejandro Mendoza V.",
  role: "owner" as const,
  platform_role: "user" as const,
  specialty: "Psicología Clínica y TCC",
  license_number: "C.Ps.P. 28419",
  bio: "Especialista en trastornos de ansiedad, estrés y regulación emocional con más de 8 años de experiencia clínica.",
  office_address: "Av. Benavides 1570, Miraflores, Lima",
  default_meet_link: "https://meet.google.com/syn-kro-demo",
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "pat-1",
    organization_id: "org-demo-001",
    first_name: "Camila",
    last_name: "Valdivia Rosas",
    email: "camila.valdivia@gmail.com",
    phone: "+51 984 123 456",
    birth_date: "1996-04-15",
    gender: "Femenino",
    therapeutic_approach: "Cognitivo Conductual (TCC)",
    consultation_reason: "Trastorno de Ansiedad Generalizada y Burnout Laboral",
    emergency_contact: "Roberto Valdivia (Padre) - +51 999 444 333",
    notes: "Llega derivada por médico ocupacional. Presenta somatizaciones (tensión cervical, insomnio de conciliación). Buenas redes de apoyo.",
    status: "activo",
    created_at: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "pat-2",
    organization_id: "org-demo-001",
    first_name: "Mateo",
    last_name: "Rivas Morales",
    email: "mateo.rivas.m@outlook.com",
    phone: "+51 972 881 204",
    birth_date: "1990-11-20",
    gender: "Masculino",
    therapeutic_approach: "Terapia de Aceptación y Compromiso (ACT)",
    consultation_reason: "Episodio Depresivo Leve y Duelo no resuelto",
    emergency_contact: "Lucía Rivas (Hermana) - +51 981 223 900",
    notes: "Pérdida de progenitor hace 8 meses. Dificultad para retomar proyectos profesionales y anhedonia moderada.",
    status: "activo",
    created_at: "2026-09-18T11:30:00.000Z",
  },
  {
    id: "pat-3",
    organization_id: "org-demo-001",
    first_name: "Valeria",
    last_name: "Gómez & Gonzalo",
    email: "valeria.gomez.t@gmail.com",
    phone: "+51 945 612 870",
    birth_date: "1993-08-05",
    gender: "Pareja",
    therapeutic_approach: "Terapia Sistémica de Pareja",
    consultation_reason: "Conflictos de comunicación y convivencia en pareja",
    emergency_contact: "Valeria Gómez - +51 945 612 870",
    notes: "Relación de 4 años, convivencia reciente. Patrones de escalada y retiro defensivo durante discusiones.",
    status: "activo",
    created_at: "2026-09-20T16:00:00.000Z",
  },
  {
    id: "pat-4",
    organization_id: "org-demo-001",
    first_name: "Sebastián",
    last_name: "Arana Silva",
    email: "sebas.arana.s@gmail.com",
    phone: "+51 913 774 219",
    birth_date: "2003-02-18",
    gender: "Masculino",
    therapeutic_approach: "Cognitivo Conductual (TCC)",
    consultation_reason: "Procrastinación académica, baja autoestima y miedo al fracaso",
    emergency_contact: "Claudia Silva (Madre) - +51 944 112 556",
    notes: "Estudiante universitario de 7mo ciclo. Exigencia familiar elevada, esquemas de autoexigencia y evitación conductual.",
    status: "activo",
    created_at: "2026-09-22T09:15:00.000Z",
  },
  {
    id: "pat-5",
    organization_id: "org-demo-001",
    first_name: "Lucía",
    last_name: "Paredes Cárdenas",
    email: "lucia.paredes.c@empresa.pe",
    phone: "+51 961 802 345",
    birth_date: "1982-06-30",
    gender: "Femenino",
    therapeutic_approach: "Humanista Existencial",
    consultation_reason: "Transición vital, nido vacío y sobrecarga en cuidados familiares",
    emergency_contact: "Carlos Paredes (Esposo) - +51 962 109 432",
    notes: "Directiva corporativa. Expresa sensación de vacío tras independencia de sus hijos y cuidado simultáneo de madre mayor.",
    status: "activo",
    created_at: "2026-09-23T14:40:00.000Z",
  },
  {
    id: "pat-6",
    organization_id: "org-demo-001",
    first_name: "Diego",
    last_name: "Morales Becerra",
    email: "diego.morales.b@gmail.com",
    phone: "+51 928 440 193",
    birth_date: "1998-09-12",
    gender: "Masculino",
    therapeutic_approach: "Cognitivo Conductual (TCC)",
    consultation_reason: "Crisis de angustia y Trastorno de Pánico incipiente",
    emergency_contact: "Mariana Morales (Madre) - +51 920 771 884",
    notes: "Primer episodio de pánico en transporte público hace 3 semanas. Hiperventilación y miedo a morir o perder el control.",
    status: "evaluacion",
    created_at: "2026-09-24T18:00:00.000Z",
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "app-1",
    organization_id: "org-demo-001",
    patient_id: "pat-1",
    professional_id: "prof-demo-001",
    appointment_date: "2026-09-28",
    start_time: "09:00:00",
    end_time: "10:00:00",
    status: "completed",
    modality: "presencial",
    notes: "Box 1 (Adultos / TCC) • Sesión 4: Reestructuración cognitiva sobre autoexigencia laboral",
    created_at: "2026-09-25T10:00:00.000Z",
  },
  {
    id: "app-2",
    organization_id: "org-demo-001",
    patient_id: "pat-2",
    professional_id: "prof-demo-001",
    appointment_date: "2026-09-28",
    start_time: "11:00:00",
    end_time: "12:00:00",
    status: "completed",
    modality: "presencial",
    notes: "Box 1 (Adultos / TCC) • Sesión 2: Clarificación de valores según ACT y trabajo de duelo",
    created_at: "2026-09-25T11:00:00.000Z",
  },
  {
    id: "app-3",
    organization_id: "org-demo-001",
    patient_id: "pat-3",
    professional_id: "prof-demo-001",
    appointment_date: "2026-09-28",
    start_time: "16:00:00",
    end_time: "17:15:00",
    status: "completed",
    modality: "presencial",
    notes: "Box 2 (Parejas y Familias) • Sesión 1: Encuadre relacional y contrato terapéutico",
    created_at: "2026-09-25T12:00:00.000Z",
  },
  {
    id: "app-4",
    organization_id: "org-demo-001",
    patient_id: "pat-4",
    professional_id: "prof-demo-001",
    appointment_date: "2026-09-29",
    start_time: "10:00:00",
    end_time: "11:00:00",
    status: "scheduled",
    modality: "virtual",
    meeting_link: "https://meet.google.com/syn-kro-demo",
    notes: "Sesión 3: Registro de pensamientos distorsionados ante exámenes de grado",
    created_at: "2026-09-26T09:00:00.000Z",
  },
  {
    id: "app-5",
    organization_id: "org-demo-001",
    patient_id: "pat-5",
    professional_id: "prof-demo-001",
    appointment_date: "2026-09-29",
    start_time: "15:00:00",
    end_time: "16:00:00",
    status: "scheduled",
    modality: "presencial",
    notes: "Box 1 (Adultos / TCC) • Sesión 2: Exploración de sentido de vida y autocuidado",
    created_at: "2026-09-26T10:30:00.000Z",
  },
  {
    id: "app-6",
    organization_id: "org-demo-001",
    patient_id: "pat-6",
    professional_id: "prof-demo-001",
    appointment_date: "2026-09-30",
    start_time: "09:00:00",
    end_time: "10:00:00",
    status: "scheduled",
    modality: "presencial",
    notes: "Box 1 (Adultos / TCC) • Sesión 1: Psicoeducación sobre el pánico y técnica de respiración diafragmática",
    created_at: "2026-09-27T08:00:00.000Z",
  },
  {
    id: "app-7",
    organization_id: "org-demo-001",
    patient_id: "pat-1",
    professional_id: "prof-demo-001",
    appointment_date: "2026-10-02",
    start_time: "09:00:00",
    end_time: "10:00:00",
    status: "scheduled",
    modality: "virtual",
    meeting_link: "https://meet.google.com/syn-kro-demo",
    notes: "Sesión 5: Exposición gradual a situaciones de delegación de tareas laborales",
    created_at: "2026-09-27T14:00:00.000Z",
  },
  {
    id: "app-8",
    organization_id: "org-demo-001",
    patient_id: "pat-2",
    professional_id: "prof-demo-001",
    appointment_date: "2026-10-02",
    start_time: "11:00:00",
    end_time: "12:00:00",
    status: "scheduled",
    modality: "presencial",
    notes: "Box 1 (Adultos / TCC) • Sesión 3: Defusión cognitiva de pensamientos de culpa",
    created_at: "2026-09-27T15:00:00.000Z",
  },
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: "sess-1",
    patient_id: "pat-1",
    professional_id: "prof-demo-001",
    appointment_id: "app-1",
    session_number: 4,
    emotional_score: 7,
    session_summary:
      "Se revisó autorregistro de pensamientos distorsionados durante situaciones de sobrecarga laboral. La paciente logró identificar sesgos de catastrofismo y sobregeneralización. Muestra mayor asertividad en límites con su jefatura.",
    soap_subjective:
      "Paciente refiere menor nivel de ansiedad general (SUDS 4/10). Expresa satisfacción por haber logrado decir 'no' a una asignación de última hora en su trabajo sin experimentar taquicardia severa.",
    soap_objective:
      "Contacto visual sostenido, postura relajada, afecto congruente con el relato. Presenta autorregistro impreso con 4 entradas completadas metódicamente.",
    soap_assessment:
      "Buena asimilación de técnicas de reestructuración cognitiva (TCC). Disminución notable de la conducta de evitación experiencial ante figuras de autoridad laboral.",
    soap_plan:
      "Consolidar asertividad mediante ensayo conductual. Mantener autorregistro ABC ante situaciones ansiógenas y practicar respiración diafragmática 10 min diarios.",
    private_notes:
      "NOTA PRIVADA / CONFIDENCIAL: Paciente verbaliza culpa excesiva vinculada a expectativas parentales exigentes. Mantener foco en aceptación incondicional y separación de valía personal respecto a productividad.",
    homework: "Completar autorregistro ABC de 3 situaciones ansiógenas esta semana.",
    created_at: "2026-09-28T10:00:00.000Z",
  },
  {
    id: "sess-2",
    patient_id: "pat-2",
    professional_id: "prof-demo-001",
    appointment_id: "app-2",
    session_number: 2,
    emotional_score: 5,
    session_summary:
      "Trabajo en torno a la pérdida del padre. Se realizó ejercicio de la 'Brújula de Valores' de ACT enfocado en área de relaciones familiares y trascendencia vital.",
    soap_subjective:
      "Paciente reporta tristeza moderada persistente y dificultad para concentrarse en su jornada. Manifiesta temor a olvidar los momentos compartidos con su padre.",
    soap_objective:
      "Facie compungida, pausas prolongadas al hablar de la pérdida, llanto silente en la mitad de la sesión. Responde adecuadamente a la contención empática.",
    soap_assessment:
      "Duelo no complicado en curso. Apertura a trabajar aceptación y defusión cognitiva según principios de ACT. Vínculo terapéutico sólido y colaborativo.",
    soap_plan:
      "Ejercicio de la carta no enviada para facilitar elaboración del duelo. Revisión de red de apoyo social en próxima sesión.",
    private_notes:
      "NOTA PRIVADA / CONFIDENCIAL: Llanto contenido. Muestra resistencia inicial a contactar con la tristeza pero tolera la experiencia guiada. Buena alianza terapéutica en consolidación.",
    homework: "Escribir una carta no enviada dirigida al padre expresando lo no dicho.",
    created_at: "2026-09-28T12:00:00.000Z",
  },
  {
    id: "sess-3",
    patient_id: "pat-3",
    professional_id: "prof-demo-001",
    appointment_id: "app-3",
    session_number: 1,
    emotional_score: 6,
    session_summary:
      "Primera sesión de pareja. Se establecieron las reglas de encuadre relacional: escucha activa sin interrupción y confidencialidad compartida. Ambos miembros expresan disposición a la terapia.",
    soap_subjective:
      "Ambos miembros de la pareja expresan desgaste en la comunicación cotidiana y desacuerdos en la crianza de los hijos.",
    soap_objective:
      "Tensión postural inicial, interrupciones mutuas observadas en los primeros 15 minutos que disminuyen tras intervención del terapeuta en encuadre.",
    soap_assessment:
      "Patrón de demanda-retraimiento típico en parejas con escalada simétrica. Ambos conservan motivación hacia la continuidad de la relación.",
    soap_plan:
      "Implementar protocolo de tiempo fuera ('time-out') de 20 minutos ante discusiones acaloradas en casa. Sesión individual con cada uno la próxima semana.",
    private_notes:
      "NOTA PRIVADA / CONFIDENCIAL: Alta simetría en la escalada. Gonzalo tiende al retraimiento ('stonewalling') ante críticas percibidas. Valeria responde con hiperactivación verbal.",
    homework: "Implementar pausa acordada ('Time-Out') de 20 minutos si una discusión sube de tono.",
    created_at: "2026-09-28T17:15:00.000Z",
  },
];

export const INITIAL_FILES: PatientFile[] = [
  {
    id: "file-1",
    organization_id: "org-demo-001",
    patient_id: "pat-1",
    file_name: "Evaluacion_Inicial_BAI_Ansiedad.pdf",
    category: "Evaluación Psicométrica",
    file_category: "evaluation",
    file_type: "application/pdf",
    file_size: "1.4 MB",
    storage_path: "patient-files/pat-1/bai_ansiedad.pdf",
    shared_with_patient: true,
    created_at: "2026-09-24T14:30:00.000Z",
  },
  {
    id: "file-2",
    organization_id: "org-demo-001",
    patient_id: "pat-1",
    file_name: "Consentimiento_Informado_Terapia_Adultos.pdf",
    category: "Consentimiento Informado",
    file_category: "consent",
    file_type: "application/pdf",
    file_size: "850 KB",
    storage_path: "patient-files/pat-1/consentimiento.pdf",
    shared_with_patient: true,
    created_at: "2026-09-24T14:35:00.000Z",
  },
  {
    id: "file-3",
    organization_id: "org-demo-001",
    patient_id: "pat-2",
    file_name: "Inventario_Depresion_Beck_BDI_II.pdf",
    category: "Evaluación Psicométrica",
    file_category: "evaluation",
    file_type: "application/pdf",
    file_size: "1.1 MB",
    storage_path: "patient-files/pat-2/bdi_ii.pdf",
    shared_with_patient: false,
    created_at: "2026-09-25T11:00:00.000Z",
  },
  {
    id: "file-4",
    organization_id: "org-demo-001",
    patient_id: "pat-3",
    file_name: "Cuestionario_Satisfaccion_Marital_Dyadic.pdf",
    category: "Informe Clínico",
    file_category: "report",
    file_type: "application/pdf",
    file_size: "2.3 MB",
    storage_path: "patient-files/pat-3/satisfaccion_marital.pdf",
    shared_with_patient: false,
    created_at: "2026-09-26T16:20:00.000Z",
  },
];

const KEYS = {
  PATIENTS: "synkro_mock_patients",
  APPOINTMENTS: "synkro_mock_appointments",
  SESSIONS: "synkro_mock_sessions",
  FILES: "synkro_mock_files",
};

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[DemoStorage] Error saving ${key}:`, e);
  }
}

export const DemoStorage = {
  getPatients(): Patient[] {
    return getLocal<Patient[]>(KEYS.PATIENTS, INITIAL_PATIENTS);
  },
  savePatients(patients: Patient[]): void {
    setLocal(KEYS.PATIENTS, patients);
  },

  getAppointments(): Appointment[] {
    return getLocal<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  },
  saveAppointments(appointments: Appointment[]): void {
    setLocal(KEYS.APPOINTMENTS, appointments);
  },

  getSessions(): Session[] {
    return getLocal<Session[]>(KEYS.SESSIONS, INITIAL_SESSIONS);
  },
  saveSessions(sessions: Session[]): void {
    setLocal(KEYS.SESSIONS, sessions);
  },

  getFiles(): PatientFile[] {
    return getLocal<PatientFile[]>(KEYS.FILES, INITIAL_FILES);
  },
  saveFiles(files: PatientFile[]): void {
    setLocal(KEYS.FILES, files);
  },

  resetAll(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      localStorage.setItem(KEYS.FILES, JSON.stringify(INITIAL_FILES));
    } catch (e) {
      console.error("[DemoStorage] Error resetting demo data:", e);
    }
  },
};
