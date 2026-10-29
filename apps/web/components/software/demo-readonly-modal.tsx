"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight, MessageCircle, X } from "lucide-react";

export default function DemoReadonlyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [actionName, setActionName] = useState<string>("esta acción");

  useEffect(() => {
    const handleBlocked = (e: Event) => {
      const customEvent = e as CustomEvent<{ action?: string }>;
      setActionName(customEvent.detail?.action || "esta acción");
      setIsOpen(true);
    };

    window.addEventListener("synkro-demo-write-blocked", handleBlocked);
    return () => {
      window.removeEventListener("synkro-demo-write-blocked", handleBlocked);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center relative">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <ShieldAlert size={28} />
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-primary">
            Modo Demostración Comercial (Solo Lectura)
          </span>
          <h3 className="text-xl font-bold tracking-tight text-foreground pt-1">
            Operación de guardado desactivada
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed px-2">
            La función para <strong>{actionName}</strong> está desactivada en esta demo para proteger la integridad de los datos de muestra y permitir una exploración consistente.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/40 p-4 text-xs text-muted-foreground text-left space-y-2">
          <p className="font-semibold text-foreground">
            ¿Deseas gestionar pacientes, citas y notas reales?
          </p>
          <p>
            Inicia tu consultorio con <strong>14 días de prueba gratuita sin tarjeta de crédito</strong> o coordina una activación asistida por WhatsApp con el equipo VelyonSoft.
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <Link
            href="/registrarse"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
          >
            <span>Iniciar Prueba Gratuita de 14 Días</span>
            <ArrowRight size={14} />
          </Link>

          <a
            href="https://wa.me/51997676432?text=Hola%20VelyonSoft,%20estoy%20probando%20la%20demo%20de%20Synkro%20y%20deseo%20activar%20mi%20cuenta"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all shadow-2xs"
          >
            <MessageCircle size={15} />
            <span>Consultar con un Asesor por WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground py-1 cursor-pointer"
          >
            Continuar explorando la demo
          </button>
        </div>
      </div>
    </div>
  );
}

