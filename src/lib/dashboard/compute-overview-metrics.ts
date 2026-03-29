import type { University } from "@/types/universities";
import type { DashboardEventPeriod, DashboardOverviewMetrics } from "./types";
import { filterEventsByPeriod } from "./filter-events";

export function computeOverviewMetrics(
  universities: University[],
  eventPeriod: DashboardEventPeriod,
  referenceDate = new Date()
): DashboardOverviewMetrics {
  const today = referenceDate;

  const totalUniversities = universities.length;

  const allContracts = universities.flatMap((u) => u.contracts || []);
  const activeContracts = allContracts.filter((c) => {
    if (!c.period?.end) return c.hasContract;
    return new Date(c.period.end) > today;
  });
  const expiringContracts = allContracts.filter((c) => {
    if (!c.period?.end) return false;
    const endDate = new Date(c.period.end);
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  });
  const expiredContracts = allContracts.filter((c) => {
    if (!c.period?.end) return false;
    return new Date(c.period.end) < today;
  });

  const allInterns = universities.flatMap((u) => u.internList || []);
  const activeInterns = allInterns.filter((i) => i.status === "active");
  const allPractitioners = universities.flatMap((u) => u.practitionerList || []);

  const practitionersByStatus = {
    exceeds: allPractitioners.filter((p) => p.practiceStatus === "exceeds").length,
    meets: allPractitioners.filter((p) => p.practiceStatus === "meets").length,
    notMeets: allPractitioners.filter((p) => p.practiceStatus === "not_meets").length,
  };

  const allEvents = universities.flatMap((u) => u.events || []);
  const periodEvents = filterEventsByPeriod(allEvents, eventPeriod);

  const eventsByType = {
    businessGame: periodEvents.filter((e) => e.type === "businessGame").length,
    caseChampionship: periodEvents.filter((e) => e.type === "caseChampionship").length,
    diplomaDefense: periodEvents.filter((e) => e.type === "diplomaDefense").length,
    webinar: periodEvents.filter((e) => e.type === "webinar").length,
    lecture: periodEvents.filter((e) => e.type === "lecture").length,
    conference: periodEvents.filter((e) => e.type === "conference").length,
    masterClass: periodEvents.filter((e) => e.type === "masterClass").length,
    contact: periodEvents.filter((e) => e.type === "contact").length,
  };

  const eventsByStatus = {
    planned: periodEvents.filter((e) => e.status === "planned").length,
    inProgress: periodEvents.filter((e) => e.status === "in_progress").length,
    completed: periodEvents.filter((e) => e.status === "completed").length,
  };

  const linesCounts = { drp: 0, bko: 0, cntr: 0 };
  universities.forEach((u) => {
    const lines = new Set(u.cooperationLines?.map((cl) => cl.line) || []);
    if (lines.has("drp")) linesCounts.drp++;
    if (lines.has("bko")) linesCounts.bko++;
    if (lines.has("cntr")) linesCounts.cntr++;
  });

  const totalBankDepartments = universities.reduce(
    (sum, u) => sum + (u.bankDepartments?.length || 0),
    0
  );

  const allProjects = universities.flatMap((u) => u.cntrProjects || []);
  const totalFunding = allProjects.reduce((sum, p) => sum + (p.fundingAmount || 0), 0);

  const allParticipants = universities.flatMap(
    (u) => u.caseChampionshipParticipants || []
  );
  const caseResults = {
    winners: allParticipants.filter((p) => p.status === "winner").length,
    prizeWinners: allParticipants.filter((p) => p.status === "prize_winner").length,
    participated: allParticipants.filter((p) => p.status === "participated").length,
  };

  const topUniversitiesByEmployees = [...universities]
    .filter((u) => u.allEmployees && u.allEmployees > 0)
    .sort((a, b) => (b.allEmployees || 0) - (a.allEmployees || 0))
    .slice(0, 5);

  const cityCounts: Record<string, number> = {};
  universities.forEach((u) => {
    cityCounts[u.city] = (cityCounts[u.city] || 0) + 1;
  });
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const partnershipsByYear: Record<number, number> = {};
  universities.forEach((u) => {
    if (u.cooperationStartYear) {
      partnershipsByYear[u.cooperationStartYear] =
        (partnershipsByYear[u.cooperationStartYear] || 0) + 1;
    }
  });
  const yearsData = Object.entries(partnershipsByYear)
    .map(([year, count]) => ({ year: parseInt(year, 10), count }))
    .sort((a, b) => a.year - b.year);

  const bkoStats = {
    salaryStudents: universities.filter((u) => u.bkoData?.salaryProject?.students)
      .length,
    salaryEmployees: universities.filter((u) => u.bkoData?.salaryProject?.employees)
      .length,
    ie: universities.filter((u) => u.bkoData?.transactionalProducts?.ie).length,
    te: universities.filter((u) => u.bkoData?.transactionalProducts?.te).length,
    sbp: universities.filter((u) => u.bkoData?.transactionalProducts?.sbp).length,
    adm: universities.filter((u) => u.bkoData?.transactionalProducts?.adm).length,
  };

  return {
    totalUniversities,
    activeContracts: activeContracts.length,
    expiringContracts: expiringContracts.length,
    expiredContracts: expiredContracts.length,
    totalInterns: allInterns.length,
    activeInterns: activeInterns.length,
    totalPractitioners: allPractitioners.length,
    practitionersByStatus,
    totalEvents: periodEvents.length,
    eventsByType,
    eventsByStatus,
    linesCounts,
    totalBankDepartments,
    totalProjects: allProjects.length,
    totalFunding,
    caseResults,
    topUniversitiesByEmployees,
    topCities,
    yearsData,
    bkoStats,
  };
}
