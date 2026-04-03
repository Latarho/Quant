/**
 * Утилиты для форматирования дат
 */

/**
 * Форматирует дату в формат дд.мм.гггг из строки ISO (YYYY-MM-DD)
 * @param dateString Дата в формате YYYY-MM-DD
 * @returns Дата в формате дд.мм.гггг или пустая строка если дата не указана
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  
  try {
    // Парсим дату в формате YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
  } catch {
    return "";
  }
}

/**
 * Форматирует объект Date в формат дд.мм.гггг
 * @param date Объект Date
 * @returns Дата в формате дд.мм.гггг
 */
export function formatDateObject(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Форматирует дату с использованием toLocaleDateString
 * @param date Объект Date или строка ISO
 * @param locale Локаль (по умолчанию ru-RU)
 * @returns Отформатированная дата
 */
export function formatDateLocale(date: Date | string, locale: string = "ru-RU"): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Форматирует дату с возможностью указать дефолтное значение
 * @param dateString Дата в формате YYYY-MM-DD
 * @param defaultValue Значение по умолчанию (по умолчанию "—")
 * @returns Отформатированная дата или значение по умолчанию
 */
export function formatDateOrDefault(dateString: string | undefined, defaultValue: string = "—"): string {
  if (!dateString) return defaultValue;
  return formatDate(dateString);
}

/**
 * Дата и время в стиле ru (short date + short time), как toLocaleString с dateStyle/timeStyle.
 * Фиксированный timeZone — одинаковый результат на сервере (Node) и в браузере, без ошибок гидрации.
 */
export function formatDateTimeShortRu(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Moscow",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/**
 * Форматирует дату из строки ISO в формат дд.мм.гггг с обработкой часового пояса
 * @param dateString Дата в формате YYYY-MM-DD
 * @returns Дата в формате дд.мм.гггг
 */
export function formatDateToDDMMYYYY(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString + "T00:00:00");
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "";
  }
}

/**
 * Форматирует ввод даты пользователя (удаляет все кроме цифр)
 * @param value Введенное значение
 * @returns Очищенная строка с цифрами
 */
export function formatDateInput(value: string): string {
  return value.replace(/\D/g, '');
}
