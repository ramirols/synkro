import { z } from "zod";

export const reclamacionesSchema = z
  .object({
    fullName: z
      .string({ message: "El nombre y apellidos son obligatorios" })
      .trim()
      .min(3, "Ingresa tu nombre y apellidos completos")
      .max(120, "El nombre no puede superar los 120 caracteres"),
    docType: z.enum(["DNI", "CE", "Carné de Extranjería", "Pasaporte", "RUC"], {
      message: "Selecciona un tipo de documento válido",
    }),
    docNumber: z
      .string({ message: "El número de documento es obligatorio" })
      .trim()
      .min(4, "Número de documento no válido"),
    email: z
      .string({ message: "El correo electrónico es obligatorio" })
      .trim()
      .email("Ingresa un correo electrónico válido para recibir la copia"),
    phone: z
      .string({ message: "El teléfono celular es obligatorio" })
      .trim()
      .min(9, "Ingresa un número telefónico válido"),
    address: z
      .string({ message: "La dirección de domicilio es obligatoria" })
      .trim()
      .min(5, "Ingresa una dirección completa (Calle/Av., Número, Distrito)"),
    planName: z.string().default("Starter (S/ 49/mes)"),
    claimedAmount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Ingresa un monto válido (ej. 49.00 o 0.00)")
      .or(z.literal(""))
      .default("0.00"),
    type: z.enum(["Reclamo", "Queja", "reclamo", "queja"], {
      message: "Selecciona si es Reclamo o Queja",
    }),
    description: z
      .string({ message: "El detalle del reclamo o queja es obligatorio" })
      .trim()
      .min(10, "Describe con claridad lo ocurrido (mínimo 10 caracteres)")
      .max(2000, "La descripción no puede superar 2000 caracteres"),
    request: z
      .string({ message: "El pedido del consumidor es obligatorio" })
      .trim()
      .min(5, "Indica qué solución o atención esperas (mínimo 5 caracteres)")
      .max(1000, "El pedido no puede superar 1000 caracteres"),
    termsAccepted: z.literal(true, {
      message: "Debes declarar la veracidad de la información consignada",
    }),
  })
  .refine(
    (data) => {
      if (data.docType === "DNI") {
        return /^\d{8}$/.test(data.docNumber);
      }
      if (data.docType === "RUC") {
        return /^\d{11}$/.test(data.docNumber);
      }
      return data.docNumber.length >= 6 && data.docNumber.length <= 15;
    },
    {
      message: "Formato de documento inválido para el tipo seleccionado (DNI: 8 dígitos, RUC: 11 dígitos)",
      path: ["docNumber"],
    }
  );

export type ReclamacionesFormData = z.infer<typeof reclamacionesSchema>;
