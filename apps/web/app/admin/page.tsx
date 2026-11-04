"use client";

import { useEffect, useState, useCallback } from "react";
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
  Check,
  LogOut,
  ExternalLink,
  Lock,
  ArrowRight,
  Search,
  Clock,
  AlertTriangle,
  Receipt,
  Smartphone,
  Calendar,
  X,
  RefreshCw,
} from "lucide-react";
import { PLANS_CONFIG, SubscriptionPlan, SubscriptionStatus } from "@/lib/config/plans";
import { COMMERCIAL_CONFIG } from "@/lib/config/commercial";
import { toast } from "sonner";
import {
  confirmPaymentSchema,
  adjustSubscriptionSchema,
  validateForm,
} from "@/lib/validations";
import { getFriendlyErrorMessage } from "@/lib/utils";


interface RealOrganizationItem {
  id: string;
  name: string;
  slug: string;
  organization_type: "independent" | "clinic";
  created_at: string;
  owner_name: string;
  owner_email: string;
  license_number: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_start_at: string | null;
  trial_end_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  last_payment_date: string | null;
  payment_method: string | null;
  patient_count: number;
  professional_count: number;
}

export default function MasterAdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [organizations, setOrganizations] = useState<RealOrganizationItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [searchClinic, setSearchClinic] = useState("");
  const [filterPlan, setFilterPlan] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Modal de Administración Comercial
  const [selectedOrg, setSelectedOrg] = useState<RealOrganizationItem | null>(null);
  const [adminActionTab, setAdminActionTab] = useState<"payment" | "adjust">("payment");

  // Formulario Confirmar Pago
  const [paymentPlan, setPaymentPlan] = useState<SubscriptionPlan>("starter");
  const [paymentMonths, setPaymentMonths] = useState<number>(1);
  const [paymentAmount, setPaymentAmount] = useState<number>(49);
  const [paymentMethod, setPaymentMethod] = useState<string>("yape");
  const [paymentRefCode, setPaymentRefCode] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Formulario Ajuste Rápido
  const [adjustPlan, setAdjustPlan] = useState<SubscriptionPlan>("starter");
  const [adjustStatus, setAdjustStatus] = useState<SubscriptionStatus>("trialing");
  const [adjustExtendDays, setAdjustExtendDays] = useState<number>(0);
  const [adjustNotes, setAdjustNotes] = useState<string>("");

  const isSuperAdmin = user?.platform_role === "superadmin";

  useEffect(() => {
    if (!authLoading && (!user || !isSuperAdmin)) {
      router.push("/iniciar-sesion");
    }
  }, [user, authLoading, isSuperAdmin, router]);

  // Cargar organizaciones reales desde RPC
  const fetchOrganizations = useCallback(async () => {
    try {
      setLoadingData(true);
      setDataError(null);
      const { data, error } = await supabase.rpc("admin_list_organizations");

      if (error) throw error;
      setOrganizations((data as RealOrganizationItem[]) || []);
    } catch (err: any) {
      console.error("[MasterAdminPage] Error loading organizations:", err);
      setDataError(err.message || "Error al conectar con la base de datos.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations();
    }
  }, [isSuperAdmin, fetchOrganizations]);

  // Actualizar monto sugerido al cambiar plan o meses en el modal
  useEffect(() => {
    const pConfig = PLANS_CONFIG[paymentPlan];
    if (pConfig) {
      setPaymentAmount(pConfig.priceMonthly * paymentMonths);
    }
  }, [paymentPlan, paymentMonths]);

  // Al abrir modal, inicializar datos
  const handleOpenModal = (org: RealOrganizationItem) => {
    setSelectedOrg(org);
    setPaymentPlan(org.plan || "starter");
    setPaymentMonths(1);
    setPaymentAmount(PLANS_CONFIG[org.plan || "starter"].priceMonthly);
    setPaymentMethod("yape");
    setPaymentRefCode("");
    setPaymentNotes("");

    setAdjustPlan(org.plan || "starter");
    setAdjustStatus(org.status || "trialing");
    setAdjustExtendDays(0);
    setAdjustNotes("");

    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  // Confirmar Pago
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    const validation = validateForm(confirmPaymentSchema, {
      plan: paymentPlan,
      months: paymentMonths,
      amount: paymentAmount,
      paymentMethod,
      referenceCode: paymentRefCode || undefined,
      notes: paymentNotes || undefined,
    });

    if (!validation.success) {
      setActionErrorMsg(validation.firstError);
      toast.error(validation.firstError);
      return;
    }

    try {
      setSubmittingPayment(true);
      setActionErrorMsg(null);
      setActionSuccessMsg(null);

      const { data, error } = await supabase.rpc("admin_confirm_subscription_payment", {
        p_organization_id: selectedOrg.id,
        p_plan: validation.data.plan,
        p_period_months: validation.data.months,
        p_amount: validation.data.amount,
        p_payment_method: validation.data.paymentMethod,
        p_reference_code: validation.data.referenceCode || null,
        p_notes: validation.data.notes || null,
      });

      if (error) throw error;

      setActionSuccessMsg("¡Pago confirmado exitosamente! La suscripción está activa.");
      toast.success("Pago confirmado y suscripción activada.");
      await fetchOrganizations();
      setTimeout(() => setSelectedOrg(null), 1800);
    } catch (err: any) {
      console.error("Error confirm payment:", err);
      const msg = getFriendlyErrorMessage(err, "Error al confirmar el pago.");
      setActionErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Ajuste Manual de Estado
  const handleAdjustSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    const validation = validateForm(adjustSubscriptionSchema, {
      plan: adjustPlan,
      status: adjustStatus,
      extendDays: adjustExtendDays,
      notes: adjustNotes || undefined,
    });

    if (!validation.success) {
      setActionErrorMsg(validation.firstError);
      toast.error(validation.firstError);
      return;
    }

    try {
      setSubmittingPayment(true);
      setActionErrorMsg(null);
      setActionSuccessMsg(null);

      const { data, error } = await supabase.rpc("admin_update_subscription", {
        p_organization_id: selectedOrg.id,
        p_plan: validation.data.plan,
        p_status: validation.data.status,
        p_extend_days: validation.data.extendDays > 0 ? validation.data.extendDays : null,
        p_notes: validation.data.notes || null,
      });

      if (error) throw error;

      setActionSuccessMsg("Suscripción actualizada exitosamente.");
      toast.success("Suscripción actualizada.");
      await fetchOrganizations();
      setTimeout(() => setSelectedOrg(null), 1800);
    } catch (err: any) {
      console.error("Error adjust subscription:", err);
      const msg = getFriendlyErrorMessage(err, "Error al ajustar la suscripción.");
      setActionErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (authLoading || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filtrado de Organizaciones
  const filteredClinics = organizations.filter((c) => {
    const q = searchClinic.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.owner_name.toLowerCase().includes(q) ||
      c.owner_email.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q);

    const matchesPlan = filterPlan === "todos" ? true : c.plan === filterPlan;
    const matchesStatus = filterStatus === "todos" ? true : c.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Métricas reales
  const totalClinics = organizations.length;
  const activeSubs = organizations.filter((o) => o.status === "active").length;
  const trialingSubs = organizations.filter((o) => o.status === "trialing").length;
  const expiredSubs = organizations.filter((o) => o.status === "expired" || o.status === "past_due").length;
  const totalPatients = organizations.reduce((acc, o) => acc + (o.patient_count || 0), 0);

  // MRR estimado en base a suscripciones activas
  const calculatedMRR = organizations
    .filter((o) => o.status === "active")
    .reduce((acc, o) => acc + (PLANS_CONFIG[o.plan]?.priceMonthly || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-card/90 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 font-bold shadow-xs">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">
                Consola Comercial Velyon
              </span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                Superadmin Confidencial
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Gestión de clientes, confirmación manual de pagos con Yape y control de licencias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrganizations()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw size={13} className={loadingData ? "animate-spin" : ""} />
            <span>Actualizar</span>
          </button>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <Brain size={14} className="text-primary" />
            <span>Software Clínico</span>
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-2xs cursor-pointer"
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
              MRR Contratado (Activo)
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              S/ {calculatedMRR.toLocaleString("es-PE")}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp size={13} /> {activeSubs} suscripciones pagadas
            </span>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Organizaciones Registradas
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              {totalClinics}
            </p>
            <span className="text-xs text-muted-foreground">
              {trialingSubs} en prueba gratuita (14 días)
            </span>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pacientes Custodiados
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              {totalPatients}
            </p>
            <span className="text-xs text-muted-foreground">
              Total en todas las organizaciones
            </span>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Suscripciones Vencidas
            </span>
            <p className="text-3xl font-black tracking-tight text-foreground">
              {expiredSubs}
            </p>
            <span className="text-xs text-amber-600 font-semibold">
              Requieren seguimiento por WhatsApp
            </span>
          </div>
        </div>

        {/* Directory Table */}
        <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Gestión de Organizaciones & Suscripciones
              </h2>
              <p className="text-xs text-muted-foreground">
                Listado en vivo desde PostgreSQL. Confirma pagos recibidos por Yape para activar o renovar licencias.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                {filteredClinics.length} de {organizations.length} Clínicas
              </span>
            </div>
          </div>

          {dataError && (
            <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {dataError}
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por consultorio, titular, correo o slug..."
                value={searchClinic}
                onChange={(e) => setSearchClinic(e.target.value)}
                className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Filtro Plan */}
              {[
                { id: "todos", label: "Todos los Planes" },
                { id: "starter", label: "Starter" },
                { id: "professional", label: "Professional" },
                { id: "clinic", label: "Clínica" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterPlan(p.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filterPlan === p.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <span className="h-4 w-px bg-border mx-1" />

              {/* Filtro Estado */}
              {[
                { id: "todos", label: "Todos Estados" },
                { id: "trialing", label: "Prueba" },
                { id: "active", label: "Activas" },
                { id: "expired", label: "Vencidas" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFilterStatus(s.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === s.id
                      ? "bg-secondary text-primary border border-primary/20"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/30 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Organización / Tipo</th>
                  <th className="px-5 py-3">Titular & Contacto</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Pacientes / Terapeutas</th>
                  <th className="px-5 py-3">Estado & Vencimiento</th>
                  <th className="px-5 py-3 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingData ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      Cargando organizaciones desde Supabase...
                    </td>
                  </tr>
                ) : filteredClinics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      No se encontraron organizaciones registradas con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredClinics.map((c) => {
                    const pConfig = PLANS_CONFIG[c.plan || "starter"];
                    const isTrial = c.status === "trialing";
                    const isActive = c.status === "active";
                    const isExpired = c.status === "expired" || c.status === "past_due";

                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-foreground">{c.name}</div>
                          <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-primary font-semibold">
                            {c.organization_type === "clinic" ? "Centro Multiprofesional" : "Independiente"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-foreground">{c.owner_name}</div>
                          <span className="text-muted-foreground text-[11px] block">{c.owner_email}</span>
                          {c.license_number && (
                            <span className="text-muted-foreground text-[10px]">{c.license_number}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-foreground capitalize">
                            {pConfig?.name || c.plan}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            S/ {pConfig?.priceMonthly || 0}/mes
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-foreground">{c.patient_count} pac.</span>
                          <span className="text-muted-foreground block text-[11px]">
                            {c.professional_count} profesional{c.professional_count > 1 ? "es" : ""}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isTrial
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : isTrial ? "bg-amber-500" : "bg-destructive"
                              }`}
                            />
                            {isActive ? "Activo" : isTrial ? "Prueba 14d" : "Vencida"}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {c.current_period_end
                              ? `Fin: ${new Date(c.current_period_end).toLocaleDateString("es-PE")}`
                              : c.trial_end_at
                              ? `Prueba: ${new Date(c.trial_end_at).toLocaleDateString("es-PE")}`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors shadow-2xs cursor-pointer"
                          >
                            Administrar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL DE GESTIÓN COMERCIAL PARA SUPERADMIN */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Gestión Comercial • Velyon Admin
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{selectedOrg.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Titular: {selectedOrg.owner_name} ({selectedOrg.owner_email})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground text-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mensajes de feedback */}
            {actionSuccessMsg && (
              <div className="rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {actionSuccessMsg}
              </div>
            )}
            {actionErrorMsg && (
              <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {actionErrorMsg}
              </div>
            )}

            {/* Pestañas de Acción */}
            <div className="grid grid-cols-2 gap-2 border-b pb-3">
              <button
                type="button"
                onClick={() => setAdminActionTab("payment")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminActionTab === "payment"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Receipt size={14} className="inline mr-1.5" />
                Confirmar Pago (Yape / BCP)
              </button>

              <button
                type="button"
                onClick={() => setAdminActionTab("adjust")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminActionTab === "adjust"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Calendar size={14} className="inline mr-1.5" />
                Ajustar Plan / Estado
              </button>
            </div>

            {/* TAB 1: CONFIRMAR PAGO REAL */}
            {adminActionTab === "payment" && (
              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Plan Pagado:</label>
                    <select
                      value={paymentPlan}
                      onChange={(e) => setPaymentPlan(e.target.value as SubscriptionPlan)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                    >
                      <option value="starter">Starter (S/ 49)</option>
                      <option value="professional">Professional (S/ 89)</option>
                      <option value="clinic">Clínica (S/ 189)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Periodo Meses:</label>
                    <select
                      value={paymentMonths}
                      onChange={(e) => setPaymentMonths(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                    >
                      <option value={1}>1 Mes</option>
                      <option value={3}>3 Meses</option>
                      <option value={6}>6 Meses</option>
                      <option value={12}>12 Meses (1 Año)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Monto en Soles (PEN):</label>
                    <input
                      type="number"
                      min={0}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Método de Pago:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                    >
                      <option value="yape">Yape</option>
                      <option value="plin">Plin</option>
                      <option value="transferencia">Transferencia BCP/BBVA</option>
                      <option value="tarjeta">Tarjeta (WhatsApp)</option>
                      <option value="cortesia">Cortesía / Beca</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    N° de Operación / Código Referencia (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Operación Yape 847291"
                    value={paymentRefCode}
                    onChange={(e) => setPaymentRefCode(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Notas de Auditoría (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Comprobante verificado por WhatsApp..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrg(null)}
                    className="rounded-xl border border-input px-4 py-2 text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingPayment ? "Registrando..." : "Confirmar Pago & Activar"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: AJUSTE MANUAL */}
            {adminActionTab === "adjust" && (
              <form onSubmit={handleAdjustSubscription} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Plan:</label>
                    <select
                      value={adjustPlan}
                      onChange={(e) => setAdjustPlan(e.target.value as SubscriptionPlan)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                    >
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="clinic">Clínica</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Estado:</label>
                    <select
                      value={adjustStatus}
                      onChange={(e) => setAdjustStatus(e.target.value as SubscriptionStatus)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                    >
                      <option value="trialing">Trialing (Prueba)</option>
                      <option value="active">Active (Activo)</option>
                      <option value="past_due">Past Due (Gracia)</option>
                      <option value="expired">Expired (Vencido)</option>
                      <option value="cancelled">Cancelled (Cancelado)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Extender Días de Gracia / Vigencia (Opcional):
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={adjustExtendDays}
                    onChange={(e) => setAdjustExtendDays(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Suma días a la fecha de vencimiento actual.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Motivo del Ajuste (Auditoría):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Extensión comercial de prueba autorizada por Velyon"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrg(null)}
                    className="rounded-xl border border-input px-4 py-2 text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingPayment ? "Guardando..." : "Guardar Ajustes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
