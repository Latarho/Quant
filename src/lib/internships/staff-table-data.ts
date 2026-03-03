import type { InternshipStatus } from "@/types/internships";

/** Запись кадровых показателей стажировки (формат как в ДРП — сотрудники) */
export interface StaffIndicatorRow {
  id: string;
  fullName: string;
  university: string;
  positionDepartment: string;
  /** ССП — департамент */
  ssp: string;
  /** ВСП — управление / отдел */
  vsp: string;
  internshipStartDate: string;
  internshipEndDate: string;
  internshipResult: string;
  departmentHireDate: string | null;
  dismissalDate: string | null;
  status: "active" | "dismissed";
  comment?: string;
}

/** Список ВУЗов для распределения по стажерам (полные названия — в таблице показываем краткие) */
export const MOCK_UNIVERSITIES_FOR_STAFF = [
  "Московский государственный университет",
  "Санкт-Петербургский государственный университет",
  "Московский физико-технический институт",
  "Новосибирский государственный университет",
  "Высшая школа экономики",
] as const;

export const MOCK_STAFF_INDICATORS_BASE: Omit<StaffIndicatorRow, "university">[] = [
  { id: "1", fullName: "Иванов Иван Иванович", positionDepartment: "Аналитик-исследователь / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-20", dismissalDate: null, status: "active" },
  { id: "2", fullName: "Петрова Анна Сергеевна", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "3", fullName: "Сидоров Петр Олегович", positionDepartment: "Стажёр / Риски", ssp: "Риски", vsp: "Управление рисков", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-25", dismissalDate: null, status: "active" },
  { id: "4", fullName: "Козлова Мария Александровна", positionDepartment: "Ведущий аналитик / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "5", fullName: "Новиков Дмитрий Игоревич", positionDepartment: "Стажёр / Корпоративный блок", ssp: "Корпоративный блок", vsp: "Управление корпоративных проектов", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-01", dismissalDate: null, status: "active" },
  { id: "6", fullName: "Волкова Елена Сергеевна", positionDepartment: "Специалист / Операционный блок", ssp: "Операционный блок", vsp: "Операционное управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "7", fullName: "Морозов Алексей Владимирович", positionDepartment: "Стажёр / Риски", ssp: "Риски", vsp: "Управление рисков", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Уволен", departmentHireDate: null, dismissalDate: "2025-03-20", status: "dismissed" },
  { id: "8", fullName: "Соколова Ольга Николаевна", positionDepartment: "Ведущий аналитик / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-28", dismissalDate: null, status: "active" },
  { id: "9", fullName: "Лебедев Андрей Петрович", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "10", fullName: "Кузнецова Татьяна Михайловна", positionDepartment: "Стажёр / HR-направление", ssp: "HR", vsp: "Управление по работе с персоналом", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "11", fullName: "Попов Сергей Андреевич", positionDepartment: "Аналитик-исследователь / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-07", dismissalDate: null, status: "active" },
  { id: "12", fullName: "Васильева Наталья Олеговна", positionDepartment: "Стажёр / Финансы", ssp: "Финансы", vsp: "Финансовое управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "13", fullName: "Федоров Игорь Дмитриевич", positionDepartment: "Специалист / Юридический блок", ssp: "Юридический блок", vsp: "Юридическое управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "14", fullName: "Михайлова Юлия Викторовна", positionDepartment: "Аналитик-исследователь / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-22", dismissalDate: null, status: "active" },
  { id: "15", fullName: "Егоров Павел Александрович", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "16", fullName: "Никитина Анастасия Игоревна", positionDepartment: "Стажёр / Маркетинг", ssp: "Маркетинг", vsp: "Отдел маркетинга", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "17", fullName: "Орлов Владимир Сергеевич", positionDepartment: "Ведущий аналитик / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-01", dismissalDate: null, status: "active" },
  { id: "18", fullName: "Захарова Кристина Дмитриевна", positionDepartment: "Стажёр / Риски", ssp: "Риски", vsp: "Управление рисков", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Уволен", departmentHireDate: null, dismissalDate: "2025-03-19", status: "dismissed" },
  { id: "19", fullName: "Семёнов Роман Николаевич", positionDepartment: "Ведущий аналитик / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "20", fullName: "Голубева Дарья Андреевна", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-24", dismissalDate: null, status: "active" },
  { id: "21", fullName: "Виноградов Артём Олегович", positionDepartment: "Стажёр / Корпоративный блок", ssp: "Корпоративный блок", vsp: "Управление корпоративных проектов", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "22", fullName: "Борисова Виктория Павловна", positionDepartment: "Специалист / Операционный блок", ssp: "Операционный блок", vsp: "Операционное управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "23", fullName: "Королёв Максим Ильич", positionDepartment: "Аналитик-исследователь / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-26", dismissalDate: null, status: "active" },
  { id: "24", fullName: "Герасимова Екатерина Владимировна", positionDepartment: "Стажёр / Финансы", ssp: "Финансы", vsp: "Финансовое управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "25", fullName: "Тихонов Глеб Сергеевич", positionDepartment: "Аналитик-исследователь / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-02", dismissalDate: null, status: "active" },
];

export function getBaseStaffIndicators(): StaffIndicatorRow[] {
  return MOCK_STAFF_INDICATORS_BASE.map((row, index) => ({
    ...row,
    university: MOCK_UNIVERSITIES_FOR_STAFF[index % MOCK_UNIVERSITIES_FOR_STAFF.length],
  }));
}

export function getStaffSummary(rows: StaffIndicatorRow[]): {
  totalTrainees: number;
  currentEmployees: number;
  conversionPercent: number | null;
} {
  const totalTrainees = rows.length;
  const currentEmployees = rows.filter((row) => row.status === "active").length;
  const conversionPercent = totalTrainees > 0 ? Math.round((currentEmployees / totalTrainees) * 100) : null;
  return { totalTrainees, currentEmployees, conversionPercent };
}

