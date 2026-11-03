import { z } from "zod";

export const profileSettingsSchema = z.object({
  fullName: z
    .string({ message: "El nombre completo es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{1,4}[-\s]?)?\d{6,14}$/, "Ingresa un número telefónico válido (ej. 999888777)")
    .or(z.literal(""))
    .nullable()
    .optional(),
  specialty: z
    .string()
    .trim()
    .max(100, "La especialidad no puede exceder 100 caracteres")
    .nullable()
    .optional(),
  licenseNumber: z
    .string()
    .trim()
    .max(30, "El número de colegiatura no puede superar 30 caracteres")
    .nullable()
    .optional(),
  bio: z
    .string()
    .trim()
    .max(1000, "La biografía profesional no puede superar 1000 caracteres")
    .nullable()
    .optional(),
  officeAddress: z
    .string()
    .trim()
    .max(200, "La dirección no puede superar 200 caracteres")
    .nullable()
    .optional(),
  defaultMeetLink: z
    .string()
    .trim()
    .url("Ingresa una URL válida de videoconferencia (ej. Google Meet)")
    .or(z.literal(""))
    .nullable()
    .optional(),
});

export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

export const clinicSettingsSchema = z.object({
  clinicName: z
    .string({ message: "El nombre de la clínica es obligatorio" })
    .trim()
    .min(2, "El nombre de la clínica debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  organizationType: z.enum(["independent", "clinic"], {
    message: "Selecciona el modelo de práctica",
  }),
});

export type ClinicSettingsFormData = z.infer<typeof clinicSettingsSchema>;

export const changePasswordSettingsSchema = z
  .object({
    newPassword: z
      .string({ message: "La nueva contraseña es obligatoria" })
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string({ message: "Confirma la nueva contraseña" })
      .min(8, "La confirmación debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ChangePasswordSettingsFormData = z.infer<typeof changePasswordSettingsSchema>;
