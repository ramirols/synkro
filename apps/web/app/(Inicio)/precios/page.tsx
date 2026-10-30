import { Link } from "next-view-transitions";
import { Check, ArrowRight, MessageCircle, Smartphone, CreditCard, ShieldCheck, Landmark } from "lucide-react";
import PublicHeader from "@/components/inicio/public-header";
import PublicFooter from "@/components/inicio/public-footer";
import { PLANS_CONFIG } from "@/lib/config/plans";
import { COMMERCIAL_CONFIG, getCommercialWhatsAppLink } from "@/lib/config/commercial";

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
  const starter = PLANS_CONFIG.starter;
  const professional = PLANS_CONFIG.professional;
  const clinic = PLANS_CONFIG.clinic;

  return (
    <>
      <main className="min-h-screen bg-background py-20 px-6">
        <div className="mx-auto max-w-5xl space-y-16">
          <div className="text-center space-y-4">
            <div className="mx-auto flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                Plan Gratuito disponible para siempre (hasta 5 pacientes)
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Pagos en Soles con Yape & Plin
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Invierte en orden, tranquilidad y tiempo clínico.
            </h1>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed">
              Comienza gratis sin tarjeta de crédito o contrata un plan para tu consulta activa. La activación y renovación se coordinan de manera directa por WhatsApp mediante Yape, Plin o Transferencia BCP.
            </p>
          </div>

          {/* Plan Gratuito Callout */}
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
                  Para Iniciar
                </span>
                <h3 className="text-base font-bold text-foreground">Plan Gratuito — S/ 0</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Hasta 5 pacientes activos, 1 profesional independiente, agenda de citas y portal de pacientes. Sin caducidad ni tarjeta requerida.
              </p>
            </div>
            <Link
              href="/registrarse"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shrink-0 shadow-xs"
            >
              <span>Crear Cuenta Gratis</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Starter */}
            <div className="rounded-3xl border bg-card p-7 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {starter.badge}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{starter.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {starter.tagline}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 border-b pb-4">
                  <span className="text-4xl font-black tracking-tight text-foreground">
                    {starter.currencySymbol} {starter.priceMonthly}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">{starter.billingPeriodLabel}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  {starter.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getCommercialWhatsAppLink({
                  intent: "plan_hire",
                  planName: starter.name,
                  price: `${starter.currencySymbol} ${starter.priceMonthly}/mes`,
                })}
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
                    {professional.badge}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{professional.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {professional.tagline}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 border-b pb-4">
                  <span className="text-4xl font-black tracking-tight text-foreground">
                    {professional.currencySymbol} {professional.priceMonthly}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">{professional.billingPeriodLabel}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  {professional.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getCommercialWhatsAppLink({
                  intent: "plan_hire",
                  planName: professional.name,
                  price: `${professional.currencySymbol} ${professional.priceMonthly}/mes`,
                })}
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
                    {clinic.badge}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{clinic.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {clinic.tagline}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 border-b pb-4">
                  <span className="text-4xl font-black tracking-tight text-foreground">
                    {clinic.currencySymbol} {clinic.priceMonthly}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">{clinic.billingPeriodLabel}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  {clinic.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={getCommercialWhatsAppLink({
                  intent: "plan_hire",
                  planName: clinic.name,
                  price: `${clinic.currencySymbol} ${clinic.priceMonthly}/mes`,
                })}
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
                <span className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Smartphone size={13} className="text-purple-600" />
                  <span>Yape ({COMMERCIAL_CONFIG.yape.number})</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                  <Smartphone size={13} className="text-cyan-600" />
                  <span>Plin</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                  <CreditCard size={13} className="text-blue-600" />
                  <span>Visa / Mastercard</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Landmark size={13} className="text-amber-600" />
                  <span>BCP / BBVA</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Para garantizar que tu consultorio o clínica quede configurado a medida con tu número de colegiatura (C.Ps.P.), logotipo y datos profesionales, la activación se coordina de manera directa por WhatsApp al <strong className="text-foreground">{COMMERCIAL_CONFIG.phoneFormatted}</strong>. Te compartimos el código QR de Yape o los datos de transferencia y tendrás tu software listo en minutos.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
