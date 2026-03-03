import { Suspense } from "react";
import { InternshipsProvider } from "@/contexts/internships-context";
import { InternshipExtraProvider } from "@/contexts/internship-extra-context";

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InternshipsProvider>
      <InternshipExtraProvider>
        <Suspense fallback={<div className="p-4">Загрузка...</div>}>{children}</Suspense>
      </InternshipExtraProvider>
    </InternshipsProvider>
  );
}
