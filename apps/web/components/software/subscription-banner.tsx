"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  MessageCircle,
  X,
  Lock,
} from "lucide-react";
import { useSubscription } from "@/lib/subscription-context";
import { getCommercialWhatsAppLink } from "@/lib/config/commercial";

export default function SubscriptionBanner() {
  const {
    subscription,
    loading,
    planConfig,
    daysRemaining,
    effectiveStatus,
    isTrial,
    isActive,
    isPastDue,
    isExpired,
    canWrite,
  } = useSubscription();

  const [dismissed, setDismissed] = useState(false);

  // Leer estado de descarte de sesión si no es bloqueo total
  useEffect(() => {
    if (typeof window !== "undefined" && isTrial && daysRemaining > 2) {
      const isDismissed = sessionStorage.getItem(`sub_banner_dismissed_${daysRemaining}`);
      if (isDismissed === "true") {
        setDismissed(true);
      }
    }
  }, [isTrial, daysRemaining]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`sub_banner_dismissed_${daysRemaining}`, "true");
    }
  };

  if (loading || !subscription) return null;

  const whatsappRenewalLink = getCommercialWhatsAppLink({
    intent: isExpired ? "plan_renewal" : "plan_hire",
    planName: planConfig.name,
    price: `${planConfig.currencySymbol} ${planConfig.priceMonthly}/mes`,
    organizationName: subscription.organization_name,
    organizationId: subscription.organization_id,
  });

  // CASO 1: SUSCRIPCIÓN O PRUEBA VENCIDA (BLOQUEO COMERCIAL ESTRICTO — NO DESCARTABLE)
  if (isExpired || !canWrite) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4 sm:p-5 text-destructive dark:bg-destructive/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-xs">
              <Lock size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                Periodo Finalizado • Acceso Clínico en Modo Lectura
              </h4>
              <p className="text-xs text-foreground/90 leading-relaxed max-w-2xl">
                Tu prueba de 14 días o suscripción ha culminado. <strong>Tus expedientes y citas están seguros y disponibles para consulta</strong>, pero las nuevas altas y modificaciones han sido pausadas. Renueva tu plan para continuar operando sin interrupciones.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
            <Link
              href="/suscripcion"
              className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-2 text-xs font-bold text-destructive-foreground shadow-xs hover:opacity-90 transition-opacity"
            >
              <span>Ver Planes & Renovar</span>
              <ArrowRight size={13} />
            </Link>

            <a
              href={whatsappRenewalLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-colors"
            >
              <MessageCircle size={14} className="text-emerald-600" />
              <span>Yape / WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // CASO 2: PERIODO DE GRACIA (PAST_DUE)
  if (isPastDue) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <p className="text-xs font-medium">
              Tu periodo contratado ha concluido. Cuentas con <strong>3 días de gracia</strong> para confirmar tu renovación por Yape antes de pausar operaciones clínicas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/suscripcion"
              className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
            >
              Renovar Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CASO 3: PRUEBA GRATUITA PROGRESIVA (TRIALING)
  if (isTrial) {
    if (dismissed) return null;

    // Día 12-14: Alerta urgente (<= 2 días restantes)
    if (daysRemaining <= 2) {
      return (
        <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Prueba de 14 días • {daysRemaining === 0 ? "Vence hoy" : `Quedan ${daysRemaining} día(s)`}
                </span>
                <p className="text-xs text-foreground/90">
                  Contrata tu plan hoy para asegurar la continuidad de tus citas y pacientes sin bloqueos operativos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/suscripcion"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
              >
                <span>Elegir Plan</span>
                <ArrowRight size={13} />
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                title="Descartar aviso temporalmente"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Día 10-11: Recordatorio (<= 4 días restantes)
    if (daysRemaining <= 4) {
      return (
        <div className="relative mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 sm:px-4 text-foreground">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <Clock size={15} className="text-primary shrink-0" />
              <span>
                Te quedan <strong>{daysRemaining} días</strong> de prueba gratuita en Synkro. Conoce las opciones de pago local con Yape.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/suscripcion"
                className="text-xs font-bold text-primary hover:underline"
              >
                Ver planes →
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
                title="Descartar aviso"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Día 1-9: Banner inicial discreto
    return (
      <div className="relative mb-6 rounded-2xl border border-border/80 bg-card p-3 sm:px-4 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Espacio en <strong className="text-foreground">Prueba Gratuita ({daysRemaining} días restantes)</strong>. Disfrutas de todas las funciones sin costo.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/suscripcion"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Planes & Yape
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              title="Ocultar"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

