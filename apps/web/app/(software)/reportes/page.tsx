"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClinicalDataService } from "@/lib/clinical-data";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Users,
  CalendarCheck,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patients: 6,
    sessions: 3,
    appointments: 8,
    completionRate: 88,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const summary = await ClinicalDataService.getDashboardSummary();

        setStats({
          patients: summary.patientsCount,
          sessions: summary.sessionsCount,
          appointments: summary.appointmentsCount,
          completionRate: 92,
        });
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
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
            {stats.completionRate}%
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
            {stats.sessions * 4} hrs
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
            94%
          </p>
          <span className="mt-1 text-xs text-muted-foreground">
            Pacientes continúan su tratamiento
          </span>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Evaluaciones Aplicadas
          </span>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            4 tests
          </p>
          <span className="mt-1 text-xs text-muted-foreground">
            Inventarios Beck (BAI/BDI) y escalas
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
