/**
 * Палитра для Recharts (SVG fill не всегда корректно берёт oklch из CSS).
 * Согласована с акцентами темы (синий / зелёный / фиолетовый / предупреждение).
 */
export const CHART = {
  lineDrp: "#6b7fa8",
  lineBko: "#5a9b7a",
  lineCntr: "#9b8bc4",
  barDefault: "#94a3b8",
  barAccent: "#6b7fa8",
  positive: "#5a9b7a",
  warning: "#c4a574",
  danger: "#b87a7a",
  caseGold: "#b8a86e",
  caseBronze: "#c4a574",
  cntrViolet: "#9b8bc4",
} as const;

export const CNTR_FORMAT_LABELS: Record<string, string> = {
  "grant-cofinancing": "Грант/софинансирование",
  "ordered-rd-center-lift": "Заказной НИОКР",
  "targeted-charity": "Целевая благотв.",
  other: "Другое",
};
