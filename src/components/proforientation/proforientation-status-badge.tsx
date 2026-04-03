"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BADGE_COLORS, getStatusBadgeColor } from "@/lib/badge-colors";
import type { ProforientationApplication } from "@/lib/proforientation/types";
import { cn } from "@/lib/utils";

export const STATUS_LABEL: Record<ProforientationApplication["status"], string> = {
  created: "Создана",
  in_progress: "В процессе",
  completed: "Завершена",
};

const IN_PROGRESS_STATUS_TOOLTIP =
  "Заявка в работе у ДРП. После завершения здесь появятся результаты и PDF.";

export function ApplicationStatusBadge({
  status,
  tone = "default",
}: {
  status: ProforientationApplication["status"];
  /** «yellow» — жёлтый тег (например в шапке страницы заявки) */
  tone?: "default" | "yellow";
}) {
  const colorClass = tone === "yellow" ? BADGE_COLORS.inProgress : getStatusBadgeColor(status);
  const badge = (
    <Badge variant="outline" className={cn("shrink-0 text-sm font-medium", colorClass)}>
      {STATUS_LABEL[status]}
    </Badge>
  );
  if (status !== "in_progress") return badge;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex max-w-full cursor-default">{badge}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-pretty">
        {IN_PROGRESS_STATUS_TOOLTIP}
      </TooltipContent>
    </Tooltip>
  );
}
