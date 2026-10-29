import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain,
  Shield,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageCircle,
  FileText,
  UserCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Software para Psicólogos Independientes | Synkro Perú",
  description:
    "Organiza tu consultorio privado con Synkro: historias clínicas electrónicas, notas privadas confidenciales, agenda inteligente y portal del paciente. Prueba gratis por 14 días.",
  alternates: {
    canonical: "/psicologos",
  },
  openGraph: {
    title: "Software para Psicólogos Independientes | Synkro Perú",
    description:
      "Gestiona tus pacientes, sesiones confidenciales y citas terapéuticas sin complicaciones administrativas. 14 días de prueba gratis.",
    url: "https://synkro.velyonsoft.com/psicologos",
  },
};

export default function PsicologosLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Synkro para Psicólogos Independientes",
    operatingSystem: "Web Browser",
    applicationCategory: "MedicalApplication",
    offers: {
      "@type": "Offer",
      price: "79",
      priceCurrency: "PEN",
      priceValidUntil: "2027-12-31",
    },
    description:
      "Software clínico integral para psicoterapeutas y psicólogos en práctica privada en Perú y Latinoamérica.",
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
              <Brain size={14} />
              <span>Diseñado para tu práctica clínica privada</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Dedícate a la psicoterapia,{" "}
              <span className="text-primary">Synkro</span> cuida tu consultorio.
            </h1>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              La plataforma para psicólogos que buscan orden, confidencialidad médica rigurosa según la Ley 29733 y una experiencia profesional para sus pacientes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/registrarse"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                <span>Probar 14 días gratis</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-2xl border border-input bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <span>Explorar demo interactiva</span>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              Sin tarjeta de crédito requerida • Activación instantánea • Soporte por WhatsApp
            </p>
          </div>

          {/* Pillars for Independent Psychologists */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock size={22} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Notas Privadas Blindadas
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tus hipótesis diagnósticas y notas de encuadre quedan en una capa confidencial inaccesible para terceros y pacientes. Solo tú tienes la llave.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Calendar size={22} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Agenda & Teleterapia
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Organiza citas presenciales o virtuales con enlaces directos de Google Meet y seguimiento de asistencia para evitar cancelaciones de último momento.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <UserCheck size={22} />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Portal para tus Pacientes
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Envía un enlace seguro para que tu paciente consulte sus próximas sesiones y tareas intersesión sin necesidad de llamadas ni mensajes dispersos.
              </p>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="rounded-3xl border-2 border-primary/20 bg-secondary/30 p-8 sm:p-12 text-center space-y-6">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Plan Individual Profesional
            </span>
            <div className="space-y-2">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-foreground">S/ 79</span>
                <span className="text-muted-foreground text-sm font-semibold">/ mes</span>
              </div>
              <p className="text-xs text-muted-foreground">
                (o US$ 22 / mes para Latinoamérica). Incluye 14 días de prueba gratuita.
              </p>
            </div>

            <ul className="mx-auto max-w-md space-y-2.5 text-left text-xs text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Pacientes ilimitados y expedientes completos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Bóveda documental para pruebas psicométricas (hasta 5 GB)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Pagos oficiales con Yape, Plin y transferencia BCP</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Asistencia personalizada por WhatsApp con el equipo Velyon</span>
              </li>
            </ul>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/registrarse"
                className="w-full sm:w-auto rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Comenzar con 14 días gratis
              </Link>
              <a
                href="https://wa.me/51997676432?text=Hola%20VelyonSoft,%20deseo%20información%20sobre%20el%20Plan%20Individual%20de%20Synkro"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <MessageCircle size={15} className="text-emerald-500" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

