"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  loginDemo: (role: "psychologist" | "patient" | "admin") => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (authUserId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUserId)
        .single();

      if (data) {
        setUser({
          id: data.id,
          email: email,
          full_name: data.full_name || "Usuario Synkro",
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
        // Fallback default
        setUser({
          id: authUserId,
          email: email,
          full_name: "Lic. Alejandro Mendoza V.",
          role: "owner",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || "");
      } else {
        // En modo desarrollo / demo si no hay sesión, permitir datos
        setUser(null);
      }
      setLoading(false);
    });

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    if (data.user) {
      await fetchProfile(data.user.id, data.user.email || "");
    }
    setLoading(false);
  };

  const loginDemo = async (role: "psychologist" | "patient" | "admin") => {
    setLoading(true);
    let email = "demo@synkro.com";
    let pass = "demo123456";
    let target = "/dashboard";

    if (role === "admin") {
      email = "admin@velyonsoft.com";
      pass = "admin123456";
      target = "/configuracion?tab=admin";
    } else if (role === "patient") {
      email = "paciente@synkro.com";
      pass = "paciente123456";
      target = "/portal-paciente";
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email || "");
      }
      router.push(target);
    } catch (err: any) {
      console.error("Demo login error:", err);
      // Fallback redirect if local auth token exists
      router.push(target);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
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
