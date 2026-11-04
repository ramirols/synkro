"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
  UserCheck,
  Home,
  FolderLock,
  LogIn,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solucionesOpen, setSolucionesOpen] = useState(false);
  const [plataformaOpen, setPlataformaOpen] = useState(false);

  const solucionesRef = useRef<HTMLDivElement>(null);
  const plataformaRef = useRef<HTMLDivElement>(null);

  const whatsappLink =
    "https://wa.me/51997676432?text=Hola%20Velyon!%20Deseo%20informaci%C3%B3n%20sobre%20Synkro%20y%20activar%20mi%20cuenta%20de%20psicolog%C3%ADa.";

  // Cerrar selectores al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        solucionesRef.current &&
        !solucionesRef.current.contains(event.target as Node)
      ) {
        setSolucionesOpen(false);
      }
      if (
        plataformaRef.current &&
        !plataformaRef.current.contains(event.target as Node)
      ) {
        setPlataformaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logotipo de Marca */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Image
            src="/icon.png"
            alt="Synkro Logo"
            width={36}
            height={36}
            className="size-9 rounded-xl object-cover shadow-2xs group-hover:scale-105 transition-transform"
            priority
          />
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

        {/* Navegación de Escritorio con Selectores Limpios e Íconos */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2 text-xs font-semibold text-muted-foreground">
          {/* 1. Inicio */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all hover:bg-muted/60 hover:text-foreground"
          >
            <Home size={14} className="opacity-75" />
            <span>Inicio</span>
          </Link>

          {/* 2. Selector: Soluciones */}
          <div className="relative" ref={solucionesRef}>
            <button
              onClick={() => {
                setSolucionesOpen(!solucionesOpen);
                setPlataformaOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all hover:bg-muted/60 hover:text-foreground cursor-pointer ${
                solucionesOpen ? "bg-muted text-foreground" : ""
              }`}
            >
              <UserCheck size={14} className="opacity-75" />
              <span>Soluciones</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  solucionesOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {solucionesOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border bg-card p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 z-50 space-y-1">
                <Link
                  href="/psicologos"
                  onClick={() => setSolucionesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-colors group"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Para Psicólogos Independientes
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">
                      Consulta privada, notas SOAP estructuradas y portal de pacientes
                    </span>
                  </div>
                </Link>

                <Link
                  href="/centros-psicologicos"
                  onClick={() => setSolucionesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-colors group"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Para Centros & Clínicas
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">
                      Boxes físicos, derivaciones internas y supervisión clínica
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* 3. Selector: Plataforma */}
          <div className="relative" ref={plataformaRef}>
            <button
              onClick={() => {
                setPlataformaOpen(!plataformaOpen);
                setSolucionesOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all hover:bg-muted/60 hover:text-foreground cursor-pointer ${
                plataformaOpen ? "bg-muted text-foreground" : ""
              }`}
            >
              <Brain size={14} className="opacity-75" />
              <span>Plataforma</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  plataformaOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {plataformaOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border bg-card p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 z-50 space-y-1">
                <Link
                  href="/funciones"
                  onClick={() => setPlataformaOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-2 text-primary shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Funcionalidades Clínicas
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">
                      Agenda de horario, notas clínicas SOAP y Google Meet
                    </span>
                  </div>
                </Link>

                <Link
                  href="/seguridad"
                  onClick={() => setPlataformaOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-2 text-primary shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Seguridad & Ley 28369 C.Ps.P.
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">
                      Aislamiento RLS en PostgreSQL y secreto profesional
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#boveda"
                  onClick={() => setPlataformaOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-colors group"
                >
                  <div className="rounded-lg bg-secondary p-2 text-primary shrink-0 mt-0.5">
                    <FolderLock size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                      Bóveda Documental Cifrada
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">
                      Visor in-app de pruebas psicométricas y reportes
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* 4. Precios */}
          <Link
            href="/precios"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all hover:bg-muted/60 hover:text-foreground"
          >
            <CreditCard size={14} className="opacity-75" />
            <span>Precios</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              Yape
            </span>
          </Link>
        </nav>

        {/* Acciones de Escritorio - Claramente diferenciadas */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Asesor WhatsApp */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all shadow-2xs"
            title="Hablar por WhatsApp para consultas o activación"
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </a>

          {/* Botón: Probar Demo (Solo lectura interactiva) */}
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-all shadow-2xs"
            title="Explorar el consultorio interactivo con datos ficticios"
          >
            <Sparkles size={13} className="text-primary" />
            <span>Probar Demo</span>
          </Link>

          {/* Botón: Ingresar (Cuentas ya registradas) */}
          <Link
            href="/iniciar-sesion"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Acceder a tu cuenta clínica registrada"
          >
            <LogIn size={14} />
            <span>Ingresar</span>
          </Link>

          {/* Botón: Iniciar Prueba Gratis (14 Días) con Tooltip Explicativo de Shadcn */}
          <TooltipProvider delay={100}>
            <Tooltip>
              <TooltipTrigger render={
                <Link
                  href="/registrarse"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                >
                  <span>Prueba Gratis</span>
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    14 días
                  </span>
                  <ArrowRight size={13} />
                </Link>
              } />
              <TooltipContent side="bottom" className="text-xs font-medium">
                Acceso total al consultorio por 14 días. Sin tarjeta de crédito.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Botón Hamburguesa Móvil */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl p-2 text-muted-foreground hover:bg-muted md:hidden cursor-pointer"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menú Móvil Desplegable y Espacioso */}
      {mobileMenuOpen && (
        <div className="border-b bg-card px-6 py-6 shadow-xl md:hidden space-y-5 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-xs font-semibold text-foreground">
            {/* Inicio */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl p-2.5 font-bold hover:bg-muted transition-colors"
            >
              <Home size={16} className="text-primary" />
              <span>Inicio</span>
            </Link>

            {/* Grupo: Soluciones */}
            <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
              Soluciones para Profesionales
            </div>

            <Link
              href="/psicologos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-secondary/50 p-2.5 font-bold text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <UserCheck size={16} />
                <span>Para Psicólogos Independientes</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/centros-psicologicos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-secondary/50 p-2.5 font-bold text-primary transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span>Para Centros & Clínicas</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            {/* Grupo: Plataforma & Precios */}
            <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
              Plataforma & Tarifas
            </div>

            <Link
              href="/funciones"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Funcionalidades Clínicas</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/seguridad"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span>Seguridad & Ley 28369 C.Ps.P.</span>
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
                <span>Planes & Pagos por Yape</span>
              </div>
              <ArrowRight size={14} />
            </Link>
          </nav>

          {/* Bloque de Acciones Móviles */}
          <div className="pt-4 border-t space-y-2.5">
            {/* Prueba Gratuita Destacada */}
            <Link
              href="/registrarse"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
            >
              <span>Iniciar Prueba Gratis de 14 Días</span>
              <ArrowRight size={14} />
            </Link>

            {/* Fila: Ingresar + Demo */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/iniciar-sesion"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <LogIn size={14} />
                <span>Ingresar</span>
              </Link>

              <Link
                href="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Sparkles size={14} className="text-primary" />
                <span>Probar Demo</span>
              </Link>
            </div>

            {/* Asesoría WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all shadow-2xs"
            >
              <MessageCircle size={15} />
              <span>Contactar Asesor por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
