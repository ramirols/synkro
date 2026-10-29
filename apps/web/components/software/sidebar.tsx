"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useClinicalData } from "@/lib/clinical-context";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Brain,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Building2,
  CreditCard,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { basePath, isDemo, user } = useClinicalData();

  const isSuperAdmin = !isDemo && user?.platform_role === "superadmin";

  const items = [
    {
      name: "Dashboard",
      href: basePath ? basePath : "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Pacientes",
      href: `${basePath}/pacientes`,
      icon: Users,
    },
    {
      name: "Agenda",
      href: `${basePath}/agenda`,
      icon: CalendarDays,
    },
    {
      name: "Sesiones Clínicas",
      href: `${basePath}/sesiones`,
      icon: Brain,
    },
    {
      name: "Documentos",
      href: `${basePath}/documentos`,
      icon: FileText,
    },
    {
      name: "Clínica & Equipo",
      href: `${basePath}/profesionales`,
      icon: Building2,
    },
    {
      name: "Mi Perfil & Clínica",
      href: `${basePath}/configuracion`,
      icon: Settings,
    },
    {
      name: "Suscripción & Plan",
      href: `${basePath}/suscripcion`,
      icon: CreditCard,
    },
  ];

  const handleLogout = async () => {
    if (isDemo) {
      router.push("/iniciar-sesion");
    } else {
      await authLogout();
    }
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r bg-card/60 backdrop-blur-md px-6 py-7 lg:flex z-30">
      <div id="tour-brand-header">
        <div className="flex items-center justify-between">
          <Link href={basePath || "/dashboard"} className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Brain size={20} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Synkro
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">
                by Velyon
              </span>
            </div>
          </Link>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-primary">
            {isDemo ? "Modo Demo" : isSuperAdmin ? "Admin" : "Producción"}
          </span>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {isDemo ? "Demostración Interactiva con Datos Ficticios" : "Gestión clínica & práctica psicológica"}
        </p>
      </div>

      <nav className="mt-8 space-y-1.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isDashboardLink = item.href === (basePath || "/dashboard");
          const isActive = isDashboardLink
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          const tourId =
            item.name === "Dashboard"
              ? "tour-nav-dashboard"
              : item.name === "Pacientes"
              ? "tour-nav-pacientes"
              : item.name === "Agenda"
              ? "tour-nav-agenda"
              : item.name === "Sesiones Clínicas"
              ? "tour-nav-sesiones"
              : item.name === "Documentos"
              ? "tour-nav-documentos"
              : item.name === "Suscripción & Plan"
              ? "tour-nav-suscripcion"
              : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={tourId}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} className={isActive ? "text-primary" : ""} />
              {item.name}
            </Link>
          );
        })}

        {/* Consola exclusiva para Superadmin Velyon (solo en producción) */}
        {isSuperAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors mt-4"
          >
            <ShieldAlert size={18} />
            <span>Consola Velyon Admin</span>
          </Link>
        )}
      </nav>

      {/* User Footer Profile & Logout Button */}
      <div className="mt-auto space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-2xs">
              {user?.full_name ? user.full_name[0] : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.full_name || (isDemo ? "Lic. Alejandro Mendoza V." : "Usuario Clínico")}
              </p>
              <span className="block text-[10px] text-muted-foreground truncate">
                {isDemo
                  ? "Terapeuta Demo"
                  : isSuperAdmin
                  ? "Admin Velyon"
                  : user?.specialty || "Psicólogo Titular"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={isDemo ? "Salir de la demo" : "Cerrar sesión"}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}