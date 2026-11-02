"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import { useSubscription } from "@/lib/subscription-context";
import { useSidebarLayout } from "@/lib/sidebar-context";
import { Calendar, LogOut, PanelLeft, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import GuidedTourButton from "@/components/software/guided-tour";

export default function Topbar() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { basePath, isDemo, user } = useClinicalData();
  const { plan, planConfig, daysRemaining, isTrial, isExpired, isClinic, subscription } = useSubscription();
  const { isCollapsed, toggleSidebar } = useSidebarLayout();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const handleLogout = async () => {
    if (isDemo) {
      router.push("/iniciar-sesion");
    } else {
      await authLogout();
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 sm:h-20 items-center justify-between border-b bg-background/80 px-3 sm:px-6 lg:px-10 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Botón Icono para abrir/colapsar sidebar (Visible y funcional en móvil y desktop) */}
        <button
          type="button"
          onClick={toggleSidebar}
          title={isCollapsed ? "Expandir menú lateral (Ctrl+B)" : "Colapsar menú lateral (Ctrl+B)"}
          aria-label="Abrir o colapsar menú lateral"
          className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-foreground hover:bg-muted shadow-2xs transition-all cursor-pointer"
        >
          <PanelLeft size={18} className="text-foreground" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="hidden md:inline text-xs font-medium text-muted-foreground capitalize truncate">
              {currentDate || "Práctica Clínica Activa"}
            </span>

            {isDemo ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <span className="hidden sm:inline">Modo</span> Demo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {user?.platform_role === "superadmin"
                  ? "Admin"
                  : isClinic
                  ? "Centro Clínico"
                  : "Psicólogo Titular"}
              </span>
            )}

            <Link
              href={`${basePath}/suscripcion`}
              className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all ${
                isExpired
                  ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                  : isTrial
                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25"
                  : plan === "free"
                  ? "bg-secondary text-primary font-bold hover:bg-secondary/80"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              <span>
                {isExpired
                  ? "Licencia Vencida"
                  : isTrial
                  ? `Prueba (${daysRemaining}d)`
                  : plan === "free"
                  ? "Plan Gratuito"
                  : `Plan ${planConfig.name}`}
              </span>
            </Link>
          </div>

          <h2 className="text-sm sm:text-lg font-semibold tracking-tight text-foreground truncate max-w-[130px] sm:max-w-xs md:max-w-none">
            {isClinic && subscription?.organization_name
              ? subscription.organization_name
              : user?.full_name || (isDemo ? "Lic. Alejandro Mendoza V." : "Consultorio")}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="hidden md:block">
          <GuidedTourButton />
        </div>

        <Link
          href={`${basePath}/agenda`}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
        >
          <Calendar size={14} className="text-primary" />
          <span>Agenda</span>
        </Link>

        {isDemo ? (
          <button
            type="button"
            onClick={() => notifyDemoWriteBlocked("Crear Nuevo Paciente")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 sm:px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nuevo Paciente</span>
            <span className="sm:hidden">Paciente</span>
          </button>
        ) : (
          <Link
            href={`${basePath}/pacientes`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 sm:px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nuevo Paciente</span>
            <span className="sm:hidden">Paciente</span>
          </Link>
        )}

        <button
          onClick={handleLogout}
          title={isDemo ? "Salir de la demo" : "Cerrar sesión"}
          className="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-2xs cursor-pointer"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
