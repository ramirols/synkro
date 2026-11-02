"use client";

import Link from "next/link";
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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function MobileSidebar() {
  const { isMobileOpen, setIsMobileOpen } = useSidebarLayout();
  const pathname = usePathname();
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { basePath, isDemo, user } = useClinicalData();
  const { subscription, planConfig, isClinic } = useSubscription();

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
    setIsMobileOpen(false);
    if (isDemo) {
      router.push("/iniciar-sesion");
    } else {
      await authLogout();
    }
  };

  return (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetContent
        side="left"
        className="w-72 sm:w-80 p-6 flex flex-col justify-between bg-card text-foreground"
      >
        <div>
          <SheetHeader className="text-left pb-6 border-b">
            <SheetTitle>
              <Link
                href={basePath || "/dashboard"}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Brain size={20} />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    Synkro
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary leading-none">
                    by Velyon
                  </span>
                </div>
              </Link>
            </SheetTitle>
            <div className="pt-2 flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                {isDemo ? "Modo Demo" : isSuperAdmin ? "Admin" : isClinic ? "Centro" : "Independiente"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {planConfig?.name || "Starter"}
              </span>
            </div>
          </SheetHeader>

          <nav className="mt-6 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isDashboardLink = item.href === (basePath || "/dashboard");
              const isActive = isDashboardLink
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
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

            {isSuperAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors mt-3"
              >
                <ShieldAlert size={18} />
                <span>Consola Velyon Admin</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Footer con usuario y cerrar sesión */}
        <div className="pt-4 border-t space-y-3">
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
      </SheetContent>
    </Sheet>
  );
}
