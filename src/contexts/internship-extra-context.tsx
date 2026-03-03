"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface InternshipExtraContextValue {
  departmentsByInternship: Record<string, string[]>;
  setDepartmentsForInternship: (internshipId: string, departments: string[]) => void;
}

const InternshipExtraContext = createContext<InternshipExtraContextValue | null>(null);

export function InternshipExtraProvider({ children }: { children: React.ReactNode }) {
  const [departmentsByInternship, setDepartmentsByInternship] = useState<Record<string, string[]>>({});

  const setDepartmentsForInternship = useCallback((internshipId: string, departments: string[]) => {
    setDepartmentsByInternship((prev) => ({
      ...prev,
      [internshipId]: [...departments],
    }));
  }, []);

  return (
    <InternshipExtraContext.Provider value={{ departmentsByInternship, setDepartmentsForInternship }}>
      {children}
    </InternshipExtraContext.Provider>
  );
}

export function useInternshipExtra(): InternshipExtraContextValue {
  const ctx = useContext(InternshipExtraContext);
  if (!ctx) {
    return {
      departmentsByInternship: {},
      setDepartmentsForInternship: () => {},
    };
  }
  return ctx;
}

