import { Suspense } from "react";
import { InternshipsProvider } from "@/contexts/internships-context";

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InternshipsProvider>
      <Suspense fallback={<div className="p-4">Загрузка...</div>}>{children}</Suspense>
    </InternshipsProvider>
  );
}
