"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Session, Patient } from "@/lib/types/clinical";
import { useClinicalData } from "@/lib/clinical-context";
import {
  Brain,
  Plus,
  Shield,
  Eye,
  EyeOff,
  User,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  ChevronDown,
  X,
  Search,
} from "lucide-react";

function SesionesContent() {
  const { service, basePath, isDemo } = useClinicalData();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patient_id") || "";
  const initialAppointmentId = searchParams.get("appointment_id") || "";

  const [sessions, setSessions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPatientId, setFilterPatientId] = useState(initialPatientId || "todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrivateNotes, setShowPrivateNotes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [patientId, setPatientId] = useState(initialPatientId);
  const [appointmentId, setAppointmentId] = useState(initialAppointmentId);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [emotionalScore, setEmotionalScore] = useState(6);
  const [sessionSummary, setSessionSummary] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [homework, setHomework] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, pData] = await Promise.all([
        service.getSessions(),
        service.getPatients(),
      ]);

      setSessions(sData || []);
      setPatients(pData || []);
      if (pData && pData.length > 0 && !patientId) {
        setPatientId(pData[0].id);
      }
    } catch (err: any) {
      console.error("Error loading sessions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (initialPatientId) {
      setIsModalOpen(true);
    }
  }, [initialPatientId]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setErrorMsg("Selecciona un paciente.");
      return;
    }
    if (!sessionSummary.trim() && !privateNotes.trim()) {
      setErrorMsg("Escribe al menos el resumen clínico o una nota privada.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      await service.createSession({
        patient_id: patientId,
        appointment_id: appointmentId || null,
        session_number: Number(sessionNumber),
        emotional_score: Number(emotionalScore),
        session_summary: sessionSummary.trim() || null,
        private_notes: privateNotes.trim() || null,
        homework: homework.trim() || null,
      });

      // Reset
      setSessionSummary("");
      setPrivateNotes("");
      setHomework("");
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Error creating session:", err);
      setErrorMsg(err.message || "Error al guardar la sesión clínica.");
    } finally {
      setSaving(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterPatientId === "todos") return true;
    return s.patient_id === filterPatientId;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sesiones & Notas Clínicas
            </h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
              {sessions.length} Registradas
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Doble capa de privacidad: Evolución clínica oficial y notas privadas de contratransferencia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrivateNotes(!showPrivateNotes)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
          >
            {showPrivateNotes ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showPrivateNotes ? "Ocultar Notas Privadas" : "Ver Notas Privadas"}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            <span>Registrar Nueva Sesión</span>
          </button>
        </div>
      </div>

      {/* Filter by Patient */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <User size={16} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">Filtrar por Paciente:</span>
          <select
            value={filterPatientId}
            onChange={(e) => setFilterPatientId(e.target.value)}
            className="h-9 rounded-xl border bg-background px-3 text-xs font-medium text-foreground outline-none"
          >
            <option value="todos">Todos los Pacientes ({sessions.length} sesiones)</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield size={14} className="text-amber-600" />
          <span>Notas privadas cifradas bajo secreto profesional</span>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-5">
        {loading ? (
          <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
            Cargando historial de sesiones clínicas...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <Brain size={32} className="mx-auto text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No hay sesiones registradas con este filtro
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Comienza registrando la primera sesión del paciente.
            </p>
          </div>
        ) : (
          filteredSessions.map((sess) => (
            <div
              key={sess.id}
              className="rounded-3xl border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                    #{sess.session_number || 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/pacientes/${sess.patient_id}`}
                        className="text-base font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {sess.patients?.first_name} {sess.patients?.last_name}
                      </Link>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {sess.patients?.therapeutic_approach || "TCC"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar size={12} />
                      {new Date(sess.created_at).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sess.emotional_score && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      Ánimo del Paciente: {sess.emotional_score} / 10
                    </span>
                  )}
                  <Link
                    href={`/pacientes/${sess.patient_id}`}
                    className="rounded-lg border border-input bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Ver Expediente
                  </Link>
                </div>
              </div>

              {/* Resumen Oficial / Evolución */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText size={13} className="text-primary" /> EVOLUCIÓN CLÍNICA / RESUMEN DE SESIÓN (COMPARTIBLE)
                </span>
                <div className="rounded-2xl bg-muted/30 p-4 text-xs font-normal leading-relaxed text-foreground whitespace-pre-line border border-border/50">
                  {sess.session_summary || "Sin evolución redactada."}
                </div>
              </div>

              {/* Notas Privadas / Contratransferencia */}
              {showPrivateNotes && sess.private_notes && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <Shield size={14} /> NOTAS PRIVADAS & REFLEXIÓN TERAPÉUTICA (CONFIDENCIAL)
                    </span>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      Solo Psicólogo
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-950/90 dark:text-amber-100/90 whitespace-pre-line">
                    {sess.private_notes}
                  </p>
                </div>
              )}

              {/* Homework */}
              {sess.homework && (
                <div className="rounded-xl border border-primary/20 bg-secondary/30 p-3 text-xs flex items-center gap-2">
                  <Sparkles size={14} className="text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-primary">Tarea / Ejercicio Intersesión:</span>{" "}
                    <span className="text-muted-foreground">{sess.homework}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Registrar Sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border bg-card p-6 sm:p-8 shadow-xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Registrar Nota Clínica de Sesión
                </h2>
                <p className="text-xs text-muted-foreground">
                  Doble capa de documentación: notas formales e impresiones privadas.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSession} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Paciente *
                  </label>
                  <select
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} ({p.therapeutic_approach || "TCC"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Número de Sesión
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Estado de Ánimo del Paciente (SUDS / Escala 1 al 10)
                  </label>
                  <span className="font-bold text-xs text-primary">{emotionalScore} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={emotionalScore}
                  onChange={(e) => setEmotionalScore(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1 (Crisis / Angustia severa)</span>
                  <span>5 (Moderado)</span>
                  <span>10 (Estable / Pleno)</span>
                </div>
              </div>

              {/* Capa 1: Resumen Oficial */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Resumen Clínico / Evolución Oficial (Compartible)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Visible en reportes e informes
                  </span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Descripción de la intervención (TCC, reestructuración, exposición, análisis de resistencias, acuerdos)..."
                  value={sessionSummary}
                  onChange={(e) => setSessionSummary(e.target.value)}
                  className="w-full rounded-xl border bg-background p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Capa 2: Notas Privadas */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Shield size={14} /> Notas Privadas & Contratransferencia (Estrictamente Confidencial)
                  </label>
                  <span className="text-[10px] text-amber-600 font-semibold">
                    Nunca se exporta
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Reflexiones del psicólogo, hipótesis diagnósticas preliminares, dinámicas vinculares, banderas rojas o contratransferencia..."
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/20 bg-background/80 p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Homework */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Tarea / Ejercicios Intersesión (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Registro de pensamientos disfuncionales, respiración 4-7-8 dos veces al día..."
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Nota de Sesión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SesionesView() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando sesiones...</p>}>
      <SesionesContent />
    </Suspense>
  );
}
