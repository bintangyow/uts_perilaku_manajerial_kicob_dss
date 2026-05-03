"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Wrench,
  FolderKanban,
  ClipboardCheck,
  Sparkles,
  History,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import type { RoleName } from "@/lib/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: RoleName[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ["admin", "manager", "hr", "reviewer"],
  },
  {
    title: "Karyawan",
    href: "/karyawan",
    icon: <Users className="w-4 h-4" />,
    roles: ["admin", "hr", "manager"],
  },
  {
    title: "Skills",
    href: "/skills",
    icon: <Wrench className="w-4 h-4" />,
    roles: ["admin", "hr"],
  },
  {
    title: "Proyek",
    href: "/proyek",
    icon: <FolderKanban className="w-4 h-4" />,
    roles: ["admin", "manager"],
  },
  {
    title: "Assessment",
    href: "/assessment",
    icon: <ClipboardCheck className="w-4 h-4" />,
    roles: ["admin", "manager", "reviewer"],
  },
  {
    title: "Rekomendasi",
    href: "/rekomendasi",
    icon: <Sparkles className="w-4 h-4" />,
    roles: ["admin", "manager"],
  },
  {
    title: "Riwayat",
    href: "/riwayat",
    icon: <History className="w-4 h-4" />,
    roles: ["admin", "manager"],
  },
  {
    title: "Pengaturan",
    href: "/pengaturan",
    icon: <Settings className="w-4 h-4" />,
    roles: ["admin"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const filteredNav = navItems.filter(
    (item) =>
      currentUser && item.roles.includes(currentUser.role as RoleName)
  );

  return (
    <Sidebar className="glass-sidebar border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 rounded-xl glow-button flex items-center justify-center"
          >
            <Users className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-gradient">KiCob</h2>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Team DSS
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground/60 uppercase tracking-wider px-3 mb-1">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNav.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className={`
                        relative rounded-xl h-10 transition-all duration-200
                        ${
                          isActive
                            ? "bg-primary/15 text-primary border border-primary/20 shadow-[0_0_12px_oklch(0.5_0.2_260/20%)]"
                            : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        {item.icon}
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </motion.div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-accent/10 transition-colors" />
              }
            >
                <Avatar className="w-9 h-9 border border-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentUser.name}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20"
                  >
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </Badge>
                </div>
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className="w-56 glass-card border-border/30"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-border/30" />
                onClick={async () => {
                  await logout();
                  // Gunakan replace agar history login tidak bisa di-back
                  window.location.replace("/login");
                }}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
