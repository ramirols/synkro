import {
  Patient,
  Appointment,
  Session,
  PatientFile,
  DashboardSummary,
  IClinicalDataService,
} from "@/lib/types/clinical";
import { DemoStorage, DEMO_PROFILE } from "./demo-storage";

const DEMO_READONLY_ERROR =
  "La demo comercial es exclusivamente de exploración interactiva (modo solo lectura). Para crear expedientes reales, agendar citas y gestionar documentación clínica, inicia tu prueba gratuita de 14 días.";

export function notifyDemoWriteBlocked(actionName: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("synkro-demo-write-blocked", {
        detail: {
          action: actionName,
          message: DEMO_READONLY_ERROR,
        },
      })
    );
  }
}

export const DemoClinicalDataService: IClinicalDataService = {
  // --- PACIENTES ---
  async getPatients(): Promise<Patient[]> {
    return DemoStorage.getPatients();
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const patients = DemoStorage.getPatients();
    return patients.find((p) => p.id === id) || null;
  },

  async createPatient(
    _patient: Omit<Patient, "id" | "created_at" | "organization_id">
  ): Promise<Patient> {
    notifyDemoWriteBlocked("Crear Paciente");
    throw new Error(DEMO_READONLY_ERROR);
  },

  async updatePatient(_id: string, _updates: Partial<Patient>): Promise<Patient> {
    notifyDemoWriteBlocked("Modificar Paciente");
    throw new Error(DEMO_READONLY_ERROR);
  },

  async deletePatient(_id: string): Promise<void> {
    notifyDemoWriteBlocked("Eliminar Paciente");
    throw new Error(DEMO_READONLY_ERROR);
  },

  // --- CITAS / AGENDA ---
  async getAppointments(): Promise<Appointment[]> {
    const apps = DemoStorage.getAppointments();
    const patients = DemoStorage.getPatients();

    return apps.map((app) => ({
      ...app,
      patients: patients.find((p) => p.id === app.patient_id),
    }));
  },

  async createAppointment(
    _app: Omit<Appointment, "id" | "created_at" | "organization_id" | "professional_id">
  ): Promise<Appointment> {
    notifyDemoWriteBlocked("Agendar Cita");
    throw new Error(DEMO_READONLY_ERROR);
  },

  async updateAppointmentStatus(_appId: string, _newStatus: string): Promise<void> {
    notifyDemoWriteBlocked("Actualizar Estado de Cita");
    throw new Error(DEMO_READONLY_ERROR);
  },

  // --- SESIONES CLÍNICAS ---
  async getSessions(): Promise<Session[]> {
    const sessions = DemoStorage.getSessions();
    const patients = DemoStorage.getPatients();

    return sessions.map((s) => ({
      ...s,
      patients: patients.find((p) => p.id === s.patient_id),
    }));
  },

  async createSession(
    _sess: Omit<Session, "id" | "created_at" | "professional_id">
  ): Promise<Session> {
    notifyDemoWriteBlocked("Crear Nota de Sesión");
    throw new Error(DEMO_READONLY_ERROR);
  },

  // --- DOCUMENTOS / BÓVEDA ---
  async getFiles(patientId?: string): Promise<PatientFile[]> {
    let files = DemoStorage.getFiles();
    if (patientId) {
      files = files.filter((f) => f.patient_id === patientId);
    }
    const patients = DemoStorage.getPatients();

    return files.map((f) => ({
      ...f,
      patients: patients.find((p) => p.id === f.patient_id),
    }));
  },

  async createFile(
    _file: Omit<PatientFile, "id" | "created_at">
  ): Promise<PatientFile> {
    notifyDemoWriteBlocked("Registrar Documento");
    throw new Error(DEMO_READONLY_ERROR);
  },

  async uploadFile(
    _file: File,
    _patientId: string,
    _category: "evaluation" | "consent" | "report" | "prescription" | "other" = "other",
    _sharedWithPatient: boolean = false
  ): Promise<PatientFile> {
    notifyDemoWriteBlocked("Subir Archivo Clínico");
    throw new Error(DEMO_READONLY_ERROR);
  },

  async getFileSignedUrl(storagePath: string): Promise<string> {
    // Modo demo: enlace simulado de visualización
    return `#demo-viewer-${encodeURIComponent(storagePath)}`;
  },

  async deleteFile(_id: string): Promise<void> {
    notifyDemoWriteBlocked("Eliminar Documento");
    throw new Error(DEMO_READONLY_ERROR);
  },

  // --- PORTAL DEL PACIENTE (DEMO) ---
  async createPatientPortalInvitation(patientId: string): Promise<{
    token: string;
    expires_at: string;
    invitation_url: string;
  }> {
    return {
      token: "demo-invitation-token-mock",
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      invitation_url: `${typeof window !== "undefined" ? window.location.origin : ""}/portal-paciente/activar?token=demo-token-${patientId}`,
    };
  },

  async acceptPatientPortalInvitation(_token: string): Promise<{
    patient_id: string;
    organization_id: string;
  }> {
    notifyDemoWriteBlocked("Activar Portal");
    throw new Error(DEMO_READONLY_ERROR);
  },

  async revokePatientPortalAccess(_patientId: string): Promise<void> {
    notifyDemoWriteBlocked("Revocar Acceso al Portal");
    throw new Error(DEMO_READONLY_ERROR);
  },

  // --- RESUMEN DASHBOARD ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    const [patients, appointments, sessions, files] = await Promise.all([
      this.getPatients(),
      this.getAppointments(),
      this.getSessions(),
      this.getFiles(),
    ]);

    const upcomingAppointments = appointments
      .filter((a) => a.status === "scheduled")
      .slice(0, 5);

    const recentSessions = sessions.slice(0, 4);

    return {
      patientsCount: patients.length,
      appointmentsCount: appointments.length,
      sessionsCount: sessions.length,
      filesCount: files.length,
      upcomingAppointments,
      recentSessions,
    };
  },
};
