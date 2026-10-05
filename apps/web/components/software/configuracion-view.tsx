"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useClinicalData } from "@/lib/clinical-context";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  User,
  Building,
  CreditCard,
  Cloud,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Camera,
  HeartHandshake,
  ExternalLink,
  ShieldAlert,
  Save,
  CheckCircle2,
} from "lucide-react";

function ConfiguracionContent() {
  const { user, refreshProfile } = useAuth();
  const { isDemo, user: clinicalUser } = useClinicalData();
  const currentUser = isDemo ? clinicalUser : user;
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "perfil";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Clinic State
  const [clinicName, setClinicName] = useState("Centro Psicológico Synkro");
  const [clinicSlug, setClinicSlug] = useState("synkro-mind-clinic");

  const isSuperAdmin = user?.role === "superadmin" || user?.role === "admin";

  useEffect(() => {
    async function loadData() {
      if (currentUser) {
        setFullName(currentUser.full_name || "Lic. Alejandro Mendoza V.");
        setSpecialty(currentUser.specialty || "Psicología Clínica y TCC");
        setLicenseNumber(currentUser.license_number || "C.Ps.P. 28419");
        setPhone(currentUser.phone || "+51 984 555 123");
        setBio(
          currentUser.bio ||
            "Especialista en trastornos de ansiedad, estrés y regulación emocional con más de 8 años de experiencia clínica."
        );
        setOfficeAddress(currentUser.office_address || "Av. Benavides 1570, Miraflores, Lima");
        setMeetLink(currentUser.default_meet_link || "https://meet.google.com/syn-kro-vely");
        setAvatarUrl(currentUser.avatar_url || "");
      }

      if (isDemo) {
        setClinicName("Centro Psicológico Synkro (Demo)");
        setClinicSlug("synkro-demo-clinic");
        return;
      }

      // Fetch organization from Supabase only in production
      const { data: orgData } = await supabase
        .from("organizations")
        .select("name, slug")
        .limit(1)
        .single();

      if (orgData) {
        setClinicName(orgData.name);
        setClinicSlug(orgData.slug);
      }
    }

    loadData();
  }, [currentUser, isDemo]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 300);
      return;
    }

    if (!user?.id) return;

    try {
      setSaving(true);
      setSaveSuccess(false);

      // Update profiles
      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          specialty: specialty.trim(),
          license_number: licenseNumber.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          office_address: officeAddress.trim(),
          default_meet_link: meetLink.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", user.id);

      if (profErr) throw profErr;

      // Update professionals
      await supabase
        .from("professionals")
        .update({
          specialty: specialty.trim(),
          license_number: licenseNumber.trim(),
          bio: bio.trim(),
        })
        .eq("profile_id", user.id);

      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isSuperAdmin && activeTab === "admin"
              ? "Consola Administrador Velyon"
              : "Mi Perfil & Configuración"}
          </h1>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
            {isSuperAdmin ? "Superadmin" : "Psicólogo Titular"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSuperAdmin && activeTab === "admin"
            ? "Herramientas de plataforma, base de datos e infraestructura Cloud para Velyon."
            : "Gestiona tus credenciales profesionales, datos de consultorio y accesos de pacientes."}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab("perfil")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "perfil"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <User size={15} />
          <span>Perfil del Psicólogo</span>
        </button>

        <button
          onClick={() => setActiveTab("clinica")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "clinica"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Building size={15} />
          <span>Consultorio & Clínica</span>
        </button>

        <button
          onClick={() => setActiveTab("pacientes")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "pacientes"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <HeartHandshake size={15} />
          <span>Acceso para Pacientes</span>
        </button>

        {/* Pestaña exclusiva de Superadmin Velyon */}
        {(isSuperAdmin || initialTab === "admin") && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ml-auto ${
              activeTab === "admin"
                ? "bg-amber-600 text-white shadow-xs"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            <ShieldAlert size={15} />
            <span>Consola Velyon Admin</span>
          </button>
        )}
      </div>

      {/* TAB 1: PERFIL DEL PSICÓLOGO */}
      {activeTab === "perfil" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Ficha Profesional del Terapeuta
                </h2>
                <p className="text-xs text-muted-foreground">
                  Esta información avala tus notas clínicas y aparece en los reportes e informes de tus pacientes.
                </p>
              </div>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 size={14} /> Guardado con éxito
                </span>
              )}
            </div>

            {/* Avatar & Identidad */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative flex size-20 items-center justify-center rounded-3xl bg-secondary text-2xl font-bold text-primary shadow-xs">
                {fullName ? fullName[0] : "A"}
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                  <Camera size={12} />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Foto de Perfil Profesional
                </span>
                <p className="text-xs text-muted-foreground">
                  Formato recomendado: JPG o PNG cuadrado (mínimo 400x400 px).
                </p>
                <input
                  type="url"
                  placeholder="URL de foto o avatar (opcional)..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="h-9 w-full max-w-md rounded-xl border bg-background px-3 text-xs outline-none"
                />
              </div>
            </div>

            {/* Campos del Psicólogo */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nombre Completo & Título Profesional *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Número de Colegiatura Oficial *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. C.Ps.P. 28419"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none font-semibold text-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Especialidad / Enfoque Clínico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Psicología Clínica y TCC"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Teléfono / WhatsApp de Consultas
                </label>
                <input
                  type="tel"
                  placeholder="+51 984 555 123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Dirección del Consultorio Físico
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. Benavides 1570, Miraflores, Lima"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Enlace Predeterminado de Telepsicología (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Bio / Resumen Profesional (Visible para pacientes)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border bg-background p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? "Guardando cambios..." : "Guardar Perfil Profesional"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CONSULTORIO & CLÍNICA */}
      {activeTab === "clinica" && (
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              Datos del Consultorio / Clínica Psicológica
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Nombre de la Clínica
                </label>
                <input
                  type="text"
                  readOnly
                  value={clinicName}
                  className="h-10 w-full rounded-xl border bg-muted/30 px-3 text-sm font-medium text-foreground outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Identificador Único (Slug)
                </label>
                <input
                  type="text"
                  readOnly
                  value={clinicSlug}
                  className="h-10 w-full rounded-xl border bg-muted/30 px-3 text-xs text-foreground outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Suscripción & Plan Synkro</h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                Plan Activo
              </span>
            </div>
            <div className="rounded-2xl bg-secondary/50 p-4 space-y-1">
              <span className="font-bold text-sm text-primary">Plan Professional (Ilimitado)</span>
              <p className="text-xs text-muted-foreground">
                Pacientes ilimitados, doble capa de notas confidenciales y portal de pacientes activo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESO PARA PACIENTES */}
      {activeTab === "pacientes" && (
        <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Portal del Paciente: Cómo funciona el acceso
              </h2>
              <p className="text-xs text-muted-foreground">
                Invita a tus pacientes a su propio portal seguro para ver tareas y citas.
              </p>
            </div>
            <a
              href="/portal-paciente"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <span>Abrir Portal de Paciente</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-muted/20 p-4 space-y-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-xs font-bold text-foreground">Registras al Paciente</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Ingresas sus datos en el módulo de Pacientes y se genera automáticamente su ficha clínica.
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4 space-y-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-xs font-bold text-foreground">Le das acceso a su Portal</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                El paciente ingresa con su correo a <code className="font-mono text-primary">/portal-paciente</code>.
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4 space-y-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-xs font-bold text-foreground">Interacción Intersesión</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                El paciente revisa sus tareas, registra su ánimo diario y accede al enlace de videollamada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONSOLA ADMIN VELYON (SOLO SUPERADMIN) */}
      {(isSuperAdmin || initialTab === "admin") && activeTab === "admin" && (
        <div className="rounded-3xl border-2 border-amber-500/30 bg-card p-6 lg:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 font-bold">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Consola Maestra de Plataforma (Exclusivo Administrador Velyon)
              </h2>
              <p className="text-xs text-muted-foreground">
                Esta sección solo es visible para tu usuario administrador. Los psicólogos clientes nunca ven esta información técnica.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-amber-500/5 p-4 text-xs space-y-2">
              <span className="font-bold text-foreground block">
                Herramienta de Migración a Supabase Cloud (Free Tier)
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Usa estos comandos en tu terminal para crear el backup y cargarlo en tu proyecto Supabase Cloud:
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between rounded-xl bg-background p-3 border">
                  <div>
                    <span className="font-semibold block text-[11px]">Paso 1: Generar backup local</span>
                    <code className="text-[10px] text-primary font-mono">
                      supabase db dump --local -f supabase/backup_synkro_cloud_ready.sql
                    </code>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        "supabase db dump --local -f supabase/backup_synkro_cloud_ready.sql",
                        1
                      )
                    }
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {copiedStep === 1 ? "Copiado" : "Copiar"}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-background p-3 border">
                  <div>
                    <span className="font-semibold block text-[11px]">Paso 2: Restaurar en Supabase Cloud</span>
                    <span className="text-[10px] text-muted-foreground block">
                      Pega el contenido del archivo <code className="text-primary font-mono">supabase/seed.sql</code> en el SQL Editor de Supabase Cloud.
                    </span>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Abrir Cloud <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfiguracionView() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando configuración...</p>}>
      <ConfiguracionContent />
    </Suspense>
  );
}
