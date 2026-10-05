import {
  Patient,
  Appointment,
  Session,
  PatientFile,
  DashboardSummary,
  IClinicalDataService,
} from "@/lib/types/clinical";
import { DemoStorage, DEMO_PROFILE } from "./demo-storage";

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
    patient: Omit<Patient, "id" | "created_at" | "organization_id">
  ): Promise<Patient> {
    const newRecord: Patient = {
      ...patient,
      id: `pat-${Date.now()}`,
      organization_id: "org-demo-001",
      created_at: new Date().toISOString(),
    };

    const current = DemoStorage.getPatients();
    DemoStorage.savePatients([newRecord, ...current]);
    return newRecord;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const current = DemoStorage.getPatients();
    let updatedItem: Patient | null = null;

    const nextList = current.map((p) => {
      if (p.id === id) {
        updatedItem = { ...p, ...updates };
        return updatedItem;
      }
      return p;
    });

    if (!updatedItem) {
      throw new Error(`Paciente demo con id ${id} no encontrado`);
    }

    DemoStorage.savePatients(nextList);
    return updatedItem;
  },

  async deletePatient(id: string): Promise<void> {
    const current = DemoStorage.getPatients();
    DemoStorage.savePatients(current.filter((p) => p.id !== id));
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
    app: Omit<Appointment, "id" | "created_at" | "organization_id" | "professional_id">
  ): Promise<Appointment> {
    const newRecord: Appointment = {
      ...app,
      id: `app-${Date.now()}`,
      organization_id: "org-demo-001",
      professional_id: DEMO_PROFILE.id,
      created_at: new Date().toISOString(),
    };

    const current = DemoStorage.getAppointments();
    DemoStorage.saveAppointments([...current, newRecord]);
    return newRecord;
  },

  async updateAppointmentStatus(appId: string, newStatus: string): Promise<void> {
    const current = DemoStorage.getAppointments();
    const updated = current.map((a) =>
      a.id === appId ? { ...a, status: newStatus as Appointment["status"] } : a
    );
    DemoStorage.saveAppointments(updated);
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
    sess: Omit<Session, "id" | "created_at" | "professional_id">
  ): Promise<Session> {
    const newRecord: Session = {
      ...sess,
      id: `sess-${Date.now()}`,
      professional_id: DEMO_PROFILE.id,
      created_at: new Date().toISOString(),
    };

    if (sess.appointment_id) {
      await this.updateAppointmentStatus(sess.appointment_id, "completed");
    }

    const current = DemoStorage.getSessions();
    DemoStorage.saveSessions([newRecord, ...current]);
    return newRecord;
  },

  // --- DOCUMENTOS / BÓVEDA ---
  async getFiles(): Promise<PatientFile[]> {
    const files = DemoStorage.getFiles();
    const patients = DemoStorage.getPatients();

    return files.map((f) => ({
      ...f,
      patients: patients.find((p) => p.id === f.patient_id),
    }));
  },

  async createFile(
    file: Omit<PatientFile, "id" | "created_at">
  ): Promise<PatientFile> {
    const newRecord: PatientFile = {
      ...file,
      id: `file-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const current = DemoStorage.getFiles();
    DemoStorage.saveFiles([newRecord, ...current]);
    return newRecord;
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
