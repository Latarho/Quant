"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardEventPeriod } from "@/lib/dashboard";

interface DashboardToolbarProps {
  /** Уникальный суффикс для id полей (несколько экземпляров на странице) */
  instanceId: string;
  eventPeriod: DashboardEventPeriod;
  onEventPeriodChange: (p: DashboardEventPeriod) => void;
  yearOptions: number[];
  onExport: () => void;
  exporting: boolean;
}

export function DashboardToolbar({
  instanceId,
  eventPeriod,
  onEventPeriodChange,
  yearOptions,
  onExport,
  exporting,
}: DashboardToolbarProps) {
  const selectValue =
    eventPeriod.mode === "all" ? "all" : String(eventPeriod.year);
  const fieldId = `dashboard-event-period-${instanceId}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <Label htmlFor={fieldId}>Период для мероприятий</Label>
        <Select
          value={selectValue}
          onValueChange={(v) => {
            if (v === "all") onEventPeriodChange({ mode: "all" });
            else onEventPeriodChange({ mode: "year", year: parseInt(v, 10) });
          }}
        >
          <SelectTrigger id={fieldId} className="w-[220px]">
            <SelectValue placeholder="Выберите период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все годы</SelectItem>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
                {y === new Date().getFullYear() ? " (текущий)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={exporting}
        onClick={onExport}
      >
        <Download data-icon="inline-start" />
        {exporting ? "Формируем файл…" : "Сводка в Excel"}
      </Button>
    </div>
  );
}
