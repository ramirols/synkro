import { z } from "zod";

export const inviteProfessionalSchema = z.object({
  fullName: z
    .string({ message: "El nombre completo del profesional es obligatorio" })
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z
    .string({ message: "El correo electrónico es obligatorio" })
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  specialty: z
    .string({ message: "La especialidad clínica es obligatoria" })
    .trim()
    .min(2, "Ingresa una especialidad clínica (ej. TCC, Infanto-Juvenil)"),
  licenseNumber: z
    .string()
    .trim()
    .max(30, "El número de colegiatura no puede superar los 30 caracteres")
    .optional(),
  role: z
    .enum(["psychologist", "admin", "assistant"], {
      message: "Selecciona un rol válido para el miembro",
    })
    .default("psychologist"),
});

export type InviteProfessionalFormData = z.infer<typeof inviteProfessionalSchema>;

export const referralSchema = z.object({
  patient: z
    .string({ message: "Selecciona el paciente para derivación" })
    .trim()
    .min(1, "Selecciona el paciente para derivación"),
  toTherapist: z
    .string({ message: "Selecciona el terapeuta de destino" })
    .trim()
    .min(1, "Selecciona el terapeuta de destino"),
  priority: z.enum(["Baja", "Media", "Alta", "Urgente", "Normal"], {
    message: "Selecciona el nivel de prioridad clínica",
  }),
  reason: z
    .string({ message: "Indica el motivo clínico de la derivación" })
    .trim()
    .min(5, "El motivo de derivación debe tener al menos 5 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type ReferralFormData = z.infer<typeof referralSchema>;
