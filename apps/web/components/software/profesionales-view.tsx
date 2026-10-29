"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useClinicalData } from "@/lib/clinical-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import {
  Building2,
  Users2,
  UserPlus,
  ShieldCheck,
  Award,
  ArrowRightLeft,
  DoorOpen,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Brain,
  Search,
  Plus,
  X,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function ProfesionalesView() {
  const { isDemo } = useClinicalData();
  const [activeTab, setActiveTab] = useState<"equipo" | "derivaciones" | "boxes" | "supervision">("equipo");
  const [loading, setLoading] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Derivaciones Demo State
  const [referrals, setReferrals] = useState([
    {
      id: "ref-1",
      patient: "Mateo Huamán (16 años)",
      fromTherapist: "Lic. Alejandro Mendoza",
      toTherapist: "Dra. Claudia Paredes (Infanto-Juvenil)",
      reason: "Evaluación psicométrica por sospecha de TDAH y dificultades de autorregulación emocional en el colegio.",
      date: "26 Septiembre 2026",
      status: "En Co-Atención",
      priority: "Alta",
    },
    {
      id: "ref-2",
      patient: "Carlos & Andrea (Pareja)",
      fromTherapist: "Lic. Alejandro Mendoza",
      toTherapist: "Mtr. Jimena Rivas (Terapia Sistémica de Pareja)",
      reason: "Deterioro de la comunicación, escaladas simétricas y dificultades en acuerdos parentales.",
      date: "25 Septiembre 2026",
      status: "Aceptada",
      priority: "Media",
    },
    {
      id: "ref-3",
      patient: "Lucía Benavides (68 años)",
      fromTherapist: "Lic. Alejandro Mendoza",
      toTherapist: "Lic. Marco Soto (Neuropsicología)",
      reason: "Descarte de deterioro cognitivo leve vs. pseudodemencia depresiva secundaria a duelo.",
      date: "22 Septiembre 2026",
      status: "Informe Finalizado",
      priority: "Normal",
    },
  ]);

  // Form State for new referral
  const [refPatient, setRefPatient] = useState("Camila Valdivia");
  const [refTo, setRefTo] = useState("Dra. Claudia Paredes");
  const [refReason, setRefReason] = useState("");
  const [refPriority, setRefPriority] = useState("Media");

  // Multi-therapist team data
  const therapists = [
    {
      id: "p1",
      name: "Lic. Alejandro Mendoza V.",
      role: "Director Clínico & Psicólogo Titular",
      license: "C.Ps.P. 28419",
      specialty: "Psicología Clínica & TCC (Adultos)",
      casesCount: 6,
      weeklyHours: "24 hrs / sem",
      status: "En Consulta (Box 1)",
      avatar: "A",
      approach: "Terapia Cognitivo Conductual y Terapia de Aceptación y Compromiso (ACT)",
      email: "alejandro.mendoza@synkro.com",
    },
    {
      id: "p2",
      name: "Dra. Claudia Paredes",
      role: "Especialista Infanto-Juvenil",
      license: "C.Ps.P. 31204",
      specialty: "Psicología Infantil, Adolescentes & TEA",
      casesCount: 14,
      weeklyHours: "28 hrs / sem",
      status: "Disponible",
      avatar: "C",
      approach: "Terapia de Juego, Neurodesarrollo y Orientación Parental",
      email: "claudia.paredes@synkro.com",
    },
    {
      id: "p3",
      name: "Mtr. Jimena Rivas",
      role: "Terapeuta de Pareja & Familia",
      license: "C.Ps.P. 19582",
      specialty: "Terapia Sistémica & Relacional",
      casesCount: 11,
      weeklyHours: "20 hrs / sem",
      status: "Disponible (Cita 17:00)",
      avatar: "J",
      approach: "Enfoque Sistémico Estructural y Terapia Focalizada en las Emociones (EFT)",
      email: "jimena.rivas@synkro.com",
    },
    {
      id: "p4",
      name: "Lic. Marco Aurelio Soto",
      role: "Neuropsicólogo Clínico",
      license: "C.Ps.P. 24890",
      specialty: "Evaluación Neurocognitiva & Rehabilitación",
      casesCount: 8,
      weeklyHours: "16 hrs / sem",
      status: "En Evaluación (Box 3)",
      avatar: "M",
      approach: "Baterías Neuropsicológicas (WISC-V, WAIS-IV, Test de Stroop, Minimental)",
      email: "marco.soto@synkro.com",
    },
  ];

  // Consultorios Físicos (Boxes)
  const boxes = [
    {
      id: "box-1",
      name: "Consultorio Box 1 (Adultos & TCC)",
      type: "Psicoterapia Individual",
      currentOccupant: "Lic. Alejandro Mendoza",
      patient: "Camila Valdivia",
      time: "09:00 - 10:00 hrs",
      status: "occupied",
      features: "Sillones ergonómicos, insonorización acústica, iluminación regulable cálida.",
    },
    {
      id: "box-2",
      name: "Consultorio Box 2 (Infantil & Juego)",
      type: "Psicoterapia Niños & Adolescentes",
      currentOccupant: null,
      patient: null,
      time: "Libre hasta las 15:00 hrs",
      status: "available",
      features: "Caja de arena, mesa de dibujo, juegos terapéuticos proyectivos, piso acolchado.",
    },
    {
      id: "box-3",
      name: "Consultorio Box 3 (Parejas & Familias)",
      type: "Terapia Relacional",
      currentOccupant: "Lic. Marco Soto",
      patient: "Evaluación Neurocognitiva",
      time: "10:00 - 11:30 hrs",
      status: "occupied",
      features: "Mesa de evaluación con cronómetro y kit psicométrico, sofá triple de confort familiar.",
    },
    {
      id: "box-4",
      name: "Cámara Gesell (Supervisión & Co-visión)",
      type: "Supervisión & Docencia Clínica",
      currentOccupant: null,
      patient: null,
      time: "Disponible para reservas",
      status: "available",
      features: "Espejo unidireccional, sistema de audio HD intercomunicado para feedback en tiempo real.",
    },
  ];

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refReason.trim()) return;

    const newRef = {
      id: `ref-${Date.now()}`,
      patient: refPatient,
      fromTherapist: "Lic. Alejandro Mendoza",
      toTherapist: refTo,
      reason: refReason.trim(),
      date: "28 Septiembre 2026",
      status: "En Revisión",
      priority: refPriority,
    };

    setReferrals([newRef, ...referrals]);
    setRefReason("");
    setIsReferralModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Gestión Clínica de Centro & Equipo
            </h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
              Empresa / Clínica
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Plataforma integral para centros psicológicos: equipo multidisciplinario, derivaciones internas y gestión de consultorios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isDemo) {
                notifyDemoWriteBlocked("Nueva Derivación / Triage");
                return;
              }
              setIsReferralModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-secondary/50 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-secondary transition-colors cursor-pointer"
          >
            <ArrowRightLeft size={14} />
            <span>Nueva Derivación</span>
          </button>

          <button
            onClick={() => {
              if (isDemo) {
                notifyDemoWriteBlocked("Invitar Terapeuta a la Clínica");
                return;
              }
              setIsInviteModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Invitar Profesional</span>
          </button>
        </div>
      </div>

      {/* Enterprise Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border bg-card p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Terapeutas en Red
          </span>
          <p className="text-2xl font-black text-foreground">4 Psicólogos</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> Colegiaturas C.Ps.P. verificadas
          </span>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Casos Clínicos Activos
          </span>
          <p className="text-2xl font-black text-foreground">39 Pacientes</p>
          <span className="text-[11px] text-muted-foreground">
            Distribuidos por especialidad
          </span>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Consultorios Físicos (Boxes)
          </span>
          <p className="text-2xl font-black text-foreground">2 / 4 En Uso</p>
          <span className="text-[11px] text-sky-600 font-semibold">
            50% de ocupación en sede
          </span>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Adherencia Terapéutica
          </span>
          <p className="text-2xl font-black text-foreground">94.8%</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> Alta retención de pacientes
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        {[
          { id: "equipo", label: "Equipo Multidisciplinario", icon: Users2 },
          { id: "derivaciones", label: "Derivaciones & Co-atención", icon: ArrowRightLeft, count: referrals.length },
          { id: "boxes", label: "Consultorios & Boxes Físicos", icon: DoorOpen },
          { id: "supervision", label: "Supervisión & Comité Ético", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EQUIPO MULTIDISCIPLINARIO */}
      {activeTab === "equipo" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="flex flex-col justify-between rounded-3xl border bg-card p-6 shadow-xs hover:border-primary/40 transition-all space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary font-bold text-xl shadow-2xs">
                        {therapist.avatar}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {therapist.name}
                        </h3>
                        <p className="text-xs text-primary font-semibold">
                          {therapist.role}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {therapist.license}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        therapist.status.includes("Consulta") || therapist.status.includes("Evaluación")
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}
                    >
                      {therapist.status}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-muted/20 p-3.5 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Especialidad & Abordaje:
                    </span>
                    <p className="text-foreground font-medium">{therapist.specialty}</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {therapist.approach}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>
                      <strong className="text-foreground">{therapist.casesCount}</strong> casos activos
                    </span>
                    <span>•</span>
                    <span>{therapist.weeklyHours}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isDemo) {
                          notifyDemoWriteBlocked("Derivar Caso Clínico");
                          return;
                        }
                        setRefTo(therapist.name);
                        setIsReferralModalOpen(true);
                      }}
                      className="rounded-lg border px-3 py-1 text-xs font-semibold text-primary hover:bg-secondary/40 transition-colors cursor-pointer"
                    >
                      Derivar Caso
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DERIVACIONES & CO-ATENCIÓN */}
      {activeTab === "derivaciones" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-secondary/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles size={16} /> Innovación Synkro: Triage & Derivación Inter-profesional
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Permite a los profesionales de tu clínica transferir pacientes o solicitar evaluaciones complementarias (ej. neuropsicología, terapia de pareja o psiquiatría) sin perder el historial clínico, notas SOAP ni obligar al paciente a repetir su anamnesis desde cero.
            </p>
          </div>

          <div className="space-y-3">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="rounded-3xl border bg-card p-5 shadow-xs hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {ref.patient}
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-primary">
                      Prioridad {ref.priority}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      ref.status === "En Co-Atención"
                        ? "bg-sky-500/10 text-sky-600"
                        : ref.status === "Informe Finalizado"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {ref.status}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Terapeuta Remitente:
                    </span>
                    <span className="text-foreground font-semibold">{ref.fromTherapist}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Terapeuta Receptor:
                    </span>
                    <span className="text-primary font-semibold">{ref.toTherapist}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-background p-3 text-xs text-muted-foreground border">
                  <strong className="text-foreground">Motivo Clínico de Derivación:</strong>{" "}
                  {ref.reason}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                  <span>Registrado el {ref.date}</span>
                  <div className="flex items-center gap-2">
                    <button className="font-semibold text-primary hover:underline">
                      Ver Expediente Compartido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONSULTORIOS & BOXES FÍSICOS */}
      {activeTab === "boxes" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-secondary/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <DoorOpen size={16} /> Control de Ocupación en Consultorios Físicos
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Evita colisiones y dobles reservas de consultorios en la sede de tu clínica psicológica. Visualiza en tiempo real qué terapeuta y paciente están utilizando cada sala.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {boxes.map((box) => (
              <div
                key={box.id}
                className={`rounded-3xl border p-6 shadow-xs space-y-4 transition-all ${
                  box.status === "occupied"
                    ? "bg-card border-amber-500/30"
                    : "bg-card border-emerald-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{box.name}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{box.type}</span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      box.status === "occupied"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {box.status === "occupied" ? "En Consulta" : "Libre / Disponible"}
                  </span>
                </div>

                {box.status === "occupied" ? (
                  <div className="rounded-2xl bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{box.currentOccupant}</span>
                      <span>{box.time}</span>
                    </div>
                    <p className="text-[11px]">Paciente: {box.patient}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-200">
                    <span className="font-bold block">Espacio Disponible</span>
                    <span className="text-[11px]">{box.time}</span>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground leading-relaxed border-t pt-3">
                  <strong>Equipamiento:</strong> {box.features}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUPERVISIÓN & COMITÉ ÉTICO */}
      {activeTab === "supervision" && (
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-base font-bold text-foreground">
              Comité de Supervisión Clínica & Visado de Casos
            </h2>
            <p className="text-xs text-muted-foreground">
              Validación y revisión por pares para psicólogos en formación o casos clínicos de alta complejidad.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  Sesión 5: Evaluación y Reestructuración Cognitiva (Camila Valdivia)
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600">
                  Visado Ético Conforme
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Supervisado por: Lic. Alejandro Mendoza V. (C.Ps.P. 28419). Se certifica la correcta aplicación del protocolo de registro conductual y cuidado en el descarte de riesgo de autolesión.
              </p>
            </div>

            <div className="rounded-2xl border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  Batería Psicométrica de Descarte Neurocognitivo (Lucía Benavides)
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600">
                  Aprobado en Sesión Clínica
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Supervisado por: Lic. Marco Soto. Se concluye compatibilidad con sintomatología afectiva reactiva al duelo y no con patología neurodegenerativa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA DERIVACIÓN INTERNA */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Nueva Derivación Clínica Interna
                </h2>
                <p className="text-xs text-muted-foreground">
                  Transfiere o solicita co-atención con un colega de tu clínica.
                </p>
              </div>
              <button
                onClick={() => setIsReferralModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Paciente a Derivar *
                </label>
                <select
                  value={refPatient}
                  onChange={(e) => setRefPatient(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                >
                  <option value="Camila Valdivia">Camila Valdivia (Ansiedad Generalizada)</option>
                  <option value="Sofía Morales">Sofía Morales (Duelo Complicado)</option>
                  <option value="Mateo Huamán">Mateo Huamán (Procrastinación & Ansiedad)</option>
                  <option value="Carlos & Andrea">Carlos & Andrea (Terapia de Pareja)</option>
                  <option value="Lucía Benavides">Lucía Benavides (Depresión Reactiva)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Profesional de Destino *
                </label>
                <select
                  value={refTo}
                  onChange={(e) => setRefTo(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                >
                  <option value="Dra. Claudia Paredes">Dra. Claudia Paredes (Infanto-Juvenil & TEA)</option>
                  <option value="Mtr. Jimena Rivas">Mtr. Jimena Rivas (Pareja & Familia Sistémica)</option>
                  <option value="Lic. Marco Soto">Lic. Marco Soto (Neuropsicología Clínica)</option>
                  <option value="Lic. Alejandro Mendoza">Lic. Alejandro Mendoza (TCC Adultos)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Prioridad del Caso
                </label>
                <select
                  value={refPriority}
                  onChange={(e) => setRefPriority(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                >
                  <option value="Alta">Alta (Atención prioritaria en menos de 48 hrs)</option>
                  <option value="Media">Media (Próxima sesión disponible)</option>
                  <option value="Normal">Normal (Consulta programada regular)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Motivo de la Derivación & Handover Clínico *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe la hipótesis diagnóstica, motivo del pase clínico y qué tipo de intervención esperas del colega..."
                  value={refReason}
                  onChange={(e) => setRefReason(e.target.value)}
                  className="w-full rounded-xl border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsReferralModalOpen(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90"
                >
                  Confirmar Derivación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVITAR PROFESIONAL A LA CLÍNICA */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Sumar Terapeuta a la Clínica
                </h2>
                <p className="text-xs text-muted-foreground">
                  Envía una invitación segura para que acceda al centro Synkro.
                </p>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nombre Completo del Psicólogo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lic. Fernando Salcedo"
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Correo Electrónico Profesional
                </label>
                <input
                  type="email"
                  placeholder="fernando.salcedo@clinicabienestar.pe"
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Número de Colegiatura C.Ps.P.
                </label>
                <input
                  type="text"
                  placeholder="C.Ps.P. 33910"
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Especialidad Principal
                </label>
                <select className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none">
                  <option>Psicoterapia Cognitivo Conductual (TCC)</option>
                  <option>Psicología Infantil & Adolescentes</option>
                  <option>Terapia de Pareja & Familia Sistémica</option>
                  <option>Neuropsicología Clínica</option>
                  <option>Terapia Dialéctico Conductual (DBT)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Invitación generada con token seguro y enviada por correo.");
                    setIsInviteModalOpen(false);
                  }}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90"
                >
                  Enviar Invitación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
