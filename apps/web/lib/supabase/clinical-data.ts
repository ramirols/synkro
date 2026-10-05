import { supabase } from "@/lib/supabase";
import {
  Patient,
  Appointment,
  Session,
  PatientFile,
  DashboardSummary,
  IClinicalDataService,
} from "@/lib/types/clinical";

async function getActiveContext() {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    throw new Error("Sesión requerida: debes iniciar sesión para operar en el modo producción");
  }

  // 1. Obtener organización del usuario
  const { data: member, error: memErr } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (memErr || !member) {
    throw new Error(
      "No se encontró una clínica u organización asociada a tu usuario. Revisa tu configuración."
    );
  }

  // 2. Obtener profesional asociado
  const { data: prof } = await supabase
    .from("professionals")
    .select("id")
    .eq("profile_id", user.id)
    .limit(1)
    .single();

  return {
    userId: user.id,
    organizationId: member.organization_id,
    professionalId: prof?.id || null,
  };
}

export const ProductionClinicalDataService: IClinicalDataService = {
  // --- PACIENTES ---
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ProductionClinicalDataService] Error getPatients:", error);
      throw new Error(error.message || "Error al cargar la lista de pacientes desde Supabase");
    }

    return data || [];
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      console.error("[ProductionClinicalDataService] Error getPatientById:", error);
      throw new Error(error.message || `Error al obtener el paciente con ID ${id}`);
    }

    return data;
  },

  async createPatient(
    patient: Omit<Patient, "id" | "created_at" | "organization_id">
  ): Promise<Patient> {
    const context = await getActiveContext();

    const { data, error } = await supabase
      .from("patients")
      .insert([
        {
          ...patient,
          organization_id: context.organizationId,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error createPatient:", error);
      throw new Error(error?.message || "No se pudo registrar el paciente en Supabase");
    }

    return data;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from("patients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error updatePatient:", error);
      throw new Error(error?.message || `No se pudo actualizar el paciente con ID ${id}`);
    }

    return data;
  },

  async deletePatient(id: string): Promise<void> {
    const { error } = await supabase.from("patients").delete().eq("id", id);

    if (error) {
      console.error("[ProductionClinicalDataService] Error deletePatient:", error);
      throw new Error(error.message || `No se pudo eliminar el paciente con ID ${id}`);
    }
  },

  // --- CITAS / AGENDA ---
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "*, patients (id, first_name, last_name, phone, emergency_contact, therapeutic_approach, consultation_reason)"
      )
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("[ProductionClinicalDataService] Error getAppointments:", error);
      throw new Error(error.message || "Error al cargar las citas desde Supabase");
    }

    return data || [];
  },

  async createAppointment(
    app: Omit<Appointment, "id" | "created_at" | "organization_id" | "professional_id">
  ): Promise<Appointment> {
    const context = await getActiveContext();

    if (!context.professionalId) {
      throw new Error(
        "Tu cuenta de usuario no está registrada como profesional clínico activo en la base de datos."
      );
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          ...app,
          organization_id: context.organizationId,
          professional_id: context.professionalId,
        },
      ])
      .select(
        "*, patients (id, first_name, last_name, phone, emergency_contact, therapeutic_approach, consultation_reason)"
      )
      .single();

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error createAppointment:", error);
      throw new Error(error?.message || "No se pudo agendar la cita en Supabase");
    }

    return data;
  },

  async updateAppointmentStatus(appId: string, newStatus: string): Promise<void> {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appId);

    if (error) {
      console.error("[ProductionClinicalDataService] Error updateAppointmentStatus:", error);
      throw new Error(error.message || "No se pudo actualizar el estado de la cita en Supabase");
    }
  },

  // --- SESIONES CLÍNICAS ---
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, patients (id, first_name, last_name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ProductionClinicalDataService] Error getSessions:", error);
      throw new Error(error.message || "Error al cargar las sesiones clínicas desde Supabase");
    }

    return data || [];
  },

  async createSession(
    sess: Omit<Session, "id" | "created_at" | "professional_id">
  ): Promise<Session> {
    const context = await getActiveContext();

    if (!context.professionalId) {
      throw new Error(
        "Tu cuenta de usuario no está registrada como profesional clínico activo en Supabase."
      );
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          ...sess,
          professional_id: context.professionalId,
        },
      ])
      .select("*, patients (id, first_name, last_name)")
      .single();

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error createSession:", error);
      throw new Error(error?.message || "No se pudo registrar la sesión en Supabase");
    }

    // Si viene asociada a una cita, marcarla como completada
    if (sess.appointment_id) {
      await this.updateAppointmentStatus(sess.appointment_id, "completed");
    }

    return data;
  },

  // --- DOCUMENTOS / BÓVEDA ---
  async getFiles(): Promise<PatientFile[]> {
    const { data, error } = await supabase
      .from("patient_files")
      .select("*, patients (id, first_name, last_name, therapeutic_approach)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ProductionClinicalDataService] Error getFiles:", error);
      throw new Error(error.message || "Error al cargar los archivos clínicos desde Supabase");
    }

    return data || [];
  },

  async createFile(
    file: Omit<PatientFile, "id" | "created_at">
  ): Promise<PatientFile> {
    const { data, error } = await supabase
      .from("patient_files")
      .insert([file])
      .select("*, patients (id, first_name, last_name, therapeutic_approach)")
      .single();

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error createFile:", error);
      throw new Error(error?.message || "No se pudo registrar el archivo en Supabase");
    }

    return data;
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
