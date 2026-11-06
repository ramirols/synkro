import { Metadata } from "next";
import { Link } from "next-view-transitions";
import { FileText, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso del Servicio | Synkro by VelyonSoft",
  description:
    "Términos y condiciones contractuales de uso de la plataforma clínica Synkro desarrollada por VelyonSoft para psicólogos y centros de salud mental en Perú.",
  keywords: [
    "terminos y condiciones synkro",
    "contrato saas psicologia peru",
    "condiciones del servicio velyonsoft",
    "politica comercial yape bcp synkro",
    "autonomia clinica psicoterapia peru",
  ],
};

export default function TerminosPage() {
  const whatsappLink = getWhatsAppUrl(
    "¡Hola Velyon! Tengo una consulta sobre los Términos y Condiciones de Synkro."
  );

  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Breadcrumb / Back button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a la página principal</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4 border-b pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/80 px-3.5 py-1 text-xs font-semibold text-primary">
            <FileText size={14} />
            <span>Contrato de Licencia SaaS & Condiciones de Uso</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Última actualización: Noviembre 2026 • Plataforma desarrollada y operada por <strong>VelyonSoft S.A.C.</strong>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {/* 1. Objeto */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
              Objeto del Servicio y Aceptación Contractual
            </h2>
            <p>
              El presente contrato establece los términos y condiciones de uso bajo los cuales <strong>VelyonSoft S.A.C.</strong> otorga una licencia de uso de software como servicio (SaaS) no exclusiva, revocable e intransferible para el acceso a la plataforma de gestión clínica <strong>Synkro</strong>.
            </p>
            <p>
              El registro, creación de cuenta o uso continuo de Synkro implica la aceptación plena e incondicional de los presentes Términos y de nuestra Política de Privacidad.
            </p>
          </section>

          {/* 2. Elegibilidad */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Elegibilidad y Responsabilidad Profesional
            </h2>
            <p>
              Synkro está destinado exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Psicólogos Colegiados y Habilitados:</strong> Profesionales graduados e inscritos en el Colegio de Psicólogos del Perú (C.Ps.P.) o el órgano regulador correspondiente en su país de ejercicio.
              </li>
              <li>
                <strong>Centros y Clínicas Psicológicas:</strong> Instituciones de salud mental privadas debidamente constituidas con directores clínicos o terapeutas responsables de la atención.
              </li>
              <li>
                <strong>Pacientes Autorizados:</strong> Personas que reciben atención psicológica y acceden a su portal mediante invitación expresa de su terapeuta tratante.
              </li>
            </ul>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                <AlertCircle size={15} />
                <span>Autonomía Clínica y Exclusión de Responsabilidad Médica</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                Synkro es una herramienta tecnológica para la organización de historias, notas y agendas. <strong>Synkro no practica la psicología ni emite diagnósticos clínicos</strong>. Todo juicio terapéutico, diagnóstico, evaluación psicométrica y prescripción de intervenciones es de exclusiva e indelegable responsabilidad del profesional tratante bajo las normas del Colegio de Psicólogos del Perú.
              </p>
            </div>
          </section>

          {/* 3. Modalidades y Planes */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              Planes Comerciales y Período de Prueba Gratuita
            </h2>
            <p>
              Synkro ofrece una prueba de evaluación y cuatro modalidades comerciales:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="rounded-2xl border bg-card p-4 space-y-1.5 shadow-2xs">
                <span className="font-bold text-foreground block text-xs">Prueba Gratuita (14 Días)</span>
                <p className="text-xs">Acceso completo e irrestricto sin ingresar datos de tarjeta ni compromiso de permanencia.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4 space-y-1.5 shadow-2xs">
                <span className="font-bold text-foreground block text-xs">Plan Gratuito (S/ 0/mes)</span>
                <p className="text-xs">Hasta 5 pacientes activos, 1 profesional titular, notas estándar y horario semanal.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4 space-y-1.5 shadow-2xs">
                <span className="font-bold text-foreground block text-xs">Plan Starter (S/ 49/mes)</span>
                <p className="text-xs">Hasta 20 pacientes activos, 1 profesional titular, notas estructuradas y portal paciente.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4 space-y-1.5 shadow-2xs">
                <span className="font-bold text-foreground block text-xs">Plan Professional (S/ 89/mes)</span>
                <p className="text-xs">Pacientes ilimitados, 1 profesional titular, notas SOAP estructuradas con plantillas y bóveda.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4 space-y-1.5 sm:col-span-2 shadow-2xs">
                <span className="font-bold text-foreground block text-xs">Plan Empresa / Clínica (S/ 189/mes)</span>
                <p className="text-xs">Hasta 10 psicólogos, gestión de consultorios físicos (boxes), triage interno y supervisión clínica ética.</p>
              </div>
            </div>
          </section>

          {/* 4. Pagos Transparentes */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              Modelo de Pagos en Perú (Sin Cobros Fantasma)
            </h2>
            <p>
              En VelyonSoft creemos en la transparencia total. <strong>No aplicamos débitos automáticos no autorizados ni cobros sorpresa en tu tarjeta</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Métodos Oficiales:</strong> Pagos directos mediante <strong>Yape oficial ({siteConfig.phoneFormatted})</strong> y <strong>Transferencias Bancarias BCP</strong> en moneda nacional (PEN).
              </li>
              <li>
                <strong>Activación Asistida:</strong> El comprobante se valida por nuestro equipo administrativo vía WhatsApp activando la suscripción de forma inmediata en el sistema.
              </li>
              <li>
                <strong>Renovación Consciente:</strong> Antes del vencimiento del periodo mensual, el usuario recibe un recordatorio amistoso y decide libremente cuándo realizar el abono del siguiente periodo.
              </li>
            </ul>
          </section>

          {/* 5. Continuidad Clínica */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Garantía de Continuidad Clínica y Custodia de Expedientes
            </h2>
            <p>
              En caso de que una suscripción no sea renovada o el usuario decida suspender temporalmente su práctica:
            </p>
            <div className="rounded-2xl border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Tus historias clínicas nunca son secuestradas ni borradas</span>
              </div>
              <p className="text-xs leading-relaxed">
                El sistema pasa a modo de <strong>Continuidad Clínica (Solo Lectura)</strong>. El terapeuta podrá ingresar en cualquier momento para revisar los antecedentes de sus pacientes, consultar las notas SOAP históricas y exportar la información clínica cuando lo requiera.
              </p>
            </div>
          </section>

          {/* 6. Propiedad Intelectual */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">6</span>
              Propiedad Intelectual y Titularidad de Datos
            </h2>
            <p>
              Todos los derechos de propiedad intelectual sobre el código fuente, diseño, logotipos, interfaces y algoritmos de Synkro pertenecen en forma exclusiva a <strong>VelyonSoft S.A.C.</strong>
            </p>
            <p>
              Por su parte, los datos ingresados por el terapeuta (historias clínicas, informes y registros de pacientes) son de exclusiva titularidad del psicólogo y sus pacientes. VelyonSoft actúa únicamente como encargado del tratamiento y custodio técnico de la infraestructura.
            </p>
          </section>

          {/* 7. Ley y Jurisdicción */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">7</span>
              Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos y Condiciones se rigen e interpretan conforme a las leyes de la República del Perú. Para cualquier controversia derivada del presente contrato, las partes se someten expresamente a la competencia de los jueces y tribunales del distrito judicial de Lima Cercado, renunciando a cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

          {/* Contacto comercial */}
          <section className="rounded-2xl border border-primary/20 bg-secondary/30 p-5 space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageCircle size={16} className="text-primary" />
              ¿Preguntas sobre los Términos de Servicio?
            </h3>
            <p className="text-xs">
              Nuestro equipo comercial y legal está disponible para asistirte de Lunes a Sábado de 09:00 a 19:00 hrs:
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-2xs hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={14} />
              <span>Conversar con Asesor Legal / Comercial</span>
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}

