import type { University, Intern, Practitioner } from "@/types/universities";

/**
 * Детерминированный RNG для генерации моков при загрузке модуля.
 * Иначе Math.random() даёт разные списки на сервере (SSR) и в браузере → ошибка гидрации React.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Структура подразделений
interface Department {
  id: string;
  name: string;
  parentId?: string;
}

// Моковые данные подразделений
const mockDepartments: Department[] = [
  { id: "dept-1", name: "Департамент автоматизации внутренних сервисов" },
  { id: "dept-2", name: "Управление развития общекорпоративных систем", parentId: "dept-1" },
  { id: "dept-3", name: "Управление разработки банковских продуктов", parentId: "dept-1" },
  { id: "dept-4", name: "Департамент информационной безопасности" },
  { id: "dept-5", name: "Управление качества и тестирования" },
];

// Интерфейс сотрудника из штатного расписания
interface Employee {
  id: string;
  fullName: string;
  position: string;
  email: string;
  departmentId?: string;
}

// Моковые данные сотрудников из штатного расписания
const mockEmployees: Employee[] = [
  { id: "emp-1", fullName: "Петров Иван Сергеевич", position: "Главный инженер", email: "ivan.petrov@example.com", departmentId: "dept-2" },
  { id: "emp-2", fullName: "Сидорова Мария Александровна", position: "Ведущий разработчик", email: "maria.sidorova@example.com", departmentId: "dept-2" },
  { id: "emp-3", fullName: "Иванов Алексей Дмитриевич", position: "Старший разработчик", email: "alexey.ivanov@example.com", departmentId: "dept-3" },
];

// Интерфейс для уведомления
interface Notification {
  id: string;
  subject: string;
  message: string;
  recipientIds: string[];
  recipientEmails: string[];
  sentAt: Date;
  status: "sent" | "pending" | "failed";
}

// Интерфейс для комментария
interface Comment {
  id: string;
  partnershipId: string;
  author: string;
  text: string;
  createdAt: Date;
}

// Интерфейс для шаблона email
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

// Расширенный интерфейс партнерства - удален

// Моковые данные для истории уведомлений
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    subject: "Приглашение на стажировку",
    message: "Уважаемые студенты, приглашаем вас принять участие в программе стажировки...",
    recipientIds: ["student-1", "student-2", "student-3"],
    recipientEmails: ["student1@university.edu", "student2@university.edu", "student3@university.edu"],
    sentAt: new Date("2024-01-15T10:30:00"),
    status: "sent",
  },
];

// Моковые данные университетов
const mockUniversities: University[] = [
  {
    id: "univ-1",
    name: "Московский государственный университет имени М.В. Ломоносова",
    shortName: "МГУ",
    inn: "7707083893",
    city: "Москва",
    branch: ["Московский филиал"],
    cooperationStartYear: 2020,
    cooperationLines: [
      {
        id: "clr-mgu-1",
        line: "drp",
        year: 2020,
        responsible: ["person-1", "person-2"],
        universityContacts: [
          {
            name: "Петров Сергей Александрович",
            position: "Декан экономического факультета",
            phone: "+7 (495) 939-22-33",
            email: "petrov@econ.msu.ru",
            isPublic: true,
          },
          {
            name: "Кузнецова Мария Ивановна",
            position: "Заведующая кафедрой",
            phone: "+7 (495) 939-55-66",
            email: "kuznetsova@econ.msu.ru",
            isPublic: false,
          },
        ],
      },
      {
        id: "clr-mgu-2",
        line: "bko",
        year: 2022,
        responsible: ["person-3"],
        universityContacts: [
          {
            name: "Сидорова Елена Викторовна",
            position: "Заместитель декана по учебной работе",
            phone: "+7 (495) 939-33-44",
            email: "sidorova@msu.ru",
            isPublic: false,
          },
        ],
      },
    ],
    targetAudience: "Студенты IT-направлений",
    isActive: true,
    initiatorBlock: "Блок развития",
    initiatorName: "Иванов Иван Иванович",
    initiatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { 
        id: "cur-1", 
        city: "Москва", 
        branch: "Московский филиал", 
        cooperationLines: [
          { 
            id: "clr-cur-1-1", 
            line: "drp", 
            year: 2020, 
            responsible: ["person-1"],
            universityContacts: [
              {
                name: "Козлов Андрей Михайлович",
                position: "Координатор практик",
                phone: "+7 (495) 123-45-67",
                email: "kozlov@msu-branch.ru",
                isPublic: true,
              },
            ],
          },
          { id: "clr-cur-1-2", line: "bko", year: 2021, responsible: ["person-2"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-1", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-mgu-2020.pdf",
        number: "Д-2020-001",
        date: "2020-03-15",
        period: { start: "2020-03-15", end: "2025-03-14" },
        asddLink: "https://asdd.example.com/contract/2020-001",
        contractBranch: "Головной ВУЗ",
        cooperationLine: "drp"
      },
      { 
        id: "cont-2", 
        type: "internship", 
        hasContract: true, 
        contractFile: "contract-mgu-internship.pdf",
        number: "Д-2021-045",
        date: "2021-06-10",
        period: { start: "2021-06-10", end: "2026-06-09" },
        asddLink: "https://asdd.example.com/contract/2021-045",
        contractBranch: "Московский филиал",
        cooperationLine: "bko"
      },
    ],
    events: [
      { id: "event-mgu-1", type: "conference", date: "2024-02-10", endDate: "2024-02-12", status: "completed", responsiblePerson: ["person-1"], responsiblePersonImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", comments: "Дни карьеры для студентов факультета вычислительной математики и кибернетики.", cooperationLine: ["drp"], branch: "Головной ВУЗ", addedAt: "2024-01-25", addedBy: "Иванова Е.С." },
    ],
    conference: true,
    diplomaDefense: true,
    businessGame: true,
    allEmployees: 150,
    internHiring: true,
    averageInternsPerYear: 25,
    interns: 10,
    internList: [
      {
        id: "intern-mgu-1",
        employeeName: "Иванов Иван Иванович",
        age: 23,
        position: "Стажер-разработчик",
        department: "Департамент автоматизации внутренних сервисов",
        hireDate: "2024-01-15",
        status: "active",
        practiceInBank: true,
        internshipInBank: true,
        internshipStartDate: "2023-06-01",
        internshipEndDate: "2023-08-31",
      },
      {
        id: "intern-mgu-2",
        employeeName: "Петрова Мария Сергеевна",
        age: 24,
        position: "Стажер-аналитик",
        department: "Управление развития общекорпоративных систем",
        hireDate: "2024-02-01",
        status: "active",
        practiceInBank: true,
        internshipInBank: true,
        internshipStartDate: "2023-07-15",
        internshipEndDate: "2023-09-30",
      },
      {
        id: "intern-mgu-3",
        employeeName: "Сидоров Алексей Дмитриевич",
        age: 22,
        position: "Стажер-тестировщик",
        department: "Управление качества и тестирования",
        hireDate: "2024-03-10",
        status: "dismissed",
        dismissalDate: "2024-06-15",
        practiceInBank: false,
        internshipInBank: false,
      },
    ],
    region: "Московская область",
    description: "Ведущий университет России",
    image: "https://via.placeholder.com/100?text=МГУ",
  },
  {
    id: "univ-2",
    name: "Санкт-Петербургский государственный университет",
    shortName: "СПбГУ",
    inn: "7801002016",
    city: "Санкт-Петербург",
    branch: ["Санкт-Петербургский филиал"],
    cooperationStartYear: 2019,
    cooperationLines: [
      {
        id: "clr-spbgu-1",
        line: "bko",
        year: 2019,
        responsible: ["person-4", "person-5"],
      },
      {
        id: "clr-spbgu-2",
        line: "cntr",
        year: 2021,
        responsible: ["person-6"],
      },
    ],
    targetAudience: "Студенты экономических направлений",
    isActive: false,
    initiatorBlock: "Блок управления",
    initiatorName: "Смирнова Анна Владимировна",
    initiatorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { 
        id: "cur-2", 
        city: "Санкт-Петербург", 
        branch: "Санкт-Петербургский филиал", 
        cooperationLines: [
          { id: "clr-cur-2-1", line: "bko", year: 2019, responsible: ["person-4"] },
        ],
        cooperationStartYear: 2019,
      },
      { 
        id: "cur-3", 
        city: "Санкт-Петербург", 
        branch: "Центральный офис", 
        cooperationLines: [
          { id: "clr-cur-3-1", line: "drp", year: 2020, responsible: ["person-5"] },
          { id: "clr-cur-3-2", line: "bko", year: 2020, responsible: ["person-6"] },
          { id: "clr-cur-3-3", line: "cntr", year: 2021, responsible: ["person-7"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-3", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2019-078",
        date: "2019-09-01",
        period: { start: "2019-09-01", end: "2024-08-31" },
        asddLink: "https://asdd.example.com/contract/2019-078",
        contractBranch: "Санкт-Петербургский филиал",
        cooperationLine: "bko"
      },
      { 
        id: "cont-4", 
        type: "scholarship", 
        hasContract: true, 
        contractFile: "contract-spbgu-scholarship.pdf",
        number: "Д-2022-012",
        date: "2022-02-20",
        period: { start: "2022-02-20", end: "2027-02-19" },
        contractBranch: "Головной ВУЗ",
        cooperationLine: "cntr"
      },
    ],
    events: [
      { id: "event-spbgu-2", type: "businessGame", date: "2024-05-25", endDate: "2024-05-27", status: "completed", responsiblePerson: ["person-4"], responsiblePersonImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", comments: "Кейс-чемпионат по финансовому моделированию.", cooperationLine: ["cntr"], branch: "Головной ВУЗ", addedAt: "2024-05-10", addedBy: "Козлов Д.П." },
    ],
    conference: true,
    diplomaDefense: false,
    businessGame: true,
    allEmployees: 120,
    internHiring: true,
    averageInternsPerYear: 18,
    interns: 8,
    region: "Ленинградская область",
    description: "Один из старейших университетов России",
    image: "https://via.placeholder.com/100?text=СПбГУ",
  },
  {
    id: "univ-3",
    name: "Московский физико-технический институт",
    shortName: "МФТИ",
    inn: "5001002222",
    city: "Долгопрудный",
    branch: ["Московский филиал"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-mfti-1",
        line: "drp",
        year: 2021,
        responsible: ["person-7"],
      },
      {
        id: "clr-mfti-2",
        line: "bko",
        year: 2021,
        responsible: ["person-8", "person-9"],
      },
      {
        id: "clr-mfti-3",
        line: "cntr",
        year: 2023,
        responsible: ["person-10"],
      },
    ],
    targetAudience: "Студенты технических направлений",
    isActive: true,
    initiatorBlock: "Блок технологий",
    initiatorName: "Соколов Алексей Николаевич",
    branchCurators: [
      { 
        id: "cur-4", 
        city: "Долгопрудный", 
        branch: "Московский филиал", 
        cooperationLines: [
          { id: "clr-cur-4-1", line: "drp", year: 2021, responsible: ["person-7"] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-5", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2021-033",
        date: "2021-04-12",
        period: { start: "2021-04-12", end: "2026-04-11" },
        asddLink: "https://asdd.example.com/contract/2021-033",
        contractBranch: "Московский филиал",
        cooperationLine: "drp"
      },
      { 
        id: "cont-6", 
        type: "internship", 
        hasContract: true, 
        contractFile: "contract-mfti-internship.pdf",
        number: "Д-2023-089",
        date: "2023-08-05",
        period: { start: "2023-08-05", end: "2028-08-04" },
        contractBranch: "Головной ВУЗ",
        cooperationLine: "cntr"
      },
    ],
    events: [
      { id: "event-mfti-1", type: "diplomaDefense", date: "2024-04-05", endDate: "2024-04-05", status: "completed", responsiblePerson: ["person-5"], responsiblePersonImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", comments: "Участие в качестве эксперта на конференции по машинному обучению.", cooperationLine: ["drp"], branch: "Московский филиал", addedAt: "2024-03-20", addedBy: "Соколов А.Н." },
      { id: "event-mfti-3", type: "diplomaDefense", date: "2024-11-10", endDate: "2024-11-10", status: "planned", responsiblePerson: ["person-7"], responsiblePersonImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", comments: "Планируется участие в качестве эксперта на защите дипломных проектов.", cooperationLine: ["cntr"], branch: "Центральный офис", addedAt: "2024-10-28", addedBy: "Новиков Р.С." },
    ],
    conference: false,
    diplomaDefense: true,
    businessGame: true,
    allEmployees: 95,
    internHiring: true,
    averageInternsPerYear: 30,
    interns: 15,
    region: "Московская область",
    description: "Ведущий технический университет",
    image: "https://via.placeholder.com/100?text=МФТИ",
  },
  {
    id: "univ-4",
    name: "Национальный исследовательский университет «Высшая школа экономики»",
    shortName: "НИУ ВШЭ",
    inn: "7707083893",
    city: "Москва",
    branch: ["Московский филиал", "Центральный офис"],
    cooperationStartYear: 2018,
    cooperationLines: [
      {
        id: "clr-hse-1",
        line: "drp",
        year: 2018,
        responsible: ["person-1", "person-3"],
        universityContacts: [
          {
            name: "Волкова Анна Сергеевна",
            position: "Директор центра карьеры",
            phone: "+7 (495) 772-95-90 (доб. 22334)",
            email: "volkova@hse.ru",
            isPublic: true,
          },
          {
            name: "Краснов Павел Михайлович",
            position: "Заместитель декана по практике",
            phone: "+7 (495) 772-95-90 (доб. 22456)",
            email: "pkrasnov@hse.ru",
            isPublic: true,
          },
          {
            name: "Титова Елена Владимировна",
            position: "Координатор программ стажировок",
            phone: "+7 (495) 772-95-90 (доб. 22567)",
            email: "etitova@hse.ru",
            isPublic: false,
          },
          {
            name: "Семенов Алексей Игоревич",
            position: "Специалист по работе с партнерами",
            phone: "+7 (495) 772-95-90 (доб. 22678)",
            email: "asemenov@hse.ru",
            isPublic: false,
          },
        ],
      },
      {
        id: "clr-hse-2",
        line: "bko",
        year: 2019,
        responsible: ["person-2", "person-4"],
      },
      {
        id: "clr-hse-3",
        line: "cntr",
        year: 2020,
        responsible: ["person-5"],
      },
      {
        id: "clr-hse-4",
        line: "ecosystem",
        year: 2024,
        responsible: ["person-1", "person-3"],
      },
    ],
    targetAudience: "Студенты экономики, менеджмента и IT",
    initiatorBlock: "Блок стратегии",
    initiatorName: "Морозова Ольга Александровна",
    initiatorPosition: "Руководитель направления развития талантов",
    branchCurators: [
      { 
        id: "cur-5", 
        city: "Москва", 
        branch: "Московский филиал", 
        cooperationLines: [
          { id: "clr-cur-5-1", line: "drp", year: 2018, responsible: ["person-1"] },
          { id: "clr-cur-5-2", line: "bko", year: 2019, responsible: ["person-3"] },
        ],
        cooperationStartYear: 2018,
      },
      { 
        id: "cur-6", 
        city: "Москва", 
        branch: "Центральный офис", 
        cooperationLines: [
          { id: "clr-cur-6-1", line: "drp", year: 2018, responsible: ["person-1", "person-3"] },
        ],
        cooperationStartYear: 2018,
      },
    ],
    bkoData: {
      salaryProject: { students: true, employees: true },
      transactionalProducts: { ie: true, te: false, sbp: true, adm: true },
      limit: true,
      ukGpbFundsCk: true,
      comment: "Тестовые данные БКО для НИУ ВШЭ: подключены зарплатный проект (студенты и сотрудники), транзакционные продукты (ИЭ, СБП, АДМ), лимит и УК ГПБ фондами ЦК.",
    },
    contracts: [
      { 
        id: "cont-7", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-hse-2018.pdf",
        number: "Д-2018-056",
        date: "2018-11-20",
        period: { start: "2018-11-20", end: "2023-11-19" },
        asddLink: "https://asdd.example.com/contract/2018-056",
        contractBranch: "Головной ВУЗ",
        cooperationLine: "drp"
      },
      { 
        id: "cont-8", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2020-102",
        date: "2020-05-18",
        period: { start: "2020-05-18", end: "2025-05-17" },
        contractBranch: "Московский филиал",
        cooperationLine: "bko"
      },
      { 
        id: "cont-9", 
        type: "internship", 
        hasContract: true,
        number: "Д-2022-067",
        date: "2022-07-22",
        period: { start: "2022-07-22", end: "2027-07-21" },
        asddLink: "https://asdd.example.com/contract/2022-067",
        contractBranch: "Головной ВУЗ",
        cooperationLine: "drp"
      },
      { 
        id: "cont-hse-1", 
        type: "bankDepartment", 
        hasContract: true,
        number: "Д-2023-145",
        date: "2023-03-10",
        period: { start: "2023-03-10", end: "2028-03-09" },
        asddLink: "https://asdd.example.com/contract/2023-145",
        contractBranch: "Московский филиал",
        contractFile: "contract-hse-bank-department-2023.pdf",
        cooperationLine: "cntr"
      },
      { 
        id: "cont-hse-2", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2024-089",
        date: "2024-01-15",
        period: { start: "2024-01-15", end: "2029-01-14" },
        asddLink: "https://asdd.example.com/contract/2024-089",
        contractBranch: "Центральный офис",
        contractFile: "contract-hse-cooperation-2024.pdf",
        cooperationLine: "bko"
      },
      { 
        id: "cont-hse-3", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2023-278",
        date: "2023-09-05",
        period: { start: "2023-09-05", end: "2028-09-04" },
        contractBranch: "Головной ВУЗ",
        cooperationLine: "drp"
      },
      { 
        id: "cont-hse-4", 
        type: "internship", 
        hasContract: true,
        number: "Д-2024-156",
        date: "2024-06-01",
        period: { start: "2024-06-01", end: "2029-05-31" },
        asddLink: "https://asdd.example.com/contract/2024-156",
        contractBranch: "Московский филиал",
        contractFile: "contract-hse-internship-2024.pdf",
        cooperationLine: "cntr"
      },
      { 
        id: "cont-hse-5", 
        type: "bankDepartment", 
        hasContract: true,
        number: "Д-2022-334",
        date: "2022-12-20",
        period: { start: "2022-12-20", end: "2027-12-19" },
        contractBranch: "Головной ВУЗ",
        cooperationLine: "bko"
      },
      { 
        id: "cont-hse-6", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2023-201",
        date: "2023-04-12",
        period: { start: "2023-04-12", end: "2028-04-11" },
        asddLink: "https://asdd.example.com/contract/2023-201",
        contractBranch: "Санкт-Петербургский филиал",
        contractFile: "contract-hse-cooperation-2023.pdf",
        cooperationLine: "drp"
      },
      { 
        id: "cont-hse-7", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2024-067",
        date: "2024-02-01",
        period: { start: "2024-02-01", end: "2029-01-31" },
        contractBranch: "Московский филиал",
        cooperationLine: "cntr"
      },
      { 
        id: "cont-hse-8", 
        type: "internship", 
        hasContract: true,
        number: "Д-2022-189",
        date: "2022-09-15",
        period: { start: "2022-09-15", end: "2023-09-14" },
        asddLink: "https://asdd.example.com/contract/2022-189",
        contractBranch: "Головной ВУЗ",
        contractFile: "contract-hse-internship-2022.pdf",
        cooperationLine: "bko",
        archived: true
      },
      { 
        id: "cont-hse-9", 
        type: "bankDepartment", 
        hasContract: true,
        number: "Д-2024-212",
        date: "2024-05-20",
        period: { start: "2024-05-20", end: "2029-05-19" },
        asddLink: "https://asdd.example.com/contract/2024-212",
        contractBranch: "Центральный офис",
        contractFile: "contract-hse-bank-department-2024.pdf",
        cooperationLine: "drp"
      },
      { 
        id: "cont-hse-10", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2019-034",
        date: "2019-06-10",
        period: { start: "2019-06-10", end: "2024-06-09" },
        asddLink: "https://asdd.example.com/contract/2019-034",
        contractBranch: "Московский филиал",
        cooperationLine: "bko",
        archived: true
      },
      { 
        id: "cont-hse-11", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2024-118",
        date: "2024-03-05",
        period: { start: "2024-03-05", end: "2029-03-04" },
        contractBranch: "Головной ВУЗ",
        cooperationLine: "drp"
      },
      { 
        id: "cont-hse-12", 
        type: "internship", 
        hasContract: true,
        number: "Д-2023-267",
        date: "2023-11-01",
        period: { start: "2023-11-01", end: "2028-10-31" },
        asddLink: "https://asdd.example.com/contract/2023-267",
        contractBranch: "Санкт-Петербургский филиал",
        contractFile: "contract-hse-internship-2023.pdf",
        cooperationLine: "cntr"
      },
    ],
    events: [
      { id: "event-hse-1", type: "conference", date: "2024-03-15", endDate: "2024-03-17", status: "completed", responsiblePerson: ["person-1"], responsiblePersonImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", comments: "Проведены дни карьеры для студентов экономического факультета. В мероприятии приняли участие более 150 студентов 3-4 курсов. Были организованы мастер-классы по подготовке резюме, тренинги по прохождению собеседований и презентации карьерных треков в банке. Особый интерес вызвала секция по работе с корпоративными клиентами.", cooperationLine: ["drp"], branch: "Головной ВУЗ", addedAt: "2024-03-01", addedBy: "Иванова Е.С.", universityContact: { name: "Кузнецова Анна Владимировна", position: "Доцент кафедры финансов, куратор карьерного центра", phone: "+7 (495) 772-95-90", email: "a.kuznetsova@hse.ru" } },
      { id: "event-hse-3", type: "businessGame", date: "2024-05-10", endDate: "2024-05-12", status: "completed", responsiblePerson: ["person-3"], responsiblePersonImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", comments: "Кейс-чемпионат по банковскому делу. В финал вышли 8 команд из 24 участвовавших. Победила команда студентов 3 курса с проектом по оптимизации процессов кредитования МСБ. Призовой фонд составил 300 000 рублей. Все финалисты получили приоритетное право на стажировку.", cooperationLine: ["cntr"], branch: "Центральный офис", addedAt: "2024-04-25", addedBy: "Смирнова О.И.", universityContact: { name: "Орлова Мария Сергеевна", position: "Руководитель департамента развития карьеры студентов", phone: "+7 (495) 772-95-92", email: "m.orlova@hse.ru" } },
      { id: "event-hse-4", type: "conference", date: "2024-09-25", endDate: "2024-09-27", status: "planned", responsiblePerson: ["person-4"], responsiblePersonImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", comments: "Запланированы дни карьеры для студентов IT-направления. Ожидается участие более 200 студентов. В программе: хакатон по разработке финтех-решений, воркшопы по машинному обучению в банкинге, нетворкинг-сессии с техническими лидерами банка. Подготовлены специальные треки для backend и frontend разработчиков.", cooperationLine: ["drp"], branch: "Санкт-Петербургский филиал", addedAt: "2024-09-10", addedBy: "Козлов Д.П." },
      { id: "event-hse-6", type: "businessGame", date: "2024-11-20", endDate: "2024-11-22", status: "planned", responsiblePerson: ["person-6"], responsiblePersonImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", comments: "Организация кейс-чемпионата по управлению рисками в банковской сфере. Тематика включает кредитные, операционные и рыночные риски. Приглашены команды из 10 ведущих вузов страны. Общий призовой фонд — 500 000 рублей. Победители получат возможность пройти стажировку в департаменте риск-менеджмента.", cooperationLine: ["cntr"], branch: "Московский филиал", addedAt: "2024-11-05", addedBy: "Волкова М.К." },
      { id: "event-hse-7", type: "conference", date: "2024-12-05", endDate: "2024-12-07", status: "planned", responsiblePerson: ["person-7"], responsiblePersonImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face", comments: "Дни карьеры для выпускников магистратуры. Фокус на карьерные возможности в банковском секторе для специалистов с углублённой подготовкой. Запланированы индивидуальные консультации с HR-партнёрами, экскурсии в офисы банка, презентации лидерских программ развития. Ожидается участие 80+ магистрантов.", cooperationLine: ["drp"], branch: "Головной ВУЗ", addedAt: "2024-11-20", addedBy: "Новиков Р.С." },
      { id: "event-hse-9", type: "webinar", date: "2024-02-01", endDate: "2024-02-01", status: "completed", responsiblePerson: ["person-2"], comments: "Презентация программ стажировок для студентов 2 курса. Проведена в формате онлайн-вебинара с интерактивными элементами. Подключились 180 студентов. Представлены 8 направлений стажировок, условия участия, карьерные перспективы. Получено 45 заявок на участие в отборе непосредственно после мероприятия.", cooperationLine: ["cntr"], branch: "Московский филиал", addedAt: "2024-01-22", addedBy: "Лебедева А.С.", universityContact: { name: "Федорова Елена Игоревна", position: "Координатор программ стажировок", phone: "+7 (495) 772-95-94", email: "e.fedorova@hse.ru" } },
      { id: "event-hse-10", type: "diplomaDefense", date: "2024-02-20", endDate: "2024-02-20", status: "completed", responsiblePerson: ["person-3"], comments: "Экспертиза студенческих проектов по направлению «Финансовые технологии». Рассмотрено 15 проектов на различных стадиях готовности. Даны рекомендации по доработке для 8 команд. Три проекта отобраны для пилотирования в рамках акселератора банка. Выделено менторское сопровождение для перспективных команд.", cooperationLine: ["drp"], branch: "Головной ВУЗ", addedAt: "2024-02-12", addedBy: "Федорова М.Д." },
      { id: "event-hse-12", type: "conference", date: "2024-04-05", endDate: "2024-04-07", status: "completed", responsiblePerson: ["person-5"], comments: "Дни карьеры для магистрантов программы «Финансы». Трёхдневное мероприятие включало: день знакомства с корпоративной культурой, день погружения в бизнес-процессы, день карьерного планирования. Участвовало 65 магистрантов. 28 из них подали заявки на позиции junior-аналитиков.", cooperationLine: ["cntr"], branch: "Головной ВУЗ", addedAt: "2024-03-22", addedBy: "Петров А.В." },
      { id: "event-hse-13", type: "contact", date: "2024-04-18", endDate: "2024-04-18", status: "completed", responsiblePerson: ["person-6"], comments: "Совещание по плану совместных мероприятий на 2024 год. Утверждён календарь из 24 мероприятий. Согласованы бюджеты на кейс-чемпионаты, дни карьеры и научные конференции. Определены ответственные лица с обеих сторон. Запланированы ежеквартальные статус-встречи для контроля выполнения.", cooperationLine: ["drp"], branch: "Московский филиал", addedAt: "2024-04-08", addedBy: "Смирнова О.И.", universityContact: { name: "Павлова Ольга Александровна", position: "Начальник управления по работе с партнёрами", phone: "+7 (495) 772-95-95", email: "o.pavlova@hse.ru" } },
      { id: "event-hse-15", type: "diplomaDefense", date: "2024-05-22", endDate: "2024-05-22", status: "completed", responsiblePerson: ["person-1"], comments: "Участие в жюри олимпиады по экономике среди студентов. Оценивались решения кейсов по макроэкономике и финансовым рынкам. В олимпиаде приняли участие 120 студентов из 8 вузов. Вручены специальные призы от банка трём лучшим участникам с приглашением на экскурсию в головной ВУЗ.", cooperationLine: ["cntr"], branch: "Головной ВУЗ", addedAt: "2024-05-12", addedBy: "Соколов А.Н." },
      { id: "event-hse-16", type: "businessGame", date: "2024-06-10", endDate: "2024-06-12", status: "in_progress", responsiblePerson: ["person-2"], comments: "Кейс-чемпионат по риск-менеджменту в активной фазе. Регистрация завершена — подано 32 заявки от команд. Кейс посвящён разработке модели оценки кредитного риска для сегмента МСБ. Полуфиналы пройдут онлайн, финал — очно в офисе банка. Призовой фонд — 400 000 рублей.", cooperationLine: ["drp"], branch: "Санкт-Петербургский филиал", addedAt: "2024-05-28", addedBy: "Волкова М.К." },
      { id: "event-hse-18", type: "contact", date: "2024-07-15", endDate: "2024-07-15", status: "planned", responsiblePerson: ["person-4"], comments: "Планирование осенних мероприятий с кафедрой банковского дела. На повестке: согласование тем для гостевых лекций, обсуждение формата осеннего кейс-чемпионата, планирование совместной научной конференции. Участвуют заведующий кафедрой, ведущие преподаватели и представители HR-блока банка.", cooperationLine: ["cntr"], branch: "Московский филиал", addedAt: "2024-07-05", addedBy: "Морозова Т.И." },
      { id: "event-hse-19", type: "webinar", date: "2024-08-20", endDate: "2024-08-20", status: "planned", responsiblePerson: ["person-5"], comments: "Онлайн-встреча с кураторами студенческих групп перед началом учебного года. Цель — информирование о программах сотрудничества банка с университетом, планах на семестр, возможностях для студентов. Кураторы получат информационные материалы для распространения среди студентов.", cooperationLine: ["drp"], branch: "Центральный офис", addedAt: "2024-08-08", addedBy: "Лебедева А.С." },
      { id: "event-hse-21", type: "businessGame", date: "2024-09-25", endDate: "2024-09-27", status: "planned", responsiblePerson: ["person-7"], comments: "Кейс-чемпионат по устойчивому развитию и ESG в банковской сфере. Актуальная тематика привлекает повышенный интерес студентов. Планируется участие команд из 12 вузов. Кейс разработан совместно с ESG-подразделением банка. Призёры получат возможность стажировки в проектах устойчивого развития.", cooperationLine: ["cntr"], branch: "Санкт-Петербургский филиал", addedAt: "2024-09-12", addedBy: "Иванова Е.С." },
      { id: "event-hse-22", type: "conference", date: "2024-10-10", endDate: "2024-10-12", status: "planned", responsiblePerson: ["person-1"], comments: "Осенние дни карьеры для бакалавров 4 курса — целевой аудитории для программы Graduate Recruitment. Программа включает: ярмарку вакансий, speed-dating с руководителями подразделений, воркшопы по soft skills. Ожидается участие 180+ студентов. Цель — закрыть 40 позиций молодых специалистов.", cooperationLine: ["drp"], branch: "Головной ВУЗ", addedAt: "2024-09-26", addedBy: "Петров А.В." },
      { id: "event-hse-24", type: "webinar", date: "2024-11-05", endDate: "2024-11-05", status: "planned", responsiblePerson: ["person-3"], comments: "Информационная рассылка о программах стажировок 2025 года. Охват — все студенты 2-4 курсов профильных направлений (около 1500 человек). В рассылке: описание программ, сроки подачи заявок, истории успеха прошлых стажёров. Запланирована серия reminder-писем.", cooperationLine: ["cntr"], branch: "Центральный офис", addedAt: "2024-10-25", addedBy: "Козлов Д.П." },
      { id: "event-hse-25", type: "diplomaDefense", date: "2024-11-18", endDate: "2024-11-18", status: "planned", responsiblePerson: ["person-4"], comments: "Участие в межвузовской конференции «Банк и университет: модели эффективного партнёрства». Запланирован доклад о лучших практиках сотрудничества и совместной подготовки кадров. Ожидается участие представителей 25 вузов и 15 банков. Хорошая площадка для обмена опытом.", cooperationLine: ["drp"], branch: "Головной ВУЗ", addedAt: "2024-11-05", addedBy: "Соколов А.Н." },
      { id: "event-hse-27", type: "contact", date: "2024-08-05", endDate: "2024-08-05", status: "cancelled", responsiblePerson: ["person-6"], comments: "Встреча с деканатом по согласованию осеннего графика отменена по инициативе вуза в связи с изменением внутреннего расписания.", cooperationLine: ["drp"], branch: "Головной ВУЗ", addedAt: "2024-07-20", addedBy: "Новиков Р.С." },
      { id: "event-hse-27b", type: "conference", date: "2024-12-15", endDate: "2024-12-17", status: "planned", responsiblePerson: ["person-6"], comments: "Дни карьеры для выпускников бакалавриата — завершающее крупное мероприятие года. Программа адаптирована под студентов, заканчивающих обучение зимой. Особый фокус на программы management trainee и позиции с быстрым карьерным ростом. Планируется участие 120 студентов.", cooperationLine: ["cntr"], branch: "Головной ВУЗ", addedAt: "2024-12-02", addedBy: "Новиков Р.С." },
      { id: "event-hse-drp-cancelled-2", type: "diplomaDefense", date: "2024-09-12", endDate: "2024-09-12", status: "cancelled", responsiblePerson: ["person-2"], comments: "Экспертное участие в защите магистерских работ отменено в связи с переносом сроков защиты на факультете.", cooperationLine: ["drp"], branch: "Московский филиал", addedAt: "2024-09-01", addedBy: "Петров А.В." },
      { id: "event-hse-drp-cancelled-3", type: "conference", date: "2024-11-08", endDate: "2024-11-10", status: "cancelled", responsiblePerson: ["person-4"], comments: "Дни карьеры ДРП отменены по согласованию сторон из-за ограничений по помещению со стороны вуза.", cooperationLine: ["drp"], branch: "Санкт-Петербургский филиал", addedAt: "2024-10-20", addedBy: "Козлов Д.П." },
      { id: "event-hse-28", type: "contact", date: "2025-01-20", endDate: "2025-01-20", status: "planned", responsiblePerson: ["person-7"], comments: "Стартовая встреча по плану мероприятий 2025 года. Презентация стратегии работы с вузами, утверждение календаря мероприятий, распределение бюджетов и ответственных. Планируется расширить сотрудничество — добавить 3 новых формата мероприятий и увеличить охват студентов на 30%.", cooperationLine: ["drp"], branch: "Московский филиал", addedAt: "2025-01-10", addedBy: "Морозова Т.И." },
      { id: "event-hse-30", type: "diplomaDefense", date: "2025-03-05", endDate: "2025-03-05", status: "planned", responsiblePerson: ["person-2"], comments: "Экспертная сессия по тематике ЦНТР — центров научно-технологического развития. Обсуждение перспективных направлений сотрудничества: совместные R&D проекты, создание лабораторий, привлечение студентов к исследовательской работе. Участвуют представители научного блока университета и инновационного подразделения банка.", cooperationLine: ["cntr"], branch: "Головной ВУЗ", addedAt: "2025-02-22", addedBy: "Федорова М.Д." },
      { id: "event-hse-ecosystem-1", type: "conference", date: "2025-04-10", endDate: "2025-04-12", status: "planned", responsiblePerson: ["person-1"], comments: "Дни карьеры Экосистема для студентов ВШЭ. Презентация программ партнёрской экосистемы банка, возможностей для стартапов и проектов в сфере финтех.", cooperationLine: ["ecosystem"], branch: "Головной ВУЗ", addedAt: "2025-03-20", addedBy: "Иванова Е.С.", universityContact: { name: "Кузнецова Анна Владимировна", position: "Куратор центра карьеры", phone: "+7 (495) 772-95-90", email: "a.kuznetsova@hse.ru" }, ecosystemData: { materials: [{ id: "m1", name: "Презентация Экосистема 2025.pdf", url: "#", uploadedAt: "2025-03-18T10:00:00Z" }], universityRating: 5, eventRating: 4, participantsCount: 180, interestedPersons: [{ id: "ip1", name: "Кузнецова Анна Владимировна", phone: "+7 (495) 772-95-90", comment: "" }, { id: "ip2", name: "Сидоров Дмитрий", phone: "+7 (495) 772-95-91", comment: "" }] } },
      { id: "event-hse-ecosystem-2", type: "diplomaDefense", date: "2025-04-25", endDate: "2025-04-25", status: "planned", responsiblePerson: ["person-3"], comments: "Участие в качестве эксперта в акселераторе стартапов Экосистема. Оценка проектов студентов ВШЭ в области финансовых технологий и digital-решений.", cooperationLine: ["ecosystem"], branch: "Московский филиал", addedAt: "2025-04-01", addedBy: "Смирнова О.И.", ecosystemData: { materials: [], universityRating: 4, eventRating: 5, participantsCount: 45, interestedPersons: [{ id: "ip3", name: "Орлова Мария Сергеевна", phone: "+7 (495) 772-95-92", comment: "" }] } },
      { id: "event-hse-ecosystem-3", type: "businessGame", date: "2025-05-15", endDate: "2025-05-17", status: "planned", responsiblePerson: ["person-5"], comments: "Кейс-чемпионат Экосистема по интеграции API банковских сервисов. Студенты разрабатывают решения для подключения к экосистеме партнёров банка.", cooperationLine: ["ecosystem"], branch: "Головной ВУЗ", addedAt: "2025-04-28", addedBy: "Соколов А.Н.", universityContact: { name: "Орлова Мария Сергеевна", position: "Руководитель департамента карьеры", phone: "+7 (495) 772-95-92", email: "m.orlova@hse.ru" }, ecosystemData: { materials: [{ id: "m2", name: "Регламент кейс-чемпионата.docx", url: "#", uploadedAt: "2025-04-25T14:30:00Z" }, { id: "m3", name: "API-документация.pdf", url: "#", uploadedAt: "2025-04-26T09:00:00Z" }], universityRating: 5, eventRating: 5, participantsCount: 120, interestedPersons: [{ id: "ip4", name: "Орлова Мария Сергеевна", phone: "+7 (495) 772-95-92", comment: "" }, { id: "ip5", name: "Волков Андрей Николаевич", phone: "+7 (495) 772-95-93", comment: "" }] } },
      { id: "event-hse-ecosystem-4", type: "contact", date: "2025-03-18", endDate: "2025-03-18", status: "completed", responsiblePerson: ["person-2"], comments: "Встреча по запуску партнёрской программы Экосистема с ВШЭ. Обсуждение форматов взаимодействия: хакатоны, менторство, доступ к песочнице API.", cooperationLine: ["ecosystem"], branch: "Центральный офис", addedAt: "2025-03-05", addedBy: "Петров А.В.", universityContact: { name: "Волков Андрей Николаевич", position: "Декан факультета", phone: "+7 (495) 772-95-93", email: "a.volkov@hse.ru" }, ecosystemData: { materials: [{ id: "m4", name: "Протокол встречи.pdf", url: "#", uploadedAt: "2025-03-19T11:00:00Z" }], universityRating: 5, eventRating: 5, participantsCount: 12, interestedPersons: [{ id: "ip6", name: "Волков Андрей Николаевич", phone: "+7 (495) 772-95-93", comment: "" }, { id: "ip7", name: "Павлова Ольга", phone: "+7 (495) 772-95-95", comment: "" }] } },
      { id: "event-hse-ecosystem-5", type: "webinar", date: "2025-06-01", endDate: "2025-06-01", status: "planned", responsiblePerson: ["person-4"], comments: "Вебинар о возможностях экосистемы банка для студентов и выпускников ВШЭ. Презентация API Marketplace, программ для разработчиков и стартапов.", cooperationLine: ["ecosystem"], branch: "Московский филиал", addedAt: "2025-05-15", addedBy: "Козлов Д.П.", ecosystemData: { materials: [], universityRating: 4, eventRating: 4, participantsCount: 0, interestedPersons: [] } },
      { id: "event-hse-ecosystem-6", type: "caseChampionship", date: "2025-06-20", endDate: "2025-06-22", status: "planned", responsiblePerson: ["person-1"], comments: "Кейс-чемпионат Экосистема для студентов ВШЭ. Командное решение бизнес-кейсов по интеграции с экосистемой партнёров банка.", cooperationLine: ["ecosystem"], branch: "Головной ВУЗ", addedAt: "2025-06-01", addedBy: "Иванова Е.С.", universityContact: { name: "Кузнецова Анна Владимировна", position: "Куратор центра карьеры", phone: "+7 (495) 772-95-90", email: "a.kuznetsova@hse.ru" }, ecosystemData: { materials: [{ id: "m5", name: "Регламент кейс-чемпионата.pdf", url: "#", uploadedAt: "2025-06-05T10:00:00Z" }], universityRating: 5, eventRating: 4, participantsCount: 6, interestedPersons: [{ id: "ip8", name: "Иванов Пётр Сергеевич", phone: "+7 (916) 111-22-33", comment: "" }, { id: "ip9", name: "Петрова Мария Александровна", phone: "+7 (916) 222-33-44", comment: "" }, { id: "ip10", name: "Сидоров Алексей Дмитриевич", phone: "+7 (916) 333-44-55", comment: "" }, { id: "ip11", name: "Козлова Елена Викторовна", phone: "+7 (916) 444-55-66", comment: "" }, { id: "ip12", name: "Морозов Денис Игоревич", phone: "+7 (916) 555-66-77", comment: "" }, { id: "ip13", name: "Новикова Анна Сергеевна", phone: "+7 (916) 666-77-88", comment: "" }] } },
    ],
    conference: true,
    diplomaDefense: true,
    businessGame: true,
    allEmployees: 200,
    internHiring: true,
    averageInternsPerYear: 35,
    interns: 100,
    internList: (() => {
      const rng = mulberry32(0x48e1f9c2);
      /** Фиксированная «сегодняшняя» дата для ветвлений в моке (не new Date() — иначе SSR и клиент могут разойтись). */
      const mockToday = new Date("2026-04-03T12:00:00.000Z");
      const departments = [
        "Департамент автоматизации внутренних сервисов",
        "Управление развития общекорпоративных систем",
        "Управление разработки банковских продуктов",
        "Департамент информационной безопасности",
        "Управление качества и тестирования",
      ];
      const positions = [
        "Стажер-экономист",
        "Стажер-финансист",
        "Стажер-разработчик",
        "Стажер-аналитик",
        "Стажер-тестировщик",
        "Стажер-менеджер",
        "Стажер-дизайнер",
        "Стажер-маркетолог",
      ];
      const firstNames = [
        "Александр", "Алексей", "Андрей", "Антон", "Артем", "Борис", "Вадим", "Василий",
        "Виктор", "Владимир", "Дмитрий", "Евгений", "Иван", "Игорь", "Константин", "Максим",
        "Михаил", "Николай", "Олег", "Павел", "Роман", "Сергей", "Станислав", "Юрий",
        "Анна", "Валентина", "Валерия", "Вера", "Галина", "Дарья", "Елена", "Ирина",
        "Ксения", "Лариса", "Мария", "Наталья", "Ольга", "Светлана", "Татьяна", "Юлия",
      ];
      const lastNames = [
        "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Соколов", "Лебедев",
        "Козлов", "Новиков", "Морозов", "Петров", "Волков", "Соловьев", "Васильев", "Зайцев",
        "Павлов", "Семенов", "Голубев", "Виноградов", "Богданов", "Воробьев", "Федоров", "Михайлов",
        "Белов", "Тарасов", "Беляев", "Комаров", "Орлов", "Киселев", "Макаров", "Андреев",
        "Ковалев", "Ильин", "Гусев", "Титов", "Кузьмин", "Кудрявцев", "Баранов", "Куликов",
      ];
      const middleNames = [
        "Александрович", "Алексеевич", "Андреевич", "Антонович", "Артемович", "Борисович",
        "Вадимович", "Васильевич", "Викторович", "Владимирович", "Дмитриевич", "Евгеньевич",
        "Иванович", "Игоревич", "Константинович", "Максимович", "Михайлович", "Николаевич",
        "Олегович", "Павлович", "Романович", "Сергеевич", "Станиславович", "Юрьевич",
        "Александровна", "Алексеевна", "Андреевна", "Антоновна", "Артемовна", "Борисовна",
        "Вадимовна", "Васильевна", "Викторовна", "Владимировна", "Дмитриевна", "Евгеньевна",
        "Ивановна", "Игоревна", "Константиновна", "Максимовна", "Михайловна", "Николаевна",
        "Олеговна", "Павловна", "Романовна", "Сергеевна", "Станиславовна", "Юрьевна",
      ];
      
      const interns: Intern[] = [];
      
      // Добавляем стажеров с именами практикантов/участников/целевых практикантов для отображения tooltip
      const practiceEmployees = [
        // Практиканты
        { name: "Соколова Анастасия Дмитриевна", age: 22, position: "Стажер-экономист", department: "Департамент информационной безопасности", hireDate: "2024-01-15" },
        { name: "Тихонов Артем Викторович", age: 23, position: "Стажер-разработчик", department: "Управление разработки банковских продуктов", hireDate: "2024-02-20" },
        { name: "Романова Екатерина Сергеевна", age: 21, position: "Стажер-аналитик", department: "Департамент автоматизации внутренних сервисов", hireDate: "2024-03-10" },
        { name: "Григорьев Максим Александрович", age: 24, position: "Стажер-финансист", department: "Управление развития общекорпоративных систем", hireDate: "2024-04-05" },
        { name: "Федорова Виктория Игоревна", age: 22, position: "Стажер-тестировщик", department: "Управление качества и тестирования", hireDate: "2024-05-12" },
        // Участники кейс-чемпионатов
        { name: "Белова Анастасия Игоревна", age: 22, position: "Стажер-экономист", department: "Департамент автоматизации внутренних сервисов", hireDate: "2024-01-20" },
        { name: "Громов Кирилл Александрович", age: 23, position: "Стажер-аналитик", department: "Управление разработки банковских продуктов", hireDate: "2024-02-15" },
        { name: "Денисова Полина Сергеевна", age: 21, position: "Стажер-экономист", department: "Департамент информационной безопасности", hireDate: "2024-03-01" },
        { name: "Егоров Станислав Дмитриевич", age: 24, position: "Стажер-разработчик", department: "Управление развития общекорпоративных систем", hireDate: "2024-03-15" },
        { name: "Жукова Виктория Андреевна", age: 22, position: "Стажер-тестировщик", department: "Управление качества и тестирования", hireDate: "2024-04-01" },
        // Целевые практиканты
        { name: "Соколов Дмитрий Петрович", age: 23, position: "Стажер-разработчик", department: "Департамент автоматизации внутренних сервисов", hireDate: "2025-01-15" },
        { name: "Морозова Анна Сергеевна", age: 22, position: "Стажер-разработчик", department: "Управление разработки банковских продуктов", hireDate: "2024-11-15" },
        { name: "Волков Павел Александрович", age: 24, position: "Стажер-аналитик", department: "Департамент информационной безопасности", hireDate: "2024-08-15" },
      ];
      
      practiceEmployees.forEach((emp, index) => {
        const hireDateObj = new Date(emp.hireDate);
        const status: "active" | "dismissed" = "active";
        const internshipInBank = rng() < 0.6;
        let internshipStartDate: string | undefined;
        let internshipEndDate: string | undefined;
        
        if (internshipInBank) {
          const internshipStart = new Date(hireDateObj);
          internshipStart.setMonth(internshipStart.getMonth() - Math.floor(rng() * 6) - 1);
          internshipStartDate = internshipStart.toISOString().split('T')[0];
          const internshipEnd = new Date(internshipStart);
          internshipEnd.setMonth(internshipEnd.getMonth() + Math.floor(rng() * 3) + 2);
          internshipEndDate = internshipEnd.toISOString().split('T')[0];
        }
        
        interns.push({
          id: `intern-hse-practice-${index + 1}`,
          employeeName: emp.name,
          age: emp.age,
          position: emp.position,
          department: emp.department,
          hireDate: emp.hireDate,
          status,
          practiceInBank: true, // Все эти стажеры имеют практику
          internshipInBank,
          internshipStartDate,
          internshipEndDate,
        });
      });
      
      const startDate = new Date("2022-01-01");
      const endDate = new Date("2024-12-31");
      
      for (let i = 1; i <= 87; i++) { // Уменьшил с 100 до 87, чтобы всего было 100 (13 + 87)
        const firstName = firstNames[Math.floor(rng() * firstNames.length)];
        const lastName = lastNames[Math.floor(rng() * lastNames.length)];
        const middleName = middleNames[Math.floor(rng() * middleNames.length)];
        const fullName = `${lastName} ${firstName} ${middleName}`;
        
        const age = 20 + Math.floor(rng() * 11); // 20-30 лет
        const position = positions[Math.floor(rng() * positions.length)];
        const department = departments[Math.floor(rng() * departments.length)];
        
        // Случайная дата приема между 2022 и 2024
        const hireDateObj = new Date(
          startDate.getTime() + rng() * (endDate.getTime() - startDate.getTime())
        );
        const hireDate = hireDateObj.toISOString().split('T')[0];
        
        // 85% активных, 15% уволенных
        const status: "active" | "dismissed" = rng() < 0.15 ? "dismissed" : "active";
        
        let dismissalDate: string | undefined;
        if (status === "dismissed") {
          const dismissalDateObj = new Date(hireDateObj);
          dismissalDateObj.setMonth(dismissalDateObj.getMonth() + Math.floor(rng() * 12) + 1);
          if (dismissalDateObj > mockToday) {
            dismissalDateObj.setMonth(dismissalDateObj.getMonth() - 6);
          }
          dismissalDate = dismissalDateObj.toISOString().split('T')[0];
        }
        
        // 60% имеют стажировку в банке
        const internshipInBank = rng() < 0.6;
        let internshipStartDate: string | undefined;
        let internshipEndDate: string | undefined;
        
        if (internshipInBank) {
          const internshipStart = new Date(hireDateObj);
          internshipStart.setMonth(internshipStart.getMonth() - Math.floor(rng() * 6) - 1);
          internshipStartDate = internshipStart.toISOString().split('T')[0];
          
          const internshipEnd = new Date(internshipStart);
          internshipEnd.setMonth(internshipEnd.getMonth() + Math.floor(rng() * 3) + 2);
          internshipEndDate = internshipEnd.toISOString().split('T')[0];
        }
        
        // 50% имеют практику в банке
        const practiceInBank = rng() < 0.5;
        
        interns.push({
          id: `intern-hse-${i}`,
          employeeName: fullName,
          age,
          position,
          department,
          hireDate,
          status,
          dismissalDate,
          practiceInBank,
          internshipInBank,
          internshipStartDate,
          internshipEndDate,
        });
      }
      
      return interns;
    })(),
    practitionerList: (() => {
      const departments = [
        "Департамент автоматизации внутренних сервисов",
        "Управление развития общекорпоративных систем",
        "Управление разработки банковских продуктов",
        "Департамент информационной безопасности",
        "Управление качества и тестирования",
      ];
      const positions = [
        "Практикант-экономист",
        "Практикант-финансист",
        "Практикант-разработчик",
        "Практикант-аналитик",
        "Практикант-тестировщик",
      ];
      const practitioners: Practitioner[] = [
        {
          id: "pract-hse-1",
          employeeName: "Соколова Анастасия Дмитриевна",
          age: 22,
          position: "Практикант-экономист",
          department: "Департамент информационной безопасности",
          hireDate: "2024-01-15",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2023-06-01",
          internshipEndDate: "2023-08-31",
          practiceStartDate: "2024-01-15",
          practiceEndDate: "2024-05-31",
          practiceSupervisor: "Иванов Иван Иванович",
          practiceStatus: "exceeds",
          addedBy: "Иванов Иван Иванович",
          comment: "Отличные результаты в работе с финансовыми данными",
          isTarget: true,
          responsibleEmployee: "Морозов Сергей Петрович",
        },
        {
          id: "pract-hse-2",
          employeeName: "Тихонов Артем Викторович",
          age: 23,
          position: "Практикант-разработчик",
          department: "Управление разработки банковских продуктов",
          hireDate: "2024-02-20",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2023-09-01",
          internshipEndDate: "2023-11-30",
          practiceStartDate: "2024-02-20",
          practiceEndDate: "2024-06-20",
          practiceSupervisor: "Петрова Мария Сергеевна",
          practiceStatus: "exceeds",
          addedBy: "Петрова Мария Сергеевна",
          comment: "Активно участвует в разработке новых функций",
        },
        {
          id: "pract-hse-3",
          employeeName: "Романова Екатерина Сергеевна",
          age: 21,
          position: "Практикант-аналитик",
          department: "Департамент автоматизации внутренних сервисов",
          hireDate: "2024-03-10",
          status: "active",
          internshipInBank: false,
          practiceStartDate: "2024-03-10",
          practiceEndDate: "2024-07-10",
          practiceSupervisor: "Сидоров Алексей Дмитриевич",
          practiceStatus: "meets",
          addedBy: "Сидоров Алексей Дмитриевич",
          comment: "Показывает хорошие аналитические способности",
          isTarget: true,
          responsibleEmployee: "Белова Ольга Николаевна",
        },
        {
          id: "pract-hse-4",
          employeeName: "Григорьев Максим Александрович",
          age: 24,
          position: "Практикант-финансист",
          department: "Управление развития общекорпоративных систем",
          hireDate: "2024-04-05",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2023-12-01",
          internshipEndDate: "2024-02-29",
          practiceStartDate: "2024-04-05",
          practiceEndDate: "2024-08-05",
          practiceSupervisor: "Козлова Елена Владимировна",
          practiceStatus: "meets",
          addedBy: "Козлова Елена Владимировна",
          comment: "Ответственный подход к работе",
        },
        {
          id: "pract-hse-5",
          employeeName: "Федорова Виктория Игоревна",
          age: 22,
          position: "Практикант-тестировщик",
          department: "Управление качества и тестирования",
          hireDate: "2024-05-12",
          status: "active",
          internshipInBank: false,
          practiceStartDate: "2024-05-12",
          practiceEndDate: "2024-09-12",
          practiceSupervisor: "Волков Дмитрий Николаевич",
          practiceStatus: "meets",
          addedBy: "Волков Дмитрий Николаевич",
          comment: "Внимательность к деталям при тестировании",
        },
        {
          id: "pract-hse-6",
          employeeName: "Кузнецов Денис Олегович",
          age: 25,
          position: "Практикант-экономист",
          department: "Департамент информационной безопасности",
          hireDate: "2023-11-20",
          status: "dismissed",
          dismissalDate: "2024-06-15",
          internshipInBank: true,
          internshipStartDate: "2023-05-01",
          internshipEndDate: "2023-07-31",
          practiceStartDate: "2023-11-20",
          practiceEndDate: "2024-03-20",
          practiceSupervisor: "Новикова Анна Петровна",
          practiceStatus: "not_meets",
          addedBy: "Новикова Анна Петровна",
          comment: "Практика завершена досрочно",
        },
        {
          id: "pract-hse-7",
          employeeName: "Орлова Мария Павловна",
          age: 23,
          position: "Практикант-разработчик",
          department: "Управление разработки банковских продуктов",
          hireDate: "2024-06-01",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2024-01-15",
          internshipEndDate: "2024-03-31",
          practiceStartDate: "2024-06-01",
          practiceEndDate: "2024-10-01",
          practiceSupervisor: "Морозов Сергей Александрович",
          practiceStatus: "exceeds",
          addedBy: "Морозов Сергей Александрович",
          comment: "Быстро осваивает новые технологии",
        },
        {
          id: "pract-hse-8",
          employeeName: "Семенов Игорь Борисович",
          age: 24,
          position: "Практикант-аналитик",
          department: "Департамент автоматизации внутренних сервисов",
          hireDate: "2024-07-10",
          status: "active",
          internshipInBank: false,
          practiceStartDate: "2024-07-10",
          practiceEndDate: "2024-11-10",
          practiceSupervisor: "Лебедев Сергей Викторович",
          practiceStatus: "meets",
          addedBy: "Лебедев Сергей Викторович",
          comment: "Хорошо работает с большими объемами данных",
        },
        {
          id: "pract-hse-9",
          employeeName: "Виноградова Ольга Николаевна",
          age: 22,
          position: "Практикант-финансист",
          department: "Управление развития общекорпоративных систем",
          hireDate: "2024-08-20",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2024-02-01",
          internshipEndDate: "2024-04-30",
          practiceStartDate: "2024-08-20",
          practiceEndDate: "2024-12-20",
          practiceSupervisor: "Федорова Мария Дмитриевна",
          practiceStatus: "exceeds",
          addedBy: "Федорова Мария Дмитриевна",
          comment: "Проявляет инициативу в решении задач",
        },
        {
          id: "pract-hse-10",
          employeeName: "Богданов Андрей Владимирович",
          age: 23,
          position: "Практикант-тестировщик",
          department: "Управление качества и тестирования",
          hireDate: "2024-09-05",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2024-03-01",
          internshipEndDate: "2024-05-31",
          practiceStartDate: "2024-09-05",
          practiceEndDate: "2025-01-05",
          practiceSupervisor: "Иванов Иван Иванович",
          practiceStatus: "meets",
          addedBy: "Иванов Иван Иванович",
          comment: "Качественное тестирование продуктов",
        },
      ];
      
      return practitioners;
    })(),
    caseChampionshipParticipants: [
      { id: "ccp-hse-1", employeeName: "Белова Анастасия Игоревна", eventId: "event-hse-3", direction: "Финансы и контроль", status: "winner", comments: "Отличное выступление на финальном этапе. Демонстрировала глубокое понимание финансового моделирования." },
      { id: "ccp-hse-2", employeeName: "Громов Кирилл Александрович", eventId: "event-hse-3", direction: "Информационные технологии", status: "prize_winner", comments: "Показал хорошие аналитические навыки при решении кейса." },
      { id: "ccp-hse-3", employeeName: "Денисова Полина Сергеевна", eventId: "event-hse-3", direction: "Информационная безопасность", status: "prize_winner" },
      { id: "ccp-hse-4", employeeName: "Егоров Станислав Дмитриевич", eventId: "event-hse-3", direction: "Информационные технологии", status: "participated" },
      { id: "ccp-hse-5", employeeName: "Жукова Виктория Андреевна", eventId: "event-hse-3", direction: "Операционное сопровождение", status: "participated", comments: "Активное участие в командной работе." },
      { id: "ccp-hse-6", employeeName: "Захаров Артём Олегович", eventId: "event-hse-3", direction: "Розничный бизнес", status: "participated" },
      { id: "ccp-hse-7", employeeName: "Ильина Светлана Владимировна", eventId: "event-hse-6", direction: "Корпоративный бизнес", status: "registered" },
      { id: "ccp-hse-8", employeeName: "Калинин Роман Петрович", eventId: "event-hse-6", direction: "Риски", status: "registered" },
    ],
    targetPractitioners: [
      { id: "tp-hse-1", employeeName: "Соколов Дмитрий Петрович", targetStartDate: "2025-02-01", targetEndDate: "2025-05-31", department: "Департамент автоматизации внутренних сервисов", practiceSupervisor: "Иванов Иван Иванович", comments: "Запланирована целевая практика для изучения банковских процессов." },
      { id: "tp-hse-2", employeeName: "Морозова Анна Сергеевна", targetStartDate: "2024-12-01", targetEndDate: "2025-03-31", department: "Управление разработки банковских продуктов", practiceSupervisor: "Петрова Мария Сергеевна", comments: "Активно проходит целевую практику. Показывает хорошие результаты в разработке." },
      { id: "tp-hse-3", employeeName: "Волков Павел Александрович", targetStartDate: "2024-09-01", targetEndDate: "2024-12-31", department: "Департамент информационной безопасности", practiceSupervisor: "Сидоров Алексей Дмитриевич", comments: "Успешно завершил целевую практику. Рекомендован к трудоустройству." },
      { id: "tp-hse-4", employeeName: "Козлова Мария Дмитриевна", targetStartDate: "2025-03-15", targetEndDate: "2025-07-15", department: "Управление качества и тестирования", practiceSupervisor: "Козлова Елена Владимировна" },
      { id: "tp-hse-5", employeeName: "Новиков Игорь Владимирович", targetStartDate: "2025-01-10", targetEndDate: "2025-04-10", department: "Управление развития общекорпоративных систем", practiceSupervisor: "Федоров Сергей Николаевич", comments: "Проходит целевую практику в области системной разработки." },
    ],
    namedScholars: [
      { id: "ns-hse-1", employeeName: "Петрова Анна Сергеевна", scholarshipName: "Стипендия ГПБ за отличную учёбу", appointmentDate: "2024-09-01", comments: "Отличник учёбы, активный участник научных конференций." },
      { id: "ns-hse-2", employeeName: "Иванов Дмитрий Александрович", scholarshipName: "Именная стипендия им. А.И. Костина", appointmentDate: "2024-09-01", comments: "Победитель олимпиады по финансовой математике." },
      { id: "ns-hse-3", employeeName: "Смирнова Екатерина Владимировна", scholarshipName: "Стипендия ГПБ за научную деятельность", appointmentDate: "2025-01-01" },
    ],
    cntrInfrastructure: [
      { 
        id: "cntr-infra-hse-1", 
        developmentType: "financing", 
        date: "2023-05-15", 
        branch: "Головной ВУЗ",
        description: "Финансирование направлено на развитие современных исследовательских лабораторий и приобретение высокотехнологичного оборудования для научных исследований. Проект включает создание центра обработки данных, модернизацию инфраструктуры связи и внедрение передовых технологий в образовательный процесс. Ожидается значительное повышение качества научных исследований и привлечение талантливых ученых.",
        document: "https://example.com/documents/infrastructure-financing-2023.pdf"
      },
      { 
        id: "cntr-infra-hse-2", 
        developmentType: "endowment", 
        date: "2023-09-20", 
        branch: "Московский филиал",
        description: "Эндаумент фонд создан для обеспечения долгосрочной финансовой стабильности научно-технологической инфраструктуры университета. Средства фонда используются для поддержки инновационных проектов, развития исследовательской базы и привлечения ведущих специалистов. Фонд управляется профессиональной командой с учетом международных стандартов инвестирования и прозрачности использования средств.",
        document: "https://example.com/documents/endowment-fund-2023.pdf"
      },
    ],
    cntrProjects: [
      {
        id: "cntr-project-hse-1",
        projectName: "Разработка платформы для анализа больших данных",
        date: "2023-03-10",
        branch: "Головной ВУЗ",
        fundingAmount: 15000000,
        supportFormat: "grant-cofinancing",
        description: "Проект направлен на создание инновационной платформы для обработки и анализа больших объемов данных в режиме реального времени. Платформа будет использоваться для научных исследований в области машинного обучения, искусственного интеллекта и анализа финансовых рынков. Проект предполагает тесное сотрудничество с ведущими исследовательскими центрами и промышленными партнерами.",
        document: "https://example.com/documents/big-data-platform-2023.pdf"
      },
      {
        id: "cntr-project-hse-2",
        projectName: "Центр квантовых вычислений и криптографии",
        date: "2024-01-20",
        branch: "Московский филиал",
        fundingAmount: 25000000,
        supportFormat: "ordered-rd-center-lift",
        description: "Проект по созданию центра квантовых вычислений и разработке новых методов криптографической защиты информации. Центр объединит исследователей в области квантовой физики, информатики и математики для решения задач создания безопасных коммуникационных систем нового поколения. Ожидается значительный вклад в развитие национальной технологической безопасности и создание инновационных продуктов для финансового сектора."
      },
    ],
    cntrAcceleratorEnabled: true,
    cntrAcceleratorItems: [
      {
        id: "cntr-accelerator-hse-1",
        developmentType: "financing",
        date: "2023-06-15",
        branch: "Головной ВУЗ",
        description: "Участие в акселераторе Газпромбанк.Тех: Наука направлено на поддержку инновационных стартапов в области финансовых технологий и искусственного интеллекта. Проект предусматривает менторскую поддержку, доступ к инфраструктуре банка и возможность тестирования решений в реальных условиях. Ожидается создание перспективных технологических решений для банковского сектора.",
        document: "https://example.com/documents/accelerator-hse-2023.pdf"
      },
      {
        id: "cntr-accelerator-hse-2",
        developmentType: "endowment",
        date: "2024-03-20",
        branch: "Московский филиал",
        description: "Второй проект в рамках акселератора связан с разработкой решений для анализа больших данных в финансовой сфере. Проект объединяет экспертизу университета в области data science с практическим опытом банка в обработке финансовой информации. Результатом станет создание платформы для интеллектуального анализа финансовых потоков и прогнозирования рыночных тенденций."
      },
    ],
    cntrEventsItems: [
      {
        id: "cntr-event-hse-1",
        type: "conference",
        date: "2023-09-15",
        status: "completed",
        branch: "Головной ВУЗ",
        description: "Международная конференция по финансовым технологиям и цифровой экономике. Мероприятие собрало ведущих экспертов в области финтех, представителей банковского сектора и академического сообщества. Обсуждены вопросы развития цифровых платежных систем, блокчейн-технологий и искусственного интеллекта в финансовой сфере.",
        materials: [{ id: "m-cntr-1", name: "fintech-conference-2023.pdf", url: "https://example.com/documents/fintech-conference-2023.pdf", uploadedAt: "2023-09-20T10:00:00Z" }],
      },
      {
        id: "cntr-event-hse-2",
        type: "conference",
        date: "2023-11-20",
        status: "completed",
        branch: "Московский филиал",
        description: "День карьеры для студентов IT-направлений. Банк представил возможности стажировок и трудоустройства для студентов ВШЭ. Проведены мастер-классы по финансовому моделированию, разработке банковских систем и работе с большими данными. Более 200 студентов приняли участие в мероприятии.",
        materials: [{ id: "m-cntr-2", name: "career-day-hse-2023.pdf", url: "https://example.com/documents/career-day-hse-2023.pdf", uploadedAt: "2023-11-25T14:00:00Z" }],
      },
      {
        id: "cntr-event-hse-3",
        type: "lecture",
        date: "2024-02-10",
        status: "completed",
        branch: "Головной ВУЗ",
        description: "Семинар по применению машинного обучения в банковской аналитике. Эксперты банка поделились опытом использования алгоритмов машинного обучения для оценки кредитных рисков, выявления мошенничества и персонализации финансовых продуктов. Студенты и преподаватели ВШЭ представили результаты своих исследований.",
      },
      {
        id: "cntr-event-hse-4",
        type: "businessGame",
        date: "2024-04-25",
        status: "completed",
        branch: "Головной ВУЗ",
        description: "Кейс-чемпионат по финансовому моделированию и анализу данных. Студенты ВШЭ решали реальные бизнес-кейсы, предоставленные банком. Участники разрабатывали модели для прогнозирования оттока клиентов, оптимизации продуктовой линейки и оценки эффективности маркетинговых кампаний. Победители получили приглашение на стажировку в банке.",
        materials: [{ id: "m-cntr-4", name: "case-championship-2024.pdf", url: "https://example.com/documents/case-championship-2024.pdf", uploadedAt: "2024-05-01T09:00:00Z" }],
      },
      {
        id: "cntr-event-hse-5",
        type: "contact",
        date: "2024-06-12",
        status: "completed",
        branch: "Московский филиал",
        description: "Выпускное мероприятие программы стажировок для студентов ВШЭ. Подведены итоги годовой программы сотрудничества, награждены лучшие стажеры. Выпускники программы поделились опытом работы в банке и возможностями карьерного роста. Заключены соглашения о дальнейшем сотрудничестве и развитии совместных образовательных программ.",
      },
    ],
    cntrEducationalProjectsItems: [
      {
        id: "cntr-educational-project-hse-1",
        date: "2023-10-05",
        branch: "Головной ВУЗ",
        description: "Разработка совместной магистерской программы по финансовым технологиям. Программа объединяет академическую подготовку ВШЭ в области IT и экономики с практическим опытом банка в разработке финансовых продуктов. Студенты получают возможность работать над реальными проектами банка, проходить стажировки и защищать дипломные работы на актуальных для банка темах.",
        document: "https://example.com/documents/master-program-fintech-2023.pdf"
      },
      {
        id: "cntr-educational-project-hse-2",
        date: "2024-01-15",
        branch: "Московский филиал",
        description: "Создание специализированного курса по анализу больших данных в финансовой сфере. Курс разработан для студентов бакалавриата и магистратуры IT-направлений. Преподаватели банка проводят практические занятия, студенты работают с реальными данными банка (обезличенными) и решают практические задачи по прогнозированию, кластеризации клиентов и выявлению мошенничества.",
      },
      {
        id: "cntr-educational-project-hse-3",
        date: "2024-05-20",
        branch: "Головной ВУЗ",
        description: "Организация программы профессиональной переподготовки для выпускников ВШЭ. Программа направлена на переквалификацию специалистов из смежных областей в банковскую сферу. Включает интенсивное обучение основам банковского дела, финансового анализа, риск-менеджмента и цифровых технологий. Выпускники программы получают возможность трудоустройства в банке на позиции младших и средних специалистов.",
        document: "https://example.com/documents/re-qualification-program-2024.pdf"
      },
    ],
    cntrAgreementEnabled: true,
    cntrAgreementItems: [
      {
        id: "cntr-agreement-hse-1",
        date: "2023-07-20",
        branch: "Головной ВУЗ",
        status: "signed",
        description: "Соглашение о долгосрочном сотрудничестве между Национальным исследовательским университетом «Высшая школа экономики» и Газпромбанком. Соглашение охватывает совместные образовательные программы, научно-исследовательские проекты, программы стажировок и трудоустройства выпускников. Предусмотрено создание совместных лабораторий и центров компетенций в области финансовых технологий и анализа данных.",
        document: "https://example.com/documents/agreement-hse-2023.pdf"
      },
    ],
    cntrProjectTableItems: [
      { id: "cntr-pt-hse-1", date: "2024-01-15", description: "Исследование применения машинного обучения для прогнозирования оттока клиентов", status: "accepted" as const },
      { id: "cntr-pt-hse-2", date: "2024-02-20", description: "Разработка платформы для анализа транзакционных данных в реальном времени", status: "accepted" as const },
      { id: "cntr-pt-hse-3", date: "2024-03-10", description: "Совместный проект по созданию центра компетенций в области финтех", status: "accepted" as const },
      { id: "cntr-pt-hse-4", date: "2024-04-05", description: "Исследование блокчейн-технологий для банковских платежных систем", status: "accepted" as const },
      { id: "cntr-pt-hse-5", date: "2024-05-18", description: "Разработка алгоритмов выявления мошенничества с использованием нейросетей", status: "accepted" as const },
      { id: "cntr-pt-hse-6", date: "2024-06-22", description: "Пилотный проект по интеграции API открытого банкинга", status: "pending" as const },
      { id: "cntr-pt-hse-7", date: "2024-07-14", description: "Исследование потенциала квантовых вычислений в кредитном скоринге", status: "pending" as const },
      { id: "cntr-pt-hse-8", date: "2024-08-30", description: "Разработка системы персонализации финансовых продуктов", status: "pending" as const },
      { id: "cntr-pt-hse-9", date: "2024-09-12", description: "Проект по созданию sandbox для тестирования финтех-решений", status: "pending" as const },
      { id: "cntr-pt-hse-10", date: "2024-10-05", description: "Исследование репутационных рисков в цифровых каналах", status: "pending" as const },
      { id: "cntr-pt-hse-11", date: "2024-11-20", description: "Проект автоматизации скоринга малого бизнеса — не прошёл внутреннюю экспертизу", status: "rejected" as const },
      { id: "cntr-pt-hse-12", date: "2024-12-02", description: "Инициатива по внедрению криптовалютных сервисов — отклонена регулятором", status: "rejected" as const },
      { id: "cntr-pt-hse-13", date: "2025-01-10", description: "Проект голосовой биометрии — дублирование существующих решений", status: "rejected" as const },
      { id: "cntr-pt-hse-14", date: "2025-02-15", description: "Исследование NFT для банковских продуктов — вне текущей стратегии", status: "rejected" as const },
      { id: "cntr-pt-hse-15", date: "2025-03-01", description: "Пилот по распознаванию лиц в отделениях — превышение бюджета", status: "rejected" as const },
    ],
    region: "Московская область",
    description: "Ведущий экономический и IT-университет",
    image: "https://www.hse.ru//images/main/main_logo_ru_full.svg",
  },
  {
    id: "univ-5",
    name: "Уральский федеральный университет имени первого Президента России Б.Н. Ельцина",
    shortName: "УрФУ",
    inn: "6663003127",
    city: "Екатеринбург",
    branch: ["Уральский филиал"],
    cooperationStartYear: 2022,
    cooperationLines: [
      {
        id: "clr-urfu-1",
        line: "drp",
        year: 2022,
        responsible: ["person-7", "person-8"],
      },
    ],
    targetAudience: "Студенты IT и инженерии",
    initiatorBlock: "Блок развития",
    initiatorName: "Тихонов Андрей Борисович",
    branchCurators: [
      { 
        id: "cur-7", 
        city: "Екатеринбург", 
        branch: "Уральский филиал", 
        cooperationLines: [
          { id: "clr-cur-7-1", line: "drp", year: 2022, responsible: ["person-7"] },
          { id: "clr-cur-7-2", line: "cntr", year: 2022, responsible: ["person-8"] },
        ],
        cooperationStartYear: 2022,
      },
    ],
    contracts: [
      { 
        id: "cont-10", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-urfu-2022.pdf",
        number: "Д-2022-134",
        date: "2022-10-08",
        period: { start: "2022-10-08", end: "2027-10-07" },
        asddLink: "https://asdd.example.com/contract/2022-134",
        contractBranch: "Уральский филиал"
      },
    ],
    conference: true,
    diplomaDefense: false,
    businessGame: false,
    allEmployees: 80,
    internHiring: true,
    averageInternsPerYear: 15,
    interns: 5,
    region: "Свердловская область",
    description: "Крупнейший университет Урала",
    image: "https://via.placeholder.com/100?text=УрФУ",
  },
  {
    id: "univ-6",
    name: "Новосибирский государственный университет",
    shortName: "НГУ",
    inn: "5406000010",
    city: "Новосибирск",
    branch: ["Сибирский филиал"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-ngu-1",
        line: "cntr",
        year: 2021,
        responsible: ["person-9"],
      },
    ],
    targetAudience: "Студенты математики и IT",
    initiatorBlock: "Блок технологий",
    initiatorName: "Павлов Денис Олегович",
    branchCurators: [
      { 
        id: "cur-8", 
        city: "Новосибирск", 
        branch: "Сибирский филиал", 
        cooperationLines: [
          { id: "clr-cur-8-1", line: "drp", year: 2021, responsible: ["person-9"] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-11", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2021-091",
        date: "2021-12-14",
        period: { start: "2021-12-14", end: "2026-12-13" },
        contractBranch: "Сибирский филиал"
      },
      { 
        id: "cont-12", 
        type: "internship", 
        hasContract: true, 
        contractFile: "contract-ngu-internship.pdf",
        number: "Д-2023-156",
        date: "2023-03-28",
        period: { start: "2023-03-28", end: "2028-03-27" },
        asddLink: "https://asdd.example.com/contract/2023-156",
        contractBranch: "Головной ВУЗ"
      },
    ],
    conference: false,
    diplomaDefense: true,
    businessGame: true,
    allEmployees: 70,
    internHiring: true,
    averageInternsPerYear: 12,
    interns: 6,
    region: "Новосибирская область",
    description: "Ведущий научный университет Сибири",
    image: "https://via.placeholder.com/100?text=НГУ",
  },
  {
    id: "univ-7",
    name: "Казанский (Приволжский) федеральный университет",
    shortName: "КФУ",
    inn: "1654001840",
    city: "Казань",
    branch: ["Приволжский филиал"],
    cooperationStartYear: 2020,
    cooperationLines: [
      {
        id: "clr-kfu-1",
        line: "drp",
        year: 2020,
        responsible: ["person-1", "person-5"],
      },
      {
        id: "clr-kfu-2",
        line: "bko",
        year: 2021,
        responsible: ["person-6"],
      },
    ],
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Гарифуллин Рамиль Фаритович",
    branchCurators: [
      { 
        id: "cur-9", 
        city: "Казань", 
        branch: "Приволжский филиал", 
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        cooperationLines: [
          { id: "clr-cur-9-1", line: "drp", year: 2020, responsible: ["person-1", "person-5"] },
          { id: "clr-cur-9-2", line: "bko", year: 2020, responsible: ["person-5"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-13", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-kfu-2020.pdf",
        number: "Д-2020-124",
        date: "2020-08-25",
        period: { start: "2020-08-25", end: "2025-08-24" },
        asddLink: "https://asdd.example.com/contract/2020-124",
        contractBranch: "Приволжский филиал"
      },
      { 
        id: "cont-14", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2021-198",
        date: "2021-09-11",
        period: { start: "2021-09-11", end: "2026-09-10" },
        contractBranch: "Головной ВУЗ"
      },
    ],
    conference: true,
    diplomaDefense: true,
    businessGame: false,
    allEmployees: 110,
    internHiring: true,
    averageInternsPerYear: 20,
    interns: 9,
    region: "Республика Татарстан",
    description: "Крупнейший университет Приволжья",
    image: "https://via.placeholder.com/100?text=КФУ",
  },
  {
    id: "univ-8",
    name: "Томский государственный университет",
    shortName: "ТГУ",
    inn: "7017000010",
    city: "Томск",
    branch: ["Сибирский филиал"],
    cooperationStartYear: 2019,
    cooperationLines: [
      {
        id: "clr-tgu-1",
        line: "drp",
        year: 2019,
        responsible: ["person-2"],
      },
      {
        id: "clr-tgu-2",
        line: "cntr",
        year: 2020,
        responsible: ["person-10"],
      },
    ],
    targetAudience: "Студенты IT и математики",
    initiatorBlock: "Блок технологий",
    initiatorName: "Кузнецов Владимир Петрович",
    branchCurators: [
      { 
        id: "cur-10", 
        city: "Томск", 
        branch: "Сибирский филиал", 
        cooperationLines: [
          { id: "clr-cur-10-1", line: "drp", year: 2019, responsible: ["person-2"] },
        ],
        cooperationStartYear: 2019,
      },
    ],
    contracts: [
      { 
        id: "cont-15", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2022-203",
        date: "2022-11-30",
        period: { start: "2022-11-30", end: "2027-11-29" },
        asddLink: "https://asdd.example.com/contract/2022-203",
        contractBranch: "Дальневосточный филиал"
      },
    ],
    conference: true,
    diplomaDefense: false,
    businessGame: true,
    allEmployees: 90,
    internHiring: true,
    averageInternsPerYear: 16,
    interns: 7,
    region: "Томская область",
    description: "Старейший университет Сибири",
    image: "https://via.placeholder.com/100?text=ТГУ",
  },
  {
    id: "univ-9",
    name: "Санкт-Петербургский политехнический университет Петра Великого",
    shortName: "СПбПУ",
    inn: "7802000001",
    city: "Санкт-Петербург",
    branch: ["Санкт-Петербургский филиал", "Центральный офис"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-spbpu-1",
        line: "bko",
        year: 2021,
        responsible: ["person-3", "person-7"],
      },
      {
        id: "clr-spbpu-2",
        line: "cntr",
        year: 2022,
        responsible: ["person-8"],
      },
    ],
    targetAudience: "Студенты инженерии и IT",
    initiatorBlock: "Блок технологий",
    initiatorName: "Романов Павел Андреевич",
    branchCurators: [
      { 
        id: "cur-11", 
        city: "Санкт-Петербург", 
        branch: "Санкт-Петербургский филиал", 
        cooperationLines: [
          { id: "clr-cur-11-1", line: "bko", year: 2021, responsible: [] },
        ],
        cooperationStartYear: 2021,
      },
      { 
        id: "cur-12", 
        city: "Санкт-Петербург", 
        branch: "Центральный офис", 
        cooperationLines: [
          { id: "clr-cur-12-1", line: "drp", year: 2021, responsible: [] },
          { id: "clr-cur-12-2", line: "bko", year: 2021, responsible: [] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-16", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-spbpu-2021.pdf",
        number: "Д-2021-167",
        date: "2021-07-19",
        period: { start: "2021-07-19", end: "2026-07-18" },
        asddLink: "https://asdd.example.com/contract/2021-167",
        contractBranch: "Санкт-Петербургский филиал"
      },
      { 
        id: "cont-17", 
        type: "internship", 
        hasContract: true,
        number: "Д-2023-234",
        date: "2023-05-14",
        period: { start: "2023-05-14", end: "2028-05-13" },
        contractBranch: "Головной ВУЗ"
      },
    ],
    conference: true,
    diplomaDefense: true,
    businessGame: true,
    allEmployees: 130,
    internHiring: true,
    averageInternsPerYear: 28,
    interns: 12,
    region: "Ленинградская область",
    description: "Ведущий технический университет Северо-Запада",
    image: "https://via.placeholder.com/100?text=СПбПУ",
  },
  {
    id: "univ-10",
    name: "Российский университет дружбы народов",
    shortName: "РУДН",
    inn: "7728004767",
    city: "Москва",
    branch: ["Московский филиал"],
    cooperationStartYear: 2020,
    cooperationLines: [
      {
        id: "clr-rudn-1",
        line: "drp",
        year: 2020,
        responsible: ["person-4", "person-9"],
      },
      {
        id: "clr-rudn-2",
        line: "bko",
        year: 2020,
        responsible: ["person-1"],
      },
    ],
    targetAudience: "Студенты IT, экономики и менеджмента",
    initiatorBlock: "Блок стратегии",
    initiatorName: "Алиева Зарина Магомедовна",
    branchCurators: [
      { 
        id: "cur-13", 
        city: "Москва", 
        branch: "Московский филиал", 
        cooperationLines: [
          { id: "clr-cur-13-1", line: "drp", year: 2020, responsible: ["person-2", "person-7"] },
          { id: "clr-cur-13-2", line: "bko", year: 2020, responsible: ["person-4", "person-9"] },
          { id: "clr-cur-13-3", line: "cntr", year: 2021, responsible: ["person-10"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-18", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-rudn-2020.pdf",
        number: "Д-2020-178",
        date: "2020-06-03",
        period: { start: "2020-06-03", end: "2025-06-02" },
        asddLink: "https://asdd.example.com/contract/2020-178",
        contractBranch: "Головной ВУЗ"
      },
      { 
        id: "cont-19", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2021-245",
        date: "2021-10-15",
        period: { start: "2021-10-15", end: "2026-10-14" },
        contractBranch: "Южный филиал"
      },
      { 
        id: "cont-20", 
        type: "internship", 
        hasContract: true,
        number: "Д-2023-112",
        date: "2023-01-27",
        period: { start: "2023-01-27", end: "2028-01-26" },
        asddLink: "https://asdd.example.com/contract/2023-112",
        contractBranch: "Головной ВУЗ"
      },
    ],
    conference: true,
    diplomaDefense: true,
    businessGame: true,
    allEmployees: 140,
    internHiring: true,
    averageInternsPerYear: 22,
    interns: 11,
    region: "Московская область",
    description: "Международный университет с широкой сетью партнерств",
    image: "https://via.placeholder.com/100?text=МИФИ",
  },
  {
    id: "univ-11",
    name: "Южный федеральный университет",
    shortName: "ЮФУ",
    inn: "6163001840",
    city: "Ростов-на-Дону",
    branch: ["Южный филиал"],
    cooperationStartYear: 2022,
    cooperationLines: [
      {
        id: "clr-yufu-1",
        line: "drp",
        year: 2022,
        isActive: false,
        responsible: ["person-5"],
      },
    ],
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Петренко Виктор Иванович",
    branchCurators: [
      { 
        id: "cur-14", 
        city: "Ростов-на-Дону", 
        branch: "Южный филиал", 
        cooperationLines: [
          { id: "clr-cur-14-1", line: "drp", year: 2022, isActive: false, responsible: ["person-5"] },
        ],
        cooperationStartYear: 2022,
      },
    ],
    contracts: [
      { 
        id: "cont-21", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2022-278",
        date: "2022-12-09",
        period: { start: "2022-12-09", end: "2027-12-08" },
        contractBranch: "Южный филиал"
      },
    ],
    conference: true,
    diplomaDefense: false,
    businessGame: false,
    allEmployees: 75,
    internHiring: true,
    averageInternsPerYear: 14,
    interns: 6,
    region: "Ростовская область",
    description: "Крупнейший университет Юга России",
    image: "https://via.placeholder.com/100?text=КубГУ",
  },
  {
    id: "univ-99",
    name: "Российский государственный университет нефти и газа имени И. М. Губкина",
    shortName: "РГУНГ",
    inn: "7736093127",
    city: "Москва",
    branch: ["Московский филиал"],
    cooperationStartYear: 2024,
    cooperationLines: [
      {
        id: "clr-rgungg-1",
        line: "drp",
        year: 2024,
        isActive: true,
        responsible: ["person-1"],
      },
    ],
    targetAudience: "Студенты нефтегазового и IT-направлений",
    isActive: true,
    initiatorBlock: "Блок технологий",
    initiatorName: "Губкин Алексей Петрович",
    branchCurators: [
      {
        id: "cur-17",
        city: "Москва",
        branch: "Московский филиал",
        cooperationLines: [
          { id: "clr-cur-17-1", line: "drp", year: 2024, isActive: true, responsible: ["person-1"] },
        ],
        cooperationStartYear: 2024,
      },
    ],
    contracts: [
      {
        id: "cont-25",
        type: "cooperation",
        hasContract: true,
        number: "Д-2024-105",
        date: "2024-05-20",
        period: { start: "2024-05-20", end: "2029-05-19" },
        asddLink: "https://asdd.example.com/contract/2024-105",
        contractBranch: "Головной ВУЗ",
      },
    ],
    conference: true,
    diplomaDefense: true,
    businessGame: false,
    allEmployees: 90,
    internHiring: true,
    averageInternsPerYear: 18,
    interns: 7,
    region: "Москва",
    description: "Профильный вуз по нефтегазовой отрасли",
    image: "/rgung-logo.png",
  },
  {
    id: "univ-12",
    name: "Дальневосточный федеральный университет",
    shortName: "ДВФУ",
    inn: "2501000010",
    city: "Владивосток",
    branch: ["Дальневосточный филиал"],
    cooperationStartYear: 2023,
    cooperationLines: [
      {
        id: "clr-dvfu-1",
        line: "cntr",
        year: 2023,
        responsible: ["person-6"],
      },
    ],
    targetAudience: "Студенты IT и инженерии",
    initiatorBlock: "Блок технологий",
    initiatorName: "Ким Александр Сергеевич",
    branchCurators: [
      { 
        id: "cur-15", 
        city: "Владивосток", 
        branch: "Дальневосточный филиал", 
        cooperationLines: [
          { id: "clr-cur-15-1", line: "cntr", year: 2023, responsible: ["person-6"] },
        ],
        cooperationStartYear: 2023,
      },
    ],
    contracts: [
      { 
        id: "cont-22", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-dvfu-2023.pdf",
        number: "Д-2023-189",
        date: "2023-04-16",
        period: { start: "2023-04-16", end: "2028-04-15" },
        asddLink: "https://asdd.example.com/contract/2023-189",
        contractBranch: "Дальневосточный филиал"
      },
    ],
    conference: false,
    diplomaDefense: true,
    businessGame: false,
    allEmployees: 60,
    internHiring: false,
    averageInternsPerYear: 8,
    interns: 3,
    region: "Приморский край",
    description: "Ведущий университет Дальнего Востока",
    image: "https://via.placeholder.com/100?text=ДВФУ",
  },
  {
    id: "univ-13",
    name: "Белгородский государственный национальный исследовательский университет",
    shortName: "БелГУ",
    city: "Белгород",
    branch: ["Центральный филиал"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-belgu-1",
        line: "drp",
        year: 2021,
        responsible: ["person-2", "person-7"],
      },
    ],
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Степанова Наталья Михайловна",
    initiatorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { 
        id: "cur-16", 
        city: "Белгород", 
        branch: "Центральный филиал", 
        cooperationLines: [
          { id: "clr-cur-16-1", line: "drp", year: 2021, responsible: ["person-2", "person-7"] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-23", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2021-267",
        date: "2021-11-22",
        period: { start: "2021-11-22", end: "2026-11-21" },
        contractBranch: "Центральный филиал"
      },
      { 
        id: "cont-24", 
        type: "internship", 
        hasContract: true,
        number: "Д-2023-298",
        date: "2023-09-07",
        period: { start: "2023-09-07", end: "2028-09-06" },
        asddLink: "https://asdd.example.com/contract/2023-298",
        contractBranch: "Головной ВУЗ"
      },
    ],
    conference: true,
    diplomaDefense: false,
    businessGame: true,
    allEmployees: 85,
    internHiring: true,
    averageInternsPerYear: 17,
    interns: 8,
    region: "Белгородская область",
    description: "Крупный региональный университет",
    image: "https://via.placeholder.com/100?text=БелГУ",
  },
  {
    id: "univ-14",
    name: "London School of Economics and Political Science",
    shortName: "LSE",
    city: "Лондон",
    countryType: "foreign",
    cooperationStartYear: 2019,
    cooperationLines: [
      {
        id: "clr-lse-1",
        line: "drp",
        year: 2019,
        responsible: ["person-1", "person-3"],
      },
    ],
    targetAudience: "Студенты экономических и политологических направлений",
    initiatorBlock: "Блок развития",
    initiatorName: "Иванов Иван Иванович",
    branchCurators: [],
    contracts: [
      {
        id: "cont-25",
        type: "cooperation",
        hasContract: true,
        number: "Д-2019-089",
        date: "2019-06-01",
        period: { start: "2019-06-01", end: "2024-05-31" },
        contractBranch: "Головной ВУЗ",
        cooperationLine: "drp",
      },
    ],
    conference: true,
    diplomaDefense: true,
    businessGame: false,
    allEmployees: 12,
    internHiring: true,
    region: "Великобритания",
    description: "Ведущая школа экономики и политических наук",
    image: "https://via.placeholder.com/100?text=LSE",
  },
  {
    id: "univ-15",
    name: "National University of Singapore",
    shortName: "NUS",
    city: "Сингапур",
    countryType: "foreign",
    cooperationStartYear: 2022,
    cooperationLines: [
      {
        id: "clr-nus-1",
        line: "cntr",
        year: 2022,
        responsible: ["person-5", "person-6"],
      },
    ],
    targetAudience: "Студенты IT и бизнес-направлений",
    initiatorBlock: "Блок технологий",
    initiatorName: "Соколов Алексей Николаевич",
    branchCurators: [],
    contracts: [
      {
        id: "cont-26",
        type: "cooperation",
        hasContract: true,
        number: "Д-2022-156",
        date: "2022-03-15",
        period: { start: "2022-03-15", end: "2027-03-14" },
        contractBranch: "Головной ВУЗ",
        cooperationLine: "cntr",
      },
    ],
    conference: false,
    diplomaDefense: true,
    businessGame: true,
    allEmployees: 5,
    internHiring: false,
    region: "Сингапур",
    description: "Крупнейший университет Сингапура",
    image: "https://via.placeholder.com/100?text=NUS",
  },
];

export {
  mockUniversities,
  mockDepartments,
  mockEmployees,
  mockNotifications,
};

export type { Department, Employee, Notification, Comment, EmailTemplate };
