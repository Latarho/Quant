/** Утилиты отображения для стажировок и заявок */

import type { InternshipStatus, ApplicationStatus } from "@/types/internships";
import { getStatusBadgeColor } from "@/lib/badge-colors";

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В процессе",
  completed: "Завершена",
  pending: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено",
  withdrawn: "Отозвано",
  confirmed: "Подтверждено",
  active: "Активно",
};

export function getInternshipStatusText(status: InternshipStatus | ApplicationStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getInternshipStatusColor(status: InternshipStatus | ApplicationStatus): string {
  return getStatusBadgeColor(status);
}
