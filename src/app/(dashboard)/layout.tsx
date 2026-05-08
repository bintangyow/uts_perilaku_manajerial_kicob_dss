"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// Breadcrumb label mapping
const pathLabels: Record<string, string> = {
  "": "Dashboard",
  karyawan: "Karyawan",
  skills: "Skills",
  proyek: "Proyek",
  assessment: "Assessment",
  rekomendasi: "Rekomendasi",
  riwayat: "Riwayat",
  pengaturan: "Pengaturan",
  profil: "Profil",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Build breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments.map((seg) => {
    if (pathLabels[seg]) return pathLabels[seg];
    // If segment is a number (ID), show "Detail" instead of the raw number
    if (!isNaN(Number(seg))) return "Detail";
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top header bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 h-14 px-4 bg-[oklch(0.11_0.03_260)] border-b border-border/20">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground -ml-1" />
          <Separator
            orientation="vertical"
            className="h-5 bg-border/30"
          />
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">KiCob</span>
            {breadcrumbItems.length > 0 && (
              <>
                <span className="text-muted-foreground/40">/</span>
                {breadcrumbItems.map((label, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className="text-muted-foreground/40 mx-1.5">
                        /
                      </span>
                    )}
                    <span
                      className={
                        i === breadcrumbItems.length - 1
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {label}
                    </span>
                  </span>
                ))}
              </>
            )}
            {breadcrumbItems.length === 0 && (
              <>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-foreground font-medium">Dashboard</span>
              </>
            )}
          </nav>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
