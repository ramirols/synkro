"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, AlertCircle, ArrowRight, Loader2, KeyRound } from "lucide-react";

function ActivarPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [clinicInfo, setClinicInfo] = useState<{ patient_id?: string; organization_id?: string } | null>(null);

  useEffect(() => {
    async function activateToken() {
      if (authLoading) return;

      if (!token) {
        setStatus("error");
        setErrorMessage("El enlace no contiene un token de activación válido.");
        return;
      }

      if (!user) {
        // Redirigir a iniciar sesión o registro preservando el token
        return;
      }

      try {
        setStatus("processing");
        setErrorMessage("");

        const { data, error } = await supabase.rpc("accept_patient_portal_invitation", {
          p_token: token,
        });

        if (error) {
          throw new Error(error.message || "No se pudo activar el acceso al portal.");
        }

        setClinicInfo(data);
        setStatus("success");
      } catch (err: any) {
        console.error("Error activando token de portal:", err);
        setStatus("error");
        setErrorMessage(
          err.message ||
            "El token de invitación no es válido, ha expirado o no coincide con el correo de tu cuenta."
        );
      }
    }

    activateToken();
  }, [token, user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si el usuario no ha iniciado sesión
  if (!user) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center py-12 px-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Activación del Portal de Pacientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Has recibido una invitación para acceder a tu expediente de citas y documentos clínicos seguros.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 text-left space-y-4 shadow-xs">
          <p className="text-xs text-muted-foreground">
            Para proteger tu privacidad médica según la Ley 29733, debes autenticarte con tu cuenta para vincular tu identidad:
          </p>

          <div className="space-y-2.5 pt-2">
            <Link
              href={`/iniciar-sesion?redirect=/portal-paciente/activar?token=${token || ""}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <span>Iniciar Sesión con mi cuenta</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href={`/registrarse?redirect=/portal-paciente/activar?token=${token || ""}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <span>Crear cuenta de paciente nueva</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 text-center py-12 px-4">
      {status === "processing" && (
        <div className="space-y-4">
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            Verificando y vinculando tu expediente clínico...
          </h2>
          <p className="text-xs text-muted-foreground">
            Comprobando token criptográfico y autorizaciones de tu centro de atención.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <ShieldCheck size={36} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ¡Portal Activado Exitosamente!
            </h1>
            <p className="text-sm text-muted-foreground">
              Tu identidad ha sido vinculada formalmente a tu expediente clínico confidencial.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 text-left space-y-3 shadow-xs text-xs text-muted-foreground">
            <p>
              Ya puedes acceder a la visualización de tus próximas sesiones, enlaces de videoconsulta y documentos clínicos autorizados por tu profesional.
            </p>
            <div className="pt-2">
              <Link
                href="/portal-paciente"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <span>Acceder a mi Portal de Paciente</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle size={36} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              No se pudo activar el acceso
            </h1>
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 text-left space-y-3 text-xs text-muted-foreground shadow-xs">
            <p>
              Posibles causas:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>El enlace ha expirado (validez máxima de 7 días).</li>
              <li>El correo con el que iniciaste sesión ({user.email}) no coincide con el registrado por el psicólogo.</li>
              <li>La invitación fue revocada o ya fue utilizada previamente.</li>
            </ul>

            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/portal-paciente"
                className="flex w-full items-center justify-center gap-2 rounded-xl border bg-muted/40 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <span>Ir al portal de paciente</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivarPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ActivarPortalContent />
    </Suspense>
  );
}

