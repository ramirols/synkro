"use client";

import { createContext, useContext, ReactNode } from "react";
import { IClinicalDataService } from "@/lib/types/clinical";
import { DemoClinicalDataService } from "@/lib/demo/clinical-data";
import { ProductionClinicalDataService } from "@/lib/supabase/clinical-data";
import { DEMO_PROFILE, DemoStorage } from "@/lib/demo/demo-storage";
import { useAuth, UserProfile } from "@/lib/auth-context";

interface ClinicalDataContextType {
  isDemo: boolean;
  basePath: string; // "/demo" en modo demostración, "" en modo real/producción
  service: IClinicalDataService;
  user: UserProfile | null;
  resetDemoData?: () => void;
}

const ClinicalDataContext = createContext<ClinicalDataContextType | undefined>(
  undefined
);

export function ClinicalDataProvider({
  mode,
  children,
}: {
  mode: "demo" | "production";
  children: ReactNode;
}) {
  const { user: authUser } = useAuth();

  const isDemo = mode === "demo";
  const basePath = isDemo ? "/demo" : "";
  const service = isDemo
    ? DemoClinicalDataService
    : ProductionClinicalDataService;

  const user: UserProfile | null = isDemo
    ? (DEMO_PROFILE as UserProfile)
    : authUser;

  const resetDemoData = isDemo
    ? () => {
        DemoStorage.resetAll();
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    : undefined;

  return (
    <ClinicalDataContext.Provider
      value={{
        isDemo,
        basePath,
        service,
        user,
        resetDemoData,
      }}
    >
      {children}
    </ClinicalDataContext.Provider>
  );
}

export function useClinicalData() {
  const context = useContext(ClinicalDataContext);
  if (!context) {
    throw new Error(
      "useClinicalData must be used within a ClinicalDataProvider"
    );
  }
  return context;
}
