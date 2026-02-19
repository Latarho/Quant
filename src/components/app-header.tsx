"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-transparent sticky top-0 z-50">
      <SidebarTrigger />
      <Link href="/universities" className="font-semibold text-lg hover:opacity-80">
        Платформа по работе с ВУЗами
      </Link>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
