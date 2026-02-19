import { Suspense } from "react";

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="p-4">Загрузка...</div>}>{children}</Suspense>;
}
