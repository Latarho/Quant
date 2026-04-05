import { mockUniversities } from "@/lib/universities/mock-universities";
import type { Intern } from "@/types/universities";

/** Эвристика «профильной» стажировки по тексту должности и подразделения в справочнике (один из срезов, не все направления). */
const PROFILE_INTERN_HINTS =
  /кибер|кибербез|иб\b|информационн.*безопасност|информационной безопасности|разработк|автоматизац|систем|it\b|и\.б\./i;

function isProfileTaggedIntern(i: Intern): boolean {
  return PROFILE_INTERN_HINTS.test(i.department) || PROFILE_INTERN_HINTS.test(i.position);
}

export interface UniversityInternActivity {
  universityId: string;
  shortName: string;
  name: string;
  totalInternsWithBank: number;
  cyberRelatedInterns: number;
  /** Доля профильных (по разметке справочника) среди стажёров этого ВУЗа в банке, % */
  cyberShareAmongUniversityInterns: number;
}

/**
 * Агрегирует активность стажировок по ВУЗам из данных справочника (internList).
 */
export function getUniversityInternActivity(): UniversityInternActivity[] {
  const rows: UniversityInternActivity[] = [];

  for (const u of mockUniversities) {
    const list = u.internList ?? [];
    const withBank = list.filter((i) => i.internshipInBank);
    const profileTagged = withBank.filter(isProfileTaggedIntern);
    const denom = withBank.length || 1;
    rows.push({
      universityId: u.id,
      shortName: u.shortName,
      name: u.name,
      totalInternsWithBank: withBank.length,
      cyberRelatedInterns: profileTagged.length,
      cyberShareAmongUniversityInterns: Math.round((profileTagged.length / denom) * 1000) / 10,
    });
  }

  return rows.sort((a, b) => b.totalInternsWithBank - a.totalInternsWithBank);
}

/** Краткая справка по срезу стажировок из справочника (без привязки к одному типу практики). */
export function getInternActivityInsight(): string {
  const rows = getUniversityInternActivity().filter((r) => r.totalInternsWithBank > 0);
  if (rows.length === 0) {
    return "В справочнике нет данных о стажировках по ВУЗам.";
  }
  const topByProfileCount = [...rows].sort((a, b) => b.cyberRelatedInterns - a.cyberRelatedInterns)[0];
  const topShare = [...rows]
    .filter((r) => r.totalInternsWithBank >= 3)
    .sort((a, b) => b.cyberShareAmongUniversityInterns - a.cyberShareAmongUniversityInterns)[0];
  const parts: string[] = [];
  if (topByProfileCount?.cyberRelatedInterns > 0) {
    parts.push(
      `Больше всего профильных стажировок по разметке справочника — у «${topByProfileCount.shortName}» (${topByProfileCount.cyberRelatedInterns} чел.; срез по должности/подразделению).`
    );
  }
  if (topShare && topShare.cyberShareAmongUniversityInterns >= 20) {
    parts.push(
      `Наибольшая доля профильных среди стажировок вуза в банке — у «${topShare.shortName}» (~${topShare.cyberShareAmongUniversityInterns}%).`
    );
  }
  return parts.length > 0 ? parts.join(" ") : "Нет данных для среза — добавьте в справочник стажёров с отметкой стажировки в банке.";
}
