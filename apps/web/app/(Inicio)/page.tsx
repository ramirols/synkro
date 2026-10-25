"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import PublicHeader from "@/components/inicio/public-header";
import PublicFooter from "@/components/inicio/public-footer";
import WelcomeBubble from "@/components/inicio/welcome-bubble";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  FileText,
  Users,
  Users2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Video,
  Clock,
  MessageCircle,
  CreditCard,
  Smartphone,
  Building2,
  ArrowRightLeft,
  DoorOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  Star,
  FileCheck,
  HeartHandshake,
  Check,
} from "lucide-react";

export default function Home() {
  const [activeTabPreview, setActiveTabPreview] = useState<"agenda" | "soap" | "portal" | "boveda">("agenda");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const whatsappBaseUrl = "https://wa.me/51997676432";

  const getWhatsappPlanLink = (planName: string, price: string) => {
    const text = encodeURIComponent(
      `¡Hola Velyon! Me interesa activar el ${planName} (${price}) de Synkro para mi práctica psicológica. ¿Me pueden enviar los datos para pagar por Yape / Tarjeta y configurar mi clínica?`
    );
    return `${whatsappBaseUrl}?text=${text}`;
  };

  const generalWhatsappLink = `${whatsappBaseUrl}?text=${encodeURIComponent(
    "¡Hola Velyon! Quisiera recibir información y una demostración personalizada del software para psicólogos Synkro."
  )}`;

  const faqs = [
    {
      q: "¿Cómo se realiza el pago de la suscripción a Synkro?",
      a: "El pago se realiza de manera directa y personalizada con nosotros a través de WhatsApp. Aceptamos Yape, Plin, tarjetas de crédito o débito (Visa, Mastercard, American Express) y transferencias bancarias locales (BCP, BBVA, Interbank). Una vez confirmado el abono, activamos tu consultorio en menos de 5 minutos.",
    },
    {
      q: "¿Mis notas clínicas y expedientes están protegidos bajo secreto profesional?",
      a: "Totalmente. Synkro fue construido bajo la estricta normativa del Código de Ética del Colegio de Psicólogos del Perú (C.Ps.P.) y estándares internacionales de privacidad médica. Tus datos se almacenan con cifrado AES-256 en reposo y políticas de seguridad a nivel de fila (Row Level Security), de modo que solo tú tienes acceso a tus notas confidenciales.",
    },
    {
      q: "¿Cómo funciona la doble capa de notas de evolución SOAP?",
      a: "Cada sesión cuenta con dos secciones: una capa clínica estructurada (Subjetivo, Objetivo, Análisis, Plan) que puedes compartir o exportar formalmente, y una capa de 'Notas Personales del Terapeuta' 100% blindada e invisible para cualquier exportación o tercero, diseñada para tus reflexiones internas de contratransferencia.",
    },
    {
      q: "¿Mis pacientes tienen que pagar para usar el portal del paciente?",
      a: "No, para tus pacientes el portal es 100% gratuito. Les entregas su acceso para que puedan consultar la fecha de su próxima sesión, acceder con un clic a la sala de Google Meet, revisar sus tareas intersesión y leer documentos o consentimientos informados.",
    },
    {
      q: "¿Puedo utilizar Synkro si dirijo una clínica o centro con varios psicólogos?",
      a: "Sí, el Plan Clínica está pensado para centros psicológicos. Permite registrar a tu equipo multidisciplinario, asignar roles, derivar pacientes internamente preservando el historial clínico, coordinar el uso de consultorios físicos (boxes) para evitar choques y supervisar casos con visado ético.",
    },
    {
      q: "¿Puedo usar Synkro desde mi celular, tablet o laptop?",
      a: "Sí. Synkro es una plataforma web moderna y responsiva que funciona de manera fluida en cualquier navegador web moderno (Chrome, Safari, Edge) en tu computadora de escritorio, laptop, iPad, tablet o smartphone.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/40 via-background to-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-2xs">
                <Sparkles size={14} />
                <span>Software Clínico Especializado para Psicólogos en Perú & Latam</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.08]">
                Menos horas en papeleo.{" "}
                <span className="text-primary underline decoration-primary/30 decoration-wavy">
                  Más presencia
                </span>{" "}
                para tus pacientes.
              </h1>

              {/* Subheadline */}
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                Historias clínicas digitales, notas de evolución SOAP con asistencia inteligente, agenda tipo horario semanal, bóveda de pruebas psicométricas y portal seguro para tus pacientes. Todo bajo secreto profesional conforme al Colegio de Psicólogos.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                <Link
                  href="/demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 transition-all group"
                >
                  <span>Probar Demostración en Vivo Gratis</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <a
                  href={generalWhatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600/30 bg-emerald-500/10 px-6 py-3.5 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all shadow-2xs"
                >
                  <MessageCircle size={18} />
                  <span>Pagar / Activar por WhatsApp</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" /> Secreto Profesional & C.Ps.P.
                </span>
                <span className="flex items-center gap-1.5">
                  <Smartphone size={16} className="text-primary" /> Pagos con Yape, Plin y Tarjetas
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock size={16} className="text-primary" /> Cifrado de Grado Médico AES-256
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-500 fill-amber-500" /> +38 Consultorios y Clínicas Activas
                </span>
              </div>
            </div>

            {/* INTERACTIVE SOFTWARE LIVE PREVIEW */}
            <div className="rounded-3xl border-2 border-primary/20 bg-card p-4 sm:p-6 shadow-2xl space-y-4">
              {/* Preview Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-3 rounded-full bg-red-400" />
                  <div className="flex size-3 rounded-full bg-amber-400" />
                  <div className="flex size-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground font-semibold">
                    app.synkro.velyonsoft.com • Consultorio Lic. Alejandro Mendoza V. (C.Ps.P. 28419)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTabPreview("agenda")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${activeTabPreview === "agenda"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Horario Semanal
                  </button>
                  <button
                    onClick={() => setActiveTabPreview("soap")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${activeTabPreview === "soap"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Notas SOAP + IA
                  </button>
                  <button
                    onClick={() => setActiveTabPreview("portal")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${activeTabPreview === "portal"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Portal Paciente
                  </button>
                  <button
                    onClick={() => setActiveTabPreview("boveda")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${activeTabPreview === "boveda"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Bóveda Psicométrica
                  </button>
                </div>
              </div>

              {/* Tab 1: Agenda Preview */}
              {activeTabPreview === "agenda" && (
                <div className="rounded-2xl border bg-background p-5 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                        28 SEP – 04 OCT
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        Semana en Curso • 6 Citas Agendadas
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      ● 09:30 LIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-primary bg-primary text-primary-foreground p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase opacity-80">LUN</span>
                      <span className="block text-xl font-black">28</span>
                      <div className="mt-2 rounded-lg bg-white/20 p-1.5 text-left text-[10px] font-semibold space-y-0.5">
                        <span className="block font-bold">09:00 Camila V.</span>
                        <span className="text-white/80">🏢 Box 1 (TCC)</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">MAR</span>
                      <span className="block text-xl font-black">29</span>
                      <div className="mt-2 rounded-lg bg-sky-500/10 p-1.5 text-left text-[10px] font-semibold text-sky-700 space-y-0.5">
                        <span className="block font-bold">17:00 Carlos & A.</span>
                        <span>💻 Google Meet</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">MIÉ</span>
                      <span className="block text-xl font-black">30</span>
                      <div className="mt-2 rounded-lg bg-secondary p-1.5 text-left text-[10px] font-semibold text-primary space-y-0.5">
                        <span className="block font-bold">15:00 Mateo H.</span>
                        <span>🏢 Box 2</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">JUE</span>
                      <span className="block text-xl font-black">01</span>
                      <div className="mt-2 rounded-lg bg-emerald-500/10 p-1.5 text-left text-[10px] font-semibold text-emerald-700 space-y-0.5">
                        <span className="block font-bold">10:30 Lucía B.</span>
                        <span>🏢 Box 1</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">VIE</span>
                      <span className="block text-xl font-black">02</span>
                      <span className="block text-[10px] text-muted-foreground mt-3 italic">Libre</span>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">SÁB</span>
                      <span className="block text-xl font-black">03</span>
                      <div className="mt-2 rounded-lg bg-amber-500/10 p-1.5 text-left text-[10px] font-semibold text-amber-700 space-y-0.5">
                        <span className="block font-bold">11:00 Sofía M.</span>
                        <span>💻 Meet</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1 opacity-60">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">DOM</span>
                      <span className="block text-xl font-black">04</span>
                      <span className="block text-[10px] text-muted-foreground mt-3">Descanso</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Notas SOAP Preview */}
              {activeTabPreview === "soap" && (
                <div className="rounded-2xl border bg-background p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">
                      Nota de Evolución Clínica #5 • Camila Valdivia (Ansiedad Generalizada)
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary text-[10px]">
                      Asistido por IA Synkro
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <strong className="text-primary font-bold block text-[11px]">S - Subjetivo</strong>
                      <p className="text-muted-foreground">
                        &quot;Refiere disminución notable en episodios de rumiación nocturna. Logró aplicar respiración diafragmática 4-7-8 antes de la junta laboral.&quot;
                      </p>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <strong className="text-primary font-bold block text-[11px]">O - Objetivo</strong>
                      <p className="text-muted-foreground">
                        Puntaje BAI (Inventario de Ansiedad Beck) bajó de 28 a 17 puntos. Lenguaje fluido, contacto visual sostenido, postura relajada.
                      </p>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <strong className="text-primary font-bold block text-[11px]">A - Análisis</strong>
                      <p className="text-muted-foreground">
                        Evolución favorable. Mayor flexibilidad cognitiva ante sesgos de catastrofismo. Buena alianza terapéutica.
                      </p>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-1">
                      <strong className="text-primary font-bold block text-[11px]">P - Plan</strong>
                      <p className="text-muted-foreground">
                        Avanzar al módulo de desensibilización sistemática. Asignar autorregistro de pensamientos automáticos en portal del paciente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Portal Paciente Preview */}
              {activeTabPreview === "portal" && (
                <div className="rounded-2xl border bg-background p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">
                      Vista del Paciente: Camila Valdivia (Portal Seguro)
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600 text-[10px]">
                      Espacio del Paciente
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border bg-card p-3 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-primary block">Próxima Sesión</span>
                      <p className="font-bold text-foreground">Hoy a las 09:00 hrs</p>
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                        <Video size={10} /> Google Meet 1-Clic
                      </span>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-primary block">Tarea Terapéutica</span>
                      <p className="font-semibold text-foreground">Autorregistro de Pensamientos TCC</p>
                      <span className="text-[10px] text-muted-foreground">En curso para la próxima sesión</span>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-primary block">Ánimo Diario</span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-primary">8 / 10</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Tranquila & Plena</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Bóveda Preview */}
              {activeTabPreview === "boveda" && (
                <div className="rounded-2xl border bg-background p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-foreground">
                      Bóveda de Documentos Clínicos & Pruebas
                    </span>
                    <span className="text-[11px] text-muted-foreground">Visor In-App Cifrado</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <FileCheck size={16} className="text-primary" />
                        <div>
                          <span className="font-bold text-foreground block">Consentimiento_Informado_Terapia_TCC.pdf</span>
                          <span className="text-[10px] text-muted-foreground">Firmado electrónicamente • Hash criptográfico</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600 text-[10px]">
                        Verificado
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <FileCheck size={16} className="text-primary" />
                        <div>
                          <span className="font-bold text-foreground">Inventario_Ansiedad_Beck_BAI.pdf</span>
                          <span className="text-[10px] text-muted-foreground">21 Reactivos • Puntaje 28/63 (Moderada a Severa)</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary text-[10px]">
                        Evaluado
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION #funciones (PILARES CLÍNICOS) */}
        <section id="funciones" className="py-24 border-b">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
            <div className="mx-auto max-w-2xl text-center space-y-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Funcionalidades Especializadas
              </span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Diseñado exclusivamente para la mente del psicólogo.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A diferencia de agendas genéricas o CRMs comerciales, Synkro comprende el encuadre terapéutico, la confidencialidad y la práctica clínica real.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-3xl border bg-card p-6 shadow-xs hover:border-primary/50 transition-all space-y-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Users size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Expediente Clínico & Anamnesis
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ficha completa del paciente, motivo de consulta, factores mantenedores, antecedentes médicos y red de soporte de emergencia.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border bg-card p-6 shadow-xs hover:border-primary/50 transition-all space-y-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Brain size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Notas SOAP con Asistencia IA
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Estructura tus notas de evolución en segundos. Doble capa para proteger tus notas privadas de contratransferencia de cualquier informe externo.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border bg-card p-6 shadow-xs hover:border-primary/50 transition-all space-y-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <FileText size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Bóveda Psicométrica & Visor Web
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sube inventarios (Beck, STAI, Hamilton) arrastrando archivos. Previsualiza y descarga los informes directamente en la misma plataforma.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-3xl border bg-card p-6 shadow-xs hover:border-primary/50 transition-all space-y-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <HeartHandshake size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Portal Seguro del Paciente
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tus pacientes acceden a sus tareas intersesión, botón directo de Google Meet y registro diario de estado de ánimo sin costo adicional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION #agenda (HORARIO SEMANAL TIPO TIMETABLE) */}
        <section id="agenda" className="py-24 border-b bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                  Agenda Visual Revolucionaria
                </span>
                <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Una agenda amigable tipo horario escolar, pero con rigor clínico.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Se acabaron las agendas confusas. Visualiza tu semana completa de Lunes a Domingo, con bloques de hora de 08:00 a 20:00, línea de hora en vivo y diferenciación inmediata de modalidad presencial y telepsicología.
                </p>

                <ul className="space-y-3 text-xs text-foreground font-semibold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Asignación de consultorios físicos (Box 1, Box 2) y salas de Google Meet.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Agendamiento inmediato con 1 clic en cualquier casilla de hora libre.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Ficha rápida de cita para lanzar videollamada o redactar la nota SOAP sin rodeos.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Descarga e impresión en PDF del horario semanal para secretaría o consultorio.
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/demo/agenda"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
                  >
                    <span>Ver Horario en la Demo</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Graphic Representation */}
              <div className="rounded-3xl border bg-card p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-xs uppercase text-primary">
                    Vista Semanal de Consultorio
                  </span>
                  <span className="text-[11px] text-muted-foreground">34 hrs libres disponibles</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">09:00 - 10:00 hrs • Camila Valdivia</span>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300">🏢 Box 1 (TCC Adultos) • Sesión 5</span>
                    </div>
                    <span className="rounded-md bg-emerald-500 text-white font-bold px-2 py-0.5 text-[10px]">
                      Confirmada
                    </span>
                  </div>

                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">11:00 - 12:00 hrs • Sofía Morales</span>
                      <span className="text-[11px] text-sky-800 dark:text-sky-300">💻 Telepsicología • Enlace Google Meet</span>
                    </div>
                    <span className="rounded-md bg-sky-600 text-white font-bold px-2 py-0.5 text-[10px]">
                      Virtual
                    </span>
                  </div>

                  <div className="rounded-xl border border-muted bg-muted/30 p-3 flex items-center justify-between opacity-80">
                    <div>
                      <span className="font-bold text-foreground block">15:00 - 16:00 hrs • Mateo Huamán</span>
                      <span className="text-[11px] text-muted-foreground">🏢 Box 2 (Infantil & Juego)</span>
                    </div>
                    <span className="rounded-md bg-muted text-muted-foreground font-bold px-2 py-0.5 text-[10px]">
                      Programada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION #clinicas (EMPRESAS & CENTROS DE PSICOLOGÍA) */}
        <section id="clinicas" className="py-24 border-b">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
            <div className="mx-auto max-w-2xl text-center space-y-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Para Empresas & Clínicas de Psicología
              </span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Lleva la gestión de tu centro psicológico al siguiente nivel.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si diriges un centro de salud mental, policlínico o equipo de terapeutas, Synkro cuenta con herramientas multi-profesionales que ningún otro software ofrece.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <ArrowRightLeft size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Triage & Derivación Inter-profesional
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transfiere pacientes o solicita co-atención con colegas de tu clínica (ej. evaluación neuropsicológica o terapia familiar) sin perder el historial clínico ni obligar al paciente a repetir su anamnesis.
                </p>
              </div>

              <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <DoorOpen size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Control de Boxes & Consultorios Físicos
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Monitorea en tiempo real qué terapeuta y paciente están utilizando cada consultorio (Box 1, Box 2, Sala Gesell) evitando colisiones y sobre-reservas en la sede de tu clínica.
                </p>
              </div>

              <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Comité de Supervisión Clínica
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permite a directores y supervisores clínicos revisar y visar las notas de evolución de psicólogos en formación o casos complejos con sello de conformidad ética.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION #seguridad (SEGURIDAD & ÉTICA) */}
        <section id="seguridad" className="py-24 border-b bg-secondary/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
            <div className="mx-auto max-w-2xl text-center space-y-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Confidencialidad Médica & Ética
              </span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                La seguridad de tus pacientes es inviolable.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Desarrollamos Synkro con los estándares de privacidad más rigurosos del sector salud.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-2xl border bg-card p-5 space-y-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-foreground">Ley N° 28369 C.Ps.P.</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Cumplimiento pleno del secreto profesional de la Ley del Trabajo del Psicólogo en el Perú.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-5 space-y-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                  🔒
                </div>
                <h4 className="font-bold text-foreground">Cifrado AES-256</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Tus expedientes, notas y archivos están protegidos criptográficamente en reposo y en tránsito.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-5 space-y-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                  🛡️
                </div>
                <h4 className="font-bold text-foreground">Políticas RLS en Base de Datos</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Aislamiento estricto por usuario y organización. Nadie fuera de tu cuenta puede ver tus registros.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-5 space-y-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                  ☁️
                </div>
                <h4 className="font-bold text-foreground">Copias de Seguridad Diarias</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Backups automáticos en la nube para que nunca pierdas información ante robos o fallas de tu equipo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION #precios (PLANES, PAGOS YAPE & WHATSAPP) */}
        <section id="precios" className="py-24 border-b">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
            <div className="mx-auto max-w-3xl text-center space-y-4">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Planes Transparentes & Pagos Locales
              </span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                Invierte en el crecimiento de tu consulta clínica.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Sin comisiones ocultas ni contratos forzosos. Eliges tu plan y coordinas la activación y el pago directamente por WhatsApp.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              {/* PLAN 1: STARTER */}
              <div className="rounded-3xl border bg-card p-7 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Práctica Inicial
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-foreground">Starter</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ideal para psicólogos independientes que están iniciando su consulta privada.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 border-b pb-4">
                    <span className="text-4xl font-black tracking-tight text-foreground">S/ 49</span>
                    <span className="text-xs text-muted-foreground font-semibold">/ mes (PEN)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Hasta 20 pacientes activos
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Horario semanal visual y agenda
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Fichas clínicas e historial digital
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Notas de sesión estructuradas
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Portal del paciente incluido
                    </li>
                  </ul>
                </div>

                <a
                  href={getWhatsappPlanLink("Plan Starter", "S/ 49/mes")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-input bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                >
                  <MessageCircle size={15} className="text-emerald-600" />
                  <span>Activar por WhatsApp</span>
                </a>
              </div>

              {/* PLAN 2: PROFESSIONAL (RECOMENDADO) */}
              <div className="rounded-3xl border-2 border-primary bg-card p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-6 relative">
                <span className="absolute -top-3.5 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                  Más Popular • Recomendado
                </span>

                <div className="space-y-4">
                  <div>
                    <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Práctica Consolidada
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-foreground">Professional</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Para terapeutas consolidados que buscan automatizar notas y escalar su consulta.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 border-b pb-4">
                    <span className="text-4xl font-black tracking-tight text-foreground">S/ 89</span>
                    <span className="text-xs text-muted-foreground font-semibold">/ mes (PEN)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground font-bold">
                      <Check size={14} className="text-primary shrink-0" /> Pacientes Ilimitados
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Notas SOAP asistidas por Inteligencia Artificial
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Doble capa de notas privadas del terapeuta
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Bóveda de archivos con visor in-app
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Telepsicología con Google Meet integrado
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Soporte prioritario por WhatsApp directo
                    </li>
                  </ul>
                </div>

                <a
                  href={getWhatsappPlanLink("Plan Professional", "S/ 89/mes")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
                >
                  <MessageCircle size={15} />
                  <span>Elegir Plan Professional</span>
                </a>
              </div>

              {/* PLAN 3: CLINIC / EMPRESA */}
              <div className="rounded-3xl border bg-card p-7 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Centros & Policlínicos
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-foreground">Clínica / Empresa</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Para centros de psicología, consultorios asociados y equipos multidisciplinarios.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 border-b pb-4">
                    <span className="text-4xl font-black tracking-tight text-foreground">S/ 189</span>
                    <span className="text-xs text-muted-foreground font-semibold">/ mes (PEN)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground font-bold">
                      <Check size={14} className="text-primary shrink-0" /> Múltiples psicólogos y terapeutas
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Sistema de derivaciones y triage interno
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Gestión de consultorios físicos (Boxes)
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Comité de supervisión y visado ético
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <Check size={14} className="text-primary shrink-0" /> Métricas de rendimiento de la clínica
                    </li>
                  </ul>
                </div>

                <a
                  href={getWhatsappPlanLink("Plan Clínica / Empresa", "S/ 189/mes")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-input bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                >
                  <MessageCircle size={15} className="text-emerald-600" />
                  <span>Activar por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* PAYMENT METHODS & ACTIVATION CALLOUT */}
            <div className="rounded-3xl border-2 border-primary/20 bg-secondary/40 p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Smartphone size={20} className="text-primary" />
                    Métodos de Pago Aceptados en Perú y Latinoamérica
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    La activación se realiza de manera 100% directa y personalizada conmigo por WhatsApp.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-xl border bg-card px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs">
                    📱 Yape
                  </span>
                  <span className="rounded-xl border bg-card px-3 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 shadow-2xs">
                    📱 Plin
                  </span>
                  <span className="rounded-xl border bg-card px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
                    💳 Visa / Mastercard
                  </span>
                  <span className="rounded-xl border bg-card px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-2xs">
                    🏦 Transferencia BCP / BBVA
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">1. Eliges tu Plan</span>
                  <p>Haces clic en &apos;Activar por WhatsApp&apos; y nos escribes con el plan seleccionado.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">2. Pagas Cómodamente</span>
                  <p>Te enviamos el código QR de Yape/Plin o el link para pagar con cualquier tarjeta.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">3. Consultorio Listo en 5 Min</span>
                  <p>Configuramos tu cuenta con tu nombre, colegiatura C.Ps.P. y datos de clínica.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION #faq (PREGUNTAS FRECUENTES PARA SEO) */}
        <section id="faq" className="py-24 border-b bg-muted/20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Preguntas Frecuentes
              </span>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Todo lo que necesitas saber antes de empezar.
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border bg-card overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="text-muted-foreground ml-3">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              ¿Listo para transformar la gestión de tu práctica psicológica?
            </h2>
            <p className="mx-auto max-w-xl text-sm sm:text-base text-primary-foreground/80 leading-relaxed">
              Únete a las clínicas y psicólogos que ya optimizan sus tiempos clínicos y brindan una experiencia memorable a sus pacientes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/demo"
                className="w-full sm:w-auto rounded-2xl bg-white px-8 py-3.5 text-xs font-bold text-primary shadow-lg hover:bg-white/90 transition-colors"
              >
                Probar Demostración Interactiva
              </Link>
              <a
                href={generalWhatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
              >
                <MessageCircle size={16} />
                <span>Hablar por WhatsApp (Velyon)</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <WelcomeBubble />
      <PublicFooter />
    </div>
  );
}