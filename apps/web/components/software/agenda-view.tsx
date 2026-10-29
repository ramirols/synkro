"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import {
  CalendarDays,
  Plus,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  ExternalLink,
  Brain,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  Phone,
  ArrowUpRight,
  Printer,
  Lightbulb,
  Building2,
} from "lucide-react";

export default function AgendaView() {
  const { service, basePath, isDemo, user } = useClinicalData();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [modalityFilter, setModalityFilter] = useState("todos");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Lunes 28 por defecto
  const [bannerCollapsed, setBannerCollapsed] = useState(false);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Week offset state (0 = current week: 28 Sep - 04 Oct 2026)
  const [weekOffset, setWeekOffset] = useState(0);

  // Form State for new appointment
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("2026-09-28");
  const [startTime, setStartTime] = useState("09:00");
  const [modality, setModality] = useState<"presencial" | "virtual">("presencial");
  const [consultorioBox, setConsultorioBox] = useState("Box 1 (Adultos / TCC)");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  // Dynamic 7-day week calculation based on base date Monday 2026-09-28
  const baseMonday = new Date(2026, 8, 28); // Month is 0-indexed: 8 = Septiembre
  baseMonday.setDate(baseMonday.getDate() + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    const monthNames = [
      "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
      "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
    ];
    const fullMonthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    return {
      index: i,
      name: dayNames[d.getDay()],
      dayNum: dd,
      month: monthNames[d.getMonth()],
      fullMonth: fullMonthNames[d.getMonth()],
      year: yyyy,
      dateStr: dateStr,
      isMonday: i === 0,
      isSunday: i === 6,
    };
  });

  const weekTitle = `${weekDays[0].dayNum} ${weekDays[0].month} – ${weekDays[6].dayNum} ${weekDays[6].month} ${weekDays[0].year}`;

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [aData, pData] = await Promise.all([
        service.getAppointments(),
        service.getPatients(),
      ]);

      setAppointments(aData || []);
      setPatients(pData || []);
      if (pData && pData.length > 0 && !selectedPatientId) {
        setSelectedPatientId(pData[0].id);
      }
    } catch (err: any) {
      console.error("Error loading agenda data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNewAppointment = (date?: string, time?: string) => {
    if (isDemo) {
      notifyDemoWriteBlocked("Agendar Nueva Cita");
      return;
    }
    if (date) setAppointmentDate(date);
    if (time) setStartTime(time);
    setIsModalOpen(true);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !appointmentDate || !startTime) {
      setErrorMsg("Selecciona paciente, fecha y hora de la cita.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const noteContent = modality === "presencial" 
        ? `${consultorioBox}${notes ? " • " + notes.trim() : ""}`
        : notes.trim() || null;

      const defaultMeetingLink =
        user?.default_meet_link ||
        (isDemo ? "https://meet.google.com/syn-kro-demo" : "https://meet.google.com/new");

      await service.createAppointment({
        patient_id: selectedPatientId,
        appointment_date: appointmentDate,
        start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
        end_time: null,
        modality: modality,
        meeting_link: modality === "virtual" ? meetingLink.trim() || defaultMeetingLink : null,
        notes: noteContent,
        status: "scheduled",
      });

      setIsModalOpen(false);
      setNotes("");
      await loadData();
    } catch (err: any) {
      console.error("Error creating appointment:", err);
      setErrorMsg(err.message || "Error al agendar cita");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    if (isDemo) {
      notifyDemoWriteBlocked(newStatus === "completed" ? "Completar Cita" : "Cancelar Cita");
      return;
    }
    try {
      await service.updateAppointmentStatus(appId, newStatus);
      if (selectedAppointment && selectedAppointment.id === appId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }
      await loadData();
    } catch (err: any) {
      console.error("Error updating appointment status:", err.message);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = statusFilter === "todos" ? true : app.status === statusFilter;
    const matchesModality = modalityFilter === "todos" ? true : app.modality === modalityFilter;
    return matchesStatus && matchesModality;
  });

  // Calculate weekly stats
  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const virtualCount = appointments.filter((a) => a.modality === "virtual").length;
  const presencialCount = appointments.filter((a) => a.modality === "presencial").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Agenda & Horario Clínico
            </h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
              {scheduledCount} Programadas
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Planificación semanal de sesiones presenciales en box y telepsicología segura.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border bg-card p-1 shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Horario Semanal</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={14} />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            title="Descargar o Imprimir Horario"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <Download size={14} />
            <span>Descargar Horario</span>
          </button>

          <button
            onClick={() => handleOpenNewAppointment()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Week Navigator Bar (Exact styling from user reference) */}
      <div className="flex items-center justify-between rounded-2xl border bg-primary px-5 py-3 text-primary-foreground shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            title="Semana anterior"
            className="flex size-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
            {weekTitle}
          </span>

          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            title="Semana siguiente"
            className="flex size-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-bold hover:bg-white/30 transition-colors"
            >
              Esta Semana
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs text-white/90">
          <span>{presencialCount} Presenciales</span>
          <span>•</span>
          <span>{virtualCount} Virtuales</span>
          <span>•</span>
          <span className="font-semibold">{scheduledCount} Citas Activas</span>
        </div>
      </div>

      {/* Days Header Row (7 equal columns matching reference: LUN 28 to DOM 04) */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const hasAppointments = appointments.some((a) => a.appointment_date === day.dateStr);

          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center rounded-2xl py-3 px-1 transition-all text-center border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-secondary/20"
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                }`}
              >
                {day.name}
              </span>
              <span className="text-xl sm:text-2xl font-black leading-tight mt-0.5">
                {day.dayNum}
              </span>
              {hasAppointments && (
                <span
                  className={`mt-1 size-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-primary"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Collapsible Banner (Warm amber/cream tint like "Estudia a tu ritmo" in reference) */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setBannerCollapsed(!bannerCollapsed)}>
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles size={15} className="text-amber-600 dark:text-amber-400" />
            <span>
              Capacidad de Consultorio: 34 hrs disponibles • 6 citas agendadas esta semana • 2 telepsicología
            </span>
          </div>
          <button className="text-amber-700 dark:text-amber-300">
            {bannerCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {!bannerCollapsed && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 text-[11px] leading-relaxed flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <Lightbulb size={13} className="text-amber-600 shrink-0 inline" /> <strong>Organización Clínica:</strong> Haz clic en cualquier casilla de hora para agendar una cita directa. Al hacer clic en una cita existente podrás iniciar el Google Meet o escribir la Nota SOAP con 1 clic.
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-card/80 px-2 py-0.5 font-semibold text-foreground border border-border">
                <Building2 size={12} className="inline text-muted-foreground" /> Box 1: Disponible
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-card/80 px-2 py-0.5 font-semibold text-foreground border border-border">
                <Building2 size={12} className="inline text-muted-foreground" /> Box 2: Disponible
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Modality Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "todos", label: "Todas las Citas" },
            { id: "scheduled", label: "Programadas" },
            { id: "completed", label: "Completadas" },
            { id: "cancelled", label: "Canceladas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-secondary text-primary font-bold shadow-2xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Modalidad:</span>
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="rounded-lg border bg-background px-2.5 py-1 text-xs font-medium outline-none"
          >
            <option value="todos">Presencial & Virtual</option>
            <option value="presencial">Solo Presencial (Box)</option>
            <option value="virtual">Solo Telepsicología</option>
          </select>
        </div>
      </div>

      {/* WEEKLY TIMETABLE GRID VIEW (Main Feature) */}
      {viewMode === "grid" ? (
        <div className="rounded-3xl border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              {/* Day Columns Sub-header */}
              <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/30 text-center text-xs font-bold text-muted-foreground">
                <div className="p-3 border-r">Hora</div>
                {weekDays.map((d, i) => (
                  <div
                    key={d.dateStr}
                    className={`p-3 border-r last:border-r-0 ${
                      selectedDayIndex === i ? "bg-primary/5 text-primary font-extrabold" : ""
                    }`}
                  >
                    <span>{d.name} {d.dayNum}</span>
                  </div>
                ))}
              </div>

              {/* Hourly Rows & Cells */}
              <div className="relative divide-y divide-border/60">
                {/* Current Time Indicator Line (Live at 09:30 style) */}
                <div
                  className="pointer-events-none absolute left-0 right-0 z-20 flex items-center border-t-2 border-emerald-500"
                  style={{ top: "115px" }}
                >
                  <span className="rounded-r-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    09:30 LIVE
                  </span>
                </div>

                {timeSlots.map((hour) => {
                  const hourPrefix = hour.slice(0, 2);

                  return (
                    <div
                      key={hour}
                      className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[72px] hover:bg-muted/10 transition-colors"
                    >
                      {/* Left Hour Label */}
                      <div className="flex items-start justify-center p-2.5 border-r font-mono text-[11px] font-semibold text-muted-foreground/80 bg-muted/10">
                        {hour}
                      </div>

                      {/* 7 Day Slot Cells */}
                      {weekDays.map((day, dIdx) => {
                        // Find appointments for this day and hour
                        const slotAppointments = filteredAppointments.filter((app) => {
                          const matchesDate = app.appointment_date === day.dateStr;
                          const matchesHour = app.start_time?.startsWith(hourPrefix);
                          return matchesDate && matchesHour;
                        });

                        return (
                          <div
                            key={day.dateStr}
                            className={`relative border-r last:border-r-0 p-1.5 transition-colors group ${
                              selectedDayIndex === dIdx ? "bg-primary/[0.02]" : ""
                            }`}
                          >
                            {slotAppointments.length > 0 ? (
                              <div className="space-y-1.5">
                                {slotAppointments.map((app) => (
                                  <div
                                    key={app.id}
                                    onClick={() => setSelectedAppointment(app)}
                                    className={`rounded-xl border p-2 shadow-2xs transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xs ${
                                      app.modality === "virtual"
                                        ? "bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-200"
                                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                      <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {app.start_time?.slice(0, 5)} hrs
                                      </span>
                                      <ArrowUpRight size={12} className="opacity-60" />
                                    </div>

                                    <h4 className="mt-1 font-bold text-xs truncate">
                                      {app.patients?.first_name} {app.patients?.last_name}
                                    </h4>

                                    {app.patients?.therapeutic_approach && (
                                      <p className="text-[10px] text-muted-foreground truncate">
                                        {app.patients.therapeutic_approach}
                                      </p>
                                    )}

                                    <div className="mt-1.5 flex items-center justify-between text-[9px] font-semibold">
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 ${
                                          app.modality === "virtual"
                                            ? "bg-sky-500/20 text-sky-700 dark:text-sky-300"
                                            : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                        }`}
                                      >
                                        {app.modality === "virtual" ? (
                                          <>
                                            <Video size={10} /> Meet
                                          </>
                                        ) : (
                                          <>
                                            <Building2 size={10} /> Box 1
                                          </>
                                        )}
                                      </span>

                                      <span
                                        className={`inline-flex items-center capitalize ${
                                          app.status === "completed"
                                            ? "text-emerald-600"
                                            : "text-amber-600"
                                        }`}
                                      >
                                        {app.status === "completed" ? (
                                          <>
                                            <CheckCircle2 size={10} className="mr-0.5" /> Hecha
                                          </>
                                        ) : (
                                          "Agendada"
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              /* Empty Slot: Click to schedule */
                              <button
                                onClick={() => handleOpenNewAppointment(day.dateStr, hour)}
                                className="w-full h-full min-h-[56px] rounded-lg border border-dashed border-transparent hover:border-primary/30 hover:bg-secondary/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                                title={`Agendar cita el ${day.name} ${day.dayNum} a las ${hour}`}
                              >
                                <Plus size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW (Alternative view mode) */
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center">
              <CalendarDays size={32} className="mx-auto text-muted-foreground/50" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                No hay citas con este filtro
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Selecciona otro estado o agenda una nueva cita con tu paciente.
              </p>
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-primary">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(app.appointment_date + "T12:00:00").toLocaleDateString("es-ES", {
                        weekday: "short",
                      })}
                    </span>
                    <span className="text-sm font-extrabold leading-none">
                      {app.appointment_date.split("-")[2]}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`${basePath}/pacientes/${app.patient_id}`}
                        className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {app.patients?.first_name} {app.patients?.last_name}
                      </Link>

                      {app.modality === "virtual" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                          <Video size={11} /> Telepsicología (Virtual)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Building2 size={11} /> Presencial en Consultorio
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
                          : "Cancelada"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock size={12} className="text-primary" /> {app.start_time?.slice(0, 5)} hrs
                      </span>
                      <span>Fecha: {app.appointment_date}</span>
                      {app.patients?.therapeutic_approach && (
                        <span className="italic">• {app.patients.therapeutic_approach}</span>
                      )}
                    </div>

                    {app.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">
                        Detalle: {app.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {app.modality === "virtual" && app.meeting_link && (
                    <a
                      href={app.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-500 hover:text-white transition-colors"
                    >
                      <Video size={13} /> Entrar a Sesión
                    </a>
                  )}

                  <Link
                    href={`${basePath}/sesiones?patient_id=${app.patient_id}&appointment_id=${app.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Brain size={13} /> Nota SOAP
                  </Link>

                  {app.status === "scheduled" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "completed")}
                        title="Marcar como completada"
                        className="rounded-lg border bg-card p-1.5 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "cancelled")}
                        title="Cancelar cita"
                        className="rounded-lg border bg-card p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QUICK APPOINTMENT DRAWER / MODAL (When clicking any appointment card) */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                    selectedAppointment.modality === "virtual"
                      ? "bg-sky-500/10 text-sky-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {selectedAppointment.modality === "virtual" ? (
                    <>
                      <Video size={12} /> Telepsicología (Virtual)
                    </>
                  ) : (
                    <>
                      <Building2 size={12} /> Presencial en Consultorio
                    </>
                  )}
                </span>
                <h2 className="mt-2 text-xl font-bold text-foreground">
                  {selectedAppointment.patients?.first_name}{" "}
                  {selectedAppointment.patients?.last_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedAppointment.patients?.therapeutic_approach || "Terapia Psicológica"}
                </p>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/30 p-4">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase">
                    Fecha & Hora
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedAppointment.appointment_date} a las{" "}
                    {selectedAppointment.start_time?.slice(0, 5)} hrs
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase">
                    Estado de la Cita
                  </span>
                  <span
                    className={`font-bold capitalize ${
                      selectedAppointment.status === "completed"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {selectedAppointment.status === "completed" ? "Completada" : "Programada"}
                  </span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase">
                    Notas / Ubicación de Sala
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {selectedAppointment.patients?.phone && (
                <div className="flex items-center justify-between rounded-2xl border p-3">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone size={14} className="text-primary" /> Contacto del Paciente:
                  </span>
                  <a
                    href={`https://wa.me/${selectedAppointment.patients.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-600 hover:underline"
                  >
                    {selectedAppointment.patients.phone} (WhatsApp)
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons in Drawer */}
            <div className="space-y-2.5 pt-2 border-t">
              {selectedAppointment.modality === "virtual" && (
                <a
                  href={selectedAppointment.meeting_link || "https://meet.google.com/syn-kro-demo"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-500 transition-colors"
                >
                  <Video size={15} />
                  <span>Iniciar Sala Virtual (Google Meet)</span>
                </a>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`${basePath}/sesiones?patient_id=${selectedAppointment.patient_id}&appointment_id=${selectedAppointment.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                >
                  <Brain size={14} />
                  <span>Escribir Nota SOAP</span>
                </Link>

                <Link
                  href={`${basePath}/pacientes/${selectedAppointment.patient_id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <User size={14} />
                  <span>Ver Expediente</span>
                </Link>
              </div>

              {selectedAppointment.status === "scheduled" && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, "cancelled")}
                    className="text-xs font-semibold text-destructive hover:underline"
                  >
                    Cancelar Cita
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, "completed")}
                    className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    Marcar como Completada
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGENDAR NUEVA CITA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Agendar Nueva Cita
                </h2>
                <p className="text-xs text-muted-foreground">
                  Programa una sesión presencial en consultorio o telepsicología virtual.
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
              <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Seleccionar Paciente *
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Fecha de la Cita *
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Modalidad de Atención
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModality("presencial")}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      modality === "presencial"
                        ? "border-primary bg-secondary text-primary"
                        : "border-input bg-card text-muted-foreground"
                    }`}
                  >
                    <Building2 size={13} /> Presencial en Consultorio
                  </button>
                  <button
                    type="button"
                    onClick={() => setModality("virtual")}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      modality === "virtual"
                        ? "border-primary bg-secondary text-primary"
                        : "border-input bg-card text-muted-foreground"
                    }`}
                  >
                    <Video size={13} /> Telepsicología (Virtual)
                  </button>
                </div>
              </div>

              {modality === "presencial" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Asignación de Consultorio / Box Físico
                  </label>
                  <select
                    value={consultorioBox}
                    onChange={(e) => setConsultorioBox(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                  >
                    <option value="Box 1 (Adultos / TCC)">Box 1 (Adultos / TCC)</option>
                    <option value="Box 2 (Infanto-Juvenil & Juegos)">Box 2 (Infanto-Juvenil & Juegos)</option>
                    <option value="Box 3 (Terapia de Pareja y Familia)">Box 3 (Terapia de Pareja y Familia)</option>
                    <option value="Sala Gesell (Supervisión)">Sala Gesell (Supervisión)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Enlace de Videollamada (Google Meet / Zoom)
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/syn-kro-demo"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Objetivo / Nota de la Cita
                </label>
                <input
                  type="text"
                  placeholder="Ej. Revisión de registro conductual, sesión de encuadre..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
                  {saving ? "Agendando..." : "Confirmar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
