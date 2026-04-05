import { DEFAULT_ORIENTATION_TEST_RESULTS_PDF, type ProforientationApplication } from "./types";
import { buildRecommendations } from "./recommendations";

const TEST_URL = "https://example.com/proforientation-test";

/**
 * Увеличивайте при каждом изменении демо-данных в `getSeedProforientationApplications`.
 * Контекст сравнивает значение с localStorage и подменяет устаревший сид (только если в хранилище только демо-заявки).
 */
export const PROFORIENTATION_SEED_CONTENT_VERSION = 3;

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
 * Единая опорная линия: внешний тест «Профориентатор 8.2.1m», ключевая дата прохождения 15.03.2026.
 */
export function getSeedProforientationApplications(): ProforientationApplication[] {
  /**
   * Сведение к шкале 0–100 по отчёту «Профориентатор 8.2.1m» (PDF от 15.03.2026):
   * сильные абстрактная и зрительная логика, вычисления/лексика/внимание выше среднего;
   * интересы: техника, наука, общение, бизнес; «Информация» в отчёте ниже — см. текст заключения.
   */
  const scoresCompleted = {
    analytical: 88,
    technical: 85,
    social: 84,
    creative: 56,
  };
  const summaryCompleted = [
    "Источник: отчёт «Профориентатор 8.2.1m», сеанс 00303058, 15.03.2026 (41 мин 40 с). Ниже — сжатое заключение по разделам PDF; полные таблицы профессий и УГСН — в исходном файле отчёта.",
    "",
    "Интересы (шкала 1–10 в отчёте): выражены техника (8,5), наука (8,4), общение (9,5) и бизнес (8,6); умеренно — искусство (5,6). В блоке «Информация» в отчёте отмечен пониженный интерес к рутинной работе с документами и знаковыми системами — ориентируйтесь на сильные инженерно-технические и коммуникативные зоны.",
    "",
    "Структура интеллекта: очень высокие зрительная и абстрактная логика («++» в отчёте), выше среднего — вычисления, лексика и внимание; эрудиция в норме. Профиль подходит для IT, инженерии, аналитики, финансов и точных наук.",
    "",
    "Личность: активность и склонность к самостоятельности; снижена потребность в «согласии» с другими. Выражены лидерство, коммуникабельность и системность мышления; креативность и командность — в среднем диапазоне.",
    "",
    "Направления обучения (оценки в отчёте): лидируют информационно-технологический профиль (~7,6), инженерный (~7,7) и физико-математический (~7,0); заметны финансово-экономический и творческий профили на среднем уровне.",
    "",
    "Примеры профессий из отчёта: по блоку «структура интеллекта» — специалист по Big Data и машинному обучению (сходство 0,86), финансовый аналитик (0,85), системный аналитик (0,83), архитектор ПО (0,82); по интересам — инженер-электронщик, системный администратор, инженер телекоммуникаций, бизнес-информатика, менеджер интернет-проектов (сходство 0,67–0,72).",
    "",
    "Рекомендации по вузам в следующем блоке платформы считаются по этим баллам и данным о стажировках в банке; для детального разбора по кодам УГСН и перечню ЕГЭ используйте полный PDF отчёта.",
  ].join("\n");

  /** Общий текст для заявок на этапах до финала: соответствие профилю отчёта */
  const profileCommentShort =
    "Ориентир по отчёту «Профориентатор»: сильные техника, математика/логика, общение и бизнес; приоритет IT, инженерные и аналитические направления.";

  /** Завершена: тест пройден, есть результат и рекомендации (эталонный PDF) */
  const completed: ProforientationApplication = {
    id: "demo-po-seed-completed",
    createdAt: "2026-03-10T08:00:00.000Z",
    updatedAt: "2026-04-02T14:30:00.000Z",
    status: "completed",
    employeeFullName: "Иванов Иван Иванович",
    employeeTabNumber: "784512",
    employeeDepartment: "Департамент персонала",
    employeePosition: "Ведущий специалист отдела развития персонала",
    employeeEmail: "ivanov.ii@gazprombank.ru",
    employeePhone: "+7 (495) 123-45-67",
    childFullName: "Иванова Мария Ивановна",
    childBirthDate: "2010-08-22",
    childSchoolGrade: "10 класс",
    interestDirections: ["it", "math", "mgmt"],
    comment:
      "Олимпиады по информатике и математике; лидерство в проектной группе. Профиль согласован с отчётом «Профориентатор 8.2.1m» от 15.03.2026 (сеанс 00303058).",
    drpScheduledDate: "2026-03-14",
    drpComment:
      "Запись на тест подтверждена; сеанс 00303058, 15.03.2026, 41 мин — данные перенесены в заключение.",
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
      externalReport: {
        productLabel: "Профориентатор 8.2.1m",
        sessionId: "00303058",
        durationLabel: "00:41:40",
        testedAt: "2026-03-15T13:53:50.000Z",
      },
    },
  };

  /** В процессе: ссылка на тест выдана, ожидается прохождение (до даты эталонного теста) */
  const inProgressTest: ProforientationApplication = {
    id: "demo-po-seed-in-progress-test",
    createdAt: "2026-03-11T09:00:00.000Z",
    updatedAt: "2026-03-13T16:00:00.000Z",
    status: "in_progress",
    employeeFullName: "Петрова Анна Сергеевна",
    employeeTabNumber: "891234",
    employeeDepartment: "Департамент корпоративного бизнеса",
    employeePosition: "Старший менеджер по работе с корпоративными клиентами",
    employeeEmail: "petrova.as@gazprombank.ru",
    employeePhone: "+7 (495) 234-56-78",
    childFullName: "Петров Илья Андреевич",
    childBirthDate: "2012-04-10",
    childSchoolGrade: "8 класс",
    interestDirections: ["it", "math", "mgmt"],
    comment: `${profileCommentShort} Готовится к прохождению «Профориентатор» по выданной ссылке.`,
    drpScheduledDate: "2026-03-12",
    drpComment:
      "Ссылка на тест «Профориентатор 8.2.1m» отправлена на почту; рекомендуем завершить до записи на очередной поток (ориентир — как у эталонного сеанса 15.03.2026).",
    drpResponsibleFullName: "Волкова Анна Петровна",
    orientationTest: {
      status: "awaiting_pass",
      testUrl: TEST_URL,
    },
  };

  /** В процессе: тест пройден на стороне центра, ожидается загрузка PDF в карточку */
  const inProgressWaitResults: ProforientationApplication = {
    id: "demo-po-seed-awaiting-results",
    createdAt: "2026-03-12T10:00:00.000Z",
    updatedAt: "2026-03-16T11:00:00.000Z",
    status: "in_progress",
    employeeFullName: "Смирнов Дмитрий Олегович",
    employeeTabNumber: "562341",
    employeeDepartment: "Департамент рисков",
    employeePosition: "Руководитель группы кредитных рисков",
    employeeEmail: "smirnov.do@gazprombank.ru",
    employeePhone: "+7 (495) 345-67-89",
    childFullName: "Смирнова Елена Дмитриевна",
    childBirthDate: "2011-11-03",
    childSchoolGrade: "9 класс",
    interestDirections: ["it", "math", "finance"],
    comment: `${profileCommentShort} Тестирование в центре завершено, ждём PDF для сопоставления с платформой.`,
    drpScheduledDate: "2026-03-14",
    drpComment:
      "Участник прошёл тест «Профориентатор» 15.03.2026; ожидается файл отчёта от внешней системы для переноса баллов и заключения (как в демо-заявке с сеансом 00303058).",
    drpResponsibleFullName: "Волкова Анна Петровна",
    orientationTest: {
      status: "awaiting_results",
    },
  };

  /** Создана: только подана, ждёт выдачи ссылки ДРП */
  const created: ProforientationApplication = {
    id: "demo-po-seed-created",
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-05T10:00:00.000Z",
    status: "created",
    employeeFullName: "Козлов Михаил Петрович",
    employeeTabNumber: "445566",
    employeeDepartment: "Департамент ИТ",
    employeePosition: "Ведущий инженер отдела разработки",
    employeeEmail: "kozlov.mp@gazprombank.ru",
    employeePhone: "+7 (495) 456-78-90",
    childFullName: "Козлов Артём Михайлович",
    childBirthDate: "2013-02-14",
    childSchoolGrade: "7 класс",
    interestDirections: ["it", "math", "mgmt"],
    comment:
      "Робототехника, базовое программирование. Ожидаем запись на тест «Профориентатор» по тому же профилю, что в отчёте (IT, инженерия, сильная логика и коммуникации).",
    orientationTest: {
      status: "pending_link",
    },
  };

  return [created, inProgressTest, inProgressWaitResults, completed];
}
