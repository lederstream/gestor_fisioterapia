"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, AuthUser } from "@/lib/auth-context";
import { ConfiguracionClinicaItem } from "@/lib/store";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

interface DashboardShellProps {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialConfig?: ConfiguracionClinicaItem;
}

function ShellInner({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: ConfiguracionClinicaItem;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar whenever route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar (Responsive drawer on mobile, static on desktop) */}
      <DashboardSidebar
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        initialConfig={initialConfig}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar
          onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
          initialConfig={initialConfig}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children, initialUser, initialConfig }: DashboardShellProps) {
  return (
    <AuthProvider initialUser={initialUser}>
      <ShellInner initialConfig={initialConfig}>{children}</ShellInner>
    </AuthProvider>
  );
}
