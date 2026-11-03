"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Brain,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { updatePasswordSchema, validateForm } from "@/lib/validations";

function ActualizarContrasenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Estados de verificación del token de recuperación
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Inspeccionar hash y searchParams por errores de Supabase Auth (ej. otp_expired)
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const search = typeof window !== "undefined" ? window.location.search : "";

    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(search);

    const errorCode = hashParams.get("error_code") || queryParams.get("error_code");
    const errorDesc = hashParams.get("error_description") || queryParams.get("error_description");
    const error = hashParams.get("error") || queryParams.get("error");

    if (errorCode || error) {
      let friendly = "El enlace de recuperación es inválido o ha expirado.";
      if (errorCode === "otp_expired" || (errorDesc && errorDesc.toLowerCase().includes("expired"))) {
        friendly = "El enlace de recuperación ha caducado. Por motivos de seguridad clínica, los enlaces tienen una validez de 1 hora.";
      } else if (errorDesc) {
        friendly = decodeURIComponent(errorDesc.replace(/\+/g, " "));
      }
      setLinkError(friendly);
      setCheckingSession(false);
      return;
    }

    // 2. Suscribirse a onAuthStateChange para capturar PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || (session && session.user)) {
        setHasValidSession(true);
        setLinkError(null);
      }
      setCheckingSession(false);
    });

    // 3. Comprobar sesión actual activa (Supabase parsea el hash #access_token en cliente)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setHasValidSession(true);
        setLinkError(null);
      } else {
        // Verificar si la URL contiene indicios de token que Supabase aún esté procesando
        const hasHashToken = hashParams.has("access_token") || hash.includes("type=recovery");
        const hasQueryCode = queryParams.has("code");

        if (!hasHashToken && !hasQueryCode) {
          setHasValidSession(false);
        }
      }
      setCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(updatePasswordSchema, { password, confirmPassword });
    if (!validation.success) {
      setFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setFieldErrors({});

    const toastId = toast.loading("Actualizando contraseña en Supabase...");
    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: validation.data.password,
      });

      if (error) {
        throw error;
      }

      // Por seguridad, cerrar la sesión temporal de recuperación para forzar login limpio con nueva clave
      await supabase.auth.signOut().catch(() => {});

      setSuccess(true);
      toast.success("Contraseña actualizada con éxito.", { id: toastId });
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      const msg = err.message || "";
      let friendlyMsg = "No se pudo actualizar la contraseña. El enlace de recuperación puede haber expirado.";

      if (msg.includes("Auth session missing") || msg.includes("session")) {
        friendlyMsg = "La sesión de recuperación expiró. Por favor solicita un nuevo enlace de recuperación.";
      } else if (msg.includes("should be different")) {
        friendlyMsg = "La nueva contraseña debe ser diferente a la anterior.";
      } else if (msg.includes("at least 6 characters") || msg.includes("at least 8 characters")) {
        friendlyMsg = "La contraseña debe tener al menos 8 caracteres.";
      } else if (msg) {
        friendlyMsg = msg;
      }

      toast.error(friendlyMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Brain size={20} />
            </div>
            <span>Synkro</span>
          </Link>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary mt-1">
            Seguridad de Acceso Clínico
          </span>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Crear nueva contraseña
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Ingresa y confirma tu nueva contraseña para proteger tu consultorio clínico.
          </p>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs">
          {/* 1. Verificando token de recuperación */}
          {checkingSession ? (
            <div className="space-y-4 text-center py-8">
              <Loader2 className="mx-auto size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Verificando credencial de recuperación de contraseña...
              </p>
            </div>
          ) : linkError ? (
            /* 2. Enlace inválido o expirado */
            <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">
                  Enlace inválido o caducado
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {linkError}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/recuperar-contrasena"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity w-full shadow-xs cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Solicitar nuevo enlace de recuperación</span>
                </Link>

                <Link
                  href="/iniciar-sesion"
                  className="inline-flex items-center justify-center rounded-xl border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full cursor-pointer"
                >
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : !hasValidSession && !success ? (
            /* 3. No hay sesión de recuperación detectada */
            <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <KeyRound size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">
                  Acceso mediante enlace requerido
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Para actualizar tu contraseña debes hacer clic en el enlace seguro enviado a tu correo electrónico por Synkro.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/recuperar-contrasena"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity w-full shadow-xs cursor-pointer"
                >
                  <span>Ir a Recuperar Contraseña</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/iniciar-sesion"
                  className="inline-flex items-center justify-center rounded-xl border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full cursor-pointer"
                >
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : success ? (
            /* 4. Contraseña actualizada exitosamente */
            <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-foreground">
                  ¡Contraseña actualizada con éxito!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tus nuevas credenciales han quedado registradas en Supabase. Ya puedes acceder con tu nueva contraseña.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/iniciar-sesion?password_updated=true"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 w-full shadow-xs cursor-pointer transition-opacity"
                >
                  <span>Iniciar Sesión ahora</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            /* 5. Formulario de Nueva Contraseña */
            <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    className={`h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.password ? "border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    className={`h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.confirmPassword ? "border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1 border">
                <span className="font-semibold text-foreground block">Requisitos de seguridad:</span>
                <p>• Mínimo 8 caracteres</p>
                <p>• Utiliza combinación de letras, números y símbolos para mayor protección</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-primary font-semibold text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {loading ? "Actualizando contraseña en Supabase..." : "Guardar Nueva Contraseña"}
              </button>
            </form>
          )}

          <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
            ¿Deseas volver?{" "}
            <Link href="/iniciar-sesion" className="font-semibold text-primary hover:underline">
              Ir al Inicio de Sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ActualizarContrasenaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ActualizarContrasenaContent />
    </Suspense>
  );
}
