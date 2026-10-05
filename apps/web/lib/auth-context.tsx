"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type UserRole = "superadmin" | "admin" | "owner" | "psychologist" | "assistant" | "patient";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  specialty?: string | null;
  license_number?: string | null;
  bio?: string | null;
  office_address?: string | null;
  default_meet_link?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (authUserId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUserId)
        .single();

      if (!error && data) {
        setUser({
          id: data.id,
          email: email,
          full_name: data.full_name || email.split("@")[0],
          role: data.role || "owner",
          avatar_url: data.avatar_url,
          phone: data.phone,
          specialty: data.specialty,
          license_number: data.license_number,
          bio: data.bio,
          office_address: data.office_address,
          default_meet_link: data.default_meet_link,
        });
      } else {
        // Usuario autenticado pero sin registro en profiles aún
        setUser({
          id: authUserId,
          email: email,
          full_name: email.split("@")[0],
          role: "owner",
        });
      }
    } catch (err) {
      console.error("[Auth] Error fetching profile:", err);
      setUser({
        id: authUserId,
        email: email,
        full_name: email.split("@")[0],
        role: "owner",
      });
    }
  };

  useEffect(() => {
    // 1. Verificar sesión activa exclusivamente en Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || "").finally(() => {
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // 2. Suscribirse a cambios de estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || "");
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.trim();

    try {
      // Autenticación real con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await fetchProfile(data.user.id, data.user.email || "");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    // En la nueva arquitectura, el modo demo está completamente aislado
    // y vive en /demo sin requerir sesión ni modificar Supabase.
    router.push("/demo");
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Auth] Error during signOut:", err);
    }
    setUser(null);
    setLoading(false);
    router.push("/iniciar-sesion");
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginDemo,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
