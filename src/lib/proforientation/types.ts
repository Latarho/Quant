/** Заявка на профориентацию (участник тестирования — ребёнок сотрудника банка) */
/** Жизненный цикл заявки: создана → в процессе → завершена */
export type ProforientationStatus = "created" | "in_progress" | "completed";

export interface OrientationScores {
  /** Аналитика / логика, 0–100 */
  analytical: number;
  /** Техника / ИТ, 0–100 */
  technical: number;
  /** Коммуникации, 0–100 */
  social: number;
  /** Творчество / предпринимательство, 0–100 */
  creative: number;
}

export interface UniversityRecommendation {
  universityId: string;
  universityShortName: string;
  universityName: string;
  fitScore: number;
  reason: string;
  /** Доля стажёров, в справочнике отмеченных как профильные по должности/подразделению, среди учтённых по вузу */
  cyberSharePercent?: number;
  /** Стажёров из ВУЗа с отметкой стажировки в банке (данные справочника) */
  totalInternsWithBank?: number;
  /** Число стажёров с отметкой «профильный» по разметке справочника (не исчерпывает все виды практики) */
  cyberRelatedInterns?: number;
}

/** Метаданные внешнего отчёта (например «Профориентатор»), если тест проходил вне платформы */
export interface ProforientationExternalReportMeta {
  /** Название теста / версия ПО */
  productLabel: string;
  /** Номер сеанса в системе тестирования */
  sessionId: string;
  /** Длительность прохождения (как в отчёте) */
  durationLabel: string;
  /** Дата и время тестирования (ISO 8601) */
  testedAt: string;
}

export interface ProforientationResult {
  completedAt: string;
  scores: OrientationScores;
  summary: string;
  recommendations: UniversityRecommendation[];
  /** Привязка к PDF/отчёту сторонней системы */
  externalReport?: ProforientationExternalReportMeta;
}

/** Этап прохождения теста на профориентацию (отдельно от статуса заявки) */
export type OrientationTestWorkflowStatus =
  | "pending_link"
  | "awaiting_pass"
  | "awaiting_results"
  | "results_ready";

export interface OrientationTestState {
  status: OrientationTestWorkflowStatus;
  /** Ссылка на прохождение теста (когда выдана) */
  testUrl?: string;
  /** PDF с результатами теста (путь из /public или абсолютный URL) */
  resultsPdfUrl?: string;
}

/** Этап сопровождения в ДРП (отображается в блоке «Статус проведения профориентации») */
export type DrpWorkflowStep = "application_submitted" | "third_party_testing" | "drp_consultation";

export const DRP_WORKFLOW_STEP_ORDER: readonly DrpWorkflowStep[] = [
  "application_submitted",
  "third_party_testing",
  "drp_consultation",
] as const;

export const DRP_WORKFLOW_STEP_LABEL: Record<DrpWorkflowStep, string> = {
  application_submitted: "Заявка оформлена",
  third_party_testing: "Тестирование у стороннего провайдера",
  drp_consultation: "Консультация ДРП",
};

/** Даты этапов ДРП (ключ — этап, значение — YYYY-MM-DD) */
export type DrpWorkflowStepDates = Partial<Record<DrpWorkflowStep, string>>;

/** Короткая подпись для тега (компактно) */
export const ORIENTATION_TEST_BADGE_LABEL: Record<OrientationTestWorkflowStatus, string> = {
  pending_link: "Ожидание ссылки",
  awaiting_pass: "К тесту",
  awaiting_results: "Ждём результатов",
  results_ready: "Завершена",
};

/** Поясняющий текст к статусу */
export const ORIENTATION_TEST_DESCRIPTION: Record<OrientationTestWorkflowStatus, string> = {
  pending_link: "Ожидайте ссылку для прохождения",
  awaiting_pass: "Необходимо пройти тестирование",
  awaiting_results: "Тестирование завершено, ожидайте результатов",
  results_ready: "Вы можете ознакомиться с результатами",
};

/** Дефолтный PDF для демо (файл в /public) */
export const DEFAULT_ORIENTATION_TEST_RESULTS_PDF = "/proforientation/demo-test-results.pdf";

export function resolveOrientationTestState(a: ProforientationApplication): OrientationTestState {
  const o = a.orientationTest;
  /** Если есть результат тестирования — всегда этап «Завершена», даже при устаревшем orientationTest в storage */
  if (a.result) {
    return {
      status: "results_ready",
      testUrl: o?.testUrl,
      resultsPdfUrl: o?.resultsPdfUrl ?? DEFAULT_ORIENTATION_TEST_RESULTS_PDF,
    };
  }
  if (o?.status) {
    return {
      status: o.status,
      testUrl: o.testUrl,
      resultsPdfUrl: o.resultsPdfUrl,
    };
  }
  return { status: "pending_link" };
}

export interface ProforientationApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ProforientationStatus;
  /** Сотрудник банка */
  employeeFullName: string;
  employeeTabNumber: string;
  employeeDepartment: string;
  /** Должность сотрудника (отображается под ФИО, как в справочнике вузов — ответственные лица) */
  employeePosition: string;
  employeeEmail: string;
  employeePhone: string;
  /** Участник тестирования */
  childFullName: string;
  childBirthDate: string;
  childSchoolGrade: string;
  /** Интересы / пожелания */
  interestDirections: string[];
  comment: string;
  /** Текущий этап процесса ДРП (если не задан — выводится из статуса заявки) */
  drpWorkflowStep?: DrpWorkflowStep;
  /** Даты прохождения этапов ДРП (отображаются как дд.мм.гггг) */
  drpWorkflowStepDates?: DrpWorkflowStepDates;
  /** Ответственный сотрудник ДРП (после перевода заявки в работу) */
  drpResponsibleFullName?: string;
  /** Должность ответственного ДРП (под ФИО, как у создателя заявки) */
  drpResponsiblePosition?: string;
  /** Прохождение теста на профориентацию: ссылка, PDF, этап */
  orientationTest?: OrientationTestState;
  result?: ProforientationResult;
}

export function resolveDrpWorkflowStep(a: ProforientationApplication): DrpWorkflowStep {
  if (a.drpWorkflowStep) return a.drpWorkflowStep;
  if (a.status === "completed") return "drp_consultation";
  if (a.status === "in_progress") return "third_party_testing";
  return "application_submitted";
}

export const INTEREST_DIRECTIONS = [
  { id: "it", label: "ИТ и информационная безопасность" },
  { id: "finance", label: "Финансы и экономика" },
  { id: "law", label: "Право" },
  { id: "math", label: "Математика и аналитика" },
  { id: "mgmt", label: "Менеджмент и управление" },
  { id: "eng", label: "Инженерия" },
] as const;
