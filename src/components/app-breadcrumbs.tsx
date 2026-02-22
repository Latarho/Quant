"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";

/** Русские подписи для сегментов пути и вкладок */
const ROOT_LABEL = "Платформа по работе с ВУЗами";
const SEGMENT_LABELS: Record<string, string> = {
  universities: ROOT_LABEL,
  internship: "Стажировки",
};

const TAB_LABELS: Record<string, string> = {
  universities: "Справочник ВУЗов",
  internships: "Стажировки",
  reporting: "Отчётность",
  dashboard: "Дэшборд",
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { customLabel } = useBreadcrumb();
  const tab = searchParams.get("tab");

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const items: { href: string | null; label: string }[] = [];

  if (segments[0] === "universities") {
    if (segments[1] === "internship" && segments[2]) {
      items.push({ href: "/universities", label: SEGMENT_LABELS.universities ?? ROOT_LABEL });
      items.push({ href: "/universities?tab=internships", label: SEGMENT_LABELS.internship });
      items.push({ href: null, label: customLabel ?? "Стажировка" });
    } else {
      items.push({ href: "/universities", label: SEGMENT_LABELS.universities ?? ROOT_LABEL });
      if (tab && TAB_LABELS[tab]) {
        items.push({ href: null, label: TAB_LABELS[tab] });
      } else {
        items[0] = { href: null, label: ROOT_LABEL };
      }
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <span key={index} className="contents">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href !== null && index < items.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
