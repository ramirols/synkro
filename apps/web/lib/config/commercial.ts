// ==============================================================================
// SYNKRO — CONFIGURACIÓN COMERCIAL CENTRALIZADA
// Única fuente de verdad para contacto comercial, WhatsApp y métodos de pago
// ==============================================================================

export const COMMERCIAL_CONFIG = {
  // Número comercial oficial para soporte, ventas y comprobantes
  phone: "997 676 432",
  phoneFormatted: "+51 997 676 432",
  countryCode: "51",
  rawNumber: "997676432",
  
  // WhatsApp
  whatsappNumber: "51997676432",
  whatsappBaseUrl: "https://wa.me/51997676432",

  // Datos para pagos locales manuales en Perú
  yape: {
    number: "997 676 432",
    holder: "VelyonSoft / Synkro",
    qrNote: "Acepta Yape y Plin desde cualquier banco.",
  },

  bankTransfer: {
    bank: "BCP (Banco de Crédito del Perú)",
    accountType: "Cuenta Corriente Soles",
    accountNumber: "194-98765432-0-89", // Referencia informativa para coordinación
    cci: "002-194-0098765432089-12",
    holder: "VelyonSoft S.A.C.",
  },

  // Políticas comerciales
  trialDurationDays: 14,
  currency: "PEN",
  currencySymbol: "S/",
  
  supportEmail: "soporte@synkro.pe",
  salesEmail: "hola@velyon.pe",
} as const;

/**
 * Genera el enlace de WhatsApp con mensaje prellenado seguro (sin datos clínicos ni sensibles)
 */
export function getCommercialWhatsAppLink(options: {
  intent: "trial_activation" | "plan_hire" | "plan_renewal" | "upgrade" | "support";
  planName?: string;
  price?: string;
  organizationName?: string;
  organizationId?: string;
}): string {
  const { intent, planName, price, organizationName, organizationId } = options;

  let message = "";
  const orgRef = organizationName
    ? ` para mi consultorio/clínica "${organizationName}"`
    : "";
  const codeRef = organizationId ? ` (Ref: ${organizationId.substring(0, 8)})` : "";

  switch (intent) {
    case "plan_hire":
      message = `¡Hola Velyon! Me interesa contratar el ${planName || "Plan"} (${price || "PEN"})${orgRef}${codeRef}. ¿Me pueden enviar los datos para pagar por Yape o Transferencia y habilitar mi cuenta?`;
      break;

    case "plan_renewal":
      message = `¡Hola Velyon! Deseo renovar mi suscripción del ${planName || "Plan"}${orgRef}${codeRef}. He realizado o deseo coordinar el pago por Yape / Transferencia.`;
      break;

    case "upgrade":
      message = `¡Hola Velyon! Mi consultorio${orgRef}${codeRef} ha alcanzado los límites de mi plan actual. Deseo ampliar la capacidad al ${planName || "Plan Superior"}. ¿Cuáles son los pasos a seguir?`;
      break;

    case "trial_activation":
      message = `¡Hola Velyon! Estoy usando la prueba de 14 días de Synkro${orgRef} y deseo coordinar la configuración personalizada con mi número de colegiatura (C.Ps.P.).`;
      break;

    case "support":
    default:
      message = `¡Hola Velyon! Necesito asistencia comercial o técnica sobre Synkro${orgRef}${codeRef}.`;
      break;
  }

  return `${COMMERCIAL_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
}

