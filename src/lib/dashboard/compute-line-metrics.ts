import type { University } from "@/types/universities";
import type { DashboardEventPeriod, DashboardLineMetrics } from "./types";
import { filterEventsByPeriod } from "./filter-events";

export function computeLineMetrics(
  universities: University[],
  eventPeriod: DashboardEventPeriod
): DashboardLineMetrics {
  const drpUniversities = universities.filter((u) =>
    u.cooperationLines?.some((cl) => cl.line === "drp")
  );
  const bkoUniversities = universities.filter((u) =>
    u.cooperationLines?.some((cl) => cl.line === "bko")
  );
  const cntrUniversities = universities.filter((u) =>
    u.cooperationLines?.some((cl) => cl.line === "cntr")
  );

  const drpInterns = drpUniversities.flatMap((u) => u.internList || []);
  const drpPractitioners = drpUniversities.flatMap((u) => u.practitionerList || []);
  const drpEventsRaw = drpUniversities.flatMap((u) => u.events || []);
  const drpEvents = filterEventsByPeriod(drpEventsRaw, eventPeriod);
  const drpEmployees = drpUniversities.reduce(
    (sum, u) => sum + (u.allEmployees || 0),
    0
  );

  const bkoStats = {
    total: bkoUniversities.length,
    withSalaryStudents: bkoUniversities.filter((u) => u.bkoData?.salaryProject?.students)
      .length,
    withSalaryEmployees: bkoUniversities.filter((u) => u.bkoData?.salaryProject?.employees)
      .length,
    withIE: bkoUniversities.filter((u) => u.bkoData?.transactionalProducts?.ie).length,
    withTE: bkoUniversities.filter((u) => u.bkoData?.transactionalProducts?.te).length,
    withSBP: bkoUniversities.filter((u) => u.bkoData?.transactionalProducts?.sbp).length,
    withADM: bkoUniversities.filter((u) => u.bkoData?.transactionalProducts?.adm).length,
    withLimit: bkoUniversities.filter((u) => u.bkoData?.limit).length,
  };

  const cntrProjects = cntrUniversities.flatMap((u) => u.cntrProjects || []);
  const cntrInfrastructure = cntrUniversities.flatMap((u) => u.cntrInfrastructure || []);
  const cntrFunding = cntrProjects.reduce((sum, p) => sum + (p.fundingAmount || 0), 0);
  const cntrAgreements = cntrUniversities.filter(
    (u) => u.cntrAgreementItems && u.cntrAgreementItems.length > 0
  ).length;

  const eventsByType = {
    businessGame: drpEvents.filter((e) => e.type === "businessGame").length,
    caseChampionship: drpEvents.filter((e) => e.type === "caseChampionship").length,
    diplomaDefense: drpEvents.filter((e) => e.type === "diplomaDefense").length,
    webinar: drpEvents.filter((e) => e.type === "webinar").length,
    lecture: drpEvents.filter((e) => e.type === "lecture").length,
    conference: drpEvents.filter((e) => e.type === "conference").length,
    masterClass: drpEvents.filter((e) => e.type === "masterClass").length,
    contact: drpEvents.filter((e) => e.type === "contact").length,
  };

  return {
    drp: {
      universities: drpUniversities.length,
      interns: drpInterns.length,
      activeInterns: drpInterns.filter((i) => i.status === "active").length,
      practitioners: drpPractitioners.length,
      events: drpEvents.length,
      employees: drpEmployees,
      topUniversities: drpUniversities
        .filter((u) => u.allEmployees && u.allEmployees > 0)
        .sort((a, b) => (b.allEmployees || 0) - (a.allEmployees || 0))
        .slice(0, 5),
      practitionersByStatus: {
        exceeds: drpPractitioners.filter((p) => p.practiceStatus === "exceeds").length,
        meets: drpPractitioners.filter((p) => p.practiceStatus === "meets").length,
        notMeets: drpPractitioners.filter((p) => p.practiceStatus === "not_meets").length,
      },
      eventsByType,
    },
    bko: bkoStats,
    cntr: {
      universities: cntrUniversities.length,
      projects: cntrProjects.length,
      infrastructure: cntrInfrastructure.length,
      funding: cntrFunding,
      agreements: cntrAgreements,
      projectsByFormat: cntrProjects.reduce(
        (acc, p) => {
          const format = p.supportFormat || "other";
          acc[format] = (acc[format] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      topProjects: cntrProjects
        .filter((p) => p.fundingAmount && p.fundingAmount > 0)
        .sort((a, b) => (b.fundingAmount || 0) - (a.fundingAmount || 0))
        .slice(0, 5),
    },
  };
}
