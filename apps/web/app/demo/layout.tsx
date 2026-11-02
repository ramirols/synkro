"use client";

import { ClinicalDataProvider } from "@/lib/clinical-context";
import { SubscriptionProvider } from "@/lib/subscription-context";
import { SidebarProvider, useSidebarLayout } from "@/lib/sidebar-context";
import Sidebar from "@/components/software/sidebar";
import MobileSidebar from "@/components/software/mobile-sidebar";
import Topbar from "@/components/software/topbar";
import DemoBanner from "@/components/software/demo-banner";
import DemoReadonlyModal from "@/components/software/demo-readonly-modal";

function DemoLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarLayout();

  return (
    <div className="min-h-screen bg-background">
      <DemoReadonlyModal />
      <MobileSidebar />
      <div className="flex">
        <Sidebar />

        <div
          className={`flex-1 min-w-0 flex flex-col min-h-screen transition-[margin] duration-200 ease-in-out ${
            isCollapsed ? "lg:ml-20" : "lg:ml-72"
          }`}
        >
          <DemoBanner />
          <Topbar />

          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 flex-1 min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicalDataProvider mode="demo">
      <SubscriptionProvider>
        <SidebarProvider>
          <DemoLayoutContent>{children}</DemoLayoutContent>
        </SidebarProvider>
      </SubscriptionProvider>
    </ClinicalDataProvider>
  );
}
