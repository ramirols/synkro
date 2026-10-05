"use client";

import { ClinicalDataProvider } from "@/lib/clinical-context";
import Sidebar from "@/components/software/sidebar";
import Topbar from "@/components/software/topbar";
import DemoBanner from "@/components/software/demo-banner";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicalDataProvider mode="demo">
      <div className="min-h-screen bg-background">
        <DemoBanner />
        <div className="flex">
          <Sidebar />

          <div className="flex-1 lg:ml-72">
            <Topbar />

            <main className="px-6 py-8 lg:px-10">{children}</main>
          </div>
        </div>
      </div>
    </ClinicalDataProvider>
  );
}
