"use client";

import { useCallback, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  collectEventYearsFromUniversities,
  computeLineMetrics,
  computeOverviewMetrics,
  downloadDashboardSummaryXlsx,
  type DashboardEventPeriod,
} from "@/lib/dashboard";
import type { University } from "@/types/universities";
import { BkoTab } from "./bko-tab";
import { CntrTab } from "./cntr-tab";
import { DashboardToolbar } from "./dashboard-toolbar";
import { DrpTab } from "./drp-tab";
import { OverviewTab } from "./overview-tab";

interface UniversityDashboardProps {
  universities: University[];
}

export function UniversityDashboard({ universities }: UniversityDashboardProps) {
  const [activeLineTab, setActiveLineTab] = useState("overview");
  const [eventPeriod, setEventPeriod] = useState<DashboardEventPeriod>(() => ({
    mode: "year",
    year: new Date().getFullYear(),
  }));
  const [exporting, setExporting] = useState(false);

  const yearOptions = useMemo(() => {
    const s = new Set(collectEventYearsFromUniversities(universities));
    s.add(new Date().getFullYear());
    return [...s].sort((a, b) => b - a);
  }, [universities]);

  const metrics = useMemo(
    () => computeOverviewMetrics(universities, eventPeriod),
    [universities, eventPeriod]
  );

  const lineData = useMemo(
    () => computeLineMetrics(universities, eventPeriod),
    [universities, eventPeriod]
  );

  const eventsPeriodLabel =
    eventPeriod.mode === "all"
      ? "Все мероприятия за всё время"
      : `Мероприятия за ${eventPeriod.year} год`;

  const onExport = useCallback(async () => {
    setExporting(true);
    try {
      await downloadDashboardSummaryXlsx(metrics, lineData, eventPeriod);
    } finally {
      setExporting(false);
    }
  }, [metrics, lineData, eventPeriod]);

  const toolbarProps = {
    eventPeriod,
    onEventPeriodChange: setEventPeriod,
    yearOptions,
    onExport,
    exporting,
  } as const;

  return (
    <Tabs value={activeLineTab} onValueChange={setActiveLineTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Общий</TabsTrigger>
        <TabsTrigger value="drp">ДРП</TabsTrigger>
        <TabsTrigger value="bko">БКО</TabsTrigger>
        <TabsTrigger value="cntr">ЦНТР</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
        <div className="border-b border-border pb-4">
          <DashboardToolbar instanceId="overview" {...toolbarProps} />
        </div>
        <OverviewTab metrics={metrics} eventsPeriodLabel={eventsPeriodLabel} />
      </TabsContent>

      <TabsContent value="drp" className="mt-6 flex flex-col gap-6">
        <div className="border-b border-border pb-4">
          <DashboardToolbar instanceId="drp" {...toolbarProps} />
        </div>
        <DrpTab line={lineData.drp} />
      </TabsContent>

      <TabsContent value="bko" className="mt-6 flex flex-col gap-6">
        <div className="border-b border-border pb-4">
          <DashboardToolbar instanceId="bko" {...toolbarProps} />
        </div>
        <BkoTab line={lineData.bko} />
      </TabsContent>

      <TabsContent value="cntr" className="mt-6 flex flex-col gap-6">
        <div className="border-b border-border pb-4">
          <DashboardToolbar instanceId="cntr" {...toolbarProps} />
        </div>
        <CntrTab line={lineData.cntr} />
      </TabsContent>
    </Tabs>
  );
}
