"use client";

import { useClinicalData } from "@/lib/clinical-context";
import { Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DemoBanner() {
  const { isDemo, resetDemoData } = useClinicalData();

  if (!isDemo) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-6 py-2.5 lg:px-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Sparkles size={16} className="shrink-0 text-primary" />
          <span>
            <strong className="font-semibold">Demostración interactiva (solo lectura)</strong> — Datos de prueba protegidos. Las operaciones de guardado están desactivadas para preservar el entorno.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {resetDemoData && (
            <button
              onClick={resetDemoData}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-2xs"
              title="Restaurar los datos originales de la demo"
            >
              <RotateCcw size={12} />
              <span>Restaurar demo</span>
            </button>
          )}

          <Link
            href="/registrarse"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-2xs"
          >
            <span>Iniciar prueba de 14 días</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
