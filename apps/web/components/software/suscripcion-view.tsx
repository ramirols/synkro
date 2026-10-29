"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  ShieldCheck,
  Sparkles,
  Clock,
  AlertTriangle,
  Building,
  User,
  Users,
  Smartphone,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  Receipt,
  FileCheck,
  Info,
  Landmark,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useClinicalData } from "@/lib/clinical-context";
import { useSubscription } from "@/lib/subscription-context";
import { PLANS_CONFIG, SubscriptionPlan, getPlanConfig } from "@/lib/config/plans";
import { COMMERCIAL_CONFIG, getCommercialWhatsAppLink } from "@/lib/config/commercial";
import { supabase } from "@/lib/supabase";

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  plan: string;
  period_months: number;
  payment_method: string;
  reference_code: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
}

export default function SuscripcionView() {
  const { user } = useAuth();
  const { isDemo } = useClinicalData();
  const {
    subscription,
    loading,
    plan,
    status,
    effectiveStatus,
    planConfig,
    daysRemaining,
    isTrial,
    isActive,
    isPastDue,
    isExpired,
  } = useSubscription();

  const [selectedPlanModal, setSelectedPlanModal] = useState<SubscriptionPlan | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Cargar historial de pagos de la organización (solo en producción con org real)
  useEffect(() => {
    async function loadHistory() {
      if (isDemo || !user?.organization_id) {
        setPaymentHistory([]);
        return;
      }
      try {
        setLoadingHistory(true);
        const { data, error } = await supabase
          .from("subscription_payments")
          .select("*")
          .eq("organization_id", user.organization_id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setPaymentHistory(data as PaymentHistoryItem[]);
        }
      } catch (err) {
        console.error("Error cargando historial de pagos:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [user?.organization_id, isDemo]);

  if (loading || !subscription) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedPlanData = selectedPlanModal ? PLANS_CONFIG[selectedPlanModal] : null;
  const totalPrice = selectedPlanData ? selectedPlanData.priceMonthly * selectedMonths : 0;

  const modalWhatsAppLink = selectedPlanData
    ? getCommercialWhatsAppLink({
        intent: "plan_hire",
        planName: `${selectedPlanData.name} (${selectedMonths} mes${selectedMonths > 1 ? "es" : ""})`,
        price: `${selectedPlanData.currencySymbol} ${totalPrice}`,
        organizationName: subscription.organization_name,
        organizationId: subscription.organization_id,
      })
    : "#";

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Gestión Comercial & Licencia
        </span>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl mt-1">
          Plan y Suscripción
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Consulta el estado de tu consultorio, límites comerciales y renueva fácilmente mediante pagos locales con Yape o transferencia.
        </p>
      </div>

      {/* Estado Actual de la Suscripción */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xl font-bold text-foreground">
                {subscription.organization_name}
              </span>
              <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {subscription.organization_type === "clinic" ? "Centro Multiprofesional" : "Psicólogo Independiente"}
              </span>
              {isDemo && (
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  Modo Demostración
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              ID de Organización: <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{subscription.organization_id}</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {isTrial && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-amber-800 dark:text-amber-300">
                <Clock size={16} />
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider">Prueba de 14 Días</span>
                  <span className="text-xs font-bold">
                    {daysRemaining > 0 ? `${daysRemaining} días restantes` : "Vence hoy"}
                  </span>
                </div>
              </div>
            )}

            {isActive && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck size={16} />
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider">Plan Activo</span>
                  <span className="text-xs font-bold">Al día</span>
                </div>
              </div>
            )}

            {isPastDue && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-600/10 border border-amber-600/30 px-4 py-2 text-amber-900 dark:text-amber-300">
                <AlertTriangle size={16} />
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider">Periodo de Gracia</span>
                  <span className="text-xs font-bold">Pendiente de Pago</span>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-2 text-destructive">
                <Clock size={16} />
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider">Vencida</span>
                  <span className="text-xs font-bold">Modo Solo Lectura</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detalles y Métricas de Uso */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-6">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Plan Actual</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">{planConfig.name}</span>
              <span className="text-xs text-muted-foreground font-semibold">
                ({planConfig.currencySymbol} {planConfig.priceMonthly}/m)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{planConfig.tagline}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Pacientes Activos</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">{subscription.patient_count}</span>
              <span className="text-xs text-muted-foreground font-semibold">
                {planConfig.limits.maxPatients === null ? "/ Ilimitados" : `/ ${planConfig.limits.maxPatients} máx.`}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Expedientes clínicos registrados</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Terapeutas en Clínica</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">{subscription.professional_count}</span>
              <span className="text-xs text-muted-foreground font-semibold">
                / {planConfig.limits.maxProfessionals} {planConfig.limits.maxProfessionals === 1 ? "profesional" : "profesionales"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Usuarios clínicos autorizados</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Bóveda Documental</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">
                {planConfig.limits.hasFileVault ? "Habilitada" : "No disponible"}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {planConfig.limits.hasFileVault ? "(Cifrado AES-256)" : "(Plan Pro/Clínica)"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Visor in-app de pruebas y reportes</p>
          </div>
        </div>
      </div>

      {/* Selector de Planes para Renovación / Cambio */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Planes Disponibles & Renovación
          </h2>
          <p className="text-xs text-muted-foreground">
            Elige el plan adecuado para tu consultorio. La activación y renovación se gestionan directamente por WhatsApp vía Yape o transferencia bancaria.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(["starter", "professional", "clinic"] as SubscriptionPlan[]).map((pKey) => {
            const p = PLANS_CONFIG[pKey];
            const isCurrentPlan = subscription.plan === pKey;

            return (
              <div
                key={pKey}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all bg-card ${
                  pKey === "professional"
                    ? "border-2 border-primary shadow-lg ring-1 ring-primary/20"
                    : "border-border shadow-2xs hover:border-primary/40"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                        pKey === "professional"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-primary"
                      }`}
                    >
                      {p.badge}
                    </span>
                    {isCurrentPlan && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Plan Actual
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1 border-b pb-4">
                    <span className="text-3xl font-black text-foreground">
                      {p.currencySymbol} {p.priceMonthly}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">/ mes</span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground font-medium">
                        <Check size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanModal(pKey)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      pKey === "professional"
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "border border-input bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>{isCurrentPlan ? "Renovar con Yape" : `Cambiar a ${p.name}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Historial de Pagos & Activaciones</h3>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            {paymentHistory.length} transacciones
          </span>
        </div>

        {loadingHistory ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Cargando pagos...</p>
        ) : paymentHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Sin pagos registrados aún</p>
            <p>Tu cuenta se encuentra activa bajo el periodo de prueba de 14 días o en modo demostración.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 pr-4">Fecha</th>
                  <th className="py-2.5 pr-4">Plan</th>
                  <th className="py-2.5 pr-4">Periodo</th>
                  <th className="py-2.5 pr-4">Monto</th>
                  <th className="py-2.5 pr-4">Método</th>
                  <th className="py-2.5">Referencia</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {paymentHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="py-3 pr-4 font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-3 pr-4 font-bold capitalize">{item.plan}</td>
                    <td className="py-3 pr-4">
                      {item.period_months} mes{item.period_months > 1 ? "es" : ""}
                    </td>
                    <td className="py-3 pr-4 font-bold">
                      {item.currency} {item.amount}
                    </td>
                    <td className="py-3 pr-4 uppercase text-[11px] font-semibold text-primary">
                      {item.payment_method}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-muted-foreground">
                      {item.reference_code || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Coordinación de Pago */}
      {selectedPlanModal && selectedPlanData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Instrucciones de Pago
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  Contratar {selectedPlanData.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector de Meses */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Periodo a Contratar:</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 6].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMonths(m)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedMonths === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {m} {m === 1 ? "Mes" : "Meses"}
                  </button>
                ))}
              </div>
            </div>

            {/* Total a Pagar */}
            <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
              <span className="text-xs font-semibold text-muted-foreground">Total en Soles (PEN):</span>
              <span className="text-2xl font-black text-foreground">
                S/ {totalPrice}
              </span>
            </div>

            {/* Instrucciones Yape */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Smartphone size={16} /> Pago por Yape / Plin
                </span>
                <span className="font-mono text-sm">{COMMERCIAL_CONFIG.yape.number}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Titular: <strong>{COMMERCIAL_CONFIG.yape.holder}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Abre tu app de Yape o Plin, transfiere el monto exacto y envía la captura de pantalla al WhatsApp para activación inmediata.
              </p>
            </div>

            {/* Instrucciones Transferencia BCP */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Landmark size={16} /> Transferencia BCP
                </span>
                <span className="text-xs">Soles</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Puedes solicitar el número de cuenta corriente o CCI directamente por WhatsApp para transferencias interbancarias.
              </p>
            </div>

            {/* Botón de Coordinación WhatsApp */}
            <div className="space-y-2 pt-2">
              <a
                href={modalWhatsAppLink}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-xs text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle size={16} />
                <span>Confirmar Pago por WhatsApp ({COMMERCIAL_CONFIG.phoneFormatted})</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

