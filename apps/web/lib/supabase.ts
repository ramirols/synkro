import { createClient } from "@supabase/supabase-js";
export * from "./types/clinical";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== "undefined") {
    console.warn(
      "[Synkro] Variables de entorno de Supabase no detectadas. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
}

// Cliente de Supabase para producción
// Nota: no se usan claves secretas ni tokens JWT hardcodeados en el código fuente.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
