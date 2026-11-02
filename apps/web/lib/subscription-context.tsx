"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  PLANS_CONFIG,
  PlanConfig,
  SubscriptionPlan,
  SubscriptionStatus,
  OrganizationType,
  getPlanConfig,
} from "@/lib/config/plans";

export interface OrgSubscriptionDetails {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_type: OrganizationType;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  effective_status: SubscriptionStatus;
  trial_start_at?: string;
  trial_end_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  last_payment_date?: string;
  payment_method?: string;
  days_remaining: number;
  is_active: boolean;
  patient_count: number;
  professional_count: number;
}

interface SubscriptionContextType {
  subscription: OrgSubscriptionDetails | null;
  loading: boolean;
  error: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  effectiveStatus: SubscriptionStatus;
  planConfig: PlanConfig;
  daysRemaining: number;
  isTrial: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isExpired: boolean;
  isClinic: boolean;
  organizationType: OrganizationType;
  canWrite: boolean;
  refreshSubscription: () => Promise<void>;
  checkPatientLimit: () => { allowed: boolean; current: number; max: number | null; message?: string };
  checkProfessionalLimit: () => { allowed: boolean; current: number; max: number; message?: string };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<OrgSubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemo =
    user?.id === "demo-user-alejandro" ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/demo"));

  const fetchSubscription = useCallback(async () => {
    const inDemoMode =
      user?.id === "demo-user-alejandro" ||
      (typeof window !== "undefined" && window.location.pathname.startsWith("/demo"));

    // Modo Demostración Aislado (100% en memoria / sin Supabase)
    if (inDemoMode) {
      setSubscription({
        id: "demo-subscription-id",
        organization_id: "demo-org-1",
        organization_name: "Centro Psicológico Demo",
        organization_type: "clinic",
        plan: "clinic",
        status: "trialing",
        effective_status: "trialing",
        trial_start_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        trial_end_at: new Date(Date.now() + 12 * 86400000).toISOString(),
        days_remaining: 12,
        is_active: true,
        patient_count: 6,
        professional_count: 4,
      });
      setLoading(false);
      return;
    }

    if (authLoading) return;

    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    if (!user.organization_id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcErr } = await supabase.rpc("get_org_subscription_details", {
        p_org_id: user.organization_id,
      });

      if (rpcErr) {
        throw rpcErr;
      }

      if (data) {
        setSubscription(data as OrgSubscriptionDetails);
      } else {
        setSubscription(null);
      }
    } catch (err: any) {
      console.error("[Subscription] Error loading details:", err);
      setError(err.message || "Error al cargar estado de suscripción");
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, isDemo]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const plan = subscription?.plan || "free";
  const planConfig = getPlanConfig(plan);
  const status = subscription?.status || "trialing";
  const effectiveStatus = subscription?.effective_status || status;
  const daysRemaining = subscription?.days_remaining ?? 14;
  const organizationType: OrganizationType =
    subscription?.organization_type || "independent";
  const isClinic =
    organizationType === "clinic" ||
    plan === "clinic" ||
    (planConfig?.limits?.maxProfessionals ?? 1) > 1;

  const isTrial = effectiveStatus === "trialing";
  const isActive = effectiveStatus === "active";
  const isPastDue = effectiveStatus === "past_due";
  const isExpired = effectiveStatus === "expired" || effectiveStatus === "cancelled";

  // Operaciones de escritura permitidas solo si la suscripción está activa (en prueba válida o pagada)
  const canWrite = subscription ? subscription.is_active : false;

  const checkPatientLimit = () => {
    const current = subscription?.patient_count ?? 0;
    const max = planConfig.limits.maxPatients;
    if (max !== null && current >= max) {
      return {
        allowed: false,
        current,
        max,
        message: `Has alcanzado el límite de ${max} pacientes del ${planConfig.name}. Actualiza tu plan para registrar más pacientes.`,
      };
    }
    return { allowed: true, current, max };
  };

  const checkProfessionalLimit = () => {
    const current = subscription?.professional_count ?? 1;
    const max = planConfig.limits.maxProfessionals;
    if (current >= max) {
      return {
        allowed: false,
        current,
        max,
        message: `Tu ${planConfig.name} admite un máximo de ${max} profesional(es). Para incorporar más terapeutas a tu equipo, actualiza al Plan Clínica.`,
      };
    }
    return { allowed: true, current, max };
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        plan,
        status,
        effectiveStatus,
        planConfig,
        daysRemaining,
        isTrial,
        isActive,
        isPastDue,
        isExpired,
        isClinic,
        organizationType,
        canWrite,
        refreshSubscription: fetchSubscription,
        checkPatientLimit,
        checkProfessionalLimit,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}

