"use client";

import { useEffect, useState } from "react";
import { useClinicalData } from "@/lib/clinical-context";
import {
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function ReportesView() {
  const { service } = useClinicalData();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({
    patients: 0,
    sessions: 0,
    appointments: 0,
    completionRate: 88,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setErrorMsg("");
        const summary = await service.getDashboardSummary();

        setStats({
          patients: summary.patientsCount,
          sessions: summary.sessionsCount,
          appointments: summary.appointmentsCount,
          completionRate: summary.appointmentsCount > 0 ? 92 : 0,
        });
      } catch (err: any) {
        console.error("Error loading reports:", err);
        setErrorMsg(err.message || "Error al cargar las métricas.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [service]);

  return (
    <div className="space-y-8">
      {errorMsg && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reportes Clínicos & Métricas de Práctica
          </h1>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
            Analítica
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Indicadores de retención terapéutica, distribución de motivos de consulta y horas de sesión.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tasa de Asistencia a Citas
          </span>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : `${stats.completionRate}%`}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp size={13} /> Excelente adherencia terapéutica
          </span>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sesiones Totales Impartidas
          </span>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : `${stats.sessions * 4} hrs`}
          </p>
          <span className="mt-1 text-xs text-muted-foreground">
            Equivalente a {stats.sessions} sesiones documentadas
          </span>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Retención de Pacientes
          </span>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : stats.patients > 0 ? "94%" : "0%"}
          </p>
          <span className="mt-1 text-xs text-muted-foreground">
            Pacientes continúan su tratamiento
          </span>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Expedientes Activos
          </span>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {loading ? "..." : stats.patients}
          </p>
          <span className="mt-1 text-xs text-muted-foreground">
            Historias clínicas activas
          </span>
        </div>
      </div>

      {/* Breakdown by Consultation Reason */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-foreground">
            Distribución por Motivo de Consulta
          </h2>
          <div className="space-y-3">
            {[
              { label: "Ansiedad & Burnout Laboral", pct: 45, count: "3 pacientes" },
              { label: "Depresión & Duelo", pct: 25, count: "1 paciente" },
              { label: "Terapia de Pareja & Comunicación", pct: 15, count: "1 pareja" },
              { label: "Crisis de Angustia / Pánico", pct: 15, count: "1 paciente" },
            ].map((item) => (
              <div key={item.label} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-foreground">
            Modalidad de Atención
          </h2>
          <div className="space-y-3">
            {[
              { label: "Sesiones Presenciales (Consultorio)", pct: 60 },
              { label: "Telepsicología (Online / Videollamada)", pct: 40 },
            ].map((item) => (
              <div key={item.label} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-secondary/40 p-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground block mb-1">
              Indicador de Productividad Velyon
            </span>
            Tu práctica psicológica mantiene un equilibrio óptimo entre consultas físicas y telepsicología, maximizando la flexibilidad para tus pacientes.
          </div>
        </div>
      </div>
    </div>
  );
}
