"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useProforientation } from "@/contexts/proforientation-context";
import { Button } from "@/components/ui/button";
import { ProforientationApplicationDetailBody } from "@/components/proforientation/proforientation-application-detail";
import { ApplicationStatusBadge } from "@/components/proforientation/proforientation-status-badge";
import { openResultsPrintWindow } from "@/lib/proforientation/print-pdf";
import { formatDateTimeShortRu } from "@/lib/date-utils";
import { ArrowLeft, Calendar, FileDown } from "lucide-react";

export default function ProforientationApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { applications } = useProforientation();
  const { setCustomLabel } = useBreadcrumb();

  const application = useMemo(() => applications.find((a) => a.id === id) ?? null, [applications, id]);

  useEffect(() => {
    if (application) {
      setCustomLabel(application.childFullName);
    }
    return () => {
      setCustomLabel(null);
    };
  }, [application, setCustomLabel]);

  if (!application) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2 text-lg font-medium">Заявка не найдена</p>
        <Button variant="outline" onClick={() => router.push("/proforientation")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          К списку заявок
        </Button>
      </div>
    );
  }

  const submittedAt = formatDateTimeShortRu(application.createdAt);

  return (
    <div className="space-y-6">
      {/* Заголовок — как на странице стажировки */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/proforientation")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                {submittedAt}
              </span>
              <ApplicationStatusBadge
                status={application.status}
                tone={application.status === "in_progress" ? "yellow" : "default"}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Заявка на профориентацию</h1>
          </div>
        </div>
        {application.status === "completed" && application.result ? (
          <div className="flex shrink-0 flex-col items-end justify-center">
            <Button className="gap-2" onClick={() => openResultsPrintWindow(application)}>
              <FileDown className="size-4" />
              Открыть PDF (печать)
            </Button>
          </div>
        ) : null}
      </div>
      <ProforientationApplicationDetailBody application={application} />
    </div>
  );
}
