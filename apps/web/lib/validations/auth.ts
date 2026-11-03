import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "El correo electrónico es obligatorio" })
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string({ message: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string({ message: "El nombre completo es obligatorio" })
    .trim()
    .min(2, "El nombre completo debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  email: z
    .string({ message: "El correo electrónico es obligatorio" })
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string({ message: "La contraseña es obligatoria" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  organizationType: z.enum(["independent", "clinic"], {
    message: "Selecciona el tipo de práctica",
  }),
  clinicName: z
    .string()
    .trim()
    .max(100, "El nombre de la clínica no puede exceder 100 caracteres")
    .optional(),
  licenseNumber: z
    .string()
    .trim()
    .max(30, "El número de colegiatura no puede exceder 30 caracteres")
    .optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const passwordRecoverySchema = z.object({
  email: z
    .string({ message: "El correo electrónico es obligatorio" })
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
});

export type PasswordRecoveryFormData = z.infer<typeof passwordRecoverySchema>;

export const updatePasswordSchema = z
  .object({
    password: z
      .string({ message: "La nueva contraseña es obligatoria" })
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string({ message: "La confirmación de contraseña es obligatoria" })
      .min(8, "La confirmación de contraseña debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export const patientActivationSchema = z
  .object({
    firstName: z
      .string({ message: "El nombre es obligatorio" })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z
      .string({ message: "El apellido es obligatorio" })
      .trim()
      .min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z
      .string({ message: "El correo electrónico es obligatorio" })
      .trim()
      .email("Ingresa un correo electrónico válido"),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?\d{1,4}[-\s]?)?\d{6,14}$/, "Ingresa un número telefónico válido (ej. 999888777)")
      .or(z.literal(""))
      .optional(),
    birthDate: z
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
      .optional(),
    password: z
      .string({ message: "La contraseña es obligatoria" })
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string({ message: "Confirma tu contraseña" })
      .min(6, "La confirmación debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type PatientActivationFormData = z.infer<typeof patientActivationSchema>;
