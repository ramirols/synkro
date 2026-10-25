import { Link } from "next-view-transitions";
import { Brain, CalendarDays, FileText, ShieldCheck, ArrowRight, Sparkles, MessageCircle, HeartHandshake, Users } from "lucide-react";
import PublicHeader from "@/components/inicio/public-header";
import PublicFooter from "@/components/inicio/public-footer";

export const metadata = {
  title: "Funciones Clínicas Especializadas para Psicólogos | Synkro",
  description: "Descubre las herramientas de Synkro: historias clínicas, notas SOAP asistidas por IA, agenda tipo horario semanal, bóveda psicométrica y portal para pacientes.",
  keywords: [
    "funciones software psicologos",
    "notas soap psicologia inteligencia artificial",
    "historia clinica digital psicologia peru",
    "agenda tipo horario semanal para terapeutas",
    "boveda pruebas psicometricas inventario beck",
    "portal seguro del paciente psicologia",
    "triage derivaciones entre psicologos centros",
    "gestion consultorios fisicos boxes psicologia",
    "anamnesis psicologica digital",
    "genograma e historial clinico psicoterapia",
  ],
};

export default function FuncionesPage() {
  const whatsappLink = "https://wa.me/51997676432?text=Hola%20Velyon!%20Quiero%20conocer%20m%C3%A1s%20sobre%20las%20funciones%20de%20Synkro%20para%20mi%20consulta.";

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-background py-20 px-6">
        <div className="mx-auto max-w-5xl space-y-16">
          <div className="text-center space-y-4">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              Funcionalidades de Synkro
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Diseñado exclusivamente para la práctica psicológica
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Herramientas clínicas que reducen la carga administrativa y protegen el secreto profesional con una doble capa de notas conforme a la ley peruana.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-base font-bold text-foreground">Doble Capa de Notas SOAP</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Diferenciación estricta entre la evolución clínica formal y las notas personales de contratransferencia 100% blindadas.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Brain size={22} />
              </div>
              <h3 className="text-base font-bold text-foreground">Asistencia con IA Clínica</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Redacta el informe SOAP en segundos a partir de los puntos clave tratados durante la sesión terapéutica.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <CalendarDays size={22} />
              </div>
              <h3 className="text-base font-bold text-foreground">Horario Semanal & Boxes</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Matriz semanal de Lunes a Domingo de 08:00 a 20:00 con asignación de consultorio físico y Google Meet.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <FileText size={22} />
              </div>
              <h3 className="text-base font-bold text-foreground">Bóveda Psicométrica In-App</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Inventarios de Beck (BAI/BDI), STAI y consentimientos informados con visor interactivo en la misma web.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <HeartHandshake size={22} />
              </div>
              <h3 className="text-base font-bold text-foreground">Portal Exclusivo del Paciente</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Acceso a sala virtual de Google Meet, tareas intersesión asignadas y registro diario de estado de ánimo.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Users size={22} />
              </div>
              <h3 className="text-base font-bold text-foreground">Triage & Derivación Interna</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Ideal para clínicas: transfiere casos a especialistas sin pérdida de historial ni de notas clínicas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/iniciar-sesion"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
            >
              <span>Probar Demostración en Vivo</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-colors"
            >
              <MessageCircle size={16} />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
