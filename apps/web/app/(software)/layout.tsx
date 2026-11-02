"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ClinicalDataProvider } from "@/lib/clinical-context";
import { SubscriptionProvider } from "@/lib/subscription-context";
import { SidebarProvider, useSidebarLayout } from "@/lib/sidebar-context";
import Sidebar from "@/components/software/sidebar";
import MobileSidebar from "@/components/software/mobile-sidebar";
import Topbar from "@/components/software/topbar";
import SubscriptionBanner from "@/components/software/subscription-banner";

function SoftwareLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarLayout();

  return (
    <div className="min-h-screen bg-background">
      <MobileSidebar />
      <div className="flex">
        <Sidebar />

        <div
          className={`flex-1 min-w-0 transition-[margin] duration-200 ease-in-out ${
            isCollapsed ? "lg:ml-20" : "lg:ml-72"
          }`}
        >
          <Topbar />

          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 min-w-0 overflow-x-hidden">
            <SubscriptionBanner />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/iniciar-sesion");
      } else if (user.role === "patient") {
        router.push("/portal-paciente");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground animate-pulse">
            Cargando entorno clínico seguro...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ClinicalDataProvider mode="production">
      <SubscriptionProvider>
        <SidebarProvider>
          <SoftwareLayoutContent>{children}</SoftwareLayoutContent>
        </SidebarProvider>
      </SubscriptionProvider>
    </ClinicalDataProvider>
  );
}
