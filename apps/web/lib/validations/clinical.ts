import { z } from "zod";

export const patientSchema = z.object({
  first_name: z
    .string({ message: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede exceder 80 caracteres"),
  last_name: z
    .string({ message: "El apellido es obligatorio" })
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(80, "El apellido no puede exceder 80 caracteres"),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido")
    .or(z.literal(""))
    .nullable()
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{1,4}[-\s]?)?\d{6,14}$/, "Ingresa un número telefónico válido (ej. 999888777)")
    .or(z.literal(""))
    .nullable()
    .optional(),
  birth_date: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const d = new Date(val);
        return !isNaN(d.getTime()) && d <= new Date();
      },
      { message: "La fecha de nacimiento no puede ser futura" }
    )
    .or(z.literal(""))
    .nullable()
    .optional(),
  gender: z.string().nullable().optional(),
  therapeutic_approach: z.string().nullable().optional(),
  consultation_reason: z
    .string()
    .trim()
    .max(500, "El motivo de consulta no puede superar los 500 caracteres")
    .nullable()
    .optional(),
  emergency_contact: z
    .string()
    .trim()
    .max(200, "El contacto de emergencia no puede superar los 200 caracteres")
    .nullable()
    .optional(),
  notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres")
    .nullable()
    .optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export const appointmentSchema = z
  .object({
    patient_id: z
      .string({ message: "Selecciona un paciente para la cita" })
      .trim()
      .min(1, "Selecciona un paciente para la cita"),
    appointment_date: z
      .string({ message: "La fecha de la cita es obligatoria" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (AAAA-MM-DD)"),
    start_time: z
      .string({ message: "La hora de inicio es obligatoria" })
      .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Formato de hora inválido (HH:mm)"),
    modality: z.enum(["presencial", "virtual"], {
      message: "Selecciona la modalidad de atención",
    }),
    meeting_link: z
      .string()
      .trim()
      .url("Ingresa una URL válida para la sesión virtual (ej. Google Meet)")
      .or(z.literal(""))
      .nullable()
      .optional(),
    notes: z
      .string()
      .trim()
      .max(500, "Las notas no pueden superar los 500 caracteres")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // Si es virtual y se llenó enlace, debe ser URL válida
      if (data.modality === "virtual" && data.meeting_link) {
        return z.string().url().safeParse(data.meeting_link).success;
      }
      return true;
    },
    {
      message: "El enlace de teleconsulta debe ser una URL válida",
      path: ["meeting_link"],
    }
  );

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const sessionSchema = z
  .object({
    patient_id: z
      .string({ message: "Selecciona un paciente" })
      .trim()
      .min(1, "Selecciona un paciente"),
    session_number: z.coerce
      .number({ message: "El número de sesión debe ser un valor numérico" })
      .int()
      .min(1, "El número de sesión debe ser al menos 1")
      .default(1),
    emotional_score: z.coerce
      .number({ message: "La escala anímica debe ser un número del 1 al 10" })
      .int()
      .min(1, "La escala mínima es 1")
      .max(10, "La escala máxima es 10")
      .default(5),
    session_summary: z.string().trim().nullable().optional(),
    soap_subjective: z.string().trim().nullable().optional(),
    soap_objective: z.string().trim().nullable().optional(),
    soap_assessment: z.string().trim().nullable().optional(),
    soap_plan: z.string().trim().nullable().optional(),
    private_notes: z.string().trim().nullable().optional(),
    homework: z.string().trim().nullable().optional(),
  })
  .refine(
    (data) => {
      const hasSummary = !!data.session_summary?.trim();
      const hasSoap =
        !!data.soap_subjective?.trim() ||
        !!data.soap_objective?.trim() ||
        !!data.soap_assessment?.trim() ||
        !!data.soap_plan?.trim();
      const hasPrivate = !!data.private_notes?.trim();

      return hasSummary || hasSoap || hasPrivate;
    },
    {
      message:
        "Registra al menos el resumen de sesión, los campos SOAP o notas confidenciales de la consulta",
      path: ["session_summary"],
    }
  );

export type SessionFormData = z.infer<typeof sessionSchema>;

export const documentSchema = z.object({
  patientId: z
    .string({ message: "Selecciona el paciente del expediente" })
    .trim()
    .min(1, "Selecciona el paciente del expediente"),
  fileName: z
    .string({ message: "Ingresa el nombre descriptivo del documento" })
    .trim()
    .min(2, "El nombre del documento debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede exceder 120 caracteres"),
  category: z
    .string({ message: "Selecciona una categoría clínica para el archivo" })
    .trim()
    .min(1, "Selecciona una categoría clínica para el archivo"),
  sharedWithPatient: z.boolean().default(false),
});

export type DocumentFormData = z.infer<typeof documentSchema>;
