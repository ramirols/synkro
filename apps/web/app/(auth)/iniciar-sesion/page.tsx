"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Brain,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await login(email, password);

      // Check role if admin
      if (email.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
        setErrorMsg("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setErrorMsg("No se pudo conectar con el servidor de Supabase. Revisa tu conexión o las variables de entorno.");
      } else {
        setErrorMsg(msg || "Error al iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Brain size={20} />
            </div>
            <span>Synkro</span>
          </Link>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary mt-1">
            Plataforma para psicólogos & centros clínicos
          </span>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ingresar a tu consultorio
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Accede a tu agenda, expedientes clínicos y notas confidenciales en producción.
          </p>
        </div>

        {/* Demostración Interactiva (Acceso Clínico 1-Click) */}
        <div className="rounded-3xl border-2 border-primary/20 bg-secondary/40 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground">
                Demostración Interactiva (Sin Iniciar Sesión)
              </span>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Modo Demo
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Explora el sistema con datos clínicos de prueba totalmente aislados sin conectarse a Supabase:
          </p>

          <div className="pt-1">
            <Link
              href="/demo"
              className="w-full flex items-center justify-between rounded-2xl border bg-card p-3.5 hover:border-primary hover:bg-secondary/20 transition-all shadow-2xs group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                  <Brain size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Abrir Entorno de Demostración
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Lic. Alejandro Mendoza V. • Agenda, Notas & Expedientes Ficticios
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mr-1" />
            </Link>
          </div>
        </div>

        {/* Formulario de Login Estándar */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs">
          {errorMsg && (
            <div className="mb-5 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="doctor@synkro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-primary font-semibold text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {loading ? "Verificando acceso..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
            ¿Aún no tienes una clínica registrada?{" "}
            <Link href="/registrarse" className="font-semibold text-primary hover:underline">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}