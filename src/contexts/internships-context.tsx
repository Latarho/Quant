"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Internship, InternshipStatus } from "@/types/internships";

export interface NewInternshipData {
  type: string;
  direction?: string;
  name?: string;
  startDate: string;
  endDate: string;
  status: InternshipStatus;
}

interface InternshipsContextValue {
  internships: Internship[];
  addInternship: (data: NewInternshipData) => string;
}

const InternshipsContext = createContext<InternshipsContextValue | null>(null);

function createInternshipFromData(data: NewInternshipData, id: string): Internship {
  const now = new Date();
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return {
    id,
    partnershipId: "",
    partnershipName: "",
    universityId: "",
    universityName: "",
    title: data.type,
    name: data.name,
    description: "",
    startDate,
    endDate,
    applicationDeadline: endDate,
    status: data.status,
    maxParticipants: 0,
    currentParticipants: 0,
    requirements: [],
    requiredSkills: [],
    preferredSkills: [],
    location: "office",
    direction: data.direction,
    createdAt: now,
    updatedAt: now,
    createdBy: "",
  };
}

const STATUSES: InternshipStatus[] = ["in_progress", "completed"];

const MONTH_NAMES: string[] = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function getInitialInternships(): Internship[] {
  const list: Internship[] = [];
  const types = ["GPB.Level Up", "GPB.Experience", "GPB.IT Factory"];
  const counts = [10, 6, 5]; // Level Up 10, Experience 6, IT Factory 5
  types.forEach((title, typeIndex) => {
    const n = counts[typeIndex];
    for (let i = 0; i < n; i++) {
      const year = 2025;
      const startMonth = 1 + (i % 6);
      const endMonth = startMonth + 2;
      const startDate = new Date(year, startMonth - 1, 15);
      const endDate = new Date(year, endMonth - 1, 20);
      const status = STATUSES[i % STATUSES.length];
      const name = title === "GPB.Level Up" && i === 0 ? "Data Science" : `${MONTH_NAMES[startMonth - 1]} — ${MONTH_NAMES[endMonth - 1]} ${year}`;
      const internship = createInternshipFromData(
        {
          type: title,
          name,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          status,
        },
        `seed-${title.replace(/\s/g, "-").toLowerCase()}-${i + 1}`
      );
      list.push(internship);
    }
  });
  // 3 стажировки с типом «Стажировка МГИМО»
  const mgimoTitle = "Стажировка МГИМО";
  for (let i = 0; i < 3; i++) {
    const year = 2025;
    const startMonth = 3 + i;
    const endMonth = startMonth + 2;
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth - 1, 28);
    const internship = createInternshipFromData(
      {
        type: mgimoTitle,
        name: `${MONTH_NAMES[startMonth - 1]} — ${MONTH_NAMES[endMonth - 1]} ${year}`,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        status: STATUSES[i % STATUSES.length],
      },
      `seed-mgimo-${i + 1}`
    );
    list.push(internship);
  }
  return list;
}

export function InternshipsProvider({ children }: { children: React.ReactNode }) {
  const [internships, setInternships] = useState<Internship[]>(getInitialInternships);

  const addInternship = useCallback((data: NewInternshipData) => {
    const id = `internship-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const internship = createInternshipFromData(data, id);
    setInternships((prev) => [...prev, internship]);
    return id;
  }, []);

  return (
    <InternshipsContext.Provider value={{ internships, addInternship }}>
      {children}
    </InternshipsContext.Provider>
  );
}

export function useInternships() {
  const ctx = useContext(InternshipsContext);
  if (!ctx) {
    return {
      internships: [] as Internship[],
      addInternship: () => "",
    };
  }
  return ctx;
}
