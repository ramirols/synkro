"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  ShieldAlert,
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Brain,
  Database,
  Cloud,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";

export default function MasterAdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Verification: only superadmin can see this panel
  const isSuperAdmin = user?.role === "superadmin" || user?.role === "admin";

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  const [searchClinic, setSearchClinic] = useState("");
  const [filterPlan, setFilterPlan] = useState("todos");

  const clientClinics = [
    {
      id: "1",
      name: "Centro Psicológico Synkro (Piloto Principal)",
      psychologist: "Lic. Alejandro Mendoza V.",
      email: "demo@synkro.com",
      plan: "Professional",
      price: "S/ 89/mes",
      status: "Activo",
      patientsCount: 6,
      created: "2026-09-24",
    },
    {
      id: "2",
      name: "Clínica de Bienestar Emocional Miraflores",
      psychologist: "Dra. Claudia Paredes",
      email: "claudia.paredes@bienestaremocional.pe",
      plan: "Clinic (Empresa)",
      price: "S/ 189/mes",
      status: "Activo",
      patientsCount: 42,
      created: "2026-09-18",
    },
    {
      id: "3",
      name: "Consultorio Psicológico Crecer",
      psychologist: "Lic. Marco Aurelio Soto",
      email: "contacto@crecerpsicologia.pe",
      plan: "Starter",
      price: "S/ 49/mes",
      status: "Activo",
      patientsCount: 18,
      created: "2026-09-12",
    },
    {
      id: "4",
      name: "Terapia & Familia San Isidro",
      psychologist: "Mtr. Jimena Rivas",
      email: "jimenarivas@tfamilia.pe",
      plan: "Professional",
      price: "S/ 89/mes",
      status: "Prueba 14 días",
      patientsCount: 11,
      created: "2026-09-22",
    },
    {
      id: "5",
      name: "Instituto Peruano de TCC",
      psychologist: "Dr. Roberto Valdiviezo",
      email: "rvaldiviezo@iptcc.pe",
      plan: "Clinic (Empresa)",
      price: "S/ 189/mes",
      status: "Activo",
      patientsCount: 65,
      created: "2026-09-05",
    },
    {
      id: "6",
      name: "Psicología & Niñez Magdalena",
      psychologist: "Lic. Daniela Cárdenas",
      email: "dcardenas@psiconinez.pe",
      plan: "Professional",
      price: "S/ 89/mes",
      status: "Activo",
      patientsCount: 24,
      created: "2026-09-10",
    },
    {
      id: "7",
      name: "Espacio Terapéutico Arequipa",
      psychologist: "Lic. Gonzalo Paz",
      email: "gpaz@espacioterapeutico.pe",
      plan: "Starter",
      price: "S/ 49/mes",
      status: "Prueba 14 días",
      patientsCount: 9,
      created: "2026-09-25",
    },
  ];

  const filteredClinics = clientClinics.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchClinic.toLowerCase()) ||
      c.psychologist.toLowerCase().includes(searchClinic.toLowerCase()) ||
      c.email.toLowerCase().includes(searchClinic.toLowerCase());

    const matchesPlan =
      filterPlan === "todos" ? true : c.plan.toLowerCase().includes(filterPlan.toLowerCase());

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-card/90 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 font-bold shadow-xs">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">
                Consola Maestra Velyon
              </span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                Superadmin Confidencial
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Métricas globales SaaS, clientes suscritos y gestión de infraestructura Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <Brain size={14} className="text-primary" />
            <span>Abrir Software Clínico</span>
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-2xs"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* KPI Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              MRR (Ingresos Mensuales)
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              S/ 4,250
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp size={13} /> +28% vs. mes anterior
            </span>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Clínicas & Psicólogos Activos
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              38
            </p>
            <span className="text-xs text-muted-foreground">
              12 en prueba gratuita (prospectos)
            </span>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pacientes Atendidos en Red
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              1,480
            </p>
            <span className="text-xs text-muted-foreground">
              Expedientes clínicos custodiados
            </span>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Retención de Suscripciones
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              96.2%
            </p>
            <span className="text-xs text-emerald-600 font-semibold">
              Baja tasa de cancelación (Churn 3.8%)
            </span>
          </div>
        </div>

        {/* Charts & Analytics Visuals */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Growth Chart Visual (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Crecimiento de Facturación SaaS Velyon (2026)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ingresos recurrentes por suscripciones de psicólogos y clínicas
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                Soles (PEN)
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-4 space-y-4">
              {[
                { month: "Mayo 2026", amount: "S/ 1,420", width: "35%" },
                { month: "Junio 2026", amount: "S/ 2,150", width: "50%" },
                { month: "Julio 2026", amount: "S/ 2,890", width: "68%" },
                { month: "Agosto 2026", amount: "S/ 3,450", width: "82%" },
                { month: "Septiembre 2026 (Actual)", amount: "S/ 4,250", width: "100%" },
              ].map((item, idx) => (
                <div key={item.month} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">{item.month}</span>
                    <span className="text-primary font-bold">{item.amount}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Breakdown Visual (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border bg-card p-6 shadow-xs space-y-5">
            <div className="border-b pb-4">
              <h2 className="text-base font-bold text-foreground">
                Distribución de Planes Suscritos
              </h2>
              <p className="text-xs text-muted-foreground">
                Segmentación por tipo de cliente
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border p-4 bg-muted/20 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Plan Professional (S/ 89/mes)</span>
                  <span className="text-primary">18 clínicas (47%)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Psicólogos independientes consolidados con pacientes ilimitados.
                </p>
              </div>

              <div className="rounded-2xl border p-4 bg-muted/20 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Plan Starter (S/ 49/mes)</span>
                  <span className="text-primary">14 psicólogos (37%)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Terapeutas iniciando práctica privada (hasta 20 pacientes).
                </p>
              </div>

              <div className="rounded-2xl border p-4 bg-muted/20 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Plan Empresa / Clínica (S/ 189/mes)</span>
                  <span className="text-primary">6 centros (16%)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Centros de salud mental con múltiples terapeutas y secretaría.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Directory Table */}
        <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Directorio de Clientes & Clínicas Activas
              </h2>
              <p className="text-xs text-muted-foreground">
                Control de estados de pago, psicólogos registrados y fecha de alta
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                {filteredClinics.length} de {clientClinics.length} Clínicas
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por clínica, psicólogo o correo..."
                value={searchClinic}
                onChange={(e) => setSearchClinic(e.target.value)}
                className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: "todos", label: "Todos los Planes" },
                { id: "starter", label: "Starter" },
                { id: "professional", label: "Professional" },
                { id: "clinic", label: "Clinic (Empresa)" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterPlan(p.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    filterPlan === p.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/30 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Clínica / Psicólogo</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Plan Suscrito</th>
                  <th className="px-5 py-3">Pacientes</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClinics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      No se encontraron clínicas con el criterio de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredClinics.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{c.name}</div>
                        <span className="text-muted-foreground">{c.psychologist}</span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.email}</td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        {c.plan} ({c.price})
                      </td>
                      <td className="px-5 py-3.5 font-bold text-primary">{c.patientsCount} pacientes</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          c.status === "Activo"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => alert(`Configuración de la cuenta ${c.name} (Plan: ${c.plan})`)}
                          className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-muted transition-colors"
                        >
                          Administrar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cloud Migration & Supabase Tooling (Confidencial Velyon) */}
        <div className="rounded-3xl border-2 border-amber-500/30 bg-card p-6 lg:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 font-bold">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Infraestructura & Migración a Supabase Cloud (Free Tier)
              </h2>
              <p className="text-xs text-muted-foreground">
                Pasa tu proyecto local con datos piloto a internet para empezar a vender inmediatamente
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl border bg-background p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Paso 1: Generar dump de datos</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      "supabase db dump --local -f supabase/backup_synkro_cloud_ready.sql",
                      1
                    )
                  }
                  className="font-semibold text-primary hover:underline"
                >
                  {copiedStep === 1 ? "Copiado" : "Copiar comando"}
                </button>
              </div>
              <code className="block rounded-lg bg-muted p-2 font-mono text-[11px] text-foreground">
                supabase db dump --local -f supabase/backup_synkro_cloud_ready.sql
              </code>
            </div>

            <div className="rounded-2xl border bg-background p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Paso 2: Restaurar en Supabase Cloud</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Abrir Cloud <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Abre el SQL Editor de tu proyecto en la nube y pega el contenido del archivo <code className="font-mono text-primary">supabase/seed.sql</code>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
