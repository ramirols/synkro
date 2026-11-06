// ==============================================================================
// SYNKRO / VELYON — CONFIGURACIÓN GLOBAL CENTRALIZADA DEL SITIO (SINGLE SOURCE OF TRUTH)
// Modifica este archivo para cambiar números de contacto, correos, redes sociales
// y metadatos de marca en toda la aplicación.
// ==============================================================================

export const siteConfig = {
  name: "Synkro",
  brandName: "Synkro",
  companyName: "Velyon",
  alternateName: "VelyonSoft",
  legalName: "VelyonSoft S.A.C.",
  descriptor: "Software de gestión clínica para psicólogos y centros de salud mental",
  tagline: "Tecnología para vender y operar mejor.",
  subTagline: "Gestión clínica inteligente para una salud mental mejor.",
  description:
    "Synkro es la plataforma de gestión clínica creada por Velyon para psicólogos independientes y centros de salud mental en Perú y Latinoamérica.",
  url: "https://synkro.velyonsoft.com",
  companyUrl: "https://www.velyonsoft.com",
  email: "contacto@velyonsoft.com",
  supportEmail: "contacto@velyonsoft.com",
  salesEmail: "contacto@velyonsoft.com",
  privacyEmail: "contacto@velyonsoft.com",
  location: "Lima, Perú",
  country: "Perú",
  phone: "900 083 518",
  phoneFormatted: "+51 900 083 518",
  whatsappNumber: "51900083518",
  whatsappMessage:
    "¡Hola Velyon! Quisiera conversar sobre una solución para mi consultorio de psicología.",
} as const;

export const socialNetworks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/velyonsoft",
    icon: "instagram",
    handle: "@velyonsoft",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/velyonsoft",
    icon: "facebook",
    handle: "velyonsoft",
  },
] as const;

export const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

/**
 * Genera una URL de WhatsApp hacia el número oficial de VelyonSoft con mensaje personalizado
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const message = customMessage || siteConfig.whatsappMessage;
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

