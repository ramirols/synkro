"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Patient, Session, Appointment, PatientFile } from "@/lib/types/clinical";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import {
  ArrowLeft,
  Calendar,
  Brain,
  FileText,
  Phone,
  Mail,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  UserCheck,
  UserX,
  Link2,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";

export default function PacienteDetailView({ id }: { id: string }) {
  const { service, basePath, isDemo } = useClinicalData();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPrivateNotes, setShowPrivateNotes] = useState(true);

  // Portal patient invitation state
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [invitationFeedback, setInvitationFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPatientDetails() {
      try {
        setLoading(true);
        setErrorMsg("");

        // Cargar paciente mediante el servicio correspondiente
        const pData = await service.getPatientById(id);
        if (!pData) {
          setPatient(null);
          return;
        }
        setPatient(pData);

        // Cargar sesiones, citas y archivos
        const [allSessions, allAppointments, allFiles] = await Promise.all([
          service.getSessions(),
          service.getAppointments(),
          service.getFiles(),
        ]);

        setSessions(allSessions.filter((s) => s.patient_id === id));
        setAppointments(allAppointments.filter((a) => a.patient_id === id));
        setFiles(allFiles.filter((f) => f.patient_id === id));
      } catch (err: any) {
        console.error("Error loading patient details:", err);
        setErrorMsg(err.message || "Error al cargar el expediente clínico.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPatientDetails();
    }
  }, [id, service]);

  const handleGenerateInvitation = async () => {
    if (!service.createPatientPortalInvitation || !patient) return;
    try {
      setInvitationLoading(true);
      setInvitationFeedback(null);
      const res = await service.createPatientPortalInvitation(patient.id);
      setInvitationUrl(res.invitation_url);
      setInvitationFeedback({
        type: "success",
        message: "Enlace generado con éxito. Válido durante 7 días.",
      });
      toast.success("Enlace de activación generado exitosamente.");
      setPatient({
        ...patient,
        portal_status: "invited",
      });
    } catch (err: any) {
      const msg = err.message || "Error al generar invitación.";
      setInvitationFeedback({
        type: "error",
        message: msg,
      });
      toast.error(msg);
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleRevokePortal = async () => {
    if (isDemo) {
      notifyDemoWriteBlocked("Revocar Acceso al Portal del Paciente");
      return;
    }
    if (!service.revokePatientPortalAccess || !patient) return;
    if (!confirm("¿Estás seguro de que deseas revocar el acceso del paciente al portal?")) return;
    try {
      setInvitationLoading(true);
      setInvitationFeedback(null);
      await service.revokePatientPortalAccess(patient.id);
      setInvitationUrl(null);
      setInvitationFeedback({
        type: "success",
        message: "Acceso al portal revocado correctamente.",
      });
      toast.success("Acceso al portal revocado.");
      setPatient({
        ...patient,
        portal_status: "revoked",
      });
    } catch (err: any) {
      const msg = err.message || "Error al revocar acceso.";
      setInvitationFeedback({
        type: "error",
        message: msg,
      });
      toast.error(msg);
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!invitationUrl) return;
    navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    toast.success("Enlace de activación copiado al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Cargando expediente clínico del paciente...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="space-y-4">
        <Link
          href={`${basePath}/pacientes`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={14} /> Volver a pacientes
        </Link>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 flex items-center gap-3 text-destructive text-xs">
          <AlertCircle size={20} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <Link
          href={`${basePath}/pacientes`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={14} /> Volver a pacientes
        </Link>
        <div className="rounded-2xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            El paciente solicitado no existe o no se tiene acceso a su expediente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href={`${basePath}/pacientes`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Volver a lista de pacientes
        </Link>
      </div>

      {/* Patient Header Card */}
      <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-xl font-bold text-primary shadow-xs">
              {patient.first_name[0]}
              {patient.last_name[0]}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {patient.first_name} {patient.last_name}
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {patient.status === "activo"
                    ? "En Tratamiento Activo"
                    : patient.status === "evaluacion"
                    ? "En Evaluación"
                    : "Alta Terapéutica"}
                </span>
                <span className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {patient.therapeutic_approach || "TCC"}
                </span>
              </div>

              <p className="text-sm font-medium text-foreground">
                <span className="text-muted-foreground">Motivo de consulta:</span>{" "}
                {patient.consultation_reason || "Consulta clínica general"}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground">
                {patient.phone && (
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Phone size={13} className="text-primary" /> {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} /> {patient.email}
                  </span>
                )}
                {patient.birth_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> Nacimiento: {patient.birth_date}
                  </span>
                )}
                {patient.gender && <span>Género: {patient.gender}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start">
            <Link
              href={`${basePath}/agenda?patient_id=${patient.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
            >
              <Calendar size={14} />
              <span>Agendar Cita</span>
            </Link>
            <Link
              href={`${basePath}/sesiones?patient_id=${patient.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
            >
              <Brain size={14} />
              <span>Nueva Nota de Sesión</span>
            </Link>
          </div>
        </div>

        {/* Anamnesis / Emergency info banner */}
        {(patient.emergency_contact || patient.notes) && (
          <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2 text-xs">
            {patient.emergency_contact && (
              <div className="rounded-xl bg-muted/40 p-3">
                <span className="font-semibold text-foreground">Contacto de Emergencia:</span>
                <p className="mt-0.5 text-muted-foreground">{patient.emergency_contact}</p>
              </div>
            )}
            {patient.notes && (
              <div className="rounded-xl bg-muted/40 p-3">
                <span className="font-semibold text-foreground">Observaciones de Encuadre:</span>
                <p className="mt-0.5 text-muted-foreground line-clamp-2">{patient.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: Clinical Sessions Timeline (8 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Evolución & Sesiones Clínicas ({sessions.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Historial cronológico con doble capa de confidencialidad
              </p>
            </div>

            <button
              onClick={() => setShowPrivateNotes(!showPrivateNotes)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPrivateNotes ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showPrivateNotes ? "Ocultar Notas Privadas" : "Mostrar Notas Privadas"}</span>
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <Brain size={32} className="mx-auto text-muted-foreground/50" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                Sin sesiones registradas aún
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Comienza documentando la primera sesión de encuadre o evaluación.
              </p>
              <Link
                href={`${basePath}/sesiones?patient_id=${patient.id}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                + Registrar Primera Sesión
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((sess, idx) => (
                <div
                  key={sess.id}
                  className="rounded-2xl border bg-card p-6 shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-bold text-xs text-primary-foreground">
                        #{sess.session_number || sessions.length - idx}
                      </span>
                      <strong className="text-sm font-semibold text-foreground">
                        Sesión Clínica
                      </strong>
                      <span className="text-xs text-muted-foreground">
                        • {new Date(sess.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {sess.emotional_score && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Estado de ánimo: {sess.emotional_score}/10
                      </span>
                    )}
                  </div>

                  {/* Resumen Clínico / Evolución Oficial */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Resumen Clínico / Evolución
                    </span>
                    <div className="rounded-xl bg-muted/30 p-4 text-xs font-normal leading-relaxed text-foreground whitespace-pre-line">
                      {sess.session_summary || "Sin resumen clínico registrado."}
                    </div>
                  </div>

                  {/* Notas Privadas / Contratransferencia */}
                  {showPrivateNotes && sess.private_notes && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <Shield size={13} /> NOTAS PRIVADAS & CONTRATRANSFERENCIA
                        </span>
                        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          Solo Psicólogo
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90 whitespace-pre-line">
                        {sess.private_notes}
                      </p>
                    </div>
                  )}

                  {/* Homework / Tareas intersesión */}
                  {sess.homework && (
                    <div className="rounded-xl border border-primary/20 bg-secondary/30 p-3 text-xs">
                      <span className="font-semibold text-primary">Tarea Intersesión:</span>{" "}
                      <span className="text-muted-foreground">{sess.homework}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Files & Upcoming Citas (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Portal del Paciente Card */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">Portal del Paciente</h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  patient.portal_status === "active"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : patient.portal_status === "invited"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : patient.portal_status === "revoked"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {patient.portal_status === "active"
                  ? "Activo / Vinculado"
                  : patient.portal_status === "invited"
                  ? "Invitación Pendiente"
                  : patient.portal_status === "revoked"
                  ? "Acceso Revocado"
                  : "Sin Invitar"}
              </span>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Permite al paciente acceder a sus citas, videoconferencias y documentos autorizados mediante su cuenta personal verificada.
              </p>

              {invitationFeedback && (
                <div
                  className={`rounded-xl p-2.5 text-xs font-medium flex items-center gap-2 ${
                    invitationFeedback.type === "success"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{invitationFeedback.message}</span>
                </div>
              )}

              {invitationUrl && (
                <div className="space-y-2 rounded-xl bg-muted/40 p-3 border">
                  <span className="font-semibold text-foreground text-[11px] block">
                    Enlace de Activación (7 días):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={invitationUrl}
                      className="w-full rounded-lg border bg-background px-2.5 py-1 text-[11px] text-muted-foreground font-mono truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? "Copiado" : "Copiar"}</span>
                    </button>
                    <a
                      href={`https://wa.me/${patient.phone ? patient.phone.replace(/[^0-9]/g, "") : ""}?text=${encodeURIComponent(
                        `Hola ${patient.first_name}, te comparto tu enlace de acceso seguro al Portal del Paciente de Synkro para ver tus próximas citas y documentos: ${invitationUrl}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      <MessageCircle size={12} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    💡 <strong>Para probarlo tú mismo:</strong> Ábrelo en una ventana de incógnito o en tu móvil para no interferir con tu sesión activa de psicólogo.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {patient.portal_status !== "active" && (
                  <button
                    type="button"
                    onClick={handleGenerateInvitation}
                    disabled={invitationLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    <Link2 size={13} />
                    <span>
                      {invitationLoading
                        ? "Generando..."
                        : patient.portal_status === "invited"
                        ? "Regenerar Enlace"
                        : "Generar Invitación"}
                    </span>
                  </button>
                )}

                {(patient.portal_status === "active" || patient.portal_status === "invited") && (
                  <button
                    type="button"
                    onClick={handleRevokePortal}
                    disabled={invitationLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <UserX size={13} />
                    <span>Revocar Acceso</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Files Vault */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">Bóveda de Archivos</h3>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                {files.length}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {files.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Sin documentos subidos.
                </p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-xl border bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {file.file_name}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {file.category || "Evaluación"} • {file.file_size || "PDF"}
                      </span>
                    </div>
                    <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold text-primary">
                      Ver
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Appointments History */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">Citas del Paciente</h3>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                {appointments.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {appointments.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No hay citas registradas.
                </p>
              ) : (
                appointments.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-xl border bg-muted/20 p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {app.appointment_date}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          app.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : app.status === "cancelled"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {app.status === "scheduled" ? "Programada" : app.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{app.start_time?.slice(0, 5)} hrs</span>
                      <span className="capitalize">{app.modality || "Presencial"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
