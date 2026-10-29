"use client";

import { ClinicalDataProvider } from "@/lib/clinical-context";
import { SubscriptionProvider } from "@/lib/subscription-context";
import Sidebar from "@/components/software/sidebar";
import Topbar from "@/components/software/topbar";
import DemoBanner from "@/components/software/demo-banner";
import DemoReadonlyModal from "@/components/software/demo-readonly-modal";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicalDataProvider mode="demo">
      <SubscriptionProvider>
        <div className="min-h-screen bg-background">
          <DemoReadonlyModal />
          <div className="flex">
            <Sidebar />

            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
              <DemoBanner />
              <Topbar />

              <main className="px-6 py-8 lg:px-10 flex-1">{children}</main>
            </div>
          </div>
        </div>
      </SubscriptionProvider>
    </ClinicalDataProvider>
  );
}
