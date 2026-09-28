import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

// Usamos la clave anon del local como fallback si no existe variable de entorno en Vercel
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Patient = {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  notes: string | null;
  status?: 'activo' | 'inactivo' | 'alta' | 'evaluacion';
  therapeutic_approach?: string;
  consultation_reason?: string;
  emergency_contact?: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  organization_id: string;
  patient_id: string;
  professional_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  modality?: 'presencial' | 'virtual';
  meeting_link?: string;
  notes?: string;
  created_at: string;
  patients?: Patient;
};

export type Session = {
  id: string;
  patient_id: string;
  professional_id: string;
  appointment_id: string | null;
  session_summary: string | null;
  private_notes: string | null;
  session_number?: number;
  emotional_score?: number;
  homework?: string;
  created_at: string;
  patients?: Patient;
};

export type PatientFile = {
  id: string;
  patient_id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  category?: string;
  file_size?: string;
  created_at: string;
};
