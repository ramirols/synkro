"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  HeartHandshake,
  Calendar,
  Clock,
  Video,
  FileCheck,
  CheckCircle2,
  Brain,
  Sparkles,
  LogOut,
  Phone,
  Shield,
  Smile,
} from "lucide-react";

export default function PortalPacientePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [mood, setMood] = useState(7);
  const [moodRegistered, setMoodRegistered] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  const sharedDocuments = [
    {
      id: "doc-1",
      title: "Consentimiento_Informado_Terapia.pdf",
      category: "Consentimiento Informado",
      date: "24 Septiembre 2026",
      status: "Firmado Digitalmente",
      type: "consent",
    },
    {
      id: "doc-2",
      title: "Inventario_Ansiedad_Beck_BAI.pdf",
      category: "Evaluación Psicométrica",
      date: "25 Septiembre 2026",
      status: "Evaluado por Terapeuta",
      type: "beck",
    },
    {
      id: "doc-3",
      title: "Guia_Respiracion_Diafragmatica_TCC.pdf",
      category: "Material Psicoeducativo",
      date: "26 Septiembre 2026",
      status: "Lectura Asignada",
      type: "guide",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Patient Header */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-card/80 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-base shadow-xs">
            <HeartHandshake size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">
                Portal del Paciente
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Espacio Seguro
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Terapeuta: Lic. Alejandro Mendoza V. (C.Ps.P. 28419)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs font-semibold text-foreground">
            {user?.full_name || "Camila Valdivia"}
          </span>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-2xs"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl border border-primary/20 bg-secondary/40 p-6 lg:p-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles size={16} /> Tu espacio de crecimiento y bienestar
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Hola, {user?.full_name?.split(" ")[0] || "Camila"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Aquí puedes consultar tus próximas sesiones, revisar tus tareas intersesión y visualizar todos los documentos clínicos compartidos por tu psicólogo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card: Próxima Cita */}
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" /> PRÓXIMA SESIÓN
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                Confirmada
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Sesión 5: Evaluación y Reestructuración Cognitiva
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Clock size={13} className="text-primary" /> Hoy a las 09:00 hrs
                </span>
                <span className="flex items-center gap-1">
                  <Video size={13} className="text-sky-600" /> Modalidad Telepsicología
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://meet.google.com/syn-kro-vely"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
              >
                <Video size={16} />
                <span>Entrar a la Sala Virtual (Google Meet)</span>
              </a>
            </div>
          </div>

          {/* Card: Tarea Intersesión */}
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Brain size={14} className="text-primary" /> TAREA TERAPÉUTICA ASIGNADA
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                En Curso
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">
                Autorregistro de Pensamientos Automáticos (TCC)
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                &quot;Completar las 4 columnas (Situación, Emoción, Pensamiento Automático, Respuesta Racional) cuando experimentes activación fisiológica laboral.&quot;
              </p>
            </div>

            <button
              onClick={() => setTaskDone(!taskDone)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all ${taskDone
                  ? "bg-emerald-500 text-white"
                  : "border border-input bg-card text-foreground hover:bg-muted"
                }`}
            >
              <CheckCircle2 size={16} />
              <span>{taskDone ? "¡Tarea Realizada con Éxito!" : "Marcar como Realizada"}</span>
            </button>
          </div>
        </div>

        {/* Card: Registro Diario de Ánimo */}
        <div className="rounded-3xl border bg-card p-6 lg:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                ¿Cómo te has sentido el día de hoy?
              </h2>
              <p className="text-xs text-muted-foreground">
                Tu registro ayuda a tu terapeuta a preparar mejor tu siguiente consulta.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Nivel: {mood} / 10
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => {
                setMood(Number(e.target.value));
                setMoodRegistered(false);
              }}
              className="w-full accent-primary h-2"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
              <span>1 (Muy abrumada / Ansiedad alta)</span>
              <span>5 (Neutral)</span>
              <span>10 (Tranquila / Plena)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {moodRegistered ? "✓ Registrado para tu terapeuta" : "Desliza para actualizar"}
            </span>
            <button
              onClick={() => setMoodRegistered(true)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-xs"
            >
              {moodRegistered ? "Actualizado" : "Guardar Registro"}
            </button>
          </div>
        </div>

        {/* Documents & Emergency */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Documents Section with in-app viewer */}
          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck size={16} className="text-primary" /> Documentos Compartidos
              </h3>
              <span className="text-[11px] text-muted-foreground">Haz clic para leer</span>
            </div>

            <div className="space-y-2.5">
              {sharedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setViewingDoc(doc)}
                  className="flex items-center justify-between rounded-2xl border bg-background/50 p-3.5 hover:border-primary/40 hover:bg-secondary/20 transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block">
                      {doc.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {doc.category} • {doc.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                      {doc.status}
                    </span>
                    <span className="rounded-lg bg-secondary p-1 text-primary group-hover:scale-105 transition-transform">
                      <FileCheck size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield size={16} className="text-emerald-600" /> Líneas de Asistencia
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              En caso de emergencia emocional o crisis aguda fuera de horario de consulta:
            </p>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">Línea 113 Salud (Opción 5) - Perú</span>
              <span className="text-[11px]">Atención psicológica gratuita las 24 horas.</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Recuerda que este espacio no reemplaza una atención médica de urgencias en hospital o clínica.
            </p>
          </div>
        </div>
      </main>

      {/* Modal: Visor de Documentos In-App para el Paciente */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            {/* Header del Visor */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary">
                  {viewingDoc.category}
                </span>
                <h2 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
                  {viewingDoc.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Emitido por Lic. Alejandro Mendoza V. (C.Ps.P. 28419) • Paciente: Camila Valdivia
                </p>
              </div>

              <button
                onClick={() => setViewingDoc(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido Visual del Documento */}
            <div className="flex-1 overflow-y-auto rounded-2xl border bg-background p-6 space-y-5 text-xs text-muted-foreground leading-relaxed">
              <div className="border-b pb-4 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Centro Psicológico Synkro
                </span>
                <h3 className="mt-1 font-serif text-base font-bold text-foreground">
                  {viewingDoc.title.replace(".pdf", "").replace(/_/g, " ")}
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Fecha de registro: {viewingDoc.date}
                </span>
              </div>

              {viewingDoc.type === "consent" ? (
                <div className="space-y-4 font-serif">
                  <p>
                    Por medio del presente documento, yo,{" "}
                    <strong className="text-foreground">Camila Valdivia Flores</strong>, identificada con DNI 72918234, declaro haber sido informada de manera clara y comprensible sobre la naturaleza del proceso psicoterapéutico bajo el enfoque Cognitivo Conductual (TCC).
                  </p>
                  <p>
                    <strong className="text-foreground">Confidencialidad:</strong> Toda la información compartida durante las sesiones se encuentra protegida bajo estricto secreto profesional conforme al Código de Ética del Colegio de Psicólogos del Perú (Ley N° 28369).
                  </p>
                  <p>
                    <strong className="text-foreground">Excepciones legales a la confidencialidad:</strong> Riesgo inminente contra la propia integridad física del paciente, riesgo para terceras personas o requerimiento judicial expreso.
                  </p>
                  <p>
                    <strong className="text-foreground">Telepsicología:</strong> Acepto el uso de la plataforma Synkro y enlaces seguros de Google Meet para sesiones a distancia, comprometiéndome a contar con un espacio privado y sin interrupciones.
                  </p>

                  <div className="mt-6 rounded-2xl border bg-card p-4 space-y-2 font-sans">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                      <CheckCircle2 size={16} /> Firma Electrónica Verificada
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Firmado digitalmente por el paciente el 24/09/2026 10:14 hrs. Hash criptográfico registrado en Supabase Synkro.
                    </p>
                  </div>
                </div>
              ) : viewingDoc.type === "beck" ? (
                <div className="space-y-4 font-sans">
                  <p>
                    <strong className="text-foreground">Instrumento:</strong> Inventario de Ansiedad de Beck (BAI - Beck Anxiety Inventory). Consta de 21 ítems que evalúan la severidad de síntomas somáticos y cognitivos de ansiedad.
                  </p>

                  <div className="rounded-2xl border bg-card p-4 space-y-3">
                    <div className="flex justify-between font-bold text-foreground border-b pb-2">
                      <span>Puntaje Total Obtenido:</span>
                      <span className="text-primary text-base">28 / 63 puntos</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Categoría Diagnóstica:</span>
                      <span className="text-amber-600 font-bold">Ansiedad Moderada a Severa</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>• Palpitaciones / Taquicardia: Severo</div>
                      <div>• Tensión muscular: Severo</div>
                      <div>• Sensación de ahogo: Moderado</div>
                      <div>• Temor a perder el control: Moderado</div>
                    </div>
                  </div>

                  <p>
                    <strong className="text-foreground">Plan de Intervención:</strong> Protocolo de reestructuración cognitiva, respiración diafragmática 4-7-8 y técnica de desensibilización sistemática interoceptiva.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  <p>
                    <strong className="text-foreground">Técnica de Respiración Diafragmática (4-7-8):</strong>
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-xs">
                    <li>Inhala silenciosamente por la nariz durante 4 segundos.</li>
                    <li>Mantén la respiración en tus pulmones por 7 segundos.</li>
                    <li>Exhala completamente por la boca haciendo un sonido suave durante 8 segundos.</li>
                    <li>Repite este ciclo de 4 a 6 veces cuando sientas aceleración cardíaca o rumiación mental.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Acciones del Visor */}
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-600" />
                Documento Cifrado y Protegido
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
                >
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
