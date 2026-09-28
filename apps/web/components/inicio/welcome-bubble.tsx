"use client";

import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import {
  Brain,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Smartphone,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from "lucide-react";

export default function WelcomeBubble() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<"hidden" | "balloon" | "expanded">("hidden");
  const [showPillTrigger, setShowPillTrigger] = useState(false);

  useEffect(() => {
    setMounted(true);

    const hasSeen = sessionStorage.getItem("synkro_welcome_bubble_seen_v1");
    if (!hasSeen) {
      // 1. Initial gentle delay before the balloon appears at the bottom
      const timer1 = setTimeout(() => {
        setStage("balloon");
      }, 700);

      // 2. The balloon rises and gradually expands into the full welcome presentation
      const timer2 = setTimeout(() => {
        setStage("expanded");
        sessionStorage.setItem("synkro_welcome_bubble_seen_v1", "true");
      }, 2600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // Already seen in this session, keep only the subtle trigger pill ready
      setShowPillTrigger(true);
    }
  }, []);

  const handleDismiss = () => {
    setStage("hidden");
    setShowPillTrigger(true);
    sessionStorage.setItem("synkro_welcome_bubble_seen_v1", "true");
  };

  const handleOpenFromPill = () => {
    setShowPillTrigger(false);
    setStage("expanded");
  };

  if (!mounted) return null;

  return (
    <>
      {/* 1. Stage: GROWING BALLOON AT THE BOTTOM ("globo en la parte inferior que poco a poco va creciendo") */}
      {stage === "balloon" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="relative flex flex-col items-center animate-in fade-in zoom-in-50 duration-700 slide-in-from-bottom-10">
            {/* Glowing Aura Rings */}
            <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 via-primary to-teal-400 opacity-60 blur-md animate-spin duration-3000" />

            {/* Expanding Balloon Body */}
            <button
              onClick={() => setStage("expanded")}
              className="relative group flex items-center gap-3 rounded-full bg-gradient-to-br from-primary via-emerald-700 to-teal-800 p-2 pr-5 text-white shadow-2xl ring-2 ring-emerald-300/40 hover:scale-105 transition-all duration-500 cursor-pointer"
              title="Abrir presentación de bienvenida"
            >
              <div className="relative flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-inner">
                <Brain className="size-6 text-white animate-bounce" />
                <span className="absolute -top-1 -right-1 flex size-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3.5 bg-emerald-400" />
                </span>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Synkro by Velyon
                  </span>
                  <Sparkles size={11} className="text-amber-300 animate-spin" />
                </div>
                <p className="text-xs font-bold text-white tracking-tight">
                  ¡Bienvenido a la práctica digital! ✨
                </p>
              </div>
            </button>

            {/* Balloon String / Anchor Glow */}
            <div className="mt-1 h-3 w-0.5 bg-gradient-to-b from-emerald-400/80 to-transparent" />
          </div>
        </div>
      )}

      {/* 2. Stage: EXPANDED WELCOME PRESENTATION CARD */}
      {stage === "expanded" && (
        <div className="fixed inset-x-4 bottom-4 md:bottom-6 md:right-6 md:left-auto md:max-w-md z-50 pointer-events-auto">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-8 duration-500">
            {/* Top ambient color mesh */}
            <div className="absolute -top-16 -right-16 size-44 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 size-44 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            {/* Header with Close and Minimize */}
            <div className="relative flex items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                  <Brain size={16} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-foreground">
                    Synkro
                  </span>
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    by Velyon
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleDismiss}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Cerrar bienvenida"
                  title="Cerrar presentación"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Main Greeting Content */}
            <div className="relative mt-4 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                <span>Novedad en Gestión Clínica</span>
              </div>

              <h3 className="text-lg font-black tracking-tight text-foreground sm:text-xl">
                ¡Bienvenido a la revolución de la psicología clínica! 👋
              </h3>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Diseñado para psicólogos independientes y clínicas en Perú que buscan simplificar sus notas clínicas, agenda semanal y control de expedientes con total confidencialidad.
              </p>

              {/* 3 Key Presentation Highlights */}
              <div className="grid gap-2 pt-1 text-xs">
                <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-2.5 transition-colors hover:bg-muted/70">
                  <div className="rounded-lg bg-primary/10 p-1.5 text-primary shrink-0 mt-0.5">
                    <Brain size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">
                      Notas SOAP con Asistencia IA
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Documentación rápida con estricto apego al secreto profesional.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-2.5 transition-colors hover:bg-muted/70">
                  <div className="rounded-lg bg-primary/10 p-1.5 text-primary shrink-0 mt-0.5">
                    <CalendarDays size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">
                      Agenda tipo Horario & Boxes
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Vista semanal de consultorios físicos y citas virtuales por Google Meet.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-2.5 transition-colors hover:bg-muted/70">
                  <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Smartphone size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">
                      Pagos en Soles con Yape & Tarjetas
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Activación directa y personalizada por WhatsApp en minutos.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <Link
                  href="/iniciar-sesion"
                  onClick={handleDismiss}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span>Probar Demostración</span>
                  <ArrowRight size={13} />
                </Link>

                <Link
                  href="/funciones"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Ver Funciones
                </Link>
              </div>

              <div className="pt-1 text-center">
                <button
                  onClick={handleDismiss}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continuar explorando el sitio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Subtle floating launcher pill if dismissed or previously seen */}
      {showPillTrigger && stage === "hidden" && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={handleOpenFromPill}
            className="group flex items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-3.5 py-2 text-xs font-bold text-foreground shadow-lg backdrop-blur-md hover:border-primary/40 hover:bg-secondary/60 hover:text-primary transition-all duration-300"
            title="Ver presentación de bienvenida de Synkro"
          >
            <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
              <Sparkles size={11} />
            </div>
            <span className="hidden sm:inline">Presentación Synkro</span>
          </button>
        </div>
      )}
    </>
  );
}
