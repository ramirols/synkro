import { z } from "zod";

export const confirmPaymentSchema = z.object({
  plan: z.enum(["free", "starter", "professional", "clinic"], {
    message: "Seleccione un plan válido",
  }),
  months: z
    .number({ message: "Ingrese el número de meses" })
    .int("Debe ser un número entero de meses")
    .min(1, "El período debe ser de al menos 1 mes")
    .max(36, "El período no puede exceder 36 meses"),
  amount: z
    .number({ message: "Ingrese el monto abonado" })
    .min(0, "El monto abonado no puede ser negativo"),
  paymentMethod: z
    .string()
    .trim()
    .min(1, "Seleccione el método de pago registrado"),
  referenceCode: z
    .string()
    .trim()
    .max(100, "El código de referencia no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas de auditoría no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ConfirmPaymentFormData = z.infer<typeof confirmPaymentSchema>;

export const adjustSubscriptionSchema = z.object({
  plan: z.enum(["free", "starter", "professional", "clinic"], {
    message: "Seleccione un plan válido",
  }),
  status: z.enum(["trialing", "active", "past_due", "canceled", "expired"], {
    message: "Seleccione un estado de suscripción válido",
  }),
  extendDays: z
    .number({ message: "Ingrese el número de días adicionales" })
    .int("Debe ser un número entero de días")
    .min(0, "Los días de extensión no pueden ser negativos")
    .max(365, "La extensión no puede superar los 365 días"),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas de ajuste no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type AdjustSubscriptionFormData = z.infer<typeof adjustSubscriptionSchema>;

