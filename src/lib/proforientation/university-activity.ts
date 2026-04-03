import { mockUniversities } from "@/lib/universities/mock-universities";
import type { Intern } from "@/types/universities";

/** Стажировки в ИБ / кибер / смежных ИТ-направлениях (эвристика по тексту должности и подразделения). */
const CYBER_OR_IT_SECURITY_HINTS =
  /кибер|кибербез|иб\b|информационн.*безопасност|информационной безопасности|разработк|автоматизац|систем|it\b|и\.б\./i;

function isCyberRelatedIntern(i: Intern): boolean {
  return (
    CYBER_OR_IT_SECURITY_HINTS.test(i.department) || CYBER_OR_IT_SECURITY_HINTS.test(i.position)
  );
}

export interface UniversityInternActivity {
  universityId: string;
  shortName: string;
  name: string;
  totalInternsWithBank: number;
  cyberRelatedInterns: number;
  /** Доля «кибер» среди стажёров этого ВУЗа, % */
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
    const cyber = withBank.filter(isCyberRelatedIntern);
    const denom = withBank.length || 1;
    rows.push({
      universityId: u.id,
      shortName: u.shortName,
      name: u.name,
      totalInternsWithBank: withBank.length,
      cyberRelatedInterns: cyber.length,
      cyberShareAmongUniversityInterns: Math.round((cyber.length / denom) * 1000) / 10,
    });
  }

  return rows.sort((a, b) => b.totalInternsWithBank - a.totalInternsWithBank);
}

export function getCyberActivityInsight(): string {
  const rows = getUniversityInternActivity().filter((r) => r.totalInternsWithBank > 0);
  if (rows.length === 0) {
    return "В справочнике нет данных о стажировках по ВУЗам.";
  }
  const topCyber = [...rows].sort((a, b) => b.cyberRelatedInterns - a.cyberRelatedInterns)[0];
  const topShare = [...rows]
    .filter((r) => r.totalInternsWithBank >= 3)
    .sort((a, b) => b.cyberShareAmongUniversityInterns - a.cyberShareAmongUniversityInterns)[0];
  const parts: string[] = [];
  if (topCyber?.cyberRelatedInterns > 0) {
    parts.push(
      `По направлениям, близким к кибербезопасности и ИБ, чаще всего в банке проходили стажировку выпускники и студенты «${topCyber.shortName}» (${topCyber.cyberRelatedInterns} чел.).`
    );
  }
  if (topShare && topShare.cyberShareAmongUniversityInterns >= 20) {
    parts.push(
      `Наибольшая доля таких стажёров среди всех стажёров ВУЗа — у «${topShare.shortName}» (~${topShare.cyberShareAmongUniversityInterns}%).`
    );
  }
  return parts.length > 0 ? parts.join(" ") : "Добавьте в справочник стажёров с отметкой стажировки в банке для аналитики.";
}
