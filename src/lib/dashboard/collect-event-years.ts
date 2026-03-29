import type { University } from "@/types/universities";

/** Годы мероприятий по всем ВУЗам, по убыванию */
export function collectEventYearsFromUniversities(
  universities: University[]
): number[] {
  const years = new Set<number>();
  for (const u of universities) {
    for (const e of u.events || []) {
      const y = new Date(e.date).getFullYear();
      if (!Number.isNaN(y)) years.add(y);
    }
  }
  return [...years].sort((a, b) => b - a);
}
