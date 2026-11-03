"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useClinicalData } from "@/lib/clinical-context";
import { useSubscription } from "@/lib/subscription-context";
import { formatPrice } from "@/lib/config/plans";
import { notifyDemoWriteBlocked } from "@/lib/demo/clinical-data";
import { supabase } from "@/lib/supabase";
import {
  User,
  Building,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Camera,
  HeartHandshake,
  ExternalLink,
  ShieldAlert,
  Save,
  CheckCircle2,
  Lock,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useGuidedTour } from "@/components/software/guided-tour";
import {
  profileSettingsSchema,
  changePasswordSettingsSchema,
  validateForm,
} from "@/lib/validations";

function ConfiguracionContent() {
  const { user, refreshProfile } = useAuth();
  const { isDemo, user: clinicalUser } = useClinicalData();
  const {
    subscription,
    plan,
    status,
    planConfig,
    isTrial,
    isActive,
    isExpired,
    daysRemaining,
  } = useSubscription();

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
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string>>({});

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Update State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});

  // Clinic State
  const [clinicName, setClinicName] = useState("Centro Psicológico Synkro");
  const [clinicSlug, setClinicSlug] = useState("synkro-mind-clinic");

  const isSuperAdmin = user?.platform_role === "superadmin";
  const { startTour } = useGuidedTour();

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
        setOfficeAddress(
          currentUser.office_address || "Av. Benavides 1570, Miraflores, Lima"
        );
        setMeetLink(
          currentUser.default_meet_link || "https://meet.google.com/syn-kro-vely"
        );
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

  // Actualizar avatar mediante archivo
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido. Por favor selecciona una imagen (PNG, JPG o WebP).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 3 MB.");
      return;
    }

    const toastId = toast.loading("Procesando foto de perfil...");
    setUploadingAvatar(true);

    try {
      if (isDemo) {
        // En modo Demo cargamos localmente como DataURL para visualización inmediata
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setAvatarUrl(result);
          toast.success("Foto de perfil actualizada en modo demostración.", {
            id: toastId,
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      if (!user?.id) {
        toast.error("Sesión no válida.", { id: toastId });
        return;
      }

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Guardar URL en el perfil de PostgreSQL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success("Foto de perfil actualizada exitosamente.", { id: toastId });
    } catch (err: any) {
      console.error("Error al subir avatar:", err);
      toast.error(err.message || "Error al subir la imagen. Intenta de nuevo.", {
        id: toastId,
      });
    } finally {
      setUploadingAvatar(false);
      // Limpiar input para permitir seleccionar el mismo archivo si se desea
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (isDemo) {
      setAvatarUrl("");
      toast.success("Foto de perfil removida en modo demostración.");
      return;
    }

    if (!user?.id) return;

    try {
      setUploadingAvatar(true);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (error) throw error;

      setAvatarUrl("");
      await refreshProfile();
      toast.success("Foto de perfil eliminada.");
    } catch (err: any) {
      toast.error("Error al eliminar la foto.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      notifyDemoWriteBlocked("Actualizar Configuración Clínica");
      return;
    }

    const validation = validateForm(profileSettingsSchema, {
      fullName,
      phone: phone || undefined,
      specialty: specialty || undefined,
      licenseNumber: licenseNumber || undefined,
      bio: bio || undefined,
      officeAddress: officeAddress || undefined,
      defaultMeetLink: meetLink || undefined,
    });

    if (!validation.success) {
      setProfileFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setProfileFieldErrors({});

    if (!user?.id) return;

    try {
      setSaving(true);
      setSaveSuccess(false);

      // Update profiles
      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          full_name: validation.data.fullName,
          specialty: validation.data.specialty || "",
          license_number: validation.data.licenseNumber || "",
          phone: validation.data.phone || "",
          bio: validation.data.bio || "",
          office_address: validation.data.officeAddress || "",
          default_meet_link: validation.data.defaultMeetLink || "",
          avatar_url: avatarUrl || null,
        })
        .eq("id", user.id);

      if (profErr) throw profErr;

      // Update professionals
      await supabase
        .from("professionals")
        .update({
          specialty: validation.data.specialty || "",
          license_number: validation.data.licenseNumber || "",
          bio: validation.data.bio || "",
        })
        .eq("profile_id", user.id);

      await refreshProfile();
      setSaveSuccess(true);
      toast.success("Perfil profesional actualizado con éxito.");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err.message || "Error al guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(changePasswordSettingsSchema, {
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      setPasswordFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setPasswordFieldErrors({});

    if (isDemo) {
      notifyDemoWriteBlocked("Actualizar Contraseña de Acceso");
      return;
    }

    const toastId = toast.loading("Actualizando contraseña de acceso...");
    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: validation.data.newPassword,
      });

      if (error) throw error;

      toast.success("Contraseña actualizada con éxito.", {
        id: toastId,
        description: "Tus próximas sesiones requerirán esta nueva credencial.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast.error(err.message || "Error al actualizar la contraseña.", {
        id: toastId,
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    toast.success("Comando copiado al portapapeles");
    setTimeout(() => setCopiedStep(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isSuperAdmin && activeTab === "admin"
                ? "Consola Administrador Velyon"
                : "Mi Perfil & Consultorio"}
            </h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
              {isSuperAdmin ? "Superadmin" : "Psicólogo Titular"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSuperAdmin && activeTab === "admin"
              ? "Herramientas de plataforma, base de datos e infraestructura Cloud para Velyon."
              : "Gestiona tus credenciales profesionales, datos de consultorio, seguridad y suscripción activa."}
          </p>
        </div>

        <button
          type="button"
          onClick={startTour}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
        >
          <Sparkles size={14} className="text-primary" />
          <span>Repetir Tour Guiado</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab("perfil")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
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
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "clinica"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Building size={15} />
          <span>Consultorio & Plan</span>
        </button>

        <button
          onClick={() => setActiveTab("seguridad")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "seguridad"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Lock size={15} />
          <span>Seguridad & Contraseña</span>
        </button>

        <button
          onClick={() => setActiveTab("pacientes")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ml-auto cursor-pointer ${
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
        <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
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

            {/* Selector de Foto de Perfil (Sin enlace manual) */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative flex size-20 shrink-0 items-center justify-center rounded-3xl bg-secondary text-2xl font-bold text-primary shadow-xs overflow-hidden border">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || "Avatar"}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{fullName ? fullName[0] : "A"}</span>
                )}
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                  <Camera size={12} />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Foto de Perfil Profesional
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Selecciona una imagen desde tu dispositivo (JPG, PNG o WebP, máx. 3 MB).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2 text-xs font-semibold text-primary hover:bg-secondary/80 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={14} />
                    <span>{uploadingAvatar ? "Subiendo..." : "Seleccionar Foto"}</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>Quitar</span>
                    </button>
                  )}
                </div>
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
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (profileFieldErrors.fullName) setProfileFieldErrors((p) => ({ ...p, fullName: "" }));
                  }}
                  className={`h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                    profileFieldErrors.fullName ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {profileFieldErrors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{profileFieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Número de Colegiatura Oficial *
                </label>
                <input
                  type="text"
                  placeholder="Ej. C.Ps.P. 28419"
                  value={licenseNumber}
                  onChange={(e) => {
                    setLicenseNumber(e.target.value);
                    if (profileFieldErrors.licenseNumber) setProfileFieldErrors((p) => ({ ...p, licenseNumber: "" }));
                  }}
                  className={`h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none font-semibold text-primary transition-colors focus:ring-2 focus:ring-primary/20 ${
                    profileFieldErrors.licenseNumber ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {profileFieldErrors.licenseNumber && (
                  <p className="mt-1 text-xs text-destructive">{profileFieldErrors.licenseNumber}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Especialidad / Enfoque Clínico *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Psicología Clínica y TCC"
                  value={specialty}
                  onChange={(e) => {
                    setSpecialty(e.target.value);
                    if (profileFieldErrors.specialty) setProfileFieldErrors((p) => ({ ...p, specialty: "" }));
                  }}
                  className={`h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                    profileFieldErrors.specialty ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {profileFieldErrors.specialty && (
                  <p className="mt-1 text-xs text-destructive">{profileFieldErrors.specialty}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Teléfono / WhatsApp de Consultas
                </label>
                <input
                  type="tel"
                  placeholder="+51 984 555 123"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (profileFieldErrors.phone) setProfileFieldErrors((p) => ({ ...p, phone: "" }));
                  }}
                  className={`h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                    profileFieldErrors.phone ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {profileFieldErrors.phone && (
                  <p className="mt-1 text-xs text-destructive">{profileFieldErrors.phone}</p>
                )}
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
                  onChange={(e) => {
                    setOfficeAddress(e.target.value);
                    if (profileFieldErrors.officeAddress) setProfileFieldErrors((p) => ({ ...p, officeAddress: "" }));
                  }}
                  className={`h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                    profileFieldErrors.officeAddress ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {profileFieldErrors.officeAddress && (
                  <p className="mt-1 text-xs text-destructive">{profileFieldErrors.officeAddress}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Enlace Predeterminado de Telepsicología (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd"
                  value={meetLink}
                  onChange={(e) => {
                    setMeetLink(e.target.value);
                    if (profileFieldErrors.defaultMeetLink) setProfileFieldErrors((p) => ({ ...p, defaultMeetLink: "" }));
                  }}
                  className={`h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                    profileFieldErrors.defaultMeetLink ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {profileFieldErrors.defaultMeetLink && (
                  <p className="mt-1 text-xs text-destructive">{profileFieldErrors.defaultMeetLink}</p>
                )}
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
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                <Save size={15} />
                <span>{saving ? "Guardando cambios..." : "Guardar Perfil Profesional"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CONSULTORIO & PLAN (DATOS REALES) */}
      {activeTab === "clinica" && (
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              Datos del Consultorio / Clínica Psicológica
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Nombre de la Organización
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

          {/* Bloque de Plan y Suscripción Real */}
          <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Plan y Suscripción Activa</h3>
                  <p className="text-xs text-muted-foreground">
                    Estado real y vigencia de tu cuenta en Synkro
                  </p>
                </div>
              </div>

              <div>
                {isTrial ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
                    <Sparkles size={13} /> Prueba Gratuita (14 días)
                  </span>
                ) : plan === "free" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                    <ShieldCheck size={13} /> Plan Gratuito (Hasta 5 pacientes)
                  </span>
                ) : isActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 size={13} /> Suscripción Activa
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                    <AlertCircle size={13} /> Periodo Vencido
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {status}
                  </span>
                )}
              </div>
            </div>

            {/* Detalles del Plan Actual */}
            <div className="rounded-2xl bg-secondary/40 p-5 space-y-4 border border-secondary">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Plan Contratado
                  </span>
                  <h4 className="text-xl font-extrabold text-foreground mt-0.5">
                    {planConfig.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {planConfig.tagline}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground block">
                    Precio del ciclo
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(planConfig.priceMonthly)}
                    {planConfig.priceMonthly > 0 && (
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        {planConfig.billingPeriodLabel}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Métricas Reales de Uso */}
              <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-border/50">
                <div className="rounded-xl bg-background/80 p-3 border">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Pacientes Registrados
                  </span>
                  <span className="text-base font-bold text-foreground mt-0.5 block">
                    {subscription?.patient_count ?? 0}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      / {planConfig.limits.maxPatients === null ? "Ilimitados" : planConfig.limits.maxPatients}
                    </span>
                  </span>
                </div>

                <div className="rounded-xl bg-background/80 p-3 border">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Equipo de Terapeutas
                  </span>
                  <span className="text-base font-bold text-foreground mt-0.5 block">
                    {subscription?.professional_count ?? 1}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      / {planConfig.limits.maxProfessionals} prof.
                    </span>
                  </span>
                </div>

                <div className="rounded-xl bg-background/80 p-3 border">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Vigencia / Renovación
                  </span>
                  <span className="text-base font-bold text-foreground mt-0.5 block">
                    {plan === "free"
                      ? "Sin vencimiento"
                      : isTrial
                      ? `${daysRemaining} días restantes`
                      : subscription?.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString("es-PE")
                      : "Activa"}
                  </span>
                </div>
              </div>

              {/* Botón de acción comercial */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  ¿Necesitas más pacientes o incorporar terapeutas a tu equipo?
                </p>
                <Link
                  href="/suscripcion"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                >
                  <span>Gestionar Planes & Facturación</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEGURIDAD & ACTUALIZACIÓN DE CONTRASEÑA (DENTRO DEL SISTEMA) */}
      {activeTab === "seguridad" && (
        <form onSubmit={handleUpdatePassword} className="space-y-6" noValidate>
          <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Actualizar Contraseña de Acceso
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cambia tus credenciales de ingreso de forma segura dentro de tu panel de Synkro.
                </p>
              </div>
            </div>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordFieldErrors.newPassword) setPasswordFieldErrors((p) => ({ ...p, newPassword: "" }));
                    }}
                    className={`h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                      passwordFieldErrors.newPassword ? "border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFieldErrors.newPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordFieldErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Confirmar Nueva Contraseña *
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordFieldErrors.confirmPassword) setPasswordFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
                    className={`h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                      passwordFieldErrors.confirmPassword ? "border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordFieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordFieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Requisitos de seguridad */}
              <div className="rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1.5 border">
                <span className="font-semibold text-foreground block">
                  Recomendaciones de seguridad clínica:
                </span>
                <div className="flex items-center gap-2">
                  <Check
                    size={13}
                    className={
                      newPassword.length >= 8
                        ? "text-emerald-600 font-bold"
                        : "text-muted-foreground"
                    }
                  />
                  <span>Mínimo 8 caracteres alfanuméricos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check
                    size={13}
                    className={
                      newPassword.length > 0 && newPassword === confirmPassword
                        ? "text-emerald-600 font-bold"
                        : "text-muted-foreground"
                    }
                  />
                  <span>Coincidencia exacta entre ambos campos</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  <Lock size={14} />
                  <span>
                    {updatingPassword ? "Actualizando credencial..." : "Actualizar Contraseña"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: ACCESO PARA PACIENTES */}
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
                Generas el enlace de activación desde su ficha y el paciente valida su cuenta.
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4 space-y-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-xs font-bold text-foreground">Interacción Intersesión</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                El paciente revisa sus tareas, documentos compartidos y accede al enlace de videollamada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONSOLA ADMIN VELYON (SOLO SUPERADMIN) */}
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
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
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
