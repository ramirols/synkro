import type { Metadata } from "next";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/config/site";
import {
  Building2,
  Users,
  ShieldAlert,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageCircle,
  FolderLock,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Software para Centros Psicológicos y Clínicas | Synkro Perú",
  description:
    "Gestión integral para clínicas de salud mental y consultorios multidisciplinarios: múltiples terapeutas, asistentes de admisión, supervisión de casos y portal de pacientes.",
  alternates: {
    canonical: "/centros-psicologicos",
  },
  openGraph: {
    title: "Software para Centros Psicológicos y Clínicas | Synkro Perú",
    description:
      "Alinea a todo tu equipo terapéutico. Control de permisos por rol, agenda unificada y expedientes clínicos compartidos con máxima seguridad.",
    url: "https://synkro.velyonsoft.com/centros-psicologicos",
  },
};

export default function CentrosPsicologicosLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Synkro para Centros Psicológicos",
    operatingSystem: "Web Browser",
    applicationCategory: "MedicalApplication",
    offers: {
      "@type": "Offer",
      price: "189",
      priceCurrency: "PEN",
      priceValidUntil: "2027-12-31",
    },
    description:
      "Plataforma tecnológica de gestión clínica multi-profesional para centros y clínicas de salud mental en Perú y Latinoamérica.",
    creator: {
      "@type": "Organization",
      name: "VelyonSoft",
      url: "https://www.velyonsoft.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Building2 size={14} />
              <span>Plataforma para Clínicas & Equipos Multidisciplinarios</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              El control que tu clínica psicológica necesita,{" "}
              <span className="text-primary">en un solo lugar</span>.
            </h1>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              Administra terapeutas titulares, practicantes, secretarias de admisión y cientos de pacientes con control granular de roles y estricta separación de expedientes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/registrarse"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                <span>Probar 14 días para tu centro</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href={getWhatsAppUrl(
                  "Hola VelyonSoft, represento a un centro psicológico y deseo una demostración para mi equipo"
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-input bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <MessageCircle size={16} className="text-emerald-500" />
                <span>Agendar demo para dirección</span>
              </a>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              Capacitación de personal incluida • Factura comercial • Migración asistida
            </p>
          </div>

          {/* Pillars for Clinics */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users size={22} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Control de Roles & Equipo
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Asigna roles de Director, Psicólogo Titular y Asistente. Cada profesional solo accede a sus pacientes asignados respetando la ética clínica.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Calendar size={22} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Recepción & Citas Cruzadas
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tu personal de recepción puede agendar pacientes en la disponibilidad de cualquier terapeuta de la sede sin ver sus notas diagnósticas confidenciales.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <FolderLock size={22} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Bóveda Institucional de Archivos
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hasta 25 GB de almacenamiento institucional cifrado para informes de evaluación pericial, batería de pruebas (WAIS, WISC, MMPI) y consentimientos.
              </p>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="rounded-3xl border-2 border-primary/20 bg-secondary/30 p-8 sm:p-12 text-center space-y-6">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Plan Clínica & Centros Psicológicos
            </span>
            <div className="space-y-2">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-foreground">S/ 189</span>
                <span className="text-muted-foreground text-sm font-semibold">/ mes</span>
              </div>
              <p className="text-xs text-muted-foreground">
                (o US$ 49 / mes para centros en Latinoamérica). Incluye hasta 5 terapeutas y soporte prioritario.
              </p>
            </div>

            <ul className="mx-auto max-w-md space-y-2.5 text-left text-xs text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Hasta 5 profesionales incluidos (ampliable según tu escala)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Recepción de citas por personal administrativo</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Bóveda documental de 25 GB para protocolos psicométricos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Factura formal y soporte comercial directo por WhatsApp y videollamada</span>
              </li>
            </ul>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/registrarse"
                className="w-full sm:w-auto rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Activar 14 días para mi centro
              </Link>
              <a
                href={getWhatsAppUrl("Hola VelyonSoft, deseo coordinar el Plan Clínica de Synkro")}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <MessageCircle size={15} className="text-emerald-500" />
                <span>Contactar a un Asesor Clínico</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

