"use client";

import { useEffect, useCallback } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/lib/auth-context";

export function useGuidedTour() {
  const { user } = useAuth();
  const storageKey = user ? `synkro_tour_completed_${user.id}` : "synkro_tour_completed_guest";

  const startTour = useCallback(() => {
    const steps: DriveStep[] = [
      {
        element: "#tour-brand-header",
        popover: {
          title: "Bienvenido a Synkro by VelyonSoft",
          description:
            "Tu SaaS clínico diseñado específicamente para psicólogos y centros de salud mental en Perú y Latinoamérica.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-nav-dashboard",
        popover: {
          title: "1. Dashboard Clínico",
          description:
            "Monitorea en tiempo real tus citas del día, pacientes activos, sesiones recientes y documentos clínicos.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-nav-pacientes",
        popover: {
          title: "2. Expedientes y Portal de Pacientes",
          description:
            "Gestiona historias clínicas completas, motivos de consulta, contactos de emergencia y genera invitaciones seguras con token para el Portal del Paciente.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-nav-agenda",
        popover: {
          title: "3. Agenda y Citas",
          description:
            "Programa sesiones presenciales o virtuales con enlaces directos de videoconsulta.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-nav-sesiones",
        popover: {
          title: "4. Notas Clínicas Confidenciales",
          description:
            "Doble capa de confidencialidad: notas privadas blindadas (solo visibles para ti) y resúmenes compartibles de evolución.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-nav-documentos",
        popover: {
          title: "5. Bóveda Documental Cifrada",
          description:
            "Almacena evaluaciones psicométricas, consentimientos y reportes (hasta 15 MB) con URLs firmadas temporales.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-nav-suscripcion",
        popover: {
          title: "6. Suscripción y Renovación",
          description:
            "Controla tus 14 días de prueba, límites reales según tu plan y gestiona tu activación transparente con Yape o transferencia.",
          side: "right",
          align: "start",
        },
      },
    ];

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Empezar a trabajar!",
      steps,
      onDestroyStarted: () => {
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, "true");
        }
        driverObj.destroy();
      },
    });

    driverObj.drive();
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ejecutar tour automáticamente solo la primera vez que el usuario ingresa
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      const timer = setTimeout(() => {
        startTour();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [storageKey, startTour]);

  return { startTour };
}

export default function GuidedTourButton() {
  const { startTour } = useGuidedTour();

  return (
    <button
      type="button"
      onClick={startTour}
      className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs cursor-pointer"
      title="Iniciar tour guiado interactivo"
    >
      <span>Tour Guiado</span>
    </button>
  );
}

