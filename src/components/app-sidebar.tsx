"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { GraduationCap, Briefcase, FileText, BarChart3, ChevronDown, ChevronRight, Compass } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

const UNIVERSITY_SUBLINES = [
  { key: "drp", label: "ДРП", href: "/universities?tab=universities&line=drp&lineTab=overview" },
  { key: "bko", label: "БКО", href: "/universities?tab=universities&line=bko&lineTab=overview" },
  { key: "ecosystem", label: "Экосистема", href: "/universities?tab=universities&line=ecosystem&lineTab=overview" },
  { key: "cntr", label: "ЦНТР", href: "/universities?tab=universities&line=cntr&lineTab=overview" },
  { key: "dkm", label: "ДКМ", href: "/universities?tab=universities&line=dkm&lineTab=overview" },
] as const;

const navItems = [
  { href: "/universities?tab=universities", label: "ВУЗы", tab: "universities", icon: GraduationCap },
  { href: "/universities?tab=internships", label: "Стажировки", tab: "internships", icon: Briefcase },
  { href: "/universities?tab=reporting", label: "Отчетность", tab: "reporting", icon: FileText },
  { href: "/universities?tab=dashboard", label: "Дэшборд", tab: "dashboard", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCollapsed = state === "collapsed";
  const currentTab = searchParams.get("tab") ?? "universities";
  const activeLine = searchParams.get("line");

  const isOnUniversitiesTab = pathname === "/universities" && currentTab === "universities";
  const isProforientation = pathname === "/proforientation";
  const [isUniversitiesOpen, setIsUniversitiesOpen] = React.useState(isOnUniversitiesTab && !!activeLine);

  React.useEffect(() => {
    if (isOnUniversitiesTab && activeLine) {
      setIsUniversitiesOpen(true);
    }
  }, [isOnUniversitiesTab, activeLine]);

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
              ППРСВУЗ
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Работа с ВУЗами</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map(({ href, label, tab, icon: Icon }) => {
                if (tab === "universities") {
                  return (
                    <SidebarMenuItem key={tab}>
                      <SidebarMenuButton
                        tooltip={label}
                        className="gap-2"
                        isActive={isOnUniversitiesTab}
                        onClick={() => setIsUniversitiesOpen((prev) => !prev)}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="inline-flex items-center gap-1">
                          <span>{label}</span>
                          {isUniversitiesOpen ? (
                            <ChevronDown className="size-3 shrink-0" />
                          ) : (
                            <ChevronRight className="size-3 shrink-0" />
                          )}
                        </span>
                      </SidebarMenuButton>

                      {isUniversitiesOpen && (
                        <SidebarMenuSub>
                          {UNIVERSITY_SUBLINES.map((sub) => (
                            <SidebarMenuSubItem key={sub.key}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={activeLine === sub.key}
                              >
                                <Link href={sub.href}>{sub.label}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={tab}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/universities" && currentTab === tab}
                      tooltip={label}
                    >
                      <Link href={href}>
                        <Icon className="size-4 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Сотрудникам</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isProforientation} tooltip="Профориентация">
                  <Link href="/proforientation">
                    <Compass className="size-4 shrink-0" />
                    <span>Профориентация</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
