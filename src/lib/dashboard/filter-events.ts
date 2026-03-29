import type { Event } from "@/types/universities";
import type { DashboardEventPeriod } from "./types";

export function filterEventsByPeriod(
  events: Event[],
  period: DashboardEventPeriod
): Event[] {
  if (period.mode === "all") return events;
  return events.filter((e) => new Date(e.date).getFullYear() === period.year);
}
