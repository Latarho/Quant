/**
 * Типы для модуля университетов
 */

// Тип для куратора от филиала
export interface BranchCurator {
  id: string;
  city: string;
  branch: string;
  image?: string;
  cooperationLines?: CooperationLineRecord[]; // Линии сотрудничества для филиала
  cooperationStartYear?: number; // Год начала сотрудничества
}

// Тип для договора
export interface Contract {
  id: string;
  type: "cooperation" | "scholarship" | "internship" | "bankDepartment";
  hasContract: boolean;
  contractFile?: string; // URL или путь к файлу
  number?: string; // Номер договора
  date?: string; // Дата договора
  period?: { start: string; end: string }; // Период действия (начало - конец)
  asddLink?: string; // Ссылка на АСДД
  contractBranch?: string; // Головной ВУЗ или филиал (только одно значение)
  cooperationLine?: CooperationLine; // Линия сотрудничества (drp, bko, cntr)
  archived?: boolean; // В архиве (иначе — активные, в т.ч. с истёкшим сроком)
}

// Тип для кафедры банка
export interface BankDepartment {
  id: string;
  name: string; // Название кафедры
}

// Единый тип мероприятия для ЦНТР, ДРП и Экосистемы
export type EventType =
  | "businessGame"     // Деловая игра
  | "caseChampionship" // Кейс-чемпионат
  | "diplomaDefense"   // защита диплома
  | "webinar"          // вебинар
  | "lecture"          // лекция
  | "conference"       // конференция
  | "masterClass"      // мастер-класс
  | "contact"          // контакт
  | "meeting";         // встреча

/** Варианты типа мероприятия и подписи — реэкспорт из lib для надёжной загрузки */
export { EVENT_TYPE_OPTIONS, EVENT_TYPE_LABELS } from "@/lib/event-types";

// Тип для мероприятия
export interface Event {
  id: string;
  type: EventType; // Тип мероприятия
  date: string; // Дата начала проведения
  endDate: string; // Дата окончания проведения
  status: "planned" | "in_progress" | "completed" | "cancelled"; // Статус мероприятия
  comments?: string; // Комментарии
  responsiblePerson: string[]; // Ответственные лица Банк (массив ID)
  responsiblePersonImage?: string; // Фото ответтельного лица (устаревшее, для обратной совместимости)
  /** Линии сотрудничества мероприятия (множественный выбор: ДРП, БКО, ЦНТР, Экосистема, ДКМ) */
  cooperationLine?: ("drp" | "bko" | "cntr" | "ecosystem" | "dkm")[];
  /** Головной ВУЗ или филиал: место проведения (например «Головной ВУЗ», «Московский филиал») */
  branch?: string;
  /** Показывать в ленте мероприятий (по умолчанию true при отсутствии поля) */
  showInEventsFeed?: boolean;
  /** Дата добавления записи (формат YYYY-MM-DD), отображается в формате дд.мм.гггг */
  addedAt?: string;
  /** Кто добавил запись (ФИО или идентификатор) */
  addedBy?: string;
  /** Контактное лицо со стороны ВУЗа (ФИО, должность, телефон, email) */
  universityContact?: UniversityContact;
  /** Количество участников мероприятия */
  participantsCount?: number;
  /** Данные экосистемы (только для мероприятий линии Экосистема) */
  ecosystemData?: {
    materials?: { id: string; name: string; url: string; uploadedAt: string }[];
    universityRating?: number;
    eventRating?: number;
    participantsCount?: number;
    interestedPersons?: { id: string; name: string; phone: string; comment: string }[];
  };
}

// Тип для стажера
export interface Intern {
  id: string;
  employeeName: string; // ФИО сотрудника
  age: number; // Возраст
  position: string; // Должность
  department: string; // Подразделение
  hireDate: string; // Дата приема на работу (формат YYYY-MM-DD)
  status: "active" | "dismissed"; // Статус: работает или уволен
  dismissalDate?: string; // Дата увольнения (формат YYYY-MM-DD)
  practiceInBank: boolean; // Практика в банке: да/нет
  internshipInBank: boolean; // Стажировка в банке: да/нет
  internshipStartDate?: string; // Дата начала стажировки в банке (формат YYYY-MM-DD)
  internshipEndDate?: string; // Дата окончания стажировки в банке (формат YYYY-MM-DD)
}

// Тип для практиканта (аналогичен стажеру)
export interface Practitioner {
  id: string;
  employeeName: string; // ФИО сотрудника
  age: number; // Возраст
  position: string; // Должность
  department: string; // Подразделение
  hireDate: string; // Дата приема на работу (формат YYYY-MM-DD)
  status: "active" | "dismissed"; // Статус: работает или уволен
  dismissalDate?: string; // Дата увольнения (формат YYYY-MM-DD)
  internshipInBank: boolean; // Стажировка в банке: да/нет
  internshipStartDate?: string; // Дата начала стажировки в банке (формат YYYY-MM-DD)
  internshipEndDate?: string; // Дата окончания стажировки в банке (формат YYYY-MM-DD)
  practiceStartDate: string; // Дата начала практики (формат YYYY-MM-DD)
  practiceEndDate: string; // Дата окончания практики (формат YYYY-MM-DD)
  practiceSupervisor?: string; // Руководитель практики
  practiceStatus?: "not_meets" | "meets" | "exceeds"; // Статус: не соответствует / соответствует / превосходит ожидания
  addedBy: string; // Сотрудник, добавивший запись
  comment?: string; // Комментарий
  isTarget?: boolean; // Целевой практикант
  responsibleEmployee?: string; // Ответственный сотрудник (для целевых практикантов)
}

// Тип для участника кейс-чемпионата
export interface CaseChampionshipParticipant {
  id: string;
  employeeName: string; // ФИО участника
  eventId: string; // ID мероприятия (кейс-чемпионата)
  direction?: string; // Направление
  status: "registered" | "participated" | "winner" | "prize_winner"; // Статус: зарегистрирован, участвовал, победитель, призёр
  comments?: string; // Комментарии к участию
}

// Список направлений для кейс-чемпионатов
export const CASE_CHAMPIONSHIP_DIRECTIONS = [
  "Аудит",
  "Информационная безопасность",
  "Информационные технологии",
  "Инфраструктура и ГЧП",
  "Казначейство",
  "Коммуникация и маркетинг",
  "Корпоративный бизнес",
  "МСБ",
  "Прямые инвестиции",
  "Риски",
  "Розничный бизнес",
  "Транзационный бизнес",
  "Устойчивое развитие",
  "Ценообразование",
  "Юриспруденция",
  "Agile и эффективность",
  "HR",
  "Рынки капитала",
  "Закупки и тендерные процедуры",
  "БКО",
  "Корпоративная экосистема",
  "Операционное сопровождение",
  "Финансы и контроль",
  "Цифровые продукты и розничная экосистема",
  "Эквайринг",
] as const;

// Тип для целевого практиканта
export interface TargetPractitioner {
  id: string;
  employeeName: string; // ФИО практиканта
  targetStartDate: string; // Дата начала целевой практики (формат YYYY-MM-DD)
  targetEndDate: string; // Дата окончания целевой практики (формат YYYY-MM-DD)
  department?: string; // Подразделение
  practiceSupervisor?: string; // Руководитель практики
  comments?: string; // Комментарии
}

// Тип для именного стипендианта
export interface NamedScholar {
  id: string;
  employeeName: string; // ФИО стипендианта
  scholarshipName: string; // Название стипендии
  appointmentDate: string; // Дата назначения (формат YYYY-MM-DD)
  comments?: string; // Комментарии
}

// Тип для элемента инфраструктуры ЦНТР
export interface CNTRInfrastructureItem {
  id: string;
  developmentType: "financing" | "endowment" | "endowment-fund"; // Вид развития
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента проекта ЦНТР
export interface CNTRProjectItem {
  id: string;
  projectName: string; // Название проекта
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  fundingAmount?: number; // Размер финансирования (в рублях)
  supportFormat?: "grant-cofinancing" | "ordered-rd-center-lift" | "targeted-charity"; // Формат поддержки
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента акселератора ЦНТР
export interface CNTRAcceleratorItem {
  id: string;
  developmentType?: "financing" | "endowment" | "endowment-fund"; // Вид развития (опционально, для обратной совместимости)
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип мероприятия ЦНТР — тот же набор, что у ДРП и Экосистемы
export type CNTREventType = EventType;

// Статус мероприятия ЦНТР — такой же, как у мероприятий ДРП
export type CNTREventStatus = "planned" | "in_progress" | "completed" | "cancelled";

// Материал мероприятия (файл)
export interface EventMaterial {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

// Тип для элемента мероприятий ЦНТР
export interface CNTREventItem {
  id: string;
  type?: CNTREventType; // Тип мероприятия (пока только встреча)
  date: string; // Дата (формат YYYY-MM-DD)
  endDate?: string; // Дата окончания (формат YYYY-MM-DD), для единообразия с ДРП
  status?: CNTREventStatus; // Статус: запланировано, в процессе, проведено, отменено
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
  /** Информационные материалы (PDF, Word) */
  materials?: EventMaterial[];
  /** Показывать в ленте мероприятий (как в ДРП) */
  showInEventsFeed?: boolean;
  /** Контакт со стороны ВУЗа (для единообразия с ДРП) */
  universityContact?: UniversityContact;
  /** Ответственные со стороны банка (ID), для единообразия с ДРП */
  responsiblePerson?: string[];
  /** Количество участников мероприятия */
  participantsCount?: number;
  addedAt?: string;
  addedBy?: string;
}

// Статус проекта в таблице «Проекты» ЦНТР
export type CNTRProjectStatus = "pending" | "accepted" | "rejected"; // на рассмотрении, принят, отклонён

// Элемент таблицы «Проекты» в личном кабинете ЦНТР (дата, описание, статус)
export interface CNTRProjectTableItem {
  id: string;
  date: string; // Дата (формат YYYY-MM-DD)
  description?: string; // Описание
  status?: CNTRProjectStatus; // Статус: на рассмотрении, принят, отклонён
}

// Тип для элемента образовательных проектов ЦНТР
export interface CNTREducationalProjectItem {
  id: string;
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента соглашений о сотрудничестве ЦНТР
export interface CNTRAgreementItem {
  id: string;
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  status?: "in-progress" | "signed"; // Статус: в процессе или подписано
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип линии сотрудничества
export type CooperationLine = "drp" | "bko" | "cntr" | "ecosystem" | "dkm";

// Интерфейс для контакта со стороны ВУЗа
export interface UniversityContact {
  name: string; // ФИО контактного лица
  position?: string; // Должность
  phone?: string; // Телефон
  email?: string; // Email
  isPublic?: boolean; // Показать всем (видимость контакта)
}

// Интерфейс для записи линии сотрудничества
export interface CooperationLineRecord {
  id: string;
  line: CooperationLine;
  year: number;
  responsible: string[]; // Массив ID ответственных лиц
  universityContact?: UniversityContact; // Контактное лицо со стороны ВУЗа (для обратной совместимости)
  universityContacts?: UniversityContact[]; // Массив контактных лиц со стороны ВУЗа
  /** Работа с ВУЗом по данной линии ведётся (зелёная точка — да, серая — нет) */
  isActive?: boolean;
}

// Основной интерфейс университета
export interface University {
  id: string;
  name: string;
  shortName?: string;
  inn?: string; // ИНН
  city: string;
  branch?: string[]; // Филиалы в ГПБ
  cooperationStartYear?: number;
  cooperationLine?: CooperationLine | CooperationLine[]; // Линия сотрудничества (строка для обратной совместимости или массив) - старая версия
  cooperationLineYear?: number;
  cooperationLineResponsible?: string | string[]; // Ответственные лица (строка для обратной совместимости или массив) - старая версия
  cooperationLines?: CooperationLineRecord[]; // Новый формат: массив записей линий сотрудничества
  targetAudience?: string;
  initiatorBlock?: string; // Инициатор сотрудничества (блок/ССП)
  initiatorName?: string; // Инициатор сотрудничества (ФИО)
  initiatorPosition?: string; // Должность инициатора
  initiatorImage?: string; // Фото инициатора
  branchCurators?: BranchCurator[]; // Кураторы от филиалов
  contracts?: Contract[]; // Договоры
  bankDepartments?: BankDepartment[]; // Кафедры банка
  events?: Event[]; // Мероприятия
  careerDays?: boolean; // Дни карьеры
  expertParticipation?: boolean; // Экспертное участие
  caseChampionships?: boolean; // Кейс-чемпионаты
  /** Флаги типов мероприятий для фильтрации (устаревшие, для mock-данных) */
  conference?: boolean;
  diplomaDefense?: boolean;
  businessGame?: boolean;
  allEmployees?: number; // Все сотрудники
  internHiring?: boolean; // Найм стажеров
  averageInternsPerYear?: number; // Среднее количество стажеров в год
  interns?: number; // Практиканты
  internList?: Intern[]; // Список стажеров
  practitionerList?: Practitioner[]; // Список практикантов
  caseChampionshipParticipants?: CaseChampionshipParticipant[]; // Участники кейс-чемпионатов
  targetPractitioners?: TargetPractitioner[]; // Целевые практиканты
  namedScholars?: NamedScholar[]; // Именные стипендианты
  cntrInfrastructure?: CNTRInfrastructureItem[]; // Элементы инфраструктуры ЦНТР
  cntrProjects?: CNTRProjectItem[]; // Элементы проектов ЦНТР
  cntrAcceleratorEnabled?: boolean; // Участие в Акселераторе Газпромбанк.Тех: Наука
  cntrAcceleratorItems?: CNTRAcceleratorItem[]; // Элементы акселератора ЦНТР
  cntrEventsItems?: CNTREventItem[]; // Элементы мероприятий ЦНТР
  cntrEducationalProjectsItems?: CNTREducationalProjectItem[]; // Элементы образовательных проектов ЦНТР
  cntrProjectTableItems?: CNTRProjectTableItem[]; // Элементы таблицы «Проекты» ЦНТР (дата, описание, статус)
  cntrAgreementEnabled?: boolean; // Соглашение о сотрудничестве
  cntrAgreementItems?: CNTRAgreementItem[]; // Элементы соглашений о сотрудничестве ЦНТР
  region?: string;
  description?: string;
  image?: string; // Фото/логотип ВУЗа
  bkoData?: UniversityBKOData;
  /** Активное состояние работы с ВУЗом (зелёная точка — активно, серая — неактивно) */
  isActive?: boolean;
  /** Тип ВУЗа: российский или зарубежный */
  countryType?: "russian" | "foreign";
}

// Заметка в личном кабинете БКО (лента комментариев)
export interface BkoNote {
  id: string;
  text: string;
  author?: string;
  createdAt: string; // ISO строка даты и времени
}

// Данные БКО для университета
export interface UniversityBKOData {
  // Блок Зарплатный проект
  salaryProject?: {
    students?: boolean; // Студенты
    employees?: boolean; // Сотрудники
  };
  // Блок Транзакционные продукты
  transactionalProducts?: {
    ie?: boolean; // ИЭ
    te?: boolean; // ТЭ
    sbp?: boolean; // СБП
    adm?: boolean; // АДМ
  };
  // Блок Лимит
  limit?: boolean;
  // Блок УК ГПБ фондами ЦК
  ukGpbFundsCk?: boolean;
  // Комментарий (устаревшее, для обратной совместимости)
  comment?: string;
  // Лента заметок (блог-стиль)
  notes?: BkoNote[];
}

// Тип для студента
export interface Student {
  id: string;
  fullName: string;
  position?: string;
  description?: string;
}
