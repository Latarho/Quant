/**
 * Утилиты форматирования и валидации
 */

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "??";
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateDates(startDate: string, endDate?: string): string | null {
  if (!startDate) return "Дата начала обязательна";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "Некорректная дата начала";
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "Некорректная дата окончания";
    if (end < start) return "Дата окончания не может быть раньше даты начала";
  }
  return null;
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

export function formatCurrency(amount: number | undefined | null): string {
  if (!amount) return "—";
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} млн ₽`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} тыс ₽`;
  }
  return `${amount} ₽`;
}

export function formatCurrencyFull(amount: number | undefined | null): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STUDENT_STATUS_LABELS: Record<string, string> = {
  "not-started": "Не начато",
  invited: "Приглашен",
  "in-progress": "В процессе",
  completed: "Завершено",
};

export function getStudentStatusText(status: string): string {
  return STUDENT_STATUS_LABELS[status] ?? status;
}

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  cooperation: "Сотрудничество",
  scholarship: "Стипендия",
  internship: "Стажировка",
  bankDepartment: "Кафедра банка",
};

export function getContractTypeName(type: string): string {
  return CONTRACT_TYPE_LABELS[type] ?? type;
}

const EVENT_STATUS_LABELS: Record<string, string> = {
  planned: "Запланировано",
  in_progress: "В процессе",
  completed: "Завершено",
  cancelled: "Отменено",
};

export function getEventStatusName(status: string): string {
  return EVENT_STATUS_LABELS[status] ?? status;
}

const PRACTICE_STATUS_LABELS: Record<string, string> = {
  not_meets: "Не соответствует",
  meets: "Соответствует",
  exceeds: "Превосходит",
};

export function getPracticeStatusName(status?: string): string {
  return status ? (PRACTICE_STATUS_LABELS[status] ?? status) : "—";
}

const SUPPORT_FORMAT_LABELS: Record<string, string> = {
  "grant-cofinancing": "Грант/софинансирование",
  "ordered-rd-center-lift": "Заказной НИОКР / Центр-лифт",
  "targeted-charity": "Целевая благотворительность",
};

export function getSupportFormatName(format?: string): string {
  return format ? (SUPPORT_FORMAT_LABELS[format] ?? format) : "—";
}
