"use client";

import { ThemeProvider } from "next-themes";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <BreadcrumbProvider>
        {children}
      </BreadcrumbProvider>
    </ThemeProvider>
  );
}
