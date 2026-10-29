"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import {
  Users,
  CalendarDays,
  Brain,
  FileText,
  ArrowRight,
  Plus,
  Video,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function DashboardView() {
  const { service, basePath, isDemo } = useClinicalData();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [patientsCount, setPatientsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [filesCount, setFilesCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setErrorMsg("");
        const summary = await service.getDashboardSummary();
        setPatientsCount(summary.patientsCount);
        setAppointmentsCount(summary.appointmentsCount);
        setSessionsCount(summary.sessionsCount);
        setFilesCount(summary.filesCount);
        setUpcomingAppointments(summary.upcomingAppointments);
        setRecentSessions(summary.recentSessions);
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setErrorMsg(
          err.message || "Error al cargar la información clínica de la práctica."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [service]);

  return (
    <div className="space-y-10">
      {/* Error Banner en Producción si falla Supabase */}
      {errorMsg && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard Clínico
            </h1>
            {isDemo ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Demo Piloto
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Clínica Activa
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen activo de pacientes, sesiones terapéuticas y agenda clínica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isDemo ? (
            <>
              <button
                type="button"
                onClick={() => notifyDemoWriteBlocked("Crear Nuevo Paciente")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus size={15} />
                <span>Nuevo Paciente</span>
              </button>
              <button
                type="button"
                onClick={() => notifyDemoWriteBlocked("Agendar Nueva Cita")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors cursor-pointer"
              >
                <Calendar size={15} />
                <span>Agendar Cita</span>
              </button>
              <button
                type="button"
                onClick={() => notifyDemoWriteBlocked("Registrar Sesión Clínica")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Brain size={15} />
                <span>Registrar Sesión</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href={`${basePath}/pacientes`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors"
              >
                <Plus size={15} />
                <span>Nuevo Paciente</span>
              </Link>
              <Link
                href={`${basePath}/agenda`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors"
              >
                <Calendar size={15} />
                <span>Agendar Cita</span>
              </Link>
              <Link
                href={`${basePath}/sesiones`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-95 transition-opacity"
              >
                <Brain size={15} />
                <span>Registrar Sesión</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pacientes Activos
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : patientsCount}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>En seguimiento clínico</span>
            <Link
              href={`${basePath}/pacientes`}
              className="font-semibold text-primary hover:underline"
            >
              Ver lista →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Citas Agendadas
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : appointmentsCount}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Presenciales y online</span>
            <Link
              href={`${basePath}/agenda`}
              className="font-semibold text-primary hover:underline"
            >
              Ver agenda →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sesiones Registradas
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Brain size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : sessionsCount}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Con doble nota clínica</span>
            <Link
              href={`${basePath}/sesiones`}
              className="font-semibold text-primary hover:underline"
            >
              Ver notas →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expedientes & Archivos
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : filesCount}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Evaluaciones y consentimientos</span>
            <Link
              href={`${basePath}/documentos`}
              className="font-semibold text-primary hover:underline"
            >
              Bóveda →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Upcoming Appointments (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Próximas Sesiones Agendadas
              </h2>
              <p className="text-xs text-muted-foreground">
                Pacientes programados con acceso directo al registro clínico
              </p>
            </div>
            <Link
              href={`${basePath}/agenda`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Agenda completa <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Cargando citas...
              </p>
            ) : upcomingAppointments.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No hay citas programadas actualmente.
              </p>
            ) : (
              upcomingAppointments.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-3 rounded-xl border bg-background/50 p-4 transition-all hover:bg-secondary/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-semibold text-primary text-xs">
                      {app.patients?.first_name?.[0]}
                      {app.patients?.last_name?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`${basePath}/pacientes/${app.patient_id}`}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {app.patients?.first_name} {app.patients?.last_name}
                        </Link>
                        {app.modality === "virtual" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                            <Video size={11} /> Virtual
                          </span>
                        ) : (
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Presencial
                          </span>
                        )}
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            app.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : app.status === "cancelled"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {app.status === "scheduled"
                            ? "Programada"
                            : app.status === "completed"
                            ? "Completada"
                            : app.status === "cancelled"
                            ? "Cancelada"
                            : "No asistió"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {app.patients?.consultation_reason ||
                          app.notes ||
                          "Consulta general"}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <CalendarDays size={12} /> {app.appointment_date}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={12} /> {app.start_time?.slice(0, 5)} hrs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`${basePath}/sesiones?patient_id=${app.patient_id}&appointment_id=${app.id}`}
                      className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Nota Clínica
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Clinical Evolution Notes (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Últimas Evoluciones Clínicas
              </h2>
              <p className="text-xs text-muted-foreground">
                Resúmenes de progreso registrados
              </p>
            </div>
            <Link
              href={`${basePath}/sesiones`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-5 space-y-3.5">
            {loading ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Cargando notas...
              </p>
            ) : recentSessions.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No hay notas clínicas registradas.
              </p>
            ) : (
              recentSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-xl border bg-background/50 p-4 transition-all hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <strong className="text-xs font-semibold text-foreground">
                        {sess.patients?.first_name} {sess.patients?.last_name}
                      </strong>
                    </div>
                    {sess.emotional_score && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Ánimo: {sess.emotional_score}/10
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {sess.session_summary || "Sin resumen clínico."}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t pt-2 text-[10px] text-muted-foreground">
                    <span>
                      {new Date(sess.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`${basePath}/pacientes/${sess.patient_id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      Historial completo →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Differentiating Feature Callout */}
          <div className="mt-6 rounded-xl border border-primary/20 bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles size={15} />
              <span>Diferencial Synkro: Doble Capa de Confidencialidad</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Tus notas de contratransferencia y reflexiones privadas nunca son visibles en informes compartidos con el paciente. Seguridad ética garantizada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
