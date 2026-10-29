"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import { useSubscription } from "@/lib/subscription-context";
import { Calendar, LogOut, CreditCard } from "lucide-react";
import Link from "next/link";
import GuidedTourButton from "@/components/software/guided-tour";

export default function Topbar() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { basePath, isDemo, user } = useClinicalData();
  const { planConfig, daysRemaining, isTrial, isExpired } = useSubscription();
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
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/80 px-6 lg:px-10 backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {currentDate || "Práctica Clínica Activa"}
          </span>
          {isDemo ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Modo Demostración
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {user?.platform_role === "superadmin" ? "Modo Superadmin" : "Clínica Activa"}
            </span>
          )}

          <Link
            href={`${basePath}/suscripcion`}
            className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all ${
              isExpired
                ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                : isTrial
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <span>
              {isExpired
                ? "Licencia Vencida"
                : isTrial
                ? `Prueba (${daysRemaining}d)`
                : `Plan ${planConfig.name}`}
            </span>
          </Link>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {user?.full_name || (isDemo ? "Lic. Alejandro Mendoza V." : "Consultorio")}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <GuidedTourButton />
        </div>

        <Link
          href={`${basePath}/agenda`}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
        >
          <Calendar size={14} className="text-primary" />
          <span>Agenda de Hoy</span>
        </Link>

        {isDemo ? (
          <button
            type="button"
            onClick={() => notifyDemoWriteBlocked("Crear Nuevo Paciente")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <span>+ Nuevo Paciente</span>
          </button>
        ) : (
          <Link
            href={`${basePath}/pacientes`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
          >
            <span>+ Nuevo Paciente</span>
          </Link>
        )}

        <button
          onClick={handleLogout}
          title={isDemo ? "Salir de la demo" : "Cerrar sesión"}
          className="flex size-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-2xs cursor-pointer"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}