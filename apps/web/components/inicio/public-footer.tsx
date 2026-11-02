import { Link } from "next-view-transitions";
import { Brain, MessageCircle, ShieldCheck } from "lucide-react";

export default function PublicFooter() {
  const whatsappLink = "https://wa.me/51997676432?text=Hola%20Velyon!%20Deseo%20informaci%C3%B3n%20sobre%20Synkro.";

  return (
    <footer className="border-t bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-b pb-10">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Brain size={18} />
              </div>
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
          </div>

          {/* Quick Internal & Anchor Navigation */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
            <Link href="/funciones" className="hover:text-primary transition-colors">
              Funciones Clínicas
            </Link>
            <Link href="/precios" className="hover:text-primary transition-colors">
              Precios & Yape
            </Link>
            <Link href="/seguridad" className="hover:text-primary transition-colors">
              Seguridad & C.Ps.P.
            </Link>
            <Link href="/#agenda" className="hover:text-primary transition-colors">
              Horario Semanal
            </Link>
            <Link href="/#clinicas" className="hover:text-primary transition-colors">
              Clínicas & Equipos
            </Link>
            <Link href="/#faq" className="hover:text-primary transition-colors">
              Preguntas Frecuentes
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Conforme a la Ley N° 28369 del Colegio de Psicólogos del Perú (C.Ps.P.)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:underline"
            >
              <MessageCircle size={14} /> Soporte WhatsApp Velyon
            </a>
            <a
              href="https://www.velyonsoft.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              velyonsoft.com
            </a>
            <span>© {new Date().getFullYear()} Synkro. Todos los derechos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}