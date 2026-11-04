"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useClinicalData } from "@/lib/clinical-context";
import { useSubscription } from "@/lib/subscription-context";
import { useSidebarLayout } from "@/lib/sidebar-context";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { basePath, isDemo, user } = useClinicalData();
  const { subscription, planConfig, isClinic } = useSubscription();
  const { isCollapsed, toggleSidebar } = useSidebarLayout();

  const isSuperAdmin = !isDemo && user?.platform_role === "superadmin";
  const userRole = (user?.role as string) || (isDemo ? "owner" : "owner");

  const rawItems = [
    {
      name: "Dashboard",
      href: basePath ? basePath : "/dashboard",
      icon: LayoutDashboard,
      roles: ["owner", "admin", "psychologist", "assistant"],
    },
    {
      name: isClinic ? "Pacientes del Centro" : "Pacientes",
      href: `${basePath}/pacientes`,
      icon: Users,
      roles: ["owner", "admin", "psychologist", "assistant"],
    },
    {
      name: isClinic ? "Agenda & Boxes" : "Agenda",
      href: `${basePath}/agenda`,
      icon: CalendarDays,
      roles: ["owner", "admin", "psychologist", "assistant"],
    },
    {
      name: "Sesiones Clínicas",
      href: `${basePath}/sesiones`,
      icon: Brain,
      roles: ["owner", "admin", "psychologist"],
    },
    {
      name: "Documentos",
      href: `${basePath}/documentos`,
      icon: FileText,
      roles: ["owner", "admin", "psychologist"],
    },
  ];

  // Menú exclusivo de gestión para centros y clínicas
  if (isClinic) {
    rawItems.push({
      name: "Equipo de Psicólogos",
      href: `${basePath}/profesionales`,
      icon: Building2,
      roles: ["owner", "admin", "psychologist"],
    });
  }

  rawItems.push({
    name: isClinic ? "Mi Perfil & Centro" : "Mi Perfil & Consultorio",
    href: `${basePath}/configuracion`,
    icon: Settings,
    roles: ["owner", "admin", "psychologist", "assistant"],
  });

  if (userRole === "owner" || userRole === "admin" || isDemo) {
    rawItems.push({
      name: "Suscripción & Plan",
      href: `${basePath}/suscripcion`,
      icon: CreditCard,
      roles: ["owner", "admin"],
    });
  }

  const items = rawItems.filter((i) => i.roles.includes(userRole));

  const handleLogout = async () => {
    if (isDemo) {
      router.push("/iniciar-sesion");
    } else {
      await authLogout();
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 hidden h-screen flex-col border-r bg-card/75 backdrop-blur-md lg:flex z-30 transition-[width,padding] duration-200 ease-in-out ${
        isCollapsed ? "w-20 px-3 py-6" : "w-72 px-6 py-7"
      }`}
    >
      {/* Brand Header */}
      <div id="tour-brand-header">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <Link
              href={basePath || "/dashboard"}
              title="Synkro by Velyon"
              className="flex size-10 items-center justify-center rounded-xl overflow-hidden shadow-sm hover:opacity-90 transition-opacity"
            >
              <Image
                src="/icon.png"
                alt="Synkro"
                width={40}
                height={40}
                className="size-10 rounded-xl object-cover"
                priority
              />
            </Link>
            <button
              onClick={toggleSidebar}
              title="Expandir barra lateral"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <Link href={basePath || "/dashboard"} className="flex items-center gap-2.5">
                <Image
                  src="/icon.png"
                  alt="Synkro"
                  width={36}
                  height={36}
                  className="size-9 rounded-xl object-cover shadow-sm"
                  priority
                />
                <div>
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    Synkro
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">
                    by Velyon
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-primary">
                  {isDemo ? "Demo" : isSuperAdmin ? "Admin" : isClinic ? "Centro" : "Independiente"}
                </span>
                <button
                  onClick={toggleSidebar}
                  title="Colapsar barra lateral"
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground line-clamp-1">
              {isDemo
                ? "Demostración de Centro Clínico"
                : isClinic
                ? "Gestión de Centro & Terapeutas"
                : "Consulta Psicológica Privada"}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`mt-7 space-y-1.5 flex-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
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

          if (isCollapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                id={tourId}
                title={item.name}
                className={`flex size-11 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-secondary text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={20} className={isActive ? "text-primary" : ""} />
                <span className="sr-only">{item.name}</span>
              </Link>
            );
          }

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
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Consola exclusiva para Superadmin Velyon */}
        {isSuperAdmin && (
          isCollapsed ? (
            <Link
              href="/admin"
              title="Consola Velyon Admin"
              className="flex size-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors mt-3"
            >
              <ShieldAlert size={20} />
              <span className="sr-only">Consola Velyon Admin</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors mt-4"
            >
              <ShieldAlert size={18} />
              <span>Consola Velyon Admin</span>
            </Link>
          )
        )}
      </nav>

      {/* User Footer Profile & Logout Button */}
      <div className="mt-auto pt-4 border-t">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex size-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-2xs"
              title={user?.full_name || "Usuario Clínico"}
            >
              {user?.full_name ? user.full_name[0] : "A"}
            </div>
            <button
              onClick={handleLogout}
              title={isDemo ? "Salir de la demo" : "Cerrar sesión"}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </aside>
  );
}
