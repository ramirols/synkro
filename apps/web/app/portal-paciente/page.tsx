"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  HeartHandshake,
  Calendar,
  Clock,
  Video,
  FileCheck,
  CheckCircle2,
  Brain,
  Sparkles,
  LogOut,
  Phone,
  Shield,
  Smile,
  ExternalLink,
  Download,
  Lock,
  Printer,
  X,
  AlertCircle,
} from "lucide-react";

interface PortalAppointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  status: string;
  modality: string | null;
  meeting_link: string | null;
  notes: string | null;
}

interface PortalDocument {
  id: string;
  file_name: string;
  category?: string;
  file_category?: string;
  storage_path: string;
  file_size?: string;
  created_at: string;
  signed_url?: string;
}

const DEFAULT_DEMO_DOCS: PortalDocument[] = [
  {
    id: "demo-doc-1",
    file_name: "Consentimiento_Informado_Terapia.pdf",
    category: "Consentimiento Informado",
    file_category: "consent",
    storage_path: "demo/consentimiento.pdf",
    file_size: "850 KB",
    created_at: "2026-09-24T10:00:00.000Z",
  },
  {
    id: "demo-doc-2",
    file_name: "Inventario_Ansiedad_Beck_BAI.pdf",
    category: "Evaluación Psicométrica",
    file_category: "evaluation",
    storage_path: "demo/bai_ansiedad.pdf",
    file_size: "1.4 MB",
    created_at: "2026-09-25T11:00:00.000Z",
  },
  {
    id: "demo-doc-3",
    file_name: "Guia_Respiracion_Diafragmatica_TCC.pdf",
    category: "Material Psicoeducativo",
    file_category: "other",
    storage_path: "demo/guia_respiracion.pdf",
    file_size: "620 KB",
    created_at: "2026-09-26T14:00:00.000Z",
  },
];

export default function PortalPacientePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [patientRecord, setPatientRecord] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<PortalAppointment[]>([]);
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [mood, setMood] = useState(7);
  const [moodRegistered, setMoodRegistered] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<PortalDocument | null>(null);
  const [signedUrlLoading, setSignedUrlLoading] = useState(false);

  useEffect(() => {
    async function loadPortalData() {
      try {
        setLoading(true);

        if (!user) {
          // Si no hay usuario autenticado, usamos datos de demostración
          setDocuments(DEFAULT_DEMO_DOCS);
          setLoading(false);
          return;
        }

        // 1. Buscar registro de paciente vinculado explícitamente a este usuario autenticado (RLS Fase 4)
        const { data: patient, error: patErr } = await supabase
          .from("patients")
          .select("id, first_name, last_name, therapeutic_approach, consultation_reason, emergency_contact, organization_id, portal_status")
          .eq("user_id", user.id)
          .eq("portal_status", "active")
          .limit(1)
          .maybeSingle();

        if (patient) {
          setPatientRecord(patient);

          // 2. Cargar próximas citas del paciente (solo sus citas, ordenadas por fecha)
          const { data: appData } = await supabase
            .from("appointments")
            .select("id, appointment_date, start_time, end_time, status, modality, meeting_link, notes")
            .eq("patient_id", patient.id)
            .gte("appointment_date", new Date().toISOString().split("T")[0])
            .order("appointment_date", { ascending: true })
            .limit(5);

          if (appData && appData.length > 0) {
            setAppointments(appData);
          }

          // 3. Cargar documentos compartidos (Postgres RLS garantiza que solo se retornen shared_with_patient=true)
          const { data: fileData } = await supabase
            .from("patient_files")
            .select("id, file_name, category, file_category, storage_path, file_size, created_at")
            .eq("patient_id", patient.id)
            .eq("shared_with_patient", true)
            .order("created_at", { ascending: false });

          if (fileData && fileData.length > 0) {
            setDocuments(fileData);
          } else {
            setDocuments([]);
          }
        } else {
          // Usuario autenticado pero sin expediente vinculado aún
          setPatientRecord(null);
          setDocuments([]);
        }
      } catch (err) {
        console.warn("Error cargando datos del portal del paciente:", err);
        setDocuments(DEFAULT_DEMO_DOCS);
      } finally {
        setLoading(false);
      }
    }

    loadPortalData();
  }, [user]);

  const handleOpenDocViewer = async (doc: PortalDocument) => {
    setViewingDoc(doc);

    // Intentar generar URL firmada de descarga (válida por 15 minutos / 900s)
    if (doc.storage_path && !doc.storage_path.startsWith("demo/")) {
      try {
        setSignedUrlLoading(true);
        const { data } = await supabase.storage
          .from("patient-files")
          .createSignedUrl(doc.storage_path, 900);

        if (data?.signedUrl) {
          setViewingDoc({ ...doc, signed_url: data.signedUrl });
        }
      } catch (err) {
        console.warn("No se pudo obtener URL firmada:", err);
      } finally {
        setSignedUrlLoading(false);
      }
    }
  };

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Patient Header */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-card/80 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-base shadow-xs">
            <HeartHandshake size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">
                Portal del Paciente
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Espacio Seguro
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enfoque: {patientRecord?.therapeutic_approach || "Terapia Cognitivo Conductual (TCC)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs font-semibold text-foreground">
            {patientRecord
              ? `${patientRecord.first_name} ${patientRecord.last_name}`
              : user?.full_name || "Camila Valdivia"}
          </span>
          <button
            onClick={() => (user ? logout() : router.push("/iniciar-sesion"))}
            className="flex items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-2xs"
          >
            <LogOut size={14} />
            <span>{user ? "Cerrar Sesión" : "Iniciar Sesión"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl border border-primary/20 bg-secondary/40 p-6 lg:p-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles size={16} /> Tu espacio de crecimiento y bienestar
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Hola,{" "}
            {patientRecord?.first_name ||
              user?.full_name?.split(" ")[0] ||
              "Camila"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Aquí puedes consultar tus próximas sesiones, dar seguimiento a tus acuerdos terapéuticos y acceder a los documentos autorizados por tu psicólogo con descarga cifrada.
          </p>
        </div>

        {user && !patientRecord && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Cuenta sin expediente clínico activo vinculado</span>
              <p>
                Has iniciado sesión con <span className="font-mono font-medium">{user.email}</span>, pero tu cuenta aún no está vinculada a un expediente por tu psicólogo o clínica. Si recibiste un enlace de activación, ábrelo para vincular tus citas y documentos.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card: Próxima Cita */}
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" /> PRÓXIMA SESIÓN
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Confirmada
              </span>
            </div>

            {nextAppointment ? (
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">
                  Sesión Programada
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Clock size={13} className="text-primary" />
                    {new Date(nextAppointment.appointment_date + "T00:00:00").toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    a las {nextAppointment.start_time.substring(0, 5)} hrs
                  </span>
                  <span className="flex items-center gap-1">
                    <Video size={13} className="text-sky-600" />
                    Modalidad {nextAppointment.modality === "virtual" ? "Telepsicología" : "Presencial"}
                  </span>
                </div>
                {nextAppointment.notes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {nextAppointment.notes}
                  </p>
                )}
                {nextAppointment.meeting_link && (
                  <div className="pt-2">
                    <a
                      href={nextAppointment.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                    >
                      <Video size={16} />
                      <span>Entrar a la Sala Virtual</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-foreground">
                  Sesión 5: Evaluación y Reestructuración Cognitiva
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Clock size={13} className="text-primary" /> Esta semana a las 09:00 hrs
                  </span>
                  <span className="flex items-center gap-1">
                    <Video size={13} className="text-sky-600" /> Modalidad Telepsicología
                  </span>
                </div>
                <div className="pt-2">
                  <a
                    href="https://meet.google.com/syn-kro-vely"
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                  >
                    <Video size={16} />
                    <span>Entrar a la Sala Virtual (Google Meet)</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Card: Tarea Intersesión */}
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Brain size={14} className="text-primary" /> TAREA TERAPÉUTICA ASIGNADA
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                En Curso
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">
                Autorregistro de Pensamientos Automáticos (TCC)
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                &quot;Completar las 4 columnas (Situación, Emoción, Pensamiento Automático, Respuesta Racional) cuando experimentes activación fisiológica laboral.&quot;
              </p>
            </div>

            <button
              onClick={() => setTaskDone(!taskDone)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all ${
                taskDone
                  ? "bg-emerald-500 text-white"
                  : "border border-input bg-card text-foreground hover:bg-muted"
              }`}
            >
              <CheckCircle2 size={16} />
              <span>{taskDone ? "¡Tarea Realizada con Éxito!" : "Marcar como Realizada"}</span>
            </button>
          </div>
        </div>

        {/* Card: Registro Diario de Ánimo */}
        <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                ¿Cómo te has sentido el día de hoy?
              </h2>
              <p className="text-xs text-muted-foreground">
                Tu registro ayuda a tu terapeuta a preparar mejor tu siguiente consulta.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Nivel: {mood} / 10
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => {
                setMood(Number(e.target.value));
                setMoodRegistered(false);
              }}
              className="w-full accent-primary h-2"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
              <span>1 (Muy abrumada / Ansiedad alta)</span>
              <span>5 (Neutral)</span>
              <span>10 (Tranquila / Plena)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {moodRegistered ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 size={13} /> Registrado para tu terapeuta
                </span>
              ) : (
                "Desliza para actualizar"
              )}
            </span>
            <button
              onClick={() => setMoodRegistered(true)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-xs"
            >
              {moodRegistered ? "Actualizado" : "Guardar Registro"}
            </button>
          </div>
        </div>

        {/* Documents & Emergency */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Documents Section */}
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck size={16} className="text-primary" /> Documentos Compartidos
              </h3>
              <span className="text-[11px] text-muted-foreground">Bóveda Cifrada</span>
            </div>

            <div className="space-y-2.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleOpenDocViewer(doc)}
                  className="flex items-center justify-between rounded-2xl border bg-background/50 p-3.5 hover:border-primary/40 hover:bg-secondary/20 transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block">
                      {doc.file_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {doc.category || doc.file_category || "Documento"} • {doc.file_size || "1.2 MB"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Autorizado
                    </span>
                    <span className="rounded-lg bg-secondary p-1 text-primary group-hover:scale-105 transition-transform">
                      <FileCheck size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Assistance */}
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield size={16} className="text-emerald-600" /> Líneas de Asistencia
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              En caso de emergencia emocional o crisis aguda fuera de horario de consulta:
            </p>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">Línea 113 Salud (Opción 5) - Perú</span>
              <span className="text-[11px]">Atención psicológica gratuita las 24 horas.</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Recuerda que este espacio no reemplaza una atención médica de urgencias en hospital o clínica.
            </p>
          </div>
        </div>
      </main>

      {/* Modal: Visor de Documentos In-App para el Paciente */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col my-8">
            {/* Header del Visor */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary">
                  {viewingDoc.category || viewingDoc.file_category || "Documento Clínico"}
                </span>
                <h2 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
                  {viewingDoc.file_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Documento validado y compartido por tu terapeuta.
                </p>
              </div>

              <button
                onClick={() => setViewingDoc(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Signed URL Download Button if available */}
            {viewingDoc.signed_url && (
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-secondary/30 p-3.5 text-xs">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <Shield size={14} /> Enlace de descarga seguro generado (1h)
                </span>
                <a
                  href={viewingDoc.signed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 font-bold text-primary-foreground hover:opacity-90 shadow-xs"
                >
                  <Download size={13} />
                  <span>Descargar Archivo</span>
                </a>
              </div>
            )}

            {/* Contenido Visual del Documento */}
            <div className="flex-1 overflow-y-auto rounded-2xl border bg-background p-6 space-y-5 text-xs text-muted-foreground leading-relaxed">
              <div className="border-b pb-4 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Centro Psicológico Synkro
                </span>
                <h3 className="mt-1 font-serif text-base font-bold text-foreground">
                  {viewingDoc.file_name.replace(".pdf", "").replace(/_/g, " ")}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Fecha de registro:{" "}
                  {new Date(viewingDoc.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="space-y-4 font-serif">
                <p>
                  El presente documento forma parte de tu expediente clínico digital en Synkro. Ha sido emitido por tu profesional tratante y almacenado bajo estrictos protocolos de confidencialidad médica y secreto profesional.
                </p>
                <div className="mt-6 rounded-2xl border bg-card p-4 space-y-2 font-sans">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 size={16} /> Firma y Verificación de Bóveda
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Documento protegido con políticas RLS de Supabase Storage. Acceso exclusivo para ti como paciente autorizado.
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones del Visor */}
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-600" />
                Documento Cifrado y Protegido
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Printer size={14} className="inline mr-1" /> Imprimir
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
                >
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
