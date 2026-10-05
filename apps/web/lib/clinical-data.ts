/**
 * @deprecated Este archivo servía como servicio híbrido.
 * Ahora la arquitectura está completamente separada:
 * - Modo Demo: import { DemoClinicalDataService } from "@/lib/demo/clinical-data";
 * - Modo Real: import { ProductionClinicalDataService } from "@/lib/supabase/clinical-data";
 *
 * Para compatibilidad regresiva con imports existentes en modo producción,
 * re-exportamos ProductionClinicalDataService como ClinicalDataService (sin fallbacks demo).
 */

export { ProductionClinicalDataService as ClinicalDataService } from "./supabase/clinical-data";
export {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_SESSIONS,
  INITIAL_FILES,
  DEMO_PROFILE,
  DemoStorage,
} from "./demo/demo-storage";
export * from "./types/clinical";
