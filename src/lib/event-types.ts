/**
 * Единые типы мероприятий и подписи для ЦНТР, ДРП и Экосистемы.
 * Вынесено в lib, чтобы гарантировать доступность при любом порядке загрузки модулей.
 */

export const EVENT_TYPE_OPTIONS = [
  { value: "businessGame" as const, label: "Деловая игра" },
  { value: "caseChampionship" as const, label: "Кейс-чемпионат" },
  { value: "diplomaDefense" as const, label: "Защита диплома" },
  { value: "webinar" as const, label: "Вебинар" },
  { value: "lecture" as const, label: "Лекция" },
  { value: "conference" as const, label: "Конференция" },
  { value: "masterClass" as const, label: "Мастер-класс" },
  { value: "contact" as const, label: "Контакт" },
  { value: "meeting" as const, label: "Встреча" },
] as const;

export const EVENT_TYPE_LABELS: Record<(typeof EVENT_TYPE_OPTIONS)[number]["value"], string> =
  Object.fromEntries(EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label])) as Record<
    (typeof EVENT_TYPE_OPTIONS)[number]["value"],
    string
  >;
