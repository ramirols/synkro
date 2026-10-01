"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Bell, Calendar, Sparkles, User, LogOut } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  const { user, logout } = useAuth();
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

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-background/80 px-6 lg:px-10 backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {currentDate || "Práctica Clínica Activa"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {user?.role === "superadmin" ? "Modo Superadmin" : "Clínica Activa"}
          </span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {user?.full_name || "Lic. Alejandro Mendoza V."}
        </h2>
      </div>

      <div className="flex items-center gap-3">

        <Link
          href="/agenda"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
        >
          <Calendar size={14} className="text-primary" />
          <span>Agenda de Hoy</span>
        </Link>

        <Link
          href="/pacientes"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
        >
          <span>+ Nuevo Paciente</span>
        </Link>

        <button
          onClick={() => logout()}
          title="Cerrar sesión"
          className="flex size-9 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-2xs"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}