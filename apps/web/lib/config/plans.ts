// ==============================================================================
// SYNKRO — CONFIGURACIÓN CENTRALIZADA DE PLANES Y LÍMITES COMERCIALES
// ==============================================================================

export type SubscriptionPlan = "free" | "starter" | "professional" | "clinic";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "expired"
  | "cancelled";

export type OrganizationType = "independent" | "clinic";

export interface PlanLimits {
  /** Cantidad máxima de pacientes activos permitidos (null = ilimitado) */
  maxPatients: number | null;
  /** Cantidad máxima de psicólogos / profesionales activos en la organización */
  maxProfessionals: number;
  /** Capacidad de generar notas clínicas SOAP asistidas por IA */
  hasAiSoap: boolean;
  /** Doble capa de notas privadas del terapeuta (segregadas de la historia general) */
  hasPrivateNotes: boolean;
  /** Bóveda de archivos documentales clínicos con visor in-app */
  hasFileVault: boolean;
  /** Módulo de boxes y consultorios físicos */
  hasPhysicalBoxes: boolean;
  /** Triage y derivaciones entre profesionales */
  hasTriageAndReferrals: boolean;
  /** Panel de supervisión y visado ético para centros */
  hasSupervisionCommittee: boolean;
}

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  badge?: string;
  priceMonthly: number;
  currency: string;
  currencySymbol: string;
  billingPeriodLabel: string;
  tagline: string;
  targetAudience: string;
  recommended: boolean;
  limits: PlanLimits;
  features: string[];
}

export const PLANS_CONFIG: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    id: "free",
    name: "Gratuito",
    badge: "Plan Gratuito",
    priceMonthly: 0,
    currency: "PEN",
    currencySymbol: "S/",
    billingPeriodLabel: "/ mes (Gratis)",
    tagline: "Plan inicial sin costo para psicólogos que inician su consulta privada.",
    targetAudience: "Psicólogos independientes principiantes",
    recommended: false,
    limits: {
      maxPatients: 5,
      maxProfessionals: 1,
      hasAiSoap: false,
      hasPrivateNotes: false,
      hasFileVault: false,
      hasPhysicalBoxes: false,
      hasTriageAndReferrals: false,
      hasSupervisionCommittee: false,
    },
    features: [
      "Hasta 5 pacientes activos registrados",
      "1 profesional titular (independiente)",
      "Horario semanal visual y agenda de citas",
      "Fichas clínicas e historial digital",
      "Notas de sesión estructuradas estándar",
      "Portal del paciente incluido",
      "Gratis sin vencimiento",
    ],
  },

  starter: {
    id: "starter",
    name: "Starter",
    badge: "Práctica en Crecimiento",
    priceMonthly: 49,
    currency: "PEN",
    currencySymbol: "S/",
    billingPeriodLabel: "/ mes (PEN)",
    tagline: "Para psicólogos independientes con consulta activa en crecimiento.",
    targetAudience: "Psicólogos independientes",
    recommended: false,
    limits: {
      maxPatients: 20,
      maxProfessionals: 1,
      hasAiSoap: false,
      hasPrivateNotes: false,
      hasFileVault: false,
      hasPhysicalBoxes: false,
      hasTriageAndReferrals: false,
      hasSupervisionCommittee: false,
    },
    features: [
      "Hasta 20 pacientes activos registrados",
      "1 profesional titular (independiente)",
      "Horario semanal visual y agenda de citas",
      "Fichas clínicas e historial digital",
      "Notas de sesión estructuradas estándar",
      "Portal del paciente incluido",
      "Soporte por WhatsApp",
    ],
  },

  professional: {
    id: "professional",
    name: "Professional",
    badge: "Práctica Consolidada",
    priceMonthly: 89,
    currency: "PEN",
    currencySymbol: "S/",
    billingPeriodLabel: "/ mes (PEN)",
    tagline: "Para terapeutas consolidados que buscan automatizar notas y escalar su consulta.",
    targetAudience: "Terapeutas con consulta privada consolidada",
    recommended: true,
    limits: {
      maxPatients: null, // Ilimitados
      maxProfessionals: 1,
      hasAiSoap: true,
      hasPrivateNotes: true,
      hasFileVault: true,
      hasPhysicalBoxes: false,
      hasTriageAndReferrals: false,
      hasSupervisionCommittee: false,
    },
    features: [
      "Pacientes Ilimitados",
      "1 profesional titular",
      "Notas SOAP con Inteligencia Artificial",
      "Doble capa de notas privadas del terapeuta",
      "Bóveda de archivos con visor in-app",
      "Telepsicología con Google Meet integrado",
      "Soporte prioritario por WhatsApp directo",
    ],
  },

  clinic: {
    id: "clinic",
    name: "Clínica / Empresa",
    badge: "Centros & Policlínicos",
    priceMonthly: 189,
    currency: "PEN",
    currencySymbol: "S/",
    billingPeriodLabel: "/ mes (PEN)",
    tagline: "Para centros de psicología, consultorios asociados y equipos multidisciplinarios.",
    targetAudience: "Clínicas, centros de salud mental y equipos multidisciplinarios",
    recommended: false,
    limits: {
      maxPatients: null, // Ilimitados
      maxProfessionals: 10,
      hasAiSoap: true,
      hasPrivateNotes: true,
      hasFileVault: true,
      hasPhysicalBoxes: true,
      hasTriageAndReferrals: true,
      hasSupervisionCommittee: true,
    },
    features: [
      "Múltiples psicólogos y terapeutas (hasta 10)",
      "Pacientes ilimitados",
      "Sistema de derivaciones y triage interno",
      "Gestión de consultorios físicos (Boxes)",
      "Comité de supervisión y visado ético",
      "Métricas y reportes de rendimiento de la clínica",
      "Soporte corporativo y capacitación personalizada",
    ],
  },
};

export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  if (planId && planId in PLANS_CONFIG) {
    return PLANS_CONFIG[planId as SubscriptionPlan];
  }
  return PLANS_CONFIG.free;
}

export function formatPrice(amount: number): string {
  if (amount === 0) return "Gratis";
  return `S/ ${amount}`;
}
