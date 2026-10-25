"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "next-view-transitions";
import {
  Brain,
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  ChevronDown,
  FileText,
  CalendarDays,
  ShieldCheck,
  Building2,
  Sparkles,
  CreditCard,
  HelpCircle,
  Lock,
} from "lucide-react";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [funcionesOpen, setFuncionesOpen] = useState(false);
  const [explorarOpen, setExplorarOpen] = useState(false);

  const funcionesRef = useRef<HTMLDivElement>(null);
  const explorarRef = useRef<HTMLDivElement>(null);

  const whatsappLink =
    "https://wa.me/51997676432?text=Hola%20Velyon!%20Deseo%20informaci%C3%B3n%20sobre%20Synkro%20y%20activar%20mi%20cuenta%20de%20psicolog%C3%ADa.";

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        funcionesRef.current &&
        !funcionesRef.current.contains(event.target as Node)
      ) {
        setFuncionesOpen(false);
      }
      if (
        explorarRef.current &&
        !explorarRef.current.contains(event.target as Node)
      ) {
        setExplorarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo - Minimalist and Clean */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs group-hover:scale-105 transition-transform">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-foreground">
                Synkro
              </span>
            </div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary leading-none">
              by Velyon
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Featuring Direct Internal Pages & Clean Dropdown */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2 text-xs font-semibold text-muted-foreground">
          {/* Internal Page Link: /funciones with quick dropdown menu */}
          <div className="relative" ref={funcionesRef}>
            <div className="flex items-center">
              <Link
                href="/funciones"
                className="rounded-l-xl px-3 py-2 transition-all hover:bg-muted/60 hover:text-foreground"
              >
                Funciones
              </Link>
              <button
                onClick={() => {
                  setFuncionesOpen(!funcionesOpen);
                  setExplorarOpen(false);
                }}
                className={`rounded-r-xl p-2 transition-all hover:bg-muted/60 hover:text-foreground ${
                  funcionesOpen ? "bg-muted text-foreground" : ""
                }`}
                aria-label="Desplegar menú de funciones"
              >
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    funcionesOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
            </div>

            {funcionesOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border bg-card p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 z-50 space-y-1">
                <Link
                  href="/funciones"
                  onClick={() => setFuncionesOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-primary/5 p-2.5 hover:bg-primary/10 transition-colors group mb-1"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-xs font-bold text-primary">
                      Ver todas las funciones
                    </span>
                  </div>
                  <ArrowRight size={12} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/#funciones"
                  onClick={() => setFuncionesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-1.5 text-primary shrink-0 mt-0.5">
                    <Brain size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Notas SOAP con IA
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Documentación clínica ágil y estructurada
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#funciones"
                  onClick={() => setFuncionesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-1.5 text-primary shrink-0 mt-0.5">
                    <FileText size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Historias Clínicas & Anamnesis
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Expediente digital completo y antecedentes
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#agenda"
                  onClick={() => setFuncionesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-1.5 text-primary shrink-0 mt-0.5">
                    <CalendarDays size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Horario Semanal & Boxes
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Matriz de 08:00 a 20:00 y Google Meet
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Internal Page Link: /precios */}
          <Link
            href="/precios"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <span>Precios</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              Yape
            </span>
          </Link>

          {/* Internal Page Link: /seguridad */}
          <Link
            href="/seguridad"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <span>Seguridad</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              C.Ps.P.
            </span>
          </Link>

          {/* Explorar Sections Dropdown: Agenda, Clínicas, FAQ */}
          <div className="relative" ref={explorarRef}>
            <button
              onClick={() => {
                setExplorarOpen(!explorarOpen);
                setFuncionesOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all hover:bg-muted/60 hover:text-foreground ${
                explorarOpen ? "bg-muted text-foreground" : ""
              }`}
            >
              <span>Explorar</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  explorarOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {explorarOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border bg-card p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 z-50 space-y-1">
                <Link
                  href="/#agenda"
                  onClick={() => setExplorarOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-1.5 text-primary shrink-0 mt-0.5">
                    <CalendarDays size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Horario Semanal
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Vista semanal de consultorios tipo horario
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#clinicas"
                  onClick={() => setExplorarOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-1.5 text-primary shrink-0 mt-0.5">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Centros & Clínicas
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Gestión de equipos, derivaciones y boxes
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#faq"
                  onClick={() => setExplorarOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-1.5 text-primary shrink-0 mt-0.5">
                    <HelpCircle size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Preguntas Frecuentes
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Dudas sobre pagos, datos y migración
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all shadow-2xs"
            title="Hablar por WhatsApp para pagos por Yape o activación"
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </a>

          <Link
            href="/iniciar-sesion"
            className="rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Ingresar
          </Link>

          <Link
            href="/iniciar-sesion"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
          >
            <span>Probar Demo</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl p-2 text-muted-foreground hover:bg-muted md:hidden"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b bg-card px-6 py-6 shadow-xl md:hidden space-y-4">
          <nav className="flex flex-col space-y-1.5 text-xs font-semibold text-foreground">
            {/* Direct Internal Pages */}
            <div className="pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Páginas Principales
            </div>

            <Link
              href="/funciones"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-secondary/60 p-2.5 font-bold text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>Funcionalidades Clínicas</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/precios"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-2.5 font-bold text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              <div className="flex items-center gap-2">
                <CreditCard size={16} />
                <span>Planes, Precios & Yape</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/seguridad"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-secondary/60 p-2.5 font-bold text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Seguridad & Ética C.Ps.P.</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            {/* In-page Sections */}
            <div className="pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Secciones del Inicio
            </div>

            <Link
              href="/#agenda"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Horario Semanal & Citas (Boxes)
            </Link>

            <Link
              href="/#clinicas"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Para Centros & Clínicas de Psicología
            </Link>

            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Preguntas Frecuentes
            </Link>
          </nav>

          <div className="pt-4 border-t space-y-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs"
            >
              <MessageCircle size={15} />
              <span>Contactar por WhatsApp</span>
            </a>

            <Link
              href="/iniciar-sesion"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs"
            >
              <span>Acceder al Consultorio Demo</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}