"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useClinicalData } from "@/lib/clinical-context";
import { useSubscription } from "@/lib/subscription-context";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import { toast } from "sonner";
import {
  inviteProfessionalSchema,
  referralSchema,
  validateForm,
} from "@/lib/validations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEMO_THERAPISTS = [
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

const REF_PATIENT_OPTIONS: Record<string, string> = {
  "Camila Valdivia": "Camila Valdivia (Ansiedad Generalizada)",
  "Sofía Morales": "Sofía Morales (Duelo Complicado)",
  "Mateo Huamán": "Mateo Huamán (Procrastinación & Ansiedad)",
  "Carlos & Andrea": "Carlos & Andrea (Terapia de Pareja)",
  "Lucía Benavides": "Lucía Benavides (Depresión Reactiva)",
};

const REF_TO_OPTIONS: Record<string, string> = {
  "Dra. Claudia Paredes": "Dra. Claudia Paredes (Infanto-Juvenil & TEA)",
  "Mtr. Jimena Rivas": "Mtr. Jimena Rivas (Pareja & Familia Sistémica)",
  "Lic. Marco Soto": "Lic. Marco Soto (Neuropsicología Clínica)",
  "Lic. Alejandro Mendoza": "Lic. Alejandro Mendoza (TCC Adultos)",
};

const REF_PRIORITY_OPTIONS: Record<string, string> = {
  Alta: "Alta (Atención prioritaria en menos de 48 hrs)",
  Media: "Media (Próxima sesión disponible)",
  Normal: "Normal (Consulta programada regular)",
};

const SPECIALTY_OPTIONS: Record<string, string> = {
  "Psicoterapia Cognitivo Conductual (TCC)": "Psicoterapia Cognitivo Conductual (TCC)",
  "Psicología Infantil & Adolescentes": "Psicología Infantil & Adolescentes",
  "Terapia de Pareja & Familia Sistémica": "Terapia de Pareja & Familia Sistémica",
  "Neuropsicología Clínica": "Neuropsicología Clínica",
  "Terapia Dialéctico Conductual (DBT)": "Terapia Dialéctico Conductual (DBT)",
};

export default function ProfesionalesView() {
  const { isDemo, service, user } = useClinicalData();
  const { isClinic, subscription, checkProfessionalLimit } = useSubscription();
  const [activeTab, setActiveTab] = useState<"equipo" | "derivaciones" | "boxes" | "supervision">("equipo");
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Equipo real de la clínica (en producción) vs Demo
  const [realTherapists, setRealTherapists] = useState<typeof DEMO_THERAPISTS>([]);
  const [patients, setPatients] = useState<any[]>([]);

  // Estados del formulario de invitación
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLicense, setInviteLicense] = useState("");
  const [inviteSpecialty, setInviteSpecialty] = useState("Psicoterapia Cognitivo Conductual (TCC)");
  const [inviteFieldErrors, setInviteFieldErrors] = useState<Record<string, string>>({});
  const [referralFieldErrors, setReferralFieldErrors] = useState<Record<string, string>>({});

  // Derivaciones State
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

  // Cargar equipo real y pacientes de la clínica con aislamiento RLS
  useEffect(() => {
    if (isDemo) return;

    let isMounted = true;
    async function loadClinicData() {
      try {
        setLoadingTeam(true);

        // 1. Obtener pacientes reales de esta clínica
        const pts = await service.getPatients();
        if (isMounted) {
          setPatients(pts || []);
        }

        // 2. Obtener profesionales de esta organización desde Supabase (RLS aplica is_member_of)
        const { data: profs, error } = await supabase
          .from("professionals")
          .select(`
            id,
            organization_id,
            profile_id,
            specialty,
            license_number,
            bio,
            created_at,
            profiles (
              id,
              full_name,
              role,
              avatar_url,
              phone,
              specialty,
              license_number,
              email
            )
          `)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("[Profesionales] Error al cargar equipo:", error);
        }

        if (isMounted) {
          if (profs && profs.length > 0) {
            const mapped = profs.map((p: any, idx: number) => {
              const prof = p.profiles;
              const name = prof?.full_name || (idx === 0 ? user?.full_name : null) || "Psicólogo Colegiado";
              const role = idx === 0 ? "Director Clínico & Psicólogo Titular" : "Psicólogo(a) del Centro";
              const license = p.license_number || prof?.license_number || (idx === 0 ? user?.license_number : null) || "C.Ps.P. Registrado";
              const specialty = p.specialty || prof?.specialty || (idx === 0 ? user?.specialty : null) || "Psicología Clínica";
              const initials = name
                .split(" ")
                .filter((w: string) => !w.startsWith("Lic") && !w.startsWith("Dr") && !w.startsWith("Mtr"))
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "PS";

              return {
                id: p.id,
                name,
                role,
                license,
                specialty,
                casesCount: Math.max(1, Math.round((pts?.length || 0) / profs.length)),
                weeklyHours: "24 hrs / sem",
                status: "Disponible",
                avatar: initials,
                approach: p.bio || "Enfoque clínico basado en evidencia",
                email: (idx === 0 ? user?.email : prof?.email) || "",
              };
            });
            setRealTherapists(mapped);
          } else if (user) {
            setRealTherapists([
              {
                id: "titular",
                name: user.full_name || "Psicólogo Titular",
                role: "Director Clínico & Psicólogo Titular",
                license: user.license_number || "C.Ps.P. Registrado",
                specialty: user.specialty || "Psicología Clínica",
                casesCount: pts?.length || 0,
                weeklyHours: "24 hrs / sem",
                status: "Disponible (Box 1)",
                avatar: user.full_name?.charAt(0).toUpperCase() || "P",
                approach: "Enfoque clínico basado en evidencia",
                email: user.email || "",
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del centro:", err);
      } finally {
        if (isMounted) setLoadingTeam(false);
      }
    }

    loadClinicData();
    return () => {
      isMounted = false;
    };
  }, [isDemo, service, user]);

  // Lista de terapeutas activa según el modo
  const therapists = isDemo
    ? DEMO_THERAPISTS
    : realTherapists.length > 0
    ? realTherapists
    : [
        {
          id: "titular",
          name: user?.full_name || "Psicólogo Titular",
          role: "Director Clínico & Psicólogo Titular",
          license: user?.license_number || "C.Ps.P. Registrado",
          specialty: user?.specialty || "Psicología Clínica",
          casesCount: patients.length,
          weeklyHours: "24 hrs / sem",
          status: "Disponible (Box 1)",
          avatar: user?.full_name?.charAt(0).toUpperCase() || "P",
          approach: "Enfoque clínico basado en evidencia",
          email: user?.email || "",
        },
      ];

  // Opciones dinámicas de pacientes para derivaciones
  const refPatientOptions: Record<string, string> = isDemo
    ? REF_PATIENT_OPTIONS
    : patients.length > 0
    ? Object.fromEntries(
        patients.map((p) => [
          `${p.first_name} ${p.last_name}`,
          `${p.first_name} ${p.last_name} (${p.therapeutic_approach || "TCC"})`,
        ])
      )
    : REF_PATIENT_OPTIONS;

  // Opciones dinámicas de terapeutas para derivaciones
  const refToOptions: Record<string, string> = isDemo
    ? REF_TO_OPTIONS
    : therapists.length > 0
    ? Object.fromEntries(
        therapists.map((t) => [
          t.name,
          `${t.name} (${t.specialty})`,
        ])
      )
    : REF_TO_OPTIONS;

  // Sincronizar selección inicial de paciente y terapeuta destino
  useEffect(() => {
    const pKeys = Object.keys(refPatientOptions);
    if (pKeys.length > 0 && !pKeys.includes(refPatient)) {
      setRefPatient(pKeys[0]);
    }
    const tKeys = Object.keys(refToOptions);
    if (tKeys.length > 0 && !tKeys.includes(refTo)) {
      setRefTo(tKeys[0]);
    }
  }, [refPatientOptions, refToOptions, refPatient, refTo]);

  // Consultorios Físicos (Boxes) con ocupante dinámico
  const titularOccupant = therapists[0]?.name || "Director Clínico";
  const boxes = [
    {
      id: "box-1",
      name: "Consultorio Box 1 (Adultos & TCC)",
      type: "Psicoterapia Individual",
      currentOccupant: titularOccupant,
      patient: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : "Camila Valdivia",
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
      time: "Libre para reservas",
      status: "available",
      features: "Caja de arena, mesa de dibujo, juegos terapéuticos proyectivos, piso acolchado.",
    },
    {
      id: "box-3",
      name: "Consultorio Box 3 (Parejas & Familias)",
      type: "Terapia Relacional",
      currentOccupant: therapists[1]?.name || null,
      patient: patients[1] ? `${patients[1].first_name} ${patients[1].last_name}` : null,
      time: therapists[1] ? "10:00 - 11:30 hrs" : "Disponible para reservas",
      status: therapists[1] ? "occupied" : "available",
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

    const validation = validateForm(referralSchema, {
      patient: refPatient,
      toTherapist: refTo,
      priority: refPriority,
      reason: refReason,
    });

    if (!validation.success) {
      setReferralFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setReferralFieldErrors({});

    if (isDemo) {
      notifyDemoWriteBlocked("Nueva Derivación / Triage");
      setIsReferralModalOpen(false);
      return;
    }

    const titularName = (therapists[0]?.name) || "Director Clínico";
    const newRef = {
      id: `ref-${Date.now()}`,
      patient: validation.data.patient,
      fromTherapist: titularName,
      toTherapist: validation.data.toTherapist,
      reason: validation.data.reason,
      date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      status: "En Revisión",
      priority: validation.data.priority,
    };

    setReferrals([newRef, ...referrals]);
    setRefReason("");
    setIsReferralModalOpen(false);
    toast.success(`Derivación de ${refPatient} registrada hacia ${refTo}.`);
  };

  const handleInviteProfessional = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(inviteProfessionalSchema, {
      fullName: inviteName,
      email: inviteEmail,
      specialty: inviteSpecialty,
      licenseNumber: inviteLicense || undefined,
      role: "psychologist",
    });

    if (!validation.success) {
      setInviteFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setInviteFieldErrors({});

    if (isDemo) {
      notifyDemoWriteBlocked("Invitar nuevo terapeuta a la clínica");
      setIsInviteModalOpen(false);
      return;
    }

    // Comprobar límite de profesionales del plan
    const check = checkProfessionalLimit();
    if (!check.allowed) {
      toast.error(check.message || "Has alcanzado el límite de profesionales de tu plan.");
      return;
    }

    const initials = validation.data.fullName
      .trim()
      .split(" ")
      .filter((w) => !w.startsWith("Lic") && !w.startsWith("Dr") && !w.startsWith("Mtr"))
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PS";

    const newTherapist: (typeof DEMO_THERAPISTS)[0] = {
      id: `invited-${Date.now()}`,
      name: validation.data.fullName,
      role: "Psicólogo(a) Colaborador(a)",
      license: validation.data.licenseNumber || "C.Ps.P. en trámite",
      specialty: validation.data.specialty,
      casesCount: 0,
      weeklyHours: "Por coordinar",
      status: "Invitación Enviada",
      avatar: initials,
      approach: "Enfoque clínico en integración",
      email: validation.data.email,
    };

    setRealTherapists((prev) => [...prev, newTherapist]);
    toast.success(`Invitación enviada a ${validation.data.email}. Se ha incorporado a tu equipo.`);
    setInviteName("");
    setInviteEmail("");
    setInviteLicense("");
    setIsInviteModalOpen(false);
  };

  if (!isClinic && !isDemo) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-8">
        <div className="rounded-3xl border bg-card p-8 sm:p-10 text-center space-y-6 shadow-xs">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 size={32} />
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
              Módulo Exclusivo para Centros & Clínicas
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Gestión de Equipo de Psicólogos & Consultorios
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Tu cuenta actual está configurada como <strong>Psicólogo(a) Independiente</strong>, optimizada para la gestión directa y privada de tus propios pacientes y agenda clínica.
            </p>
          </div>

          <div className="rounded-2xl border bg-muted/40 p-5 text-left text-xs text-muted-foreground space-y-3">
            <p className="font-bold text-foreground">
              ¿Qué incluye la modalidad de Centro o Clínica Psicológica?
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Gestión de hasta 10 profesionales o terapeutas colaboradores en tu centro.</li>
              <li>Triage y derivaciones internas entre especialistas con traspaso seguro de historial.</li>
              <li>Asignación y reserva de consultorios físicos (boxes) y salas de atención.</li>
              <li>Supervisión de casos y co-visión clínica bajo secreto profesional.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/suscripcion"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
            >
              <Sparkles size={14} />
              <span>Conocer el Plan Clínica (S/ 189/mes)</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Volver a mi Consulta</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-2xl font-black text-foreground">
            {therapists.length} {therapists.length === 1 ? "Psicólogo" : "Psicólogos"}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} /> Colegiaturas C.Ps.P. verificadas
          </span>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Casos Clínicos Activos
          </span>
          <p className="text-2xl font-black text-foreground">
            {isDemo ? 39 : (patients.length || subscription?.patient_count || 0)} Pacientes
          </p>
          <span className="text-[11px] text-muted-foreground">
            Distribuidos por especialidad
          </span>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Consultorios Físicos (Boxes)
          </span>
          <p className="text-2xl font-black text-foreground">
            {boxes.filter((b) => b.status === "occupied").length} / {boxes.length} En Uso
          </p>
          <span className="text-[11px] text-sky-600 font-semibold">
            {Math.round((boxes.filter((b) => b.status === "occupied").length / boxes.length) * 100)}% de ocupación en sede
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
                <Select
                  items={refPatientOptions}
                  value={refPatient}
                  onValueChange={(val) => val && setRefPatient(val)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
                    <SelectValue placeholder="Selecciona paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(refPatientOptions).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Profesional de Destino *
                </label>
                <Select
                  items={refToOptions}
                  value={refTo}
                  onValueChange={(val) => val && setRefTo(val)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
                    <SelectValue placeholder="Selecciona profesional..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(refToOptions).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Prioridad del Caso
                </label>
                <Select
                  items={REF_PRIORITY_OPTIONS}
                  value={refPriority}
                  onValueChange={(val) => val && setRefPriority(val)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
                    <SelectValue placeholder="Prioridad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REF_PRIORITY_OPTIONS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <form onSubmit={handleInviteProfessional} className="space-y-4 text-xs">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nombre Completo del Psicólogo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lic. Fernando Salcedo"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Correo Electrónico Profesional *
                </label>
                <input
                  type="email"
                  required
                  placeholder="fernando.salcedo@clinicabienestar.pe"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Número de Colegiatura C.Ps.P. (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="C.Ps.P. 33910"
                  value={inviteLicense}
                  onChange={(e) => setInviteLicense(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Especialidad Principal
                </label>
                <Select
                  items={SPECIALTY_OPTIONS}
                  value={inviteSpecialty}
                  onValueChange={(val) => val && setInviteSpecialty(val)}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
                    <SelectValue placeholder="Selecciona especialidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIALTY_OPTIONS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 cursor-pointer"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
