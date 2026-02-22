"use client";

import { Suspense } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-transparent sticky top-0 z-50">
      <SidebarTrigger />
      <Suspense fallback={null}>
        <div className="min-w-0 flex items-center">
          <AppBreadcrumbs />
        </div>
      </Suspense>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
