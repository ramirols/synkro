export type Patient = {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  notes: string | null;
  status?: "activo" | "inactivo" | "alta" | "evaluacion";
  therapeutic_approach?: string | null;
  consultation_reason?: string | null;
  emergency_contact?: string | null;
  user_id?: string | null;
  portal_status?: "not_invited" | "invited" | "active" | "revoked";
  portal_invitation_sent_at?: string | null;
  portal_invitation_accepted_at?: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  organization_id: string;
  patient_id: string;
  professional_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  modality?: "presencial" | "virtual" | null;
  meeting_link?: string | null;
  notes?: string | null;
  created_at: string;
  patients?: Patient;
};

export type Session = {
  id: string;
  patient_id: string;
  professional_id: string;
  appointment_id: string | null;
  session_summary: string | null;
  private_notes: string | null;
  session_number?: number;
  emotional_score?: number;
  homework?: string | null;
  soap_subjective?: string | null;
  soap_objective?: string | null;
  soap_assessment?: string | null;
  soap_plan?: string | null;
  created_at: string;
  patients?: Patient;
};

export type PatientFile = {
  id: string;
  organization_id?: string;
  patient_id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  category?: string;
  file_category?: "evaluation" | "consent" | "report" | "prescription" | "other";
  file_size?: string;
  shared_with_patient?: boolean;
  uploaded_by?: string | null;
  created_at: string;
  patients?: Patient;
  signed_url?: string;
};

export interface DashboardSummary {
  patientsCount: number;
  appointmentsCount: number;
  sessionsCount: number;
  filesCount: number;
  upcomingAppointments: Appointment[];
  recentSessions: Session[];
}

export interface IClinicalDataService {
  getPatients(): Promise<Patient[]>;
  getPatientById(id: string): Promise<Patient | null>;
  createPatient(
    patient: Omit<Patient, "id" | "created_at" | "organization_id">
  ): Promise<Patient>;
  updatePatient?(id: string, updates: Partial<Patient>): Promise<Patient>;
  deletePatient?(id: string): Promise<void>;

  getAppointments(): Promise<Appointment[]>;
  createAppointment(
    app: Omit<Appointment, "id" | "created_at" | "organization_id" | "professional_id">
  ): Promise<Appointment>;
  updateAppointmentStatus(appId: string, newStatus: string): Promise<void>;

  getSessions(): Promise<Session[]>;
  createSession(
    sess: Omit<Session, "id" | "created_at" | "professional_id">
  ): Promise<Session>;

  getFiles(patientId?: string): Promise<PatientFile[]>;
  createFile(file: Omit<PatientFile, "id" | "created_at">): Promise<PatientFile>;
  uploadFile?(
    file: File,
    patientId: string,
    category: "evaluation" | "consent" | "report" | "prescription" | "other",
    sharedWithPatient: boolean
  ): Promise<PatientFile>;
  getFileSignedUrl?(storagePath: string): Promise<string>;
  deleteFile?(id: string, storagePath?: string): Promise<void>;

  // Portal de Pacientes (Invitaciones e Identidad)
  createPatientPortalInvitation?(
    patientId: string
  ): Promise<{ token: string; expires_at: string; invitation_url: string }>;
  acceptPatientPortalInvitation?(
    token: string
  ): Promise<{ patient_id: string; organization_id: string }>;
  revokePatientPortalAccess?(
    patientId: string
  ): Promise<void>;

  getDashboardSummary(): Promise<DashboardSummary>;
}
