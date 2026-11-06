import { Metadata } from "next";
import { Link } from "next-view-transitions";
import { ShieldCheck, Lock, FileText, UserCheck, Mail, ArrowLeft, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos Personales | Synkro by VelyonSoft",
  description:
    "Conoce cómo Synkro y VelyonSoft protegen tus datos y los de tus pacientes conforme a la Ley N° 29733 de Protección de Datos Personales del Perú y la Ley N° 28369 del Trabajo del Psicólogo.",
  keywords: [
    "politica de privacidad synkro",
    "proteccion datos personales psicologia peru",
    "ley 29733 datos sensibles salud mental",
    "secreto profesional psicologo peru ley 28369",
    "derechos arco velyonsoft",
    "privacidad historias clinicas electronicas",
  ],
};

export default function PrivacidadPage() {
  const whatsappLink = getWhatsAppUrl(
    "¡Hola Velyon! Tengo una consulta sobre la Política de Privacidad de Synkro."
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
            <ShieldCheck size={14} />
            <span>Marco Legal & Cumplimiento Normativo en Perú</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Política de Privacidad y Tratamiento de Datos Personales
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Última actualización: Noviembre 2026 • Titular del servicio: <strong>VelyonSoft S.A.C.</strong> (Lima, Perú).
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {/* 1. Responsable */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
              Responsable del Tratamiento y Ámbito de Aplicación
            </h2>
            <p>
              El presente documento regula el tratamiento de datos personales realizado a través de la plataforma <strong>Synkro</strong>, operada y desarrollada por <strong>VelyonSoft S.A.C.</strong> (en adelante, &quot;VelyonSoft&quot;), con domicilio fiscal en Lima, Perú.
            </p>
            <p>
              Esta política aplica a todos los psicólogos independientes, centros de salud mental, terapeutas colaboradores y pacientes que accedan al software clínico o al portal del paciente.
            </p>
          </section>

          {/* 2. Marco Legal */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Marco Legal y Normativa Aplicable
            </h2>
            <p>
              El diseño de seguridad y tratamiento de la información de Synkro se fundamenta en:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong> y su Reglamento aprobado mediante Decreto Supremo N° 003-2013-JUS.
              </li>
              <li>
                <strong>Ley N° 28369 (Ley del Trabajo del Psicólogo)</strong> y el Código de Ética y Deontología del Colegio de Psicólogos del Perú (C.Ps.P.), garantizando el respeto inviolable al <strong>secreto profesional</strong> y la confidencialidad de la psicoterapia.
              </li>
              <li>
                <strong>Decreto Legislativo N° 1306</strong> y directivas técnicas del Ministerio de Salud (MINSA) relativas a la gestión y preservación de historias clínicas electrónicas.
              </li>
            </ul>
          </section>

          {/* 3. Naturaleza de los Datos */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              Datos Recopilados y Condición de Datos Sensibles de Salud
            </h2>
            <p>
              Conforme al artículo 2 numeral 5 de la Ley N° 29733, los datos relacionados a la salud física o mental tienen la condición de <strong>datos sensibles</strong>, exigiendo las medidas de seguridad más estrictas:
            </p>
            <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-2xs">
              <div>
                <strong className="text-foreground block font-semibold mb-1">A. Datos del Profesional / Centro Clínico:</strong>
                <p>Nombres completos, correo electrónico profesional, número de Colegiatura C.Ps.P., especialidad clínica, teléfono de contacto y razón social o nombre comercial del consultorio.</p>
              </div>
              <div className="pt-2 border-t">
                <strong className="text-foreground block font-semibold mb-1">B. Datos del Paciente (bajo custodia del terapeuta):</strong>
                <p>Nombres, fecha de nacimiento, datos de contacto, motivo de consulta, evaluaciones psicológicas, pruebas psicométricas y registro de sesiones de evolución.</p>
              </div>
              <div className="pt-2 border-t">
                <strong className="text-foreground block font-semibold mb-1">C. Notas Privadas del Terapeuta (Doble Capa):</strong>
                <p>Hipótesis clínicas, reflexiones de contratransferencia e impresiones diagnósticas privadas que el terapeuta conserva bajo su exclusiva custodia técnica y que <strong>nunca</strong> son visibles para el paciente, otros terapeutas ni el personal administrativo.</p>
              </div>
            </div>
          </section>

          {/* 4. Aislamiento Técnico RLS */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              Aislamiento Multi-Tenant y Seguridad Criptográfica
            </h2>
            <p>
              Para garantizar que los datos clínicos no puedan ser interceptados, mezclados o consultados por terceros:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Row Level Security (RLS) en PostgreSQL:</strong> Cada consulta a la base de datos es filtrada matemáticamente por el identificador de la organización del usuario (`organization_id`). Ningún centro clínico puede visualizar expedientes de otro consultorio.
              </li>
              <li>
                <strong>Aislamiento de Notas Privadas:</strong> La tabla de notas privadas cuenta con una política RLS que exige `author_id = auth.uid()`. Solo el psicólogo autor que redactó la nota tiene acceso a ella.
              </li>
              <li>
                <strong>Bóveda Cifrada y URLs Firmadas:</strong> Los archivos clínicos y pruebas psicométricas se almacenan en buckets privados con expiración automática mediante tokens criptográficos firmados de 15 minutos.
              </li>
              <li>
                <strong>Aislamiento del Superadministrador:</strong> El personal administrativo y de soporte de VelyonSoft está técnicamente bloqueado por políticas RLS de leer o consultar historias clínicas o notas de evolución de los pacientes.
              </li>
            </ul>
          </section>

          {/* 5. Derechos ARCO */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Ejercicio de los Derechos ARCO
            </h2>
            <p>
              Todo titular de datos personales (profesional o paciente) tiene derecho a ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong>, conforme a la Ley N° 29733.
            </p>
            <p>
              Para ejercer estos derechos, el usuario puede remitir una solicitud formal al correo <strong>{siteConfig.email}</strong> o mediante nuestro canal oficial de WhatsApp (<strong>{siteConfig.phoneFormatted}</strong>), indicando sus nombres completos, documento de identidad (DNI o Carné de Extranjería) y el derecho que desea ejercer.
            </p>
          </section>

          {/* 6. Conservación */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">6</span>
              Custodia, Exportación y Continuidad Clínica
            </h2>
            <p>
              VelyonSoft reconoce que el expediente clínico pertenece a la custodia ética del psicólogo y a la titularidad del paciente. Por ello, bajo la <strong>Política de Continuidad Clínica de Synkro</strong>:
            </p>
            <p>
              Aun en caso de vencimiento de la suscripción o término de uso del servicio, el profesional conserva pleno acceso a la consulta, revisión y exportación de todos los expedientes históricos registrados durante la vigencia de su cuenta.
            </p>
          </section>

          {/* 7. Contacto */}
          <section className="rounded-2xl border border-primary/20 bg-secondary/30 p-5 space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              Canal de Dudas y Privacidad
            </h3>
            <p className="text-xs">
              Si tienes preguntas sobre cómo tratamos la información o deseas una copia del protocolo técnico de protección de datos:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-2xs hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={14} />
                <span>Contactar a Oficial de Privacidad</span>
              </a>
              <span className="text-xs text-muted-foreground font-semibold">
                Correo: {siteConfig.email}
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

