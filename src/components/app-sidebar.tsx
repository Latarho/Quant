"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { GraduationCap, Briefcase, FileText, BarChart3 } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems: { href: string; label: string; tab: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/universities?tab=universities", label: "ВУЗы", tab: "universities", icon: GraduationCap },
  { href: "/universities?tab=internships", label: "Стажировки", tab: "internships", icon: Briefcase },
  { href: "/universities?tab=reporting", label: "Отчетность", tab: "reporting", icon: FileText },
  { href: "/universities?tab=dashboard", label: "Дэшборд", tab: "dashboard", icon: BarChart3 },
];

/**
 * Боковая панель приложения «КАМПУС» — навигация по разделам
 */
export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCollapsed = React.useMemo(() => state === "collapsed", [state]);
  const currentTab = searchParams.get("tab") ?? "universities";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16 px-1 py-0 pb-0 relative flex items-center">
        <Link
          href="/universities"
          className="flex items-center gap-2 justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:h-full w-full hover:opacity-80 transition-opacity pb-0"
        >
          <div className="flex aspect-square h-10 w-10 group-data-[collapsible=icon]:size-9 items-center justify-center rounded-lg border-2 border-sidebar-border bg-sidebar-accent/50 overflow-hidden shrink-0 relative">
            <Image
              src="/b75f0527-1296-45d0-9735-a2f30de0e17d.png"
              alt="Logo"
              fill
              className="object-cover"
              priority
              sizes="40px"
              unoptimized
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xl font-bold text-sidebar-foreground">
              КАМПУС
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-4 py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
        <SidebarMenu className="gap-3 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:max-w-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3">
          {navItems.map(({ href, label, tab, icon: Icon }) => (
            <SidebarMenuItem key={tab}>
              <SidebarMenuButton asChild isActive={pathname === "/universities" && currentTab === tab} tooltip={label} >
                <Link href={href}>
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground/60">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Система активна</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
