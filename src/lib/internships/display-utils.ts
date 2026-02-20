/** Утилиты отображения для стажировок и заявок */

import type { InternshipStatus, ApplicationStatus } from "@/types/internships";
import { getStatusBadgeColor } from "@/lib/badge-colors";

const STATUS_LABELS: Record<string, string> = {
  planned: "План",
  recruiting: "Набор",
  active: "Активна",
  completed: "Завершена",
  pending: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено",
  withdrawn: "Отозвано",
  confirmed: "Подтверждено",
};

export function getInternshipStatusText(status: InternshipStatus | ApplicationStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getInternshipStatusColor(status: InternshipStatus | ApplicationStatus): string {
  return getStatusBadgeColor(status);
}
