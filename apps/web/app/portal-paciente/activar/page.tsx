"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  KeyRound,
  Lock,
  Mail,
  UserCheck,
  Building2,
  CheckCircle2,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  LogOut,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  patientActivationSchema,
  loginSchema,
  validateForm,
} from "@/lib/validations";

interface InvitationInfo {
  valid: boolean;
  patient_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  organization_name?: string;
  error?: string;
}

function ActivarPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, logout: authLogout } = useAuth();

  const token = searchParams.get("token");

  // Estados de verificación de token
  const [checkingToken, setCheckingToken] = useState(true);
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);

  // Estados del formulario para el paciente
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"register" | "login">("register");

  // Estados de UI
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [activationStatus, setActivationStatus] = useState<
    "idle" | "activating" | "success" | "error"
  >("idle");
  const [activationError, setActivationError] = useState("");

  // 1. Consultar estado del token
  useEffect(() => {
    async function fetchInvitationInfo() {
      if (!token) {
        setCheckingToken(false);
        setActivationStatus("error");
        setActivationError("No se proporcionó un token de activación válido.");
        return;
      }

      try {
        setCheckingToken(true);
        const { data, error } = await supabase.rpc("get_patient_portal_invitation_info", {
          p_token: token,
        });

        if (error) {
          throw new Error(error.message || "Error al verificar la invitación.");
        }

        const info = data as InvitationInfo;
        setInvitationInfo(info);

        if (!info.valid) {
          setActivationStatus("error");
          setActivationError(
            info.error || "La invitación no es válida, ha expirado o ya fue utilizada."
          );
        } else {
          // Pre-llenar campos desde el expediente creado por el psicólogo
          if (info.first_name) setFirstName(info.first_name);
          if (info.last_name) setLastName(info.last_name);
          if (info.email) setEmail(info.email);
          if (info.phone) setPhone(info.phone);
          if (info.birth_date) setBirthDate(info.birth_date);
        }
      } catch (err: any) {
        setActivationStatus("error");
        setActivationError(err.message || "No se pudo comprobar la validez de la invitación.");
      } finally {
        setCheckingToken(false);
      }
    }

    fetchInvitationInfo();
  }, [token]);

  // 2. Si el usuario ya está autenticado como PACIENTE con el mismo correo, activar directo
  useEffect(() => {
    async function activateForPatientSession() {
      if (authLoading || checkingToken || !user || !token || !invitationInfo?.valid) return;
      if (activationStatus === "success" || activationStatus === "activating") return;

      // SOLO activar automáticamente si el usuario autenticado tiene el rol de PACIENTE
      if (user.role === "patient") {
        try {
          setActivationStatus("activating");
          setActivationError("");

          const { error } = await supabase.rpc("accept_patient_portal_invitation", {
            p_token: token,
            p_first_name: firstName || null,
            p_last_name: lastName || null,
            p_phone: phone || null,
            p_birth_date: birthDate || null,
          });

          if (error) {
            throw new Error(error.message || "No se pudo activar el acceso al portal.");
          }

          setActivationStatus("success");
        } catch (err: any) {
          console.error("Error activando token:", err);
          setActivationStatus("error");
          setActivationError(
            err.message || "No se pudo vincular tu cuenta al expediente clínico."
          );
        }
      }
    }

    activateForPatientSession();
  }, [user, authLoading, checkingToken, token, invitationInfo, activationStatus, firstName, lastName, phone, birthDate]);

  // Copiar enlace al portapapeles
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Enlace de activación copiado al portapapeles.");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Manejador del formulario de activación para el paciente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!token) {
      setFormError("Token de activación no válido.");
      toast.error("Token de activación no válido.");
      return;
    }

    if (mode === "register") {
      const validation = validateForm(patientActivationSchema, {
        firstName,
        lastName,
        email,
        phone,
        birthDate,
        password,
        confirmPassword,
      });

      if (!validation.success) {
        setFieldErrors(validation.errors);
        setFormError(validation.firstError);
        toast.error(validation.firstError);
        return;
      }
    } else {
      const validation = validateForm(loginSchema, { email, password });
      if (!validation.success) {
        setFieldErrors(validation.errors);
        setFormError(validation.firstError);
        toast.error(validation.firstError);
        return;
      }
    }

    setFieldErrors({});

    try {
      setSubmitting(true);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || "Paciente";

      if (mode === "register") {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              role: "patient",
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message?.toLowerCase().includes("already registered")) {
            setMode("login");
            throw new Error(
              "Ya existe una cuenta con este correo. Ingresa tu contraseña para vincularla a tu expediente."
            );
          }
          throw signUpError;
        }

        // Si la sesión no se inició automáticamente por confirmación de email
        if (!signUpData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (signInError) {
            setActivationStatus("success");
            return;
          }
        }
      } else {
        // Modo iniciar sesión
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (signInError) {
          throw new Error("Credenciales inválidas. Verifica tu correo y contraseña.");
        }
      }

      // Con sesión activa, vincular la invitación y sincronizar datos del paciente
      setActivationStatus("activating");
      const { error: acceptError } = await supabase.rpc("accept_patient_portal_invitation", {
        p_token: token,
        p_first_name: firstName.trim() || null,
        p_last_name: lastName.trim() || null,
        p_phone: phone.trim() || null,
        p_birth_date: birthDate || null,
      });

      if (acceptError) {
        throw new Error(acceptError.message || "No se pudo vincular la invitación al paciente.");
      }

      setActivationStatus("success");
      toast.success("¡Tu cuenta de paciente ha sido activada exitosamente!");
    } catch (err: any) {
      console.error("Error en flujo de activación:", err);
      const errorMsg = err.message || "Ocurrió un error inesperado al procesar tu solicitud.";
      setFormError(errorMsg);
      toast.error(errorMsg);
      setActivationStatus("idle");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Pantalla de carga
  if (authLoading || checkingToken) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">
          Verificando enlace de invitación seguro...
        </p>
      </div>
    );
  }

  // 2. CASO: El usuario que abrió el enlace es un PSICÓLOGO / STAFF CONECTADO
  // Esto previene que el psicólogo sobrescriba su propia cuenta o vea un error confuso al probar el enlace
  if (user && user.role !== "patient") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 px-4 animate-in fade-in duration-300">
        <div className="rounded-3xl border border-primary/20 bg-card p-7 shadow-lg space-y-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound size={28} />
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-primary">
              Modo Vista Previa del Profesional
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Enlace de Activación de Paciente
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Estás conectado con tu cuenta de profesional clínico (
              <span className="font-semibold text-foreground">{user.email}</span>).
            </p>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4 text-left text-xs space-y-2">
            <p className="font-semibold text-foreground">Datos del paciente invitado:</p>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">Nombre</span>
                <span className="font-semibold text-foreground">
                  {invitationInfo?.first_name} {invitationInfo?.last_name}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">Correo</span>
                <span className="font-semibold text-foreground">
                  {invitationInfo?.email || "Sin correo (lo ingresará el paciente)"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-left space-y-2 bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <p className="font-semibold text-primary">¿Cómo probar este enlace?</p>
            <p>
              Este enlace está diseñado para que tu paciente defina su contraseña y entre a su propio portal. 
              Para simular la experiencia del paciente tienes dos opciones:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Abrir este enlace en una <strong>ventana de incógnito</strong> o en tu teléfono móvil.</li>
              <li>Cerrar sesión de psicólogo aquí para probar la activación directa como paciente.</li>
            </ul>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? "¡Enlace Copiado al Portapapeles!" : "Copiar Enlace para el Paciente"}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await authLogout();
                router.refresh();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Cerrar sesión de psicólogo y probar activación</span>
            </button>

            <Link
              href={invitationInfo?.patient_id ? `/pacientes/${invitationInfo.patient_id}` : "/pacientes"}
              className="block text-center text-xs text-muted-foreground hover:text-foreground pt-1"
            >
              ← Volver al expediente del paciente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Pantalla de Éxito
  if (activationStatus === "success") {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center py-12 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <ShieldCheck size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ¡Portal Activado Exitosamente!
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu cuenta ha sido vinculada formalmente a tu expediente clínico en{" "}
            <span className="font-semibold text-foreground">
              {invitationInfo?.organization_name || "tu consultorio"}
            </span>
            .
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 text-left space-y-4 shadow-xs text-xs text-muted-foreground">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Acceso a tu historial de citas, enlaces directos a sesiones de teleconsulta y recordatorios.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Descarga segura de consentimientos informados y documentos clínicos autorizados bajo la Ley 29733.
            </p>
          </div>

          <div className="pt-3">
            <Link
              href="/portal-paciente"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>Acceder a Mi Portal de Paciente</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Pantalla de Error (token inválido o expirado)
  if (activationStatus === "error" || (invitationInfo && !invitationInfo.valid)) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center py-12 px-4 animate-in fade-in duration-300">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Enlace de activación inválido o expirado
          </h1>
          <p className="text-sm text-destructive font-medium">
            {activationError || invitationInfo?.error || "No fue posible validar este enlace."}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 text-left space-y-3 text-xs text-muted-foreground shadow-xs">
          <p className="font-semibold text-foreground">Motivos frecuentes:</p>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>El enlace ha caducado por seguridad clínica (validez máxima de 7 días).</li>
            <li>La cuenta del paciente ya fue activada con anterioridad.</li>
            <li>El profesional de salud generó una invitación más reciente para tu expediente.</li>
          </ul>

          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              href="/iniciar-sesion"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <span>Iniciar Sesión en el Portal</span>
            </Link>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <span>Volver a la página principal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Pantalla de Activación en Progreso
  if (activationStatus === "activating") {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center py-16 px-4">
        <Loader2 className="mx-auto size-10 animate-spin text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          Activando y vinculando tu expediente...
        </h2>
        <p className="text-xs text-muted-foreground">
          Generando credenciales de acceso cifradas y sincronizando con tu consultorio.
        </p>
      </div>
    );
  }

  // 6. Formulario Directo de Activación para el Paciente
  return (
    <div className="mx-auto max-w-md space-y-6 py-10 px-4 animate-in fade-in duration-300">
      {/* Encabezado de la invitación */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <KeyRound size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Activa tu Portal de Paciente
        </h1>
        <p className="text-xs text-muted-foreground">
          {firstName ? (
            <>
              Hola <span className="font-semibold text-foreground">{firstName}</span>.{" "}
            </>
          ) : null}
          Has recibido una invitación de{" "}
          <span className="font-semibold text-foreground">
            {invitationInfo?.organization_name || "tu centro de atención"}
          </span>{" "}
          para acceder a tus citas y documentos clínicos seguros.
        </p>
      </div>

      {/* Tarjeta del formulario */}
      <div className="rounded-3xl border bg-card p-6 sm:p-7 shadow-xs space-y-5">
        {/* Toggle de Modo: Crear cuenta vs Iniciar sesión */}
        <div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setFormError("");
            }}
            className={`rounded-lg py-2 transition-all cursor-pointer ${
              mode === "register"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Activar mi Acceso
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setFormError("");
            }}
            className={`rounded-lg py-2 transition-all cursor-pointer ${
              mode === "login"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ya tengo cuenta
          </button>
        </div>

        {formError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Nombres *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (fieldErrors.firstName) setFieldErrors((p) => ({ ...p, firstName: "" }));
                    }}
                    placeholder="Tus nombres"
                    className={`w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden transition-colors ${
                      fieldErrors.firstName ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    }`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-[11px] text-destructive">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Apellidos *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (fieldErrors.lastName) setFieldErrors((p) => ({ ...p, lastName: "" }));
                    }}
                    placeholder="Tus apellidos"
                    className={`w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden transition-colors ${
                      fieldErrors.lastName ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    }`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-[11px] text-destructive">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone size={12} className="text-muted-foreground" />
                    <span>Teléfono móvil</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                    }}
                    placeholder="Ej. 987654321"
                    className={`w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden transition-colors ${
                      fieldErrors.phone ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-destructive">{fieldErrors.phone}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar size={12} className="text-muted-foreground" />
                    <span>Nacimiento</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      if (fieldErrors.birthDate) setFieldErrors((p) => ({ ...p, birthDate: "" }));
                    }}
                    className={`w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden transition-colors ${
                      fieldErrors.birthDate ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                    }`}
                  />
                  {fieldErrors.birthDate && (
                    <p className="text-[11px] text-destructive">{fieldErrors.birthDate}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail size={12} className="text-muted-foreground" />
              <span>Correo Electrónico *</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="tu-correo@ejemplo.com"
              className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden transition-colors ${
                fieldErrors.email ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-muted-foreground" />
                <span>{mode === "register" ? "Crear Contraseña *" : "Tu Contraseña *"}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
              </button>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="Mínimo 6 caracteres"
              className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden transition-colors ${
                fieldErrors.password ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-[11px] text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock size={12} className="text-muted-foreground" />
                <span>Confirmar Contraseña *</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                }}
                placeholder="Repite tu contraseña"
                className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden transition-colors ${
                  fieldErrors.confirmPassword ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Vinculando tu expediente...</span>
                </>
              ) : mode === "register" ? (
                <>
                  <UserCheck size={14} />
                  <span>Activar Mi Portal y Acceder</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión y Acceder</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-2 border-t text-[11px] text-muted-foreground space-y-1 text-center">
          <p className="flex items-center justify-center gap-1 font-medium">
            <Building2 size={12} className="text-primary" />
            <span>Centro: {invitationInfo?.organization_name || "Consultorio Psicológico"}</span>
          </p>
          <p>
            Tus datos de salud están protegidos bajo secreto profesional y la Ley 29733 de Protección de Datos Personales.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ActivarPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Cargando activación de portal...</p>
        </div>
      }
    >
      <ActivarPortalContent />
    </Suspense>
  );
}
