/**
 * Константы для модуля университетов
 */

import type { CooperationLine } from "@/types/universities";

export const availableBranches = [
  { value: "Московский филиал", label: "Московский филиал" },
  { value: "Санкт-Петербургский филиал", label: "Санкт-Петербургский филиал" },
  { value: "Уральский филиал", label: "Уральский филиал" },
  { value: "Сибирский филиал", label: "Сибирский филиал" },
  { value: "Приволжский филиал", label: "Приволжский филиал" },
  { value: "Дальневосточный филиал", label: "Дальневосточный филиал" },
  { value: "Южный филиал", label: "Южный филиал" },
  { value: "Центральный филиал", label: "Центральный филиал" },
  { value: "Центральный офис", label: "Центральный офис" },
];

export const cooperationLines = [
  { value: "drp", label: "ДРП" },
  { value: "bko", label: "БКО" },
  { value: "cntr", label: "ЦНТР" },
  { value: "ecosystem", label: "Экосистема" },
  { value: "dkm", label: "ДКМ" },
];

export const responsiblePersons = [
  { value: "person-1", label: "Иванов Иван Иванович", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", position: "Руководитель направления" },
  { value: "person-2", label: "Петрова Мария Сергеевна", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", position: "Старший специалист" },
  { value: "person-3", label: "Сидоров Алексей Дмитриевич", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", position: "Менеджер проектов" },
  { value: "person-4", label: "Козлова Анна Владимировна", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", position: "Специалист по работе с ВУЗами" },
  { value: "person-5", label: "Волков Дмитрий Петрович", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", position: "Руководитель отдела" },
  { value: "person-6", label: "Новикова Елена Александровна", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", position: "Координатор программ" },
  { value: "person-7", label: "Морозов Сергей Викторович", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face", position: "Ведущий специалист" },
  { value: "person-8", label: "Павлова Ольга Николаевна", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", position: "Менеджер по развитию" },
  { value: "person-9", label: "Семенов Андрей Борисович", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", position: "Руководитель проектов" },
  { value: "person-10", label: "Лебедева Татьяна Михайловна", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", position: "Специалист по партнерствам" },
];

const COOPERATION_LINE_LABELS: Record<CooperationLine, string> = {
  drp: "ДРП",
  bko: "БКО",
  cntr: "ЦНТР",
  ecosystem: "Экосистема",
  dkm: "ДКМ",
};

/** Возвращает подпись линии сотрудничества */
export function getCooperationLineLabel(line?: CooperationLine | CooperationLine[]): string {
  if (!line) return "";
  if (Array.isArray(line)) {
    return line.map((l) => COOPERATION_LINE_LABELS[l] || "").filter(Boolean).join(", ");
  }
  return COOPERATION_LINE_LABELS[line] || "";
}
