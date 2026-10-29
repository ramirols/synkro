"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Brain, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setErrorMsg("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      setErrorMsg(
        err.message ||
          "No se pudo actualizar la contraseña. El enlace de recuperación puede haber expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Brain size={20} />
            </div>
            <span>Synkro</span>
          </Link>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary mt-1">
            Seguridad de Acceso
          </span>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Crear nueva contraseña
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Ingresa y confirma tu nueva contraseña para proteger tu consultorio clínico.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs">
          {errorMsg && (
            <div className="mb-5 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center py-2 animate-in fade-in duration-300">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Contraseña actualizada</h3>
                <p className="text-xs text-muted-foreground">
                  Tu contraseña ha sido modificada con éxito. Ya puedes acceder con tus nuevas credenciales.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/iniciar-sesion"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 w-full"
                >
                  <span>Iniciar Sesión ahora</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-primary font-semibold text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {loading ? "Guardando..." : "Actualizar Contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

