"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

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

  // Build breadcrumb with links
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments.map((seg, index) => {
    let label = pathLabels[seg];
    if (!label) {
      label = !isNaN(Number(seg)) ? "Detail" : seg.charAt(0).toUpperCase() + seg.slice(1);
    }
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { label, href };
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
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              KiCob
            </Link>
            {breadcrumbItems.length > 0 && (
              <>
                <span className="text-muted-foreground/40">/</span>
                {breadcrumbItems.map((item, i) => (
                  <span key={i} className="flex items-center">
                    {i > 0 && (
                      <span className="text-muted-foreground/40 mx-1.5">
                        /
                      </span>
                    )}
                    <Link
                      href={item.href}
                      className={
                        i === breadcrumbItems.length - 1
                          ? "text-foreground font-medium pointer-events-none"
                          : "text-muted-foreground hover:text-primary transition-colors"
                      }
                    >
                      {item.label}
                    </Link>
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
