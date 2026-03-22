"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { OracleChatInterface } from "@/components/oracle/oracle-chat-interface";

export default function OraclePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <DashboardSidebar />
        <main className="flex-1 ml-64 h-screen">
          <OracleChatInterface />
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="h-screen">
          <OracleChatInterface />
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}
