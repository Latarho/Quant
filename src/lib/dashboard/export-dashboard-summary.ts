import type { DashboardEventPeriod } from "./types";
import type { DashboardLineMetrics, DashboardOverviewMetrics } from "./types";

function periodLabel(period: DashboardEventPeriod): string {
  if (period.mode === "all") return "Все годы";
  return String(period.year);
}

export async function downloadDashboardSummaryXlsx(
  overview: DashboardOverviewMetrics,
  lines: DashboardLineMetrics,
  eventPeriod: DashboardEventPeriod
): Promise<void> {
  const XLSX = await import("xlsx");

  const sheetRows: (string | number)[][] = [
    ["КАМПУС — сводка дэшборда"],
    ["Период мероприятий", periodLabel(eventPeriod)],
    [],
    ["Показатель", "Значение"],
    ["ВУЗов-партнеров", overview.totalUniversities],
    ["Активных договоров", overview.activeContracts],
    ["Договоров истекает (90 дн.)", overview.expiringContracts],
    ["Просроченных договоров", overview.expiredContracts],
    ["Стажеров (всего)", overview.totalInterns],
    ["Стажеров активных", overview.activeInterns],
    ["Практикантов", overview.totalPractitioners],
    ["Мероприятий (в периоде)", overview.totalEvents],
    ["Кафедр банка", overview.totalBankDepartments],
    ["Проектов ЦНТР", overview.totalProjects],
    ["Финансирование ЦНТР", overview.totalFunding],
    [],
    ["Линии сотрудничества (ВУЗов)"],
    ["ДРП", overview.linesCounts.drp],
    ["БКО", overview.linesCounts.bko],
    ["ЦНТР", overview.linesCounts.cntr],
    [],
    ["ДРП (детально)"],
    ["ВУЗов с ДРП", lines.drp.universities],
    ["Стажеров", lines.drp.interns],
    ["Практикантов", lines.drp.practitioners],
    ["Мероприятий (в периоде)", lines.drp.events],
    [],
    ["БКО"],
    ["ВУЗов с БКО", lines.bko.total],
    ["ЗП студенты", lines.bko.withSalaryStudents],
    ["ЗП сотрудники", lines.bko.withSalaryEmployees],
    [],
    ["ЦНТР"],
    ["ВУЗов с ЦНТР", lines.cntr.universities],
    ["Проектов", lines.cntr.projects],
    ["Финансирование", lines.cntr.funding],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  XLSX.utils.book_append_sheet(wb, ws, "Сводка");
  XLSX.writeFile(
    wb,
    `campus-dashboard-${periodLabel(eventPeriod).replace(/\s+/g, "_")}.xlsx`
  );
}
