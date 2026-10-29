"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Session, Patient } from "@/lib/types/clinical";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
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
  BookOpen,
  HelpCircle,
  Wand2,
  Lock,
} from "lucide-react";

const CLINICAL_TEMPLATES = [
  {
    name: "Reestructuración Cognitiva (TCC)",
    description: "Para trabajo con distorsiones cognitivas, autorregistros y creencias limitantes.",
    subjective: "Paciente reporta nivel de ansiedad SUDS 6/10 ante situaciones de exposición laboral. Refiere rumiación antes de dormir y sensación de 'no ser suficiente'.",
    objective: "Postura tensa al inicio, contacto visual adecuado. Presenta registro de pensamientos automáticos con 3 situaciones registradas.",
    assessment: "Presencia de distorsiones de catastrofismo y lectura de mente. Buena respuesta al cuestionamiento socrático y flexibilización cognitiva inicial.",
    plan: "Continuar con autorregistro ABC de pensamientos disfuncionales. Practicar técnica de respiración diafragmática 10 min antes de dormir.",
    summary: "Se revisó autorregistro cognitivo y se aplicó debate socrático sobre pensamientos catastrofistas en el ámbito laboral.",
  },
  {
    name: "Aceptación y Compromiso (ACT)",
    description: "Para flexibilización psicológica, defusión cognitiva y contacto con valores.",
    subjective: "Paciente refiere malestar emocional persistente vinculado a duelo reciente. Expresa frustración por no poder 'eliminar' la tristeza.",
    objective: "Afecto depresivo, llanto espontáneo al evocar recuerdos. Buena disposición para ejercicios de contacto con el momento presente.",
    assessment: "Evitación experiencial significativa y fusión cognitiva con autocrítica. El ejercicio de defusión facilitó distanciamiento del pensamiento.",
    plan: "Ejercicio de clarificación de valores (Brújula de Valores). Tarea: realizar una acción alineada con su valor familiar durante la semana.",
    summary: "Trabajo en aceptación emocional y defusión cognitiva frente a la pérdida. Se exploraron valores personales orientadores.",
  },
  {
    name: "Evaluación y Psicoeducación Inicial",
    description: "Para primeras sesiones de encuadre, consentimiento y formulación de objetivos.",
    subjective: "Paciente acude por primera vez manifestando síntomas de ansiedad generalizada y problemas de concentración desde hace 2 meses.",
    objective: "Orientado en tiempo, espacio y persona. Lenguaje fluido, coherente. Manifiesta disposición abierta al proceso terapéutico.",
    assessment: "Hipótesis diagnóstica preliminar compatible con sintomatología ansiosa reactiva a sobrecarga vital. Buen pronóstico terapéutico.",
    plan: "Firma de consentimiento informado. Establecimiento de encuadre semanal. Tarea: autorregistro de horarios de sueño y desencadenantes.",
    summary: "Primera sesión de encuadre clínico. Se delimitaron motivos de consulta y se firmó el consentimiento informado.",
  },
];

function SesionesContent() {
  const { service, basePath, isDemo } = useClinicalData();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patient_id") || "";
  const initialAppointmentId = searchParams.get("appointment_id") || "";

  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPatientId, setFilterPatientId] = useState(initialPatientId || "todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrivateNotes, setShowPrivateNotes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Mode in Form: SOAP vs Libre
  const [formMode, setFormMode] = useState<"soap" | "libre">("soap");
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [assistantRawNotes, setAssistantRawNotes] = useState("");

  // Form State
  const [patientId, setPatientId] = useState(initialPatientId);
  const [appointmentId, setAppointmentId] = useState(initialAppointmentId);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [emotionalScore, setEmotionalScore] = useState(6);
  const [sessionSummary, setSessionSummary] = useState("");
  const [soapSubjective, setSoapSubjective] = useState("");
  const [soapObjective, setSoapObjective] = useState("");
  const [soapAssessment, setSoapAssessment] = useState("");
  const [soapPlan, setSoapPlan] = useState("");
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
      setFilterPatientId(initialPatientId);
      if (!isDemo) {
        setIsModalOpen(true);
      }
    }
  }, [initialPatientId, isDemo]);

  const handleApplyTemplate = (tpl: typeof CLINICAL_TEMPLATES[0]) => {
    setSoapSubjective(tpl.subjective);
    setSoapObjective(tpl.objective);
    setSoapAssessment(tpl.assessment);
    setSoapPlan(tpl.plan);
    setSessionSummary(tpl.summary);
    setFormMode("soap");
    setShowAssistantModal(false);
  };

  const handleStructureRawNotesLocally = () => {
    if (!assistantRawNotes.trim()) return;

    // Asistente estructurador local determinístico:
    // Separa apuntes libres en cuadrantes SOAP basados en palabras clave clínicas
    const lines = assistantRawNotes.split("\n").filter((l) => l.trim().length > 0);
    const sLines: string[] = [];
    const oLines: string[] = [];
    const aLines: string[] = [];
    const pLines: string[] = [];

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (
        lower.includes("dice") ||
        lower.includes("refiere") ||
        lower.includes("siente") ||
        lower.includes("manifiesta") ||
        lower.includes("paciente cuenta") ||
        lower.includes("motivo") ||
        lower.includes("suds")
      ) {
        sLines.push(line.replace(/^[•\-\*]\s*/, ""));
      } else if (
        lower.includes("observa") ||
        lower.includes("postura") ||
        lower.includes("contacto visual") ||
        lower.includes("llanto") ||
        lower.includes("afecto") ||
        lower.includes("lenguaje") ||
        lower.includes("conducta")
      ) {
        oLines.push(line.replace(/^[•\-\*]\s*/, ""));
      } else if (
        lower.includes("hipótesis") ||
        lower.includes("hipotesis") ||
        lower.includes("diagnóstico") ||
        lower.includes("diagnostico") ||
        lower.includes("análisis") ||
        lower.includes("analisis") ||
        lower.includes("evaluación") ||
        lower.includes("distorsión") ||
        lower.includes("esquema")
      ) {
        aLines.push(line.replace(/^[•\-\*]\s*/, ""));
      } else if (
        lower.includes("plan") ||
        lower.includes("tarea") ||
        lower.includes("ejercicio") ||
        lower.includes("acuerdo") ||
        lower.includes("próxima") ||
        lower.includes("proxima") ||
        lower.includes("objetivo")
      ) {
        pLines.push(line.replace(/^[•\-\*]\s*/, ""));
      } else {
        // Por defecto, distribuir en el análisis o subjetivo
        if (sLines.length === 0) sLines.push(line);
        else aLines.push(line);
      }
    });

    setSoapSubjective(sLines.join(". ") || "Paciente expone motivos de la sesión y estado anímico.");
    setSoapObjective(oLines.join(". ") || "Afecto congruente, colaborador en la sesión.");
    setSoapAssessment(aLines.join(". ") || "Evolución acorde a los objetivos planteados.");
    setSoapPlan(pLines.join(". ") || "Mantener pautas acordadas y tareas de autorregistro.");

    // Resumen unificado
    setSessionSummary(
      `S: ${sLines.join(" ") || "Reporte subjetivo recogido."}\nO: ${oLines.join(" ") || "Observación clínica estándar."}\nA: ${aLines.join(" ") || "Evaluación clínica en progreso."}\nP: ${pLines.join(" ") || "Continuidad del plan terapéutico."}`
    );

    setFormMode("soap");
    setShowAssistantModal(false);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setErrorMsg("Selecciona un paciente.");
      return;
    }

    const hasSoap =
      soapSubjective.trim() ||
      soapObjective.trim() ||
      soapAssessment.trim() ||
      soapPlan.trim();

    if (!sessionSummary.trim() && !hasSoap && !privateNotes.trim()) {
      setErrorMsg("Escribe al menos el resumen clínico, campos SOAP o una nota privada.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      // Sintetizar resumen si solo se llenó SOAP
      const finalSummary =
        sessionSummary.trim() ||
        [
          soapSubjective ? `[S] ${soapSubjective}` : "",
          soapObjective ? `[O] ${soapObjective}` : "",
          soapAssessment ? `[A] ${soapAssessment}` : "",
          soapPlan ? `[P] ${soapPlan}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

      await service.createSession({
        patient_id: patientId,
        appointment_id: appointmentId || null,
        session_number: Number(sessionNumber),
        emotional_score: Number(emotionalScore),
        session_summary: finalSummary || null,
        soap_subjective: soapSubjective.trim() || null,
        soap_objective: soapObjective.trim() || null,
        soap_assessment: soapAssessment.trim() || null,
        soap_plan: soapPlan.trim() || null,
        private_notes: privateNotes.trim() || null,
        homework: homework.trim() || null,
      });

      // Reset
      setSessionSummary("");
      setSoapSubjective("");
      setSoapObjective("");
      setSoapAssessment("");
      setSoapPlan("");
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
            Documentación clínica estructurada (SOAP) y notas privadas protegidas bajo secreto profesional.
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
            onClick={() => {
              if (isDemo) {
                notifyDemoWriteBlocked("Registrar Nueva Sesión Clínica");
                return;
              }
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
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
          <span>Aislamiento RLS activo: notas privadas visibles únicamente para el terapeuta autor</span>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
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
          filteredSessions.map((sess) => {
            const hasSoapData =
              sess.soap_subjective ||
              sess.soap_objective ||
              sess.soap_assessment ||
              sess.soap_plan;

            return (
              <div
                key={sess.id}
                className="rounded-3xl border bg-card p-6 shadow-xs space-y-5 hover:border-primary/40 transition-colors"
              >
                {/* Header card */}
                <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                      #{sess.session_number || 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`${basePath}/pacientes/${sess.patient_id}`}
                          className="text-base font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {sess.patients?.first_name} {sess.patients?.last_name}
                        </Link>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {sess.patients?.therapeutic_approach || "TCC"}
                        </span>
                        {hasSoapData && (
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                            Estructura SOAP
                          </span>
                        )}
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
                      href={`${basePath}/pacientes/${sess.patient_id}`}
                      className="rounded-lg border border-input bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Ver Expediente
                    </Link>
                  </div>
                </div>

                {/* Formato SOAP si está presente */}
                {hasSoapData ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen size={13} className="text-primary" /> EVOLUCIÓN CLÍNICA ESTRUCTURADA (SOAP)
                    </span>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sess.soap_subjective && (
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1">
                          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                            [S] Subjetivo (Reporte del Paciente)
                          </span>
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                            {sess.soap_subjective}
                          </p>
                        </div>
                      )}
                      {sess.soap_objective && (
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-1">
                          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400">
                            [O] Objetivo (Observación & Signos)
                          </span>
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                            {sess.soap_objective}
                          </p>
                        </div>
                      )}
                      {sess.soap_assessment && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            [A] Análisis Clínico & Formulación
                          </span>
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                            {sess.soap_assessment}
                          </p>
                        </div>
                      )}
                      {sess.soap_plan && (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                            [P] Plan Terapéutico & Tareas
                          </span>
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                            {sess.soap_plan}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Resumen Convencional */
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <FileText size={13} className="text-primary" /> EVOLUCIÓN CLÍNICA / RESUMEN DE SESIÓN (COMPARTIBLE)
                    </span>
                    <div className="rounded-2xl bg-muted/30 p-4 text-xs font-normal leading-relaxed text-foreground whitespace-pre-line border border-border/50">
                      {sess.session_summary || "Sin evolución redactada."}
                    </div>
                  </div>
                )}

                {/* Notas Privadas / Contratransferencia (Aisladas) */}
                {showPrivateNotes && sess.private_notes && (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                        <Lock size={14} /> NOTA PRIVADA & REFLEXIÓN TERAPÉUTICA (SECRETO PROFESIONAL)
                      </span>
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        Solo autor visible
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
            );
          })
        )}
      </div>

      {/* Modal: Asistente SOAP Honesto */}
      {showAssistantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border bg-card p-6 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Wand2 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Asistente Local de Redacción Clínica SOAP
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Estructuración guiada y plantillas basadas en evidencia.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssistantModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            {/* Aviso de Transparencia e Inteligencia Honesta */}
            <div className="rounded-2xl border border-primary/20 bg-secondary/30 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Shield size={14} /> Asistente de Redacción Local & Privado
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Este módulo procesa los textos <strong>exclusivamente en tu dispositivo</strong> y no envía datos clínicos ni notas confidenciales a modelos de IA de terceros. Todos los borradores generados requieren revisión, adaptación y aprobación explícita del terapeuta antes de guardarse en el expediente.
              </p>
            </div>

            {/* Plantillas Rápidas */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">
                Opción A: Cargar Plantilla Clínica Predefinida
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                {CLINICAL_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="flex flex-col text-left p-3 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-secondary/40 transition-all text-xs space-y-1"
                  >
                    <span className="font-bold text-foreground">{tpl.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-2">
                      {tpl.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Estructurador de Apuntes Rápidos */}
            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-bold text-foreground block">
                Opción B: Pegar Apuntes Libres para Clasificación SOAP
              </label>
              <textarea
                rows={4}
                value={assistantRawNotes}
                onChange={(e) => setAssistantRawNotes(e.target.value)}
                placeholder="Pega notas tomadas durante la sesión (ej. 'Paciente refiere menos ansiedad laboral. Contacto visual sostenido. Hipótesis: menor conducta de evitación. Tarea: autorregistro semanal')..."
                className="w-full rounded-xl border bg-background p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssistantModal(false)}
                  className="rounded-xl border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleStructureRawNotesLocally}
                  disabled={!assistantRawNotes.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 shadow-xs"
                >
                  <Wand2 size={13} />
                  <span>Estructurar en SOAP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Registrar Nota Clínica de Sesión
                </h2>
                <p className="text-xs text-muted-foreground">
                  Evolución oficial estructurada y notas privadas bajo secreto profesional.
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

            <form onSubmit={handleCreateSession} className="mt-6 space-y-5 space-x-4 overflow-y-auto max-h-[600px]">
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

              {/* Selector de Modo de Redacción */}
              <div className="flex items-center justify-between border-y py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormMode("soap")}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${formMode === "soap"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    Formato SOAP Estándar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode("libre")}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${formMode === "libre"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    Texto Libre / Resumen
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAssistantModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Wand2 size={13} />
                  <span>Asistente SOAP / Plantillas</span>
                </button>
              </div>

              {/* Formato SOAP */}
              {formMode === "soap" ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">
                        [S] Subjetivo
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Motivo manifestado, experiencia personal y síntomas percibidos por el paciente..."
                        value={soapSubjective}
                        onChange={(e) => setSoapSubjective(e.target.value)}
                        className="w-full rounded-xl border bg-background p-2.5 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">
                        [O] Objetivo
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Observación clínica, conducta no verbal, afecto, examen mental y tareas revisadas..."
                        value={soapObjective}
                        onChange={(e) => setSoapObjective(e.target.value)}
                        className="w-full rounded-xl border bg-background p-2.5 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">
                        [A] Análisis / Evaluación
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Interpretación clínica, hipótesis de trabajo, dinámicas cognitivo-conductuales..."
                        value={soapAssessment}
                        onChange={(e) => setSoapAssessment(e.target.value)}
                        className="w-full rounded-xl border bg-background p-2.5 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">
                        [P] Plan Terapéutico
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Intervención acordada, ejercicios entre sesiones y fecha de seguimiento..."
                        value={soapPlan}
                        onChange={(e) => setSoapPlan(e.target.value)}
                        className="w-full rounded-xl border bg-background p-2.5 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Texto Libre */
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Resumen Clínico / Evolución Oficial (Compartible)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Visible en reportes de equipo
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descripción narrativa de la intervención, acuerdos y evolución clínica..."
                    value={sessionSummary}
                    onChange={(e) => setSessionSummary(e.target.value)}
                    className="w-full rounded-xl border bg-background p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* Capa 2: Notas Privadas & Secreto Profesional */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Shield size={14} /> Notas Privadas & Contratransferencia (Estrictamente Confidencial)
                  </label>
                  <span className="text-[10px] text-amber-600 font-semibold">
                    RLS exclusivo por autor
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80">
                  Estas reflexiones se almacenan en una tabla independiente. Nunca se incluirán en informes para pacientes ni son visibles para otros terapeutas o asistentes de la clínica.
                </p>
                <textarea
                  rows={3}
                  placeholder="Hipótesis de contratransferencia, impresiones personales sobre el vínculo, alertas diagnósticas privadas..."
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/30 bg-background/90 p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Homework */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Tarea / Ejercicios Intersesión (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Registro de pensamientos disfuncionales, respiración diafragmática dos veces al día..."
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
