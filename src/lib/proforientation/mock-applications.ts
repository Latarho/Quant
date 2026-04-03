import { DEFAULT_ORIENTATION_TEST_RESULTS_PDF, type ProforientationApplication } from "./types";
import { buildRecommendations } from "./recommendations";

const TEST_URL = "https://example.com/proforientation-test";

/** Id всех демо-заявок из сида (для восстановления неполного набора из storage). */
export const DEMO_SEED_APPLICATION_IDS = new Set([
  "demo-po-seed-completed",
  "demo-po-seed-in-progress-test",
  "demo-po-seed-awaiting-results",
  "demo-po-seed-created",
]);

/** В storage только часть демо-заявок — подставляем полный сид заново. */
export function shouldReplaceWithFullDemoSeed(rows: ProforientationApplication[]): boolean {
  if (rows.length === 0 || rows.length >= DEMO_SEED_APPLICATION_IDS.size) return false;
  return rows.every((r) => DEMO_SEED_APPLICATION_IDS.has(r.id));
}

/**
 * Демо-заявки с разными статусами и этапами теста (при пустом localStorage).
 * Временная шкала согласована с «текущим» периодом (апрель 2026).
 */
export function getSeedProforientationApplications(): ProforientationApplication[] {
  const scoresCompleted = {
    analytical: 72,
    technical: 78,
    social: 55,
    creative: 48,
  };
  const summaryCompleted =
    "Выражен интерес к техническим и аналитическим задачам. Рекомендуется развитие в направлениях ИТ, прикладной математики и финансовых технологий.";

  /** Завершена: тест пройден, есть результат и рекомендации */
  const completed: ProforientationApplication = {
    id: "demo-po-seed-completed",
    createdAt: "2026-03-28T09:15:00.000Z",
    updatedAt: "2026-04-02T14:30:00.000Z",
    status: "completed",
    employeeFullName: "Иванов Иван Иванович",
    employeeTabNumber: "784512",
    employeeDepartment: "Департамент персонала",
    employeeEmail: "ivanov.ii@gazprombank.ru",
    employeePhone: "+7 (495) 123-45-67",
    childFullName: "Иванова Мария Ивановна",
    childBirthDate: "2010-08-22",
    childSchoolGrade: "10 класс",
    interestDirections: ["it", "math"],
    comment: "Олимпиады по информатике и математике.",
    drpScheduledDate: "2026-03-30",
    drpComment: "Запись на тест подтверждена, ссылка отправлена на корпоративную почту.",
    drpResponsibleFullName: "Волкова Анна Петровна",
    orientationTest: {
      status: "results_ready",
      testUrl: TEST_URL,
      resultsPdfUrl: DEFAULT_ORIENTATION_TEST_RESULTS_PDF,
    },
    result: {
      completedAt: "2026-04-02T14:30:00.000Z",
      scores: scoresCompleted,
      summary: summaryCompleted,
      recommendations: buildRecommendations(scoresCompleted),
    },
  };

  /** В процессе: ссылка на тест выдана, ожидается прохождение */
  const inProgressTest: ProforientationApplication = {
    id: "demo-po-seed-in-progress-test",
    createdAt: "2026-04-01T11:00:00.000Z",
    updatedAt: "2026-04-03T08:20:00.000Z",
    status: "in_progress",
    employeeFullName: "Петрова Анна Сергеевна",
    employeeTabNumber: "891234",
    employeeDepartment: "Департамент корпоративного бизнеса",
    employeeEmail: "petrova.as@gazprombank.ru",
    employeePhone: "+7 (495) 234-56-78",
    childFullName: "Петров Илья Андреевич",
    childBirthDate: "2012-04-10",
    childSchoolGrade: "8 класс",
    interestDirections: ["finance", "law"],
    comment: "Интерес к экономике и юриспруденции.",
    drpScheduledDate: "2026-04-02",
    drpResponsibleFullName: "Волкова Анна Петровна",
    orientationTest: {
      status: "awaiting_pass",
      testUrl: TEST_URL,
    },
  };

  /** В процессе: тест пройден, ожидаются результаты от ДРП */
  const inProgressWaitResults: ProforientationApplication = {
    id: "demo-po-seed-awaiting-results",
    createdAt: "2026-04-02T10:00:00.000Z",
    updatedAt: "2026-04-03T09:45:00.000Z",
    status: "in_progress",
    employeeFullName: "Смирнов Дмитрий Олегович",
    employeeTabNumber: "562341",
    employeeDepartment: "Департамент рисков",
    employeeEmail: "smirnov.do@gazprombank.ru",
    employeePhone: "+7 (495) 345-67-89",
    childFullName: "Смирнова Елена Дмитриевна",
    childBirthDate: "2011-11-03",
    childSchoolGrade: "9 класс",
    interestDirections: ["mgmt", "math"],
    comment: "",
    drpScheduledDate: "2026-04-03",
    drpComment: "Кандидат прошёл тест, ожидается загрузка PDF с платформы тестирования.",
    drpResponsibleFullName: "Волкова Анна Петровна",
    orientationTest: {
      status: "awaiting_results",
    },
  };

  /** Создана: только подана, ждёт выдачи ссылки ДРП */
  const created: ProforientationApplication = {
    id: "demo-po-seed-created",
    createdAt: "2026-04-03T08:00:00.000Z",
    updatedAt: "2026-04-03T08:00:00.000Z",
    status: "created",
    employeeFullName: "Козлов Михаил Петрович",
    employeeTabNumber: "445566",
    employeeDepartment: "Департамент ИТ",
    employeeEmail: "kozlov.mp@gazprombank.ru",
    employeePhone: "+7 (495) 456-78-90",
    childFullName: "Козлов Артём Михайлович",
    childBirthDate: "2013-02-14",
    childSchoolGrade: "7 класс",
    interestDirections: ["it"],
    comment: "Начальный уровень программирования, кружок робототехники.",
    orientationTest: {
      status: "pending_link",
    },
  };

  return [created, inProgressTest, inProgressWaitResults, completed];
}
