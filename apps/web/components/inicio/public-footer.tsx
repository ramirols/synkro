import Image from "next/image";
import { Link } from "next-view-transitions";
import {
  MessageCircle,
  ShieldCheck,
  FileText,
  Lock,
  BookOpen,
  ExternalLink,
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { siteConfig, socialNetworks, whatsappUrl } from "@/lib/config/site";

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function PublicFooter() {
  return (
    <footer className="border-t bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b pb-12">
          {/* Column 1: Brand, Contact & Social */}
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

            {/* Datos de contacto oficial */}
            <div className="space-y-2 text-xs text-muted-foreground pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone size={13} className="text-primary/70 shrink-0" />
                <span>{siteConfig.phoneFormatted}</span>
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail size={13} className="text-primary/70 shrink-0" />
                <span>{siteConfig.email}</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground/80">
                <MapPin size={13} className="text-primary/70 shrink-0" />
                <span>{siteConfig.location}</span>
              </div>
            </div>

            {/* Redes sociales oficiales de Velyon */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Redes Oficiales
              </span>
              <div className="flex items-center gap-3">
                {socialNetworks.map((net) => {
                  const IconComponent =
                    net.icon === "instagram" ? InstagramIcon : FacebookIcon;
                  return (
                    <a
                      key={net.name}
                      href={net.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-8 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:bg-muted hover:text-primary transition-colors shadow-2xs"
                      title={`${net.name} - ${net.handle}`}
                    >
                      <IconComponent className="size-4" />
                    </a>
                  );
                })}
              </div>
            </div>

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
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageCircle size={13} />
                  <span>Soporte WhatsApp (+51 900 083 518)</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail size={13} />
                  <span>{siteConfig.email}</span>
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
              © {new Date().getFullYear()} <strong>{siteConfig.brandName}</strong> por <strong>{siteConfig.legalName}</strong>. Todos los derechos reservados. {siteConfig.location}.
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Tratamiento de datos personales protegido bajo la Ley N° 29733 y supervisado conforme a la Ley N° 28369 del Colegio de Psicólogos del Perú (C.Ps.P.).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 shrink-0">
            <div className="flex items-center gap-3">
              {socialNetworks.map((net) => {
                const IconComponent =
                  net.icon === "instagram" ? InstagramIcon : FacebookIcon;
                return (
                  <a
                    key={net.name}
                    href={net.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary transition-colors"
                    title={net.name}
                  >
                    <IconComponent className="size-3.5" />
                  </a>
                );
              })}
            </div>
            <span className="text-border">|</span>
            <a
              href={siteConfig.companyUrl}
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
