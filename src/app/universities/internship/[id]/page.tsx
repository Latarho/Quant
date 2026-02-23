"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, FileDown, FileUp, FileText, Filter, History, MessageSquare, Pencil, Trash2, User, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format-utils";
import { formatDateObject } from "@/lib/date-utils";
import { getStatusBadgeColor } from "@/lib/badge-colors";
import type { Internship, InternshipStatus, InternshipLocation, ApplicationStatus } from "@/types/internships";
import { mockInternships, mockMentors } from "@/lib/internships/mock-data";
import { useInternships } from "@/contexts/internships-context";

/** Запись кадровых показателей стажировки (формат как в ДРП — сотрудники) */
interface StaffIndicatorRow {
  id: string;
  fullName: string;
  university: string;
  positionDepartment: string;
  /** ССП — департамент */
  ssp: string;
  /** ВСП — управление / отдел */
  vsp: string;
  internshipStartDate: string;
  internshipEndDate: string;
  internshipResult: string;
  departmentHireDate: string | null;
  dismissalDate: string | null;
  status: "active" | "dismissed";
  comment?: string;
}

const formatDateRu = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
};

/** Этап увольнения: до или после окончания стажировки */
function getDismissalStage(dismissalDate: string | null, internshipEndDate: string): string {
  if (!dismissalDate) return "—";
  return dismissalDate <= internshipEndDate ? "до окончания стажировки" : "после окончания стажировки";
}

/** Трудовой стаж в банке (между датой приёма в подразделение и датой увольнения) */
function getTenureInBank(departmentHireDate: string | null, dismissalDate: string | null): string {
  if (!departmentHireDate || !dismissalDate) return "—";
  const [y1, m1, d1] = departmentHireDate.split("-").map(Number);
  const [y2, m2, d2] = dismissalDate.split("-").map(Number);
  let months = (y2 - y1) * 12 + (m2 - m1);
  if (d2 < d1) months -= 1;
  if (months < 0) return "—";
  const years = Math.floor(months / 12);
  const monthsRest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "год" : years < 5 ? "года" : "лет"}`);
  if (monthsRest > 0) parts.push(`${monthsRest} ${monthsRest === 1 ? "месяц" : monthsRest < 5 ? "месяца" : "месяцев"}`);
  return parts.length ? parts.join(" ") : "—";
}

/** Запись истории изменений стажировки (по аналогии с ВУЗами) */
interface InternshipChangeHistory {
  id: string;
  action: "created" | "updated" | "deleted" | "status_changed";
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: Date;
}

function getInternshipChangeHistory(internshipId: string): InternshipChangeHistory[] {
  const histories: InternshipChangeHistory[] = [
    { id: `${internshipId}-1`, action: "created", user: "Иванов Иван Иванович", timestamp: new Date("2025-01-10T10:00:00") },
    { id: `${internshipId}-2`, action: "updated", field: "title", oldValue: "Стажировка", newValue: "Фронтенд-разработка на React", user: "Петрова Анна Сергеевна", timestamp: new Date("2025-01-12T14:30:00") },
    { id: `${internshipId}-3`, action: "updated", field: "description", oldValue: "", newValue: "Подробное описание стажировки...", user: "Сидоров Петр Олегович", timestamp: new Date("2025-01-15T09:15:00") },
    { id: `${internshipId}-4`, action: "status_changed", oldValue: "Запланирована", newValue: "В процессе", user: "Козлова Мария Александровна", timestamp: new Date("2025-01-20T11:00:00") },
  ];
  return histories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/** Переводит технические значения в истории на русский для отображения */
function formatHistoryValueForDisplay(value: string | undefined, field?: string): string {
  if (value === undefined || value === "") return "(пусто)";
  if (field === "status" || !field) {
    const statusRu: Record<string, string> = { planned: "Запланирована", in_progress: "В процессе", completed: "Завершена" };
    if (statusRu[value]) return statusRu[value];
  }
  if (field === "location") {
    const locationRu: Record<string, string> = { remote: "Удаленно", office: "Офис", hybrid: "Гибридно" };
    if (locationRu[value]) return locationRu[value];
  }
  return value;
}

/** Краткие названия ВУЗов для отображения в таблице */
const UNIVERSITY_SHORT_NAMES: Record<string, string> = {
  "Московский государственный университет": "МГУ",
  "Санкт-Петербургский государственный университет": "СПбГУ",
  "Московский физико-технический институт": "МФТИ",
  "Новосибирский государственный университет": "НГУ",
  "Национальный исследовательский университет «Высшая школа экономики»": "ВШЭ",
  "Высшая школа экономики": "ВШЭ",
};

const getUniversityShortName = (fullName: string): string =>
  UNIVERSITY_SHORT_NAMES[fullName] ?? fullName;

/** Список ВУЗов для распределения по стажерам (полные названия — в таблице показываем краткие) */
const MOCK_UNIVERSITIES_FOR_STAFF = [
  "Московский государственный университет",
  "Санкт-Петербургский государственный университет",
  "Московский физико-технический институт",
  "Новосибирский государственный университет",
  "Высшая школа экономики",
];

const MOCK_STAFF_INDICATORS_BASE: Omit<StaffIndicatorRow, "university">[] = [
  { id: "1", fullName: "Иванов Иван Иванович", positionDepartment: "Аналитик-исследователь / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-20", dismissalDate: null, status: "active" },
  { id: "2", fullName: "Петрова Анна Сергеевна", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "3", fullName: "Сидоров Петр Олегович", positionDepartment: "Стажёр / Риски", ssp: "Риски", vsp: "Управление рисков", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-25", dismissalDate: null, status: "active" },
  { id: "4", fullName: "Козлова Мария Александровна", positionDepartment: "Ведущий аналитик / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "5", fullName: "Новиков Дмитрий Игоревич", positionDepartment: "Стажёр / Корпоративный блок", ssp: "Корпоративный блок", vsp: "Управление корпоративных проектов", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-01", dismissalDate: null, status: "active" },
  { id: "6", fullName: "Волкова Елена Сергеевна", positionDepartment: "Специалист / Операционный блок", ssp: "Операционный блок", vsp: "Операционное управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "7", fullName: "Морозов Алексей Владимирович", positionDepartment: "Стажёр / Риски", ssp: "Риски", vsp: "Управление рисков", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Уволен", departmentHireDate: null, dismissalDate: "2025-03-20", status: "dismissed" },
  { id: "8", fullName: "Соколова Ольга Николаевна", positionDepartment: "Ведущий аналитик / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-28", dismissalDate: null, status: "active" },
  { id: "9", fullName: "Лебедев Андрей Петрович", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "10", fullName: "Кузнецова Татьяна Михайловна", positionDepartment: "Стажёр / HR-направление", ssp: "HR", vsp: "Управление по работе с персоналом", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "11", fullName: "Попов Сергей Андреевич", positionDepartment: "Аналитик-исследователь / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-07", dismissalDate: null, status: "active" },
  { id: "12", fullName: "Васильева Наталья Олеговна", positionDepartment: "Стажёр / Финансы", ssp: "Финансы", vsp: "Финансовое управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "13", fullName: "Федоров Игорь Дмитриевич", positionDepartment: "Специалист / Юридический блок", ssp: "Юридический блок", vsp: "Юридическое управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "14", fullName: "Михайлова Юлия Викторовна", positionDepartment: "Аналитик-исследователь / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-22", dismissalDate: null, status: "active" },
  { id: "15", fullName: "Егоров Павел Александрович", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "16", fullName: "Никитина Анастасия Игоревна", positionDepartment: "Стажёр / Маркетинг", ssp: "Маркетинг", vsp: "Отдел маркетинга", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "17", fullName: "Орлов Владимир Сергеевич", positionDepartment: "Ведущий аналитик / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-01", dismissalDate: null, status: "active" },
  { id: "18", fullName: "Захарова Кристина Дмитриевна", positionDepartment: "Стажёр / Риски", ssp: "Риски", vsp: "Управление рисков", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Уволен", departmentHireDate: null, dismissalDate: "2025-03-19", status: "dismissed" },
  { id: "19", fullName: "Семёнов Роман Николаевич", positionDepartment: "Ведущий аналитик / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "20", fullName: "Голубева Дарья Андреевна", positionDepartment: "Разработчик / IT-департамент", ssp: "IT-департамент", vsp: "Управление разработки", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-24", dismissalDate: null, status: "active" },
  { id: "21", fullName: "Виноградов Артём Олегович", positionDepartment: "Стажёр / Корпоративный блок", ssp: "Корпоративный блок", vsp: "Управление корпоративных проектов", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "22", fullName: "Борисова Виктория Павловна", positionDepartment: "Специалист / Операционный блок", ssp: "Операционный блок", vsp: "Операционное управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "23", fullName: "Королёв Максим Ильич", positionDepartment: "Аналитик-исследователь / Data Science", ssp: "Аналитика", vsp: "Отдел Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-03-26", dismissalDate: null, status: "active" },
  { id: "24", fullName: "Герасимова Екатерина Владимировна", positionDepartment: "Стажёр / Финансы", ssp: "Финансы", vsp: "Финансовое управление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "25", fullName: "Тихонов Глеб Сергеевич", positionDepartment: "Аналитик-исследователь / Отдел аналитики", ssp: "Аналитика", vsp: "Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Переведен", departmentHireDate: "2025-04-02", dismissalDate: null, status: "active" },
];

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { setCustomLabel } = useBreadcrumb();
  const { internships: contextInternships } = useInternships();
  const internshipId = params.id as string;

  const internships = [...contextInternships, ...mockInternships];

  const selectedInternship = useMemo(() => {
    return internships.find(i => i.id === internshipId) || null;
  }, [internships, internshipId]);

  const [localInternship, setLocalInternship] = useState<Internship | null>(null);
  const displayInternship = localInternship ?? selectedInternship;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    universityId: "",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    maxParticipants: 10,
    status: "planned" as InternshipStatus,
    location: "hybrid" as InternshipLocation,
    city: "",
    salary: "",
    mentorId: "",
  });

  const uniqueInternshipUniversities = useMemo(() => {
    const seen = new Set<string>();
    return internships.filter((i) => {
      if (!i.universityId || seen.has(i.universityId)) return false;
      seen.add(i.universityId);
      return true;
    }).map((i) => ({ id: i.universityId, name: i.universityName }));
  }, [internships]);

  const openEditDialog = () => {
    if (!displayInternship) return;
    setEditFormData({
      title: displayInternship.title,
      description: displayInternship.description,
      universityId: displayInternship.universityId || "",
      startDate: displayInternship.startDate instanceof Date ? displayInternship.startDate.toISOString().split("T")[0] : "",
      endDate: displayInternship.endDate instanceof Date ? displayInternship.endDate.toISOString().split("T")[0] : "",
      applicationDeadline: displayInternship.applicationDeadline instanceof Date ? displayInternship.applicationDeadline.toISOString().split("T")[0] : "",
      maxParticipants: displayInternship.maxParticipants,
      status: displayInternship.status,
      location: displayInternship.location,
      city: displayInternship.city || "",
      salary: displayInternship.salary?.toString() || "",
      mentorId: displayInternship.mentorId || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedInternship) return;
    const universityName = uniqueInternshipUniversities.find((u) => u.id === editFormData.universityId)?.name ?? selectedInternship.universityName;
    const mentorName = mockMentors.find((m) => m.id === editFormData.mentorId)?.fullName;
    setLocalInternship({
      ...selectedInternship,
      title: editFormData.title,
      description: editFormData.description,
      universityId: editFormData.universityId || selectedInternship.universityId,
      universityName,
      startDate: new Date(editFormData.startDate),
      endDate: new Date(editFormData.endDate),
      applicationDeadline: new Date(editFormData.applicationDeadline),
      maxParticipants: editFormData.maxParticipants,
      status: editFormData.status,
      location: editFormData.location,
      city: editFormData.city || undefined,
      salary: editFormData.salary ? parseFloat(editFormData.salary) : undefined,
      mentorId: editFormData.mentorId || undefined,
      mentorName,
      updatedAt: new Date(),
    });
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    router.push("/universities?tab=internships");
  };

  const staffIndicators = useMemo((): StaffIndicatorRow[] => {
    return MOCK_STAFF_INDICATORS_BASE.map((row, index) => ({
      ...row,
      university: MOCK_UNIVERSITIES_FOR_STAFF[index % MOCK_UNIVERSITIES_FOR_STAFF.length],
    }));
  }, []);

  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [staffItemsPerPage, setStaffItemsPerPage] = useState(10);
  const [infoBlockOpen, setInfoBlockOpen] = useState(true);
  const [staffBlockOpen, setStaffBlockOpen] = useState(true);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentDialogStaff, setCommentDialogStaff] = useState<{ staffId: string; fullName: string; comment: string } | null>(null);
  const [staffComments, setStaffComments] = useState<Record<string, string>>({});

  const getStaffComment = (row: StaffIndicatorRow) => staffComments[row.id] ?? row.comment ?? "";

  const handleOpenCommentDialog = (row: StaffIndicatorRow) => {
    setCommentDialogStaff({ staffId: row.id, fullName: row.fullName, comment: getStaffComment(row) });
    setCommentDialogOpen(true);
  };

  const handleSaveStaffComment = () => {
    if (!commentDialogStaff) return;
    setStaffComments((prev) => ({ ...prev, [commentDialogStaff.staffId]: commentDialogStaff.comment }));
    setCommentDialogOpen(false);
    setCommentDialogStaff(null);
  };

  const filteredStaffIndicators = staffIndicators;

  // Устанавливаем название стажировки в breadcrumbs
  useEffect(() => {
    if (displayInternship) {
      setCustomLabel(displayInternship.title);
    }
    // Очищаем при размонтировании
    return () => {
      setCustomLabel(null);
    };
  }, [displayInternship, setCustomLabel]);

  const getInternshipStatusText = (status: InternshipStatus | ApplicationStatus) => {
    const statusMap: Record<string, string> = {
      planned: "Запланирована",
      in_progress: "В процессе",
      completed: "Завершена",
      pending: "На рассмотрении",
      approved: "Одобрено",
      rejected: "Отклонено",
      withdrawn: "Отозвано",
      confirmed: "Подтверждено",
      active: "Активно",
    };
    return statusMap[status] || status;
  };

  // Использует централизованные цвета из badge-colors.ts
  const getInternshipStatusColor = (status: InternshipStatus | ApplicationStatus) => {
    return getStatusBadgeColor(status);
  };

  if (!selectedInternship) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium mb-2">Стажировка не найдена</p>
        <Button onClick={() => router.push('/universities')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к списку стажировок
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/universities?tab=internships')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{displayInternship.title}</h1>
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              {displayInternship.name && (
                <>
                  <span>{displayInternship.name}</span>
                  <span aria-hidden>•</span>
                </>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                {displayInternship.startDate.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, ".")}{" "}
                —{" "}
                {displayInternship.endDate.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, ".")}
              </span>
              <span>{displayInternship.universityName}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={cn(getInternshipStatusColor(displayInternship.status))}>
            {getInternshipStatusText(displayInternship.status)}
          </Badge>
          {displayInternship.status === "planned" && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Редактировать" onClick={openEditDialog}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="История изменений" onClick={() => setHistoryDialogOpen(true)}>
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Удалить" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-6 w-full">
          {/* Информация о стажировке — коллапсируемый блок */}
          <div className="w-full grid grid-cols-1 gap-4 mb-6">
            <Card className="min-w-0 w-full">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl"
                onClick={() => setInfoBlockOpen((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={cn("h-5 w-5 shrink-0 transition-transform", !infoBlockOpen && "-rotate-90")}
                  />
                  <CardTitle className="text-lg">Информация</CardTitle>
                </div>
              </CardHeader>
              {infoBlockOpen && (
              <CardContent className="space-y-2">
                <div>
<Label className="text-xs text-muted-foreground">Описание</Label>
                <p className="text-sm">{displayInternship.description}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Формат</Label>
                  <p className="text-sm">
                    {displayInternship.location === 'remote' ? 'Удаленно' : 
                     displayInternship.location === 'office' ? 'Офис' : 'Гибридно'}
                  </p>
                </div>
                {displayInternship.city && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Город</Label>
                    <p className="text-sm">{displayInternship.city}</p>
                  </div>
                )}
                {displayInternship.salary && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Зарплата</Label>
                    <p className="text-sm">{displayInternship.salary.toLocaleString('ru-RU')} ₽</p>
                  </div>
                )}
              </CardContent>
              )}
            </Card>
          </div>

          {/* Кадровые показатели — коллапсируемый блок */}
          <div className="w-full grid grid-cols-1 gap-4 mb-6">
            <Card className="min-w-0 w-full">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl"
                onClick={() => setStaffBlockOpen((v) => !v)}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={cn("h-5 w-5 shrink-0 transition-transform", !staffBlockOpen && "-rotate-90")}
                  />
                  <CardTitle className="text-lg">Кадровые показатели</CardTitle>
                </div>
              </CardHeader>
              {staffBlockOpen && (
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      Найдено: <span className="font-semibold text-foreground">{filteredStaffIndicators.length}</span>{" "}
                      {filteredStaffIndicators.length === 1 ? "стажер" : filteredStaffIndicators.length > 1 && filteredStaffIndicators.length < 5 ? "стажера" : "стажеров"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Импорт/Экспорт Excel
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>
                          <FileDown className="mr-2 h-4 w-4" />
                          Импорт из Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileUp className="mr-2 h-4 w-4" />
                          Экспорт в Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Фильтры
                    </Button>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Добавить стажера
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm font-medium">ФИО</TableHead>
                        <TableHead className="text-sm font-medium">ВУЗ</TableHead>
                        <TableHead className="text-sm font-medium">Должность</TableHead>
                        <TableHead className="text-sm font-medium">ССП</TableHead>
                        <TableHead className="text-sm font-medium">ВСП</TableHead>
                        <TableHead className="text-sm font-medium max-w-[8.5rem]">
                          <span className="block">Дата приема на</span>
                          <span className="block">стажировку</span>
                        </TableHead>
                        <TableHead className="text-sm font-medium max-w-[8.5rem]">
                          <span className="block">Дата окончания</span>
                          <span className="block">стажировки</span>
                        </TableHead>
                        <TableHead className="text-sm font-medium">Результат стажировки</TableHead>
                        <TableHead className="text-sm font-medium max-w-[8.5rem]">
                          <span className="block">Дата приема в</span>
                          <span className="block">ССП/ВСП</span>
                        </TableHead>
                        <TableHead className="text-sm font-medium text-center">Статус</TableHead>
                        <TableHead className="text-sm font-medium text-center">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const totalPages = Math.ceil(filteredStaffIndicators.length / staffItemsPerPage);
                        const startIndex = (staffCurrentPage - 1) * staffItemsPerPage;
                        const endIndex = startIndex + staffItemsPerPage;
                        const paginatedStaff = filteredStaffIndicators.slice(startIndex, endIndex);
                        return paginatedStaff.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="px-4 whitespace-normal">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                  {getInitials(row.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{row.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">{getUniversityShortName(row.university)}</TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {row.positionDepartment.includes(" / ")
                              ? row.positionDepartment.split(" / ")[0]
                              : row.positionDepartment}
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">{row.ssp || "—"}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{row.vsp || "—"}</TableCell>
                          <TableCell className="px-4 whitespace-normal max-w-[8.5rem]">{formatDateRu(row.internshipStartDate)}</TableCell>
                          <TableCell className="px-4 whitespace-normal max-w-[8.5rem]">{formatDateRu(row.internshipEndDate)}</TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-2 py-0.5",
                                row.internshipResult === "Переведен"
                                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                                  : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                              )}
                            >
                              {row.internshipResult}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {row.departmentHireDate ? formatDateRu(row.departmentHireDate) : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              {row.status === "dismissed" ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5 cursor-help bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                                    >
                                      Уволен
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs p-3 text-sm space-y-1.5">
                                    <p><span className="font-medium">Дата увольнения:</span> {row.dismissalDate ? formatDateRu(row.dismissalDate) : "—"}</p>
                                    <p><span className="font-medium">Этап увольнения:</span> {getDismissalStage(row.dismissalDate, row.internshipEndDate)}</p>
                                    <p><span className="font-medium">Трудовой стаж в банке:</span> {getTenureInBank(row.departmentHireDate, row.dismissalDate)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                                >
                                  Работает
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCommentDialog(row);
                                }}
                                aria-label="Комментарий"
                              >
                                <MessageSquare className={cn("h-4 w-4", getStaffComment(row) ? "text-primary font-bold" : "text-muted-foreground")} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Редактировать">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between px-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="staff-items-per-page" className="text-sm text-muted-foreground">
                      Показать:
                    </Label>
                    <Select
                      value={staffItemsPerPage.toString()}
                      onValueChange={(value) => {
                        setStaffItemsPerPage(Number(value));
                        setStaffCurrentPage(1);
                      }}
                    >
                      <SelectTrigger id="staff-items-per-page" className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      из {filteredStaffIndicators.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Страница {staffCurrentPage} из {Math.ceil(filteredStaffIndicators.length / staffItemsPerPage) || 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setStaffCurrentPage(1)}
                        disabled={staffCurrentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setStaffCurrentPage(staffCurrentPage - 1)}
                        disabled={staffCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setStaffCurrentPage(staffCurrentPage + 1)}
                        disabled={staffCurrentPage >= Math.ceil(filteredStaffIndicators.length / staffItemsPerPage)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setStaffCurrentPage(Math.ceil(filteredStaffIndicators.length / staffItemsPerPage) || 1)}
                        disabled={staffCurrentPage >= Math.ceil(filteredStaffIndicators.length / staffItemsPerPage)}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              )}
            </Card>
          </div>
      </div>

      {/* Модальное окно комментария к сотруднику (кадровые показатели) */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Комментарий к стажеру</DialogTitle>
          </DialogHeader>
          {commentDialogStaff && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="staff-comment-dialog">Комментарий</Label>
                <Textarea
                  id="staff-comment-dialog"
                  placeholder="Введите комментарий..."
                  value={commentDialogStaff.comment}
                  onChange={(e) =>
                    setCommentDialogStaff((prev) => (prev ? { ...prev, comment: e.target.value } : null))
                  }
                  rows={5}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveStaffComment}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Подтверждение удаления стажировки */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить стажировку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Стажировка и все связанные данные будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* История изменений стажировки (по аналогии с ВУЗами) */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>История изменений</DialogTitle>
            <DialogDescription>
              Подробная история изменений для «{displayInternship?.title || "стажировки"}»
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(() => {
              const history = selectedInternship ? getInternshipChangeHistory(selectedInternship.id) : [];
              const getActionText = (action: InternshipChangeHistory["action"]) => {
                switch (action) {
                  case "created": return "Создан";
                  case "updated": return "Изменен";
                  case "deleted": return "Удален";
                  case "status_changed": return "Изменен статус";
                  default: return action;
                }
              };
              const getFieldName = (field?: string) => {
                if (!field) return "";
                const names: Record<string, string> = {
                  title: "Название",
                  description: "Описание",
                  status: "Статус",
                  startDate: "Дата начала",
                  endDate: "Дата окончания",
                  applicationDeadline: "Дедлайн заявок",
                  maxParticipants: "Максимум участников",
                  location: "Формат",
                  city: "Город",
                  salary: "Зарплата",
                  universityId: "ВУЗ",
                  mentorId: "Наставник",
                };
                return names[field] || field;
              };
              return history.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  История изменений отсутствует
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getActionText(item.action)}
                            </Badge>
                            {item.field && (
                              <span className="text-sm text-muted-foreground">
                                Поле: {getFieldName(item.field)}
                              </span>
                            )}
                          </div>
                          {item.oldValue !== undefined && item.newValue !== undefined && (
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Было:</span>
                                <span className="line-through text-red-600 dark:text-red-400">{formatHistoryValueForDisplay(item.oldValue, item.field)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Стало:</span>
                                <span className="text-green-600 dark:text-green-400">{formatHistoryValueForDisplay(item.newValue, item.field)}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{item.user}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{formatDateObject(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryDialogOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Редактирование стажировки — поля как при создании */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать стажировку</DialogTitle>
            <DialogDescription>
              Заполните информацию о стажировке
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-internship-title">Название стажировки *</Label>
                <Input
                  id="edit-internship-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: Фронтенд-разработка на React"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-internship-university">ВУЗ *</Label>
                <Select
                  value={editFormData.universityId}
                  onValueChange={(v) => setEditFormData((prev) => ({ ...prev, universityId: v }))}
                >
                  <SelectTrigger id="edit-internship-university">
                    <SelectValue placeholder="Выберите ВУЗ" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueInternshipUniversities.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-internship-description">Описание *</Label>
              <Textarea
                id="edit-internship-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Подробное описание стажировки..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-internship-startDate">Дата начала *</Label>
                <Input
                  id="edit-internship-startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-internship-endDate">Дата окончания *</Label>
                <Input
                  id="edit-internship-endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-internship-deadline">Дедлайн заявок *</Label>
                <Input
                  id="edit-internship-deadline"
                  type="date"
                  value={editFormData.applicationDeadline}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-internship-maxParticipants">Максимум участников *</Label>
                <Input
                  id="edit-internship-maxParticipants"
                  type="number"
                  min={1}
                  value={editFormData.maxParticipants}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, maxParticipants: parseInt(e.target.value, 10) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-internship-status">Статус</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(v) => setEditFormData((prev) => ({ ...prev, status: v as InternshipStatus }))}
                >
                  <SelectTrigger id="edit-internship-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Запланирована</SelectItem>
                    <SelectItem value="in_progress">В процессе</SelectItem>
                    <SelectItem value="completed">Завершена</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-internship-location">Формат</Label>
                <Select
                  value={editFormData.location}
                  onValueChange={(v) => setEditFormData((prev) => ({ ...prev, location: v as InternshipLocation }))}
                >
                  <SelectTrigger id="edit-internship-location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Удаленно</SelectItem>
                    <SelectItem value="office">Офис</SelectItem>
                    <SelectItem value="hybrid">Гибридно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-internship-city">Город</Label>
                <Input
                  id="edit-internship-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Москва"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-internship-salary">Зарплата (₽)</Label>
                <Input
                  id="edit-internship-salary"
                  type="number"
                  value={editFormData.salary}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, salary: e.target.value }))}
                  placeholder="30000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-internship-mentor">Наставник</Label>
              <Select
                value={editFormData.mentorId}
                onValueChange={(v) => setEditFormData((prev) => ({ ...prev, mentorId: v }))}
              >
                <SelectTrigger id="edit-internship-mentor">
                  <SelectValue placeholder="Выберите наставника" />
                </SelectTrigger>
                <SelectContent>
                  {mockMentors.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.fullName} - {m.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
