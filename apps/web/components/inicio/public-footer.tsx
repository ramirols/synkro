import Image from "next/image";
import { Link } from "next-view-transitions";
import {
  Brain,
  MessageCircle,
  ShieldCheck,
  FileText,
  Lock,
  BookOpen,
  ExternalLink,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function PublicFooter() {
  const whatsappLink =
    "https://wa.me/51997676432?text=Hola%20Velyon!%20Deseo%20informaci%C3%B3n%20sobre%20Synkro.";

  return (
    <footer className="border-t bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b pb-12">
          {/* Column 1: Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/icon.png"
                alt="Synkro Logo"
                width={36}
                height={36}
                className="size-9 rounded-xl object-cover shadow-xs"
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Synkro
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-primary">
                by Velyon
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Software de gestión clínica, historias digitales y notas SOAP estructuradas para psicólogos y centros de salud mental en Perú y Latinoamérica.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck size={14} className="shrink-0" />
              <span>Conforme a la Ley N° 28369 (C.Ps.P.)</span>
            </div>
          </div>

          {/* Column 2: Soluciones Clínicas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Soluciones Clínicas
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/funciones"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Funciones Clínicas Principales</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#agenda"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <Calendar size={13} className="text-primary/70" />
                  <span>Agenda y Horario Semanal</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#clinicas"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <Building2 size={13} className="text-primary/70" />
                  <span>Centros & Equipos Clínicos</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} className="text-primary/70" />
                  <span>Demo Interactiva Inmediata</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Precios & Soporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Planes & Soporte
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/precios" className="hover:text-primary transition-colors">
                  Precios & Pagos con Yape / BCP
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageCircle size={13} />
                  <span>Soporte Directo por WhatsApp</span>
                </a>
              </li>
              <li>
                <Link href="/iniciar-sesion" className="hover:text-primary transition-colors">
                  Portal de Acceso para Profesionales
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Cumplimiento Normativo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Legal & Cumplimiento
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/seguridad"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <Lock size={13} className="text-primary/70" />
                  <span>Seguridad & Privacidad de Datos</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText size={13} className="text-primary/70" />
                  <span>Política de Privacidad (Ley 29733)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <FileText size={13} className="text-primary/70" />
                  <span>Términos y Condiciones de Uso</span>
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/libro-de-reclamaciones"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-secondary/60 px-3 py-1.5 font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <BookOpen size={14} className="text-primary" />
                  <span>Libro de Reclamaciones Virtual</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal Disclaimer & Corporate Links */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} <strong>Synkro</strong> por <strong>VelyonSoft S.A.C.</strong> Todos los derechos reservados. Lima, Perú.
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Tratamiento de datos personales protegido bajo la Ley N° 29733 y supervisado conforme a la Ley N° 28369 del Colegio de Psicólogos del Perú (C.Ps.P.).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 shrink-0">
            <a
              href="https://www.velyonsoft.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <span>velyonsoft.com</span>
              <ExternalLink size={12} />
            </a>
            <span className="text-border">|</span>
            <Link href="/libro-de-reclamaciones" className="font-semibold hover:text-foreground">
              INDECOPI D.S. 011-2011-PCM
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
