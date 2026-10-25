import { Link } from "next-view-transitions";
import { ShieldCheck, Lock, EyeOff, Server, Check, ArrowRight, MessageCircle } from "lucide-react";
import PublicHeader from "@/components/inicio/public-header";
import PublicFooter from "@/components/inicio/public-footer";

export const metadata = {
  title: "Seguridad, Privacidad y Secreto Profesional | Synkro",
  description: "Protección de datos conforme a la Ley N° 28369 del Colegio de Psicólogos del Perú (C.Ps.P.). Cifrado AES-256 y políticas de aislamiento RLS.",
  keywords: [
    "seguridad historias clinicas psicologia",
    "secreto profesional ley 28369 cpsp peru",
    "proteccion datos personales pacientes psicologia",
    "cifrado expedientes salud mental",
    "doble capa notas privadas terapeuta",
    "confidencialidad psicoterapia peru",
    "colegio de psicologos del peru etica software",
    "seguridad medica hipaa rls supabase",
  ],
};

export default function SeguridadPage() {
  const whatsappLink = "https://wa.me/51997676432?text=Hola%20Velyon!%20Tengo%20consultas%20sobre%20la%20seguridad%20y%20privacidad%20de%20Synkro.";

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-background py-20 px-6">
        <div className="mx-auto max-w-4xl space-y-16">
          <div className="text-center space-y-4">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              Ética & Privacidad en Salud Mental
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Tus pacientes confían en ti. Tú puedes confiar en Synkro.
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Diseñado con arquitectura de grado médico, Row Level Security (RLS) en base de datos PostgreSQL y blindaje estricto de notas personales del terapeuta.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground">Cifrado de Base de Datos y RLS</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Políticas de seguridad a nivel de fila (Row Level Security) que impiden el acceso no autorizado a nivel de motor de base de datos. Nadie fuera de tu cuenta puede ver tus registros.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <EyeOff size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground">Secreto Profesional Blindado</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Tus notas de contratransferencia y reflexiones privadas nunca se exponen en reportes ni expedientes compartidos. Solo tú tienes la llave de lectura.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground">Ley N° 28369 del C.Ps.P.</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Conformidad integral con la Ley del Trabajo del Psicólogo en el Perú y normativas de custodia confidencial de expedientes clínicos de salud mental.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Server size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground">Respaldos Automáticos Diarios</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Copias de seguridad criptográficas diarias en infraestructura de nube de alta disponibilidad para garantizar la continuidad de tu práctica clínica.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/iniciar-sesion"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
            >
              <span>Probar Consultorio Demo</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-colors"
            >
              <MessageCircle size={16} />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
