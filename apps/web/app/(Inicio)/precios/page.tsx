import { Link } from "next-view-transitions";
import { Check, ArrowRight, MessageCircle, Smartphone, CreditCard, ShieldCheck } from "lucide-react";
import PublicHeader from "@/components/inicio/public-header";
import PublicFooter from "@/components/inicio/public-footer";

export const metadata = {
  title: "Precios y Planes con Yape y Tarjetas | Synkro",
  description: "Planes transparentes para psicólogos en Perú. Plan Starter S/ 49, Professional S/ 89 y Clínica S/ 189. Pagos directos con Yape, Plin y tarjetas por WhatsApp.",
  keywords: [
    "precios software psicologos",
    "software psicologia yape peru",
    "cuanto cuesta software para psicologos",
    "software psicoterapia barato peru",
    "planes historias clinicas psicologia",
    "sistema gestion psicologica precio soles",
    "software psicologos plin visa mastercard",
    "software centros psicologia precio mensual",
    "velyon precios software psicologos",
  ],
};

export default function PreciosPage() {
  const whatsappBaseUrl = "https://wa.me/51997676432";

  const getWhatsappPlanLink = (planName: string, price: string) => {
    const text = encodeURIComponent(
      `¡Hola Velyon! Me interesa activar el ${planName} (${price}) de Synkro para mi práctica psicológica. ¿Me pueden enviar los datos para pagar por Yape / Tarjeta y configurar mi clínica?`
    );
    return `${whatsappBaseUrl}?text=${text}`;
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-background py-20 px-6">
        <div className="mx-auto max-w-5xl space-y-16">
          <div className="text-center space-y-4">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              Planes Transparentes & Pagos Locales
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Invierte en orden, tranquilidad y tiempo clínico.
            </h1>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed">
              Sin comisiones ocultas ni contratos forzosos. La activación y pago se coordina directamente por WhatsApp mediante Yape, Plin o Tarjeta.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Starter */}
            <div className="rounded-3xl border bg-card p-7 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    Práctica Inicial
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-foreground">Starter</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para psicólogos independientes que están iniciando su consulta privada.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 border-b pb-4">
                  <span className="text-4xl font-black tracking-tight text-foreground">S/ 49</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ mes (PEN)</span>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Hasta 20 pacientes activos
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Horario semanal visual y agenda
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Fichas clínicas e historial digital
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Notas de sesión estructuradas
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Portal del paciente incluido
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsappPlanLink("Plan Starter", "S/ 49/mes")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-input bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                <span>Activar por WhatsApp</span>
              </a>
            </div>

            {/* Professional */}
            <div className="rounded-3xl border-2 border-primary bg-card p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-6 relative">
              <span className="absolute -top-3.5 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                Más Popular • Recomendado
              </span>

              <div className="space-y-4">
                <div>
                  <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    Práctica Consolidada
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-foreground">Professional</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para terapeutas consolidados que buscan automatizar notas y escalar su consulta.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 border-b pb-4">
                  <span className="text-4xl font-black tracking-tight text-foreground">S/ 89</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ mes (PEN)</span>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground font-bold">
                    <Check size={14} className="text-primary shrink-0" /> Pacientes Ilimitados
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Notas SOAP con Inteligencia Artificial
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Doble capa de notas privadas del terapeuta
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Bóveda de archivos con visor in-app
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Telepsicología con Google Meet integrado
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Soporte prioritario por WhatsApp directo
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsappPlanLink("Plan Professional", "S/ 89/mes")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={15} />
                <span>Elegir Plan Professional</span>
              </a>
            </div>

            {/* Clinic */}
            <div className="rounded-3xl border bg-card p-7 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    Centros & Policlínicos
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-foreground">Clínica / Empresa</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para centros de psicología, consultorios asociados y equipos multidisciplinarios.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 border-b pb-4">
                  <span className="text-4xl font-black tracking-tight text-foreground">S/ 189</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ mes (PEN)</span>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2 text-foreground font-bold">
                    <Check size={14} className="text-primary shrink-0" /> Múltiples psicólogos y terapeutas
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Sistema de derivaciones y triage interno
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Gestión de consultorios físicos (Boxes)
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Comité de supervisión y visado ético
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <Check size={14} className="text-primary shrink-0" /> Métricas de rendimiento de la clínica
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsappPlanLink("Plan Clínica / Empresa", "S/ 189/mes")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-input bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                <span>Activar por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Payment Methods Banner */}
          <div className="rounded-3xl border-2 border-primary/20 bg-secondary/40 p-6 lg:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Smartphone size={18} className="text-primary" />
                  Métodos de Pago Disponibles en Perú
                </h3>
                <p className="text-xs text-muted-foreground">
                  El pago y activación se coordina directamente por WhatsApp de forma 100% personalizada.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl border bg-card px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
                  📱 Yape
                </span>
                <span className="rounded-xl border bg-card px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                  📱 Plin
                </span>
                <span className="rounded-xl border bg-card px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                  💳 Visa / Mastercard
                </span>
                <span className="rounded-xl border bg-card px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  🏦 BCP / BBVA
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Para garantizar que tu consultorio o clínica quede configurado a medida con tu número de colegiatura (C.Ps.P.), logotipo y datos profesionales, la activación se coordina de manera directa por WhatsApp. Te compartimos el código QR de Yape o el link de pago y tendrás tu software listo en menos de 5 minutos.
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
