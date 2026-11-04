"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Brain,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Building,
  Award,
  MessageCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getCommercialWhatsAppLink } from "@/lib/config/commercial";
import { OrganizationType } from "@/lib/config/plans";
import { registerSchema, validateForm } from "@/lib/validations";
import { getFriendlyErrorMessage } from "@/lib/utils";


export default function RegisterPage() {
  const router = useRouter();
  const [organizationType, setOrganizationType] = useState<OrganizationType>("independent");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const whatsappActivationLink = getCommercialWhatsAppLink({
    intent: "trial_activation",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(registerSchema, {
      fullName,
      email,
      password,
      organizationType,
      clinicName: clinicName || undefined,
      licenseNumber: licenseNumber || undefined,
    });

    if (!validation.success) {
      setFieldErrors(validation.errors);
      toast.error(validation.firstError);
      return;
    }

    setFieldErrors({});

    const toastId = toast.loading("Configurando tu consultorio clínico...");
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email.toLowerCase(),
        password: validation.data.password,
        options: {
          data: {
            full_name: validation.data.fullName,
            license_number: validation.data.licenseNumber || "",
            clinic_name:
              validation.data.clinicName ||
              (organizationType === "clinic" ? "Centro Psicológico" : "Mi Consulta"),
            organization_type: organizationType,
            requested_plan: "free",
          },
        },
      });

      if (error) {
        throw error;
      }

      // Si la sesión no se establece de inmediato, iniciar sesión automáticamente
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: validation.data.email.toLowerCase(),
          password: validation.data.password,
        });

        if (signInError) {
          throw signInError;
        }
      }

      toast.success("¡Bienvenido a Synkro! Tu consultorio ha sido creado.", {
        id: toastId,
        description: "Espacio en Plan Gratuito listo para operar.",
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Register error:", err);
      const friendlyMsg = getFriendlyErrorMessage(err, "Error al crear la cuenta. Intenta de nuevo.");

      if (friendlyMsg.includes("Ya existe una cuenta")) {
        toast.error(friendlyMsg, {
          id: toastId,
          description: "Por favor inicia sesión o recupera tu contraseña.",
        });
      } else {
        toast.error(friendlyMsg, {
          id: toastId,
        });
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
            Plataforma para psicólogos & centros clínicos
          </span>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Crea tu consultorio clínico
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Comienza con el Plan Gratuito sin costo (hasta 5 pacientes). Acceso inmediato.
          </p>
        </div>

        {/* WhatsApp Fast Activation Callout */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <MessageCircle size={15} /> ¿Deseas activar con Yape o Tarjeta?
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              5 Minutos
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Escríbenos directamente por WhatsApp y te dejamos tu consultorio configurado a medida con tu colegiatura.
          </p>
          <a
            href={whatsappActivationLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            Hablar con Velyon por WhatsApp →
          </a>
        </div>

        {/* Formulario de Registro */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Modalidad de Práctica */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Tipo de Práctica Clínica *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOrganizationType("independent")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    organizationType === "independent"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-input bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Brain size={20} className="mb-1" />
                  <span className="text-xs">Psicólogo(a)</span>
                  <span className="text-[10px] font-normal opacity-80">Independiente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrganizationType("clinic")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    organizationType === "clinic"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-input bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Building size={20} className="mb-1" />
                  <span className="text-xs">Centro o Empresa</span>
                  <span className="text-[10px] font-normal opacity-80">Multiprofesional</span>
                </button>
              </div>

              <div className="mt-2 rounded-xl bg-secondary/50 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                {organizationType === "independent" ? (
                  <span>
                    <strong>Consulta Privada:</strong> Optimizado para tu práctica individual, historias clínicas privadas y agenda personal (Planes Free, Starter o Pro).
                  </span>
                ) : (
                  <span>
                    <strong>Centro Clínico:</strong> Habilita la gestión de equipo de terapeutas, asignación de boxes y derivaciones internas (Plan Clínica).
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Nombre Completo del Profesional *
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Lic. Alejandro Mendoza"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) {
                      setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                    }
                  }}
                  className={`h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.fullName ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
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

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Contraseña *
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  N° Colegiatura C.Ps.P.
                </label>
                <div className="relative">
                  <Award
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="C.Ps.P. 28419"
                    value={licenseNumber}
                    onChange={(e) => {
                      setLicenseNumber(e.target.value);
                      if (fieldErrors.licenseNumber) {
                        setFieldErrors((prev) => ({ ...prev, licenseNumber: "" }));
                      }
                    }}
                    className={`h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-xs outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.licenseNumber ? "border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                </div>
                {fieldErrors.licenseNumber && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.licenseNumber}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {organizationType === "clinic"
                    ? "Nombre de la Clínica *"
                    : "Nombre del Consultorio"}
                </label>
                <div className="relative">
                  <Building
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder={
                      organizationType === "clinic"
                        ? "Centro Terapéutico San Isidro"
                        : "Consulta Psicológica"
                    }
                    value={clinicName}
                    onChange={(e) => {
                      setClinicName(e.target.value);
                      if (fieldErrors.clinicName) {
                        setFieldErrors((prev) => ({ ...prev, clinicName: "" }));
                      }
                    }}
                    className={`h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-xs outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.clinicName ? "border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                </div>
                {fieldErrors.clinicName && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.clinicName}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <span>
                {loading
                  ? "Creando espacio clínico..."
                  : organizationType === "clinic"
                  ? "Crear Centro Clínico Gratuito"
                  : "Crear Consultorio Gratuito"}
              </span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground space-y-2">
            <div>
              ¿Ya tienes un consultorio registrado?{" "}
              <Link href="/iniciar-sesion" className="font-semibold text-primary hover:underline">
                Iniciar Sesión
              </Link>
            </div>
            <div>
              ¿Solo quieres probar el sistema?{" "}
              <Link href="/demo" className="font-semibold text-primary hover:underline">
                Explorar demostración interactiva
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
