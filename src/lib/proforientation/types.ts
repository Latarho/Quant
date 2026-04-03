/** Заявка на профориентацию (ребёнок сотрудника банка) */
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
  /** Доля стажёров по направлению «кибер/ИБ» из этого ВУЗа среди всех учтённых */
  cyberSharePercent?: number;
}

export interface ProforientationResult {
  completedAt: string;
  scores: OrientationScores;
  summary: string;
  recommendations: UniversityRecommendation[];
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
  employeeEmail: string;
  employeePhone: string;
  /** Ребёнок */
  childFullName: string;
  childBirthDate: string;
  childSchoolGrade: string;
  /** Интересы / пожелания */
  interestDirections: string[];
  comment: string;
  /** Заполняет ДРП */
  drpScheduledDate?: string;
  drpComment?: string;
  /** Прохождение теста на профориентацию: ссылка, PDF, этап */
  orientationTest?: OrientationTestState;
  result?: ProforientationResult;
}

export const INTEREST_DIRECTIONS = [
  { id: "it", label: "ИТ и информационная безопасность" },
  { id: "finance", label: "Финансы и экономика" },
  { id: "law", label: "Право" },
  { id: "math", label: "Математика и аналитика" },
  { id: "mgmt", label: "Менеджмент и управление" },
  { id: "eng", label: "Инженерия" },
] as const;
