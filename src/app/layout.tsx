import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppProviders } from "@/components/app-providers";
import { AppHeader } from "@/components/app-header";
import { AuroraBackground } from "@/components/aurora-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Платформа по работе с ВУЗами",
  description: "Единая платформа по работе с ВУЗами — справочник, договоры, мероприятия, стажировки",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased h-screen overflow-hidden`}>
        <AppProviders>
          <SidebarProvider>
            <Suspense fallback={null}>
              <AppSidebar />
            </Suspense>
            <SidebarInset className="h-screen z-0 flex flex-col overflow-hidden">
              <AuroraBackground className="flex-1 w-full min-h-0 overflow-hidden flex flex-col">
                <AppHeader />
                <div className="flex flex-1 flex-col min-h-0 gap-4 p-4 pt-2 overflow-y-auto">
                  {children}
                </div>
              </AuroraBackground>
            </SidebarInset>
          </SidebarProvider>
        </AppProviders>
      </body>
    </html>
  );
}
