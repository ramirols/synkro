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

  // 2. Obtener profesional asociado a la organización activa
  const { data: prof } = await supabase
    .from("professionals")
    .select("id")
    .eq("profile_id", user.id)
    .eq("organization_id", member.organization_id)
    .limit(1)
    .maybeSingle();

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*, patients (id, first_name, last_name, therapeutic_approach)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ProductionClinicalDataService] Error getSessions:", error);
      throw new Error(error.message || "Error al cargar las sesiones clínicas desde Supabase");
    }

    if (!sessions || sessions.length === 0) return [];

    // Cargar notas privadas exclusivamente si el usuario es el autor terapeuta
    // (PostgreSQL RLS en session_private_notes devolverá solo las que pertenecen a auth.uid())
    if (user) {
      const sessionIds = sessions.map((s) => s.id);
      const { data: privateNotes } = await supabase
        .from("session_private_notes")
        .select("session_id, content")
        .in("session_id", sessionIds);

      if (privateNotes && privateNotes.length > 0) {
        const notesMap = new Map<string, string>();
        for (const pn of privateNotes) {
          notesMap.set(pn.session_id, pn.content);
        }
        return sessions.map((s) => ({
          ...s,
          private_notes: notesMap.get(s.id) || null,
        }));
      }
    }

    return sessions;
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
          patient_id: sess.patient_id,
          appointment_id: sess.appointment_id || null,
          session_number: sess.session_number,
          emotional_score: sess.emotional_score,
          session_summary: sess.session_summary || null,
          private_notes: sess.private_notes || null,
          soap_subjective: sess.soap_subjective || null,
          soap_objective: sess.soap_objective || null,
          soap_assessment: sess.soap_assessment || null,
          soap_plan: sess.soap_plan || null,
          homework: sess.homework || null,
          professional_id: context.professionalId,
        },
      ])
      .select("*, patients (id, first_name, last_name, therapeutic_approach)")
      .single();

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error createSession:", error);
      throw new Error(error?.message || "No se pudo registrar la sesión en Supabase");
    }

    // Asegurar persistencia en session_private_notes si se proporcionó nota privada
    if (sess.private_notes && sess.private_notes.trim()) {
      await supabase
        .from("session_private_notes")
        .upsert(
          {
            session_id: data.id,
            organization_id: context.organizationId,
            author_id: context.userId,
            content: sess.private_notes.trim(),
          },
          { onConflict: "session_id" }
        );
    }

    // Si viene asociada a una cita, marcarla como completada
    if (sess.appointment_id) {
      await this.updateAppointmentStatus(sess.appointment_id, "completed");
    }

    return {
      ...data,
      private_notes: sess.private_notes || null,
    };
  },

  // --- DOCUMENTOS / BÓVEDA ---
  async getFiles(patientId?: string): Promise<PatientFile[]> {
    let query = supabase
      .from("patient_files")
      .select("*, patients (id, first_name, last_name, therapeutic_approach)")
      .order("created_at", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[ProductionClinicalDataService] Error getFiles:", error);
      throw new Error(error.message || "Error al cargar los archivos clínicos desde Supabase");
    }

    return data || [];
  },

  async createFile(
    file: Omit<PatientFile, "id" | "created_at">
  ): Promise<PatientFile> {
    const context = await getActiveContext();

    const { data, error } = await supabase
      .from("patient_files")
      .insert([
        {
          ...file,
          organization_id: file.organization_id || context.organizationId,
          uploaded_by: file.uploaded_by || context.userId,
          shared_with_patient: file.shared_with_patient ?? false,
          file_category: file.file_category || "other",
        },
      ])
      .select("*, patients (id, first_name, last_name, therapeutic_approach)")
      .single();

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error createFile:", error);
      throw new Error(error?.message || "No se pudo registrar el archivo en Supabase");
    }

    return data;
  },

  async uploadFile(
    file: File,
    patientId: string,
    category: "evaluation" | "consent" | "report" | "prescription" | "other" = "other",
    sharedWithPatient: boolean = false
  ): Promise<PatientFile> {
    const context = await getActiveContext();

    // 1. Validar tamaño (máximo 15 MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("El archivo supera el límite de 15 MB permitido por la bóveda clínica.");
    }

    // 2. Validar tipo de archivo y extensión permitidos
    const ALLOWED_MIME_TYPES = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".docx", ".doc"];

    const fileExtension = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new Error(
        `Extensión de archivo no permitida (${fileExtension}). Formatos autorizados: PDF, PNG, JPG, WEBP, DOCX.`
      );
    }
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(
        `Tipo MIME no autorizado (${file.type}). Formatos autorizados: PDF, PNG, JPG, WEBP, DOCX.`
      );
    }

    // 3. Sanitizar nombre de archivo y generar ruta segura anti path-traversal
    const sanitizedBase = file.name
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const cleanFileName = sanitizedBase || `document_${Date.now()}${fileExtension}`;
    const storagePath = `${patientId}/${Date.now()}_${cleanFileName}`;

    // 4. Subir a Supabase Storage (bucket 'patient-files')
    const { error: uploadErr } = await supabase.storage
      .from("patient-files")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadErr) {
      console.error("[ProductionClinicalDataService] Error subiendo archivo a Storage:", uploadErr);
      throw new Error(`Error en el almacenamiento de archivos: ${uploadErr.message}`);
    }

    // Formatear tamaño
    const sizeFormatted =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    // 5. Registrar en base de datos
    return await this.createFile({
      organization_id: context.organizationId,
      patient_id: patientId,
      file_name: cleanFileName,
      storage_path: storagePath,
      file_type: file.type || "application/octet-stream",
      category: category,
      file_category: category,
      file_size: sizeFormatted,
      shared_with_patient: sharedWithPatient,
      uploaded_by: context.userId,
    });
  },

  async getFileSignedUrl(storagePath: string): Promise<string> {
    // 1. Verificar autorización y existencia en la tabla de metadatos clínicos (protegido por RLS)
    const { data: fileRecord, error: fileErr } = await supabase
      .from("patient_files")
      .select("id, storage_path")
      .eq("storage_path", storagePath)
      .maybeSingle();

    if (fileErr || !fileRecord) {
      throw new Error("No tienes autorización o el archivo clínico solicitado no existe.");
    }

    // 2. Generar URL firmada temporal de 15 minutos (900 segundos)
    const { data, error } = await supabase.storage
      .from("patient-files")
      .createSignedUrl(storagePath, 900);

    if (error || !data?.signedUrl) {
      console.error("[ProductionClinicalDataService] Error generando signed URL:", error);
      throw new Error(error?.message || "No se pudo generar el enlace seguro de acceso.");
    }

    return data.signedUrl;
  },

  async deleteFile(id: string, storagePath?: string): Promise<void> {
    if (storagePath) {
      await supabase.storage.from("patient-files").remove([storagePath]);
    }
    const { error } = await supabase.from("patient_files").delete().eq("id", id);
    if (error) {
      console.error("[ProductionClinicalDataService] Error deleteFile:", error);
      throw new Error(error.message || "No se pudo eliminar el archivo clínico.");
    }
  },

  // --- PORTAL DEL PACIENTE (INVITACIONES E IDENTIDAD) ---
  async createPatientPortalInvitation(
    patientId: string
  ): Promise<{ token: string; expires_at: string; invitation_url: string }> {
    const { data, error } = await supabase.rpc("create_patient_portal_invitation", {
      p_patient_id: patientId,
    });

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error createPatientPortalInvitation:", error);
      throw new Error(error?.message || "No se pudo generar la invitación al portal del paciente.");
    }

    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://synkro.velyonsoft.com";
    const invitationUrl = `${origin}/portal-paciente/activar?token=${data.token}`;

    return {
      token: data.token,
      expires_at: data.expires_at,
      invitation_url: invitationUrl,
    };
  },

  async acceptPatientPortalInvitation(
    token: string
  ): Promise<{ patient_id: string; organization_id: string }> {
    const { data, error } = await supabase.rpc("accept_patient_portal_invitation", {
      p_token: token,
    });

    if (error || !data) {
      console.error("[ProductionClinicalDataService] Error acceptPatientPortalInvitation:", error);
      throw new Error(error?.message || "No se pudo procesar la invitación al portal del paciente.");
    }

    return data;
  },

  async revokePatientPortalAccess(patientId: string): Promise<void> {
    const { error } = await supabase.rpc("revoke_patient_portal_access", {
      p_patient_id: patientId,
    });

    if (error) {
      console.error("[ProductionClinicalDataService] Error revokePatientPortalAccess:", error);
      throw new Error(error.message || "No se pudo revocar el acceso al portal del paciente.");
    }
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
