/**
 * Утилиты для работы с университетами
 */

export interface ChangeHistory {
  id: string;
  partnershipId?: string;
  universityId?: string;
  action: "created" | "updated" | "deleted" | "status_changed" | "student_added" | "student_removed";
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: Date;
}

export function getUniversityChangeHistory(universityId: string): ChangeHistory[] {
  const histories: ChangeHistory[] = [];

  histories.push({
    id: `history-${universityId}-1`,
    universityId,
    action: "created",
    user: "Иванов Иван Иванович",
    timestamp: new Date("2020-01-15T10:30:00"),
  });

  const fieldChanges = [
    { field: "name", oldValue: "МГУ", newValue: "Московский государственный университет имени М.В. Ломоносова", date: "2020-02-20T14:15:00", user: "Петрова Мария Сергеевна" },
    { field: "cooperationStartYear", oldValue: "2019", newValue: "2020", date: "2020-03-10T09:00:00", user: "Сидоров Алексей Дмитриевич" },
    { field: "city", oldValue: "Москва (старое)", newValue: "Москва", date: "2020-04-05T11:20:00", user: "Козлова Елена Владимировна" },
    { field: "targetAudience", oldValue: "Студенты", newValue: "Студенты IT-направлений", date: "2020-05-12T16:45:00", user: "Волков Дмитрий Николаевич" },
    { field: "description", oldValue: "", newValue: "Ведущий университет России", date: "2020-06-18T13:30:00", user: "Новикова Анна Петровна" },
  ];

  fieldChanges.forEach((change, index) => {
    histories.push({
      id: `history-${universityId}-${index + 2}`,
      universityId,
      action: "updated",
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      user: change.user,
      timestamp: new Date(change.date),
    });
  });

  return histories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
