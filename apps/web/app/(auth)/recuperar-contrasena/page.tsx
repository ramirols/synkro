"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Brain,
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { passwordRecoverySchema, validateForm } from "@/lib/validations";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Temporizador de reenvío para respetar los 60s de rate limit de Supabase/Resend
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validation = validateForm(passwordRecoverySchema, { email });
    if (!validation.success) {
      setFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setFieldErrors({});

    try {
      setLoading(true);
      setErrorMsg("");

      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "https://synkro.velyonsoft.com";

      const targetRedirectUrl = `${origin}/actualizar-contrasena`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        validation.data.email.toLowerCase(),
        {
          redirectTo: targetRedirectUrl,
        }
      );

      if (error) {
        throw error;
      }

      setSubmitted(true);
      setCooldown(60); // Iniciar cuenta regresiva de 60 segundos
      toast.success("Enlace de recuperación enviado por correo electrónico.");
    } catch (err: any) {
      console.error("[RecuperarContrasena] Error:", err);
      const msg = err.message || "";
      let friendlyMsg = "No se pudo procesar la solicitud. Revisa el correo ingresado.";

      if (msg.includes("60 seconds") || msg.includes("over_email_send_rate_limit")) {
        friendlyMsg =
          "Por motivos de seguridad, solo puedes solicitar un correo cada 60 segundos. Por favor espera antes de volver a intentar.";
      } else if (msg.includes("Email logins are disabled")) {
        friendlyMsg =
          "El inicio de sesión por correo está deshabilitado en Supabase Auth. Habilítalo en Authentication -> Providers -> Email.";
      } else if (msg.includes("Error sending recovery email") || msg.includes("SMTP")) {
        friendlyMsg =
          "Hubo un error al enviar el correo mediante el servidor SMTP (Resend). Verifica que tu cuenta o clave de Resend estén activas.";
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        friendlyMsg = "No se pudo conectar con el servidor de Supabase. Revisa tu conexión a internet.";
      } else if (msg) {
        friendlyMsg = msg;
      }

      setErrorMsg(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link
            href="/iniciar-sesion"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a iniciar sesión</span>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Brain size={20} />
            </div>
            <span>Synkro</span>
          </Link>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary mt-1">
            Recuperación de Contraseña
          </span>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Restablecer acceso
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Ingresa tu correo registrado para recibir un enlace seguro de restablecimiento de contraseña.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs">
          {errorMsg && (
            <div className="mb-5 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-4 text-center py-2 animate-in fade-in duration-300">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Correo enviado con éxito</h3>
                <p className="text-xs text-muted-foreground">
                  Hemos enviado las instrucciones para restablecer tu contraseña a{" "}
                  <strong className="text-foreground">{email}</strong>.
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/40 p-3.5 text-left text-[11px] text-muted-foreground space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck size={14} className="text-primary" />
                  <span>Información importante sobre el enlace:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>El enlace fue emitido a través de nuestro servidor de correo seguro (Resend SMTP).</li>
                  <li>Tiene una vigencia de <strong>1 hora</strong> por confidencialidad clínica.</li>
                  <li>Si no lo ves en tu bandeja de entrada, revisa tu carpeta de <strong>Spam o Correo No Deseado</strong>.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleReset()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors w-full cursor-pointer"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>
                    {cooldown > 0
                      ? `Reenviar correo en ${cooldown}s`
                      : loading
                      ? "Reenviando..."
                      : "Reenviar enlace de recuperación"}
                  </span>
                </button>

                <Link
                  href="/iniciar-sesion"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity w-full shadow-xs"
                >
                  Regresar a Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="doctor@synkro.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    className={`h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.email ? "border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <Send size={14} />
                <span>{loading ? "Enviando instrucciones..." : "Enviar enlace de recuperación"}</span>
              </button>
            </form>
          )}

          <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/iniciar-sesion" className="font-semibold text-primary hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
