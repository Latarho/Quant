import type { OrientationScores, UniversityRecommendation } from "./types";
import { getUniversityInternActivity } from "./university-activity";

/**
 * Простая модель соответствия профиля участника тестирования и ВУЗа по данным платформы.
 */
export function buildRecommendations(scores: OrientationScores): UniversityRecommendation[] {
  const activity = getUniversityInternActivity();
  if (activity.length === 0) return [];

  const techWeight = (scores.technical + scores.analytical) / 200;
  const socialWeight = scores.social / 100;
  const creativeWeight = scores.creative / 100;

  const scored = activity.map((row) => {
    const volumeNorm = Math.min(1, row.totalInternsWithBank / 20);
    const cyberNorm = Math.min(1, row.cyberShareAmongUniversityInterns / 100);
    const fitScore =
      40 * techWeight * (0.5 + 0.5 * volumeNorm) +
      35 * techWeight * cyberNorm +
      15 * socialWeight * volumeNorm +
      10 * creativeWeight * volumeNorm;

    let reason = "";
    if (techWeight >= 0.45) {
      reason = `Сильный технический и аналитический профиль; в банке стабильно берут стажёров из «${row.shortName}» (${row.totalInternsWithBank} чел. со стажировкой).`;
    } else if (socialWeight >= 0.55) {
      reason = `Выражены коммуникативные компетенции; «${row.shortName}» даёт заметный поток стажёров в банк (${row.totalInternsWithBank} чел.).`;
    } else {
      reason = `Сбалансированный профиль; «${row.shortName}» представлен в данных платформы (${row.totalInternsWithBank} стажёров со стажировкой в банке).`;
    }

    return {
      universityId: row.universityId,
      universityShortName: row.shortName,
      universityName: row.name,
      fitScore: Math.round(fitScore * 10) / 10,
      reason,
      cyberSharePercent: row.cyberShareAmongUniversityInterns,
      totalInternsWithBank: row.totalInternsWithBank,
      cyberRelatedInterns: row.cyberRelatedInterns,
    };
  });

  return scored.sort((a, b) => b.fitScore - a.fitScore).slice(0, 5);
}
