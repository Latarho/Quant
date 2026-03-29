import type { CNTRProjectItem, University } from "@/types/universities";

/** Период для метрик по мероприятиям на дэшборде */
export type DashboardEventPeriod =
  | { mode: "all" }
  | { mode: "year"; year: number };

export interface DashboardOverviewMetrics {
  totalUniversities: number;
  activeContracts: number;
  expiringContracts: number;
  expiredContracts: number;
  totalInterns: number;
  activeInterns: number;
  totalPractitioners: number;
  practitionersByStatus: {
    exceeds: number;
    meets: number;
    notMeets: number;
  };
  totalEvents: number;
  eventsByType: Record<
    | "businessGame"
    | "caseChampionship"
    | "diplomaDefense"
    | "webinar"
    | "lecture"
    | "conference"
    | "masterClass"
    | "contact",
    number
  >;
  eventsByStatus: {
    planned: number;
    inProgress: number;
    completed: number;
  };
  linesCounts: { drp: number; bko: number; cntr: number };
  totalBankDepartments: number;
  totalProjects: number;
  totalFunding: number;
  caseResults: {
    winners: number;
    prizeWinners: number;
    participated: number;
  };
  topUniversitiesByEmployees: University[];
  topCities: [string, number][];
  yearsData: { year: number; count: number }[];
  bkoStats: {
    salaryStudents: number;
    salaryEmployees: number;
    ie: number;
    te: number;
    sbp: number;
    adm: number;
  };
}

export interface DashboardDrpLineMetrics {
  universities: number;
  interns: number;
  activeInterns: number;
  practitioners: number;
  events: number;
  employees: number;
  topUniversities: University[];
  practitionersByStatus: {
    exceeds: number;
    meets: number;
    notMeets: number;
  };
  eventsByType: DashboardOverviewMetrics["eventsByType"];
}

export interface DashboardBkoLineMetrics {
  total: number;
  withSalaryStudents: number;
  withSalaryEmployees: number;
  withIE: number;
  withTE: number;
  withSBP: number;
  withADM: number;
  withLimit: number;
}

export interface DashboardCntrLineMetrics {
  universities: number;
  projects: number;
  infrastructure: number;
  funding: number;
  agreements: number;
  projectsByFormat: Record<string, number>;
  topProjects: CNTRProjectItem[];
}

export interface DashboardLineMetrics {
  drp: DashboardDrpLineMetrics;
  bko: DashboardBkoLineMetrics;
  cntr: DashboardCntrLineMetrics;
}
