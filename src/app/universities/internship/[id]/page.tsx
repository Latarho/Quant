"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, BarChart3, Briefcase, Building2, Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, FileDown, FileSpreadsheet, FileUp, FileText, Filter, HelpCircle, History, MessageSquare, Pencil, Plus, Trash2, User, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format-utils";
import { formatDateObject } from "@/lib/date-utils";
import { getStatusBadgeColor, getInternshipTypeBadgeColor } from "@/lib/badge-colors";
import type { Internship, InternshipStatus, InternshipLocation, ApplicationStatus } from "@/types/internships";
import { mockInternships, mockMentors } from "@/lib/internships/mock-data";
import type { StaffIndicatorRow } from "@/lib/internships/staff-table-data";
import { MOCK_UNIVERSITIES_FOR_STAFF, MOCK_STAFF_INDICATORS_BASE } from "@/lib/internships/staff-table-data";
import { useInternshipExtra } from "@/contexts/internship-extra-context";
import { useInternships } from "@/contexts/internships-context";

const INTERNSHIP_TYPE_OPTIONS = ["GPB.Level Up", "GPB.Experience", "GPB.IT Factory", "Стажировка МГИМО"] as const;

/** Данные блока «Информация»: воронка, прикреплённый файл, подразделения */
interface InfoBlockData {
  funnel: { applications: number; targetApplications: number; interviews: number };
  attachedFileName: string;
  departments: string[];
}

function getDefaultInfoBlockData(internship: Internship | null): InfoBlockData {
  const isDataScience = internship?.name?.trim() === "Data Science";
  return {
    funnel: { applications: 0, targetApplications: 0, interviews: 0 },
    attachedFileName: "",
    departments: isDataScience
      ? ["Департамент анализа данных", "Департамент искусственного интеллекта", "Департамент машинного обучения"]
      : [],
  };
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

/** Трудовой стаж в банке (между датой приёма в подразделение и датой увольнения). Формат: "1 г 8 мес" */
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
  if (years > 0) parts.push(`${years} г`);
  if (monthsRest > 0) parts.push(`${monthsRest} мес`);
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
    const statusRu: Record<string, string> = { in_progress: "В процессе", completed: "Завершена" };
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

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { setCustomLabel } = useBreadcrumb();
  const { internships: contextInternships } = useInternships();
  const { departmentsByInternship, setDepartmentsForInternship } = useInternshipExtra();
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
    type: "",
    direction: "",
    name: "",
    startDate: "",
    endDate: "",
    status: "in_progress" as InternshipStatus,
  });

  /** Данные блока «Информация» по id стажировки (воронка, файл, подразделения) */
  const [infoBlockDataByInternship, setInfoBlockDataByInternship] = useState<Record<string, InfoBlockData>>({});
  const [infoBlockEditOpen, setInfoBlockEditOpen] = useState(false);
  const [infoBlockForm, setInfoBlockForm] = useState<InfoBlockData>(getDefaultInfoBlockData(null));
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentInfoBlockData = useMemo((): InfoBlockData => {
    if (!displayInternship) return getDefaultInfoBlockData(null);
    const base = infoBlockDataByInternship[displayInternship.id] ?? getDefaultInfoBlockData(displayInternship);
    const externalDepartments = departmentsByInternship[displayInternship.id];
    return {
      ...base,
      departments: externalDepartments ?? base.departments,
    };
  }, [displayInternship, infoBlockDataByInternship, departmentsByInternship]);

  const openInfoBlockEdit = () => {
    if (!displayInternship) return;
    const data = infoBlockDataByInternship[displayInternship.id] ?? getDefaultInfoBlockData(displayInternship);
    setInfoBlockForm(JSON.parse(JSON.stringify(data)));
    setNewDepartmentName("");
    setInfoBlockEditOpen(true);
  };

  const saveInfoBlockEdit = () => {
    if (!displayInternship) return;
    setInfoBlockDataByInternship((prev) => ({
      ...prev,
      [displayInternship.id]: infoBlockForm,
    }));
    setDepartmentsForInternship(displayInternship.id, infoBlockForm.departments);
    setInfoBlockEditOpen(false);
  };

  const addDepartment = () => {
    const name = newDepartmentName.trim();
    if (!name) return;
    setInfoBlockForm((prev) => ({
      ...prev,
      departments: [...prev.departments, name],
    }));
    setNewDepartmentName("");
  };

  const removeDepartment = (index: number) => {
    setInfoBlockForm((prev) => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index),
    }));
  };

  const handleInfoBlockFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.name.endsWith(".xlsx")) {
      setInfoBlockForm((prev) => ({ ...prev, attachedFileName: file.name }));
    }
    e.target.value = "";
  };

  const openEditDialog = () => {
    if (!displayInternship) return;
    setEditFormData({
      type: displayInternship.title,
      direction: "",
      name: displayInternship.name ?? "",
      startDate: displayInternship.startDate instanceof Date ? displayInternship.startDate.toISOString().split("T")[0] : "",
      endDate: displayInternship.endDate instanceof Date ? displayInternship.endDate.toISOString().split("T")[0] : "",
      status: displayInternship.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedInternship) return;
    setLocalInternship({
      ...selectedInternship,
      title: editFormData.type,
      name: editFormData.name.trim() || undefined,
      startDate: new Date(editFormData.startDate),
      endDate: new Date(editFormData.endDate),
      applicationDeadline: new Date(editFormData.endDate),
      status: editFormData.status,
      updatedAt: new Date(),
    });
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    router.push("/universities?tab=internships");
  };

  const baseStaffIndicators = useMemo((): StaffIndicatorRow[] => {
    return MOCK_STAFF_INDICATORS_BASE.map((row, index) => ({
      ...row,
      university: MOCK_UNIVERSITIES_FOR_STAFF[index % MOCK_UNIVERSITIES_FOR_STAFF.length],
    }));
  }, []);

  const [additionalStaff, setAdditionalStaff] = useState<StaffIndicatorRow[]>([]);
  const staffIndicators = useMemo(
    () => [...baseStaffIndicators, ...additionalStaff],
    [baseStaffIndicators, additionalStaff]
  );

  const [addStaffDialogOpen, setAddStaffDialogOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    fullName: "",
    university: MOCK_UNIVERSITIES_FOR_STAFF[0],
    position: "",
    ssp: "",
    vsp: "",
    internshipStartDate: "",
    internshipEndDate: "",
    internshipResult: "Переведен" as "Переведен" | "Уволен",
    departmentHireDate: "",
    status: "active" as "active" | "dismissed",
  });

  const handleAddStaffSubmit = () => {
    if (!newStaffForm.fullName.trim() || !newStaffForm.internshipStartDate || !newStaffForm.internshipEndDate) return;
    const positionDepartment = newStaffForm.position && (newStaffForm.ssp || newStaffForm.vsp)
      ? `${newStaffForm.position} / ${newStaffForm.vsp || newStaffForm.ssp}`
      : newStaffForm.position || "";
    const row: StaffIndicatorRow = {
      id: `staff-${Date.now()}`,
      fullName: newStaffForm.fullName.trim(),
      university: newStaffForm.university,
      positionDepartment,
      ssp: newStaffForm.ssp || "—",
      vsp: newStaffForm.vsp || "—",
      internshipStartDate: newStaffForm.internshipStartDate,
      internshipEndDate: newStaffForm.internshipEndDate,
      internshipResult: newStaffForm.internshipResult,
      departmentHireDate: newStaffForm.departmentHireDate || null,
      dismissalDate: null,
      status: newStaffForm.status,
    };
    setAdditionalStaff((prev) => [...prev, row]);
    setNewStaffForm({
      fullName: "",
      university: MOCK_UNIVERSITIES_FOR_STAFF[0],
      position: "",
      ssp: "",
      vsp: "",
      internshipStartDate: "",
      internshipEndDate: "",
      internshipResult: "Переведен",
      departmentHireDate: "",
      status: "active",
    });
    setAddStaffDialogOpen(false);
  };

  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [staffItemsPerPage, setStaffItemsPerPage] = useState(10);
  const [staffFullView, setStaffFullView] = useState(false);
  const [infoBlockOpen, setInfoBlockOpen] = useState(true);
  const [staffBlockOpen, setStaffBlockOpen] = useState(true);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentDialogStaff, setCommentDialogStaff] = useState<{ staffId: string; fullName: string; comment: string } | null>(null);
  const [staffComments, setStaffComments] = useState<Record<string, string>>({});
  const [careerModalStaff, setCareerModalStaff] = useState<StaffIndicatorRow | null>(null);

  const getStaffComment = (row: StaffIndicatorRow) => staffComments[row.id] ?? row.comment ?? "";

  /** Текущий стаж в банке: от даты приёма в подразделение до даты увольнения или до текущей даты */
  const getCurrentTenure = (row: StaffIndicatorRow): string => {
    if (!row.departmentHireDate) return "—";
    const endDate = row.dismissalDate ?? new Date().toISOString().split("T")[0];
    return getTenureInBank(row.departmentHireDate, endDate);
  };

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
  const totalTrainees = filteredStaffIndicators.length;
  const currentEmployees = filteredStaffIndicators.filter((row) => row.status === "active").length;
  const conversionPercent = totalTrainees > 0 ? Math.round((currentEmployees / totalTrainees) * 100) : null;

  // Устанавливаем в breadcrumbs: название стажировки (если есть) или тип
  useEffect(() => {
    if (displayInternship) {
      const label = displayInternship.name?.trim() || displayInternship.title;
      setCustomLabel(label);
    }
    // Очищаем при размонтировании
    return () => {
      setCustomLabel(null);
    };
  }, [displayInternship, setCustomLabel]);

  const getInternshipStatusText = (status: InternshipStatus | ApplicationStatus) => {
    const statusMap: Record<string, string> = {
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
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-sm font-medium", getInternshipTypeBadgeColor(displayInternship.title))}>
                {displayInternship.title}
              </Badge>
              <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
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
              <Badge variant="outline" className={cn("text-sm font-medium", getInternshipStatusColor(displayInternship.status))}>
                {getInternshipStatusText(displayInternship.status)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {displayInternship.name?.trim() || displayInternship.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {displayInternship.universityName}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end justify-center shrink-0">
          {(displayInternship.status === "in_progress" || displayInternship.status === "completed") && (
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
              <CardHeader className="rounded-t-xl">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      aria-label={infoBlockOpen ? "Свернуть" : "Развернуть"}
                      onClick={() => setInfoBlockOpen((v) => !v)}
                    >
                      <ChevronDown
                        className={cn("h-5 w-5 transition-transform", !infoBlockOpen && "-rotate-90")}
                      />
                    </Button>
                    <CardTitle className="text-lg">Информация</CardTitle>
                  </div>
                  {(displayInternship.status === "in_progress" || displayInternship.status === "completed") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label="Редактировать блок информации"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInfoBlockEdit();
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              {infoBlockOpen && (
              <CardContent className="space-y-6 pt-1">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Воронка (слева) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <BarChart3 className="h-4 w-4 shrink-0" />
                      Воронка
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg border bg-muted/30 dark:bg-muted/20 p-4 text-center">
                        <div className="text-2xl font-semibold tabular-nums text-foreground">
                          {currentInfoBlockData.funnel.applications}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Заявки</div>
                      </div>
                      <div className="rounded-lg border bg-muted/30 dark:bg-muted/20 p-4 text-center">
                        <div className="text-2xl font-semibold tabular-nums text-foreground">
                          {currentInfoBlockData.funnel.targetApplications}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Целевые заявки</div>
                      </div>
                      <div className="rounded-lg border bg-muted/30 dark:bg-muted/20 p-4 text-center">
                        <div className="text-2xl font-semibold tabular-nums text-foreground">
                          {currentInfoBlockData.funnel.interviews}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Собеседования</div>
                      </div>
                    </div>
                  </div>

                  {/* Результаты стажировки (справа) — те же метрики, что и в карточке */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <BarChart3 className="h-4 w-4 shrink-0" />
                      Результаты
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg border bg-muted/30 dark:bg-muted/20 p-4 text-center cursor-help">
                            <div className="text-2xl font-semibold tabular-nums text-foreground">
                              {totalTrainees}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Стажеры</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Общее количество стажеров (строки в таблице кадровых показателей)</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg border bg-muted/30 dark:bg-muted/20 p-4 text-center cursor-help">
                            <div className="text-2xl font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                              {currentEmployees}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Сотрудники</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Сотрудники, работающие в банке на текущий момент</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-lg border bg-muted/30 dark:bg-muted/20 p-4 text-center cursor-help">
                            <div className="text-2xl font-semibold tabular-nums text-purple-600 dark:text-purple-400">
                              {conversionPercent != null ? `${conversionPercent}%` : "—"}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Конверсия</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Конверсия = Сотрудники / Стажеры, в процентах</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Документ */}
                {currentInfoBlockData.attachedFileName ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileSpreadsheet className="h-4 w-4 shrink-0" />
                      Документ
                    </div>
                    <div className="rounded-lg border bg-muted/20 dark:bg-muted/10 px-4 py-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium truncate">{currentInfoBlockData.attachedFileName}</span>
                    </div>
                  </div>
                ) : null}

                {/* Подразделения */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Building2 className="h-4 w-4 shrink-0" />
                    Подразделения
                  </div>
                  {currentInfoBlockData.departments.length > 0 ? (
                    <div className="rounded-lg">
                      {currentInfoBlockData.departments.map((d, i) => (
                        <div key={i} className="px-4 py-2.5 text-sm flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                          {d}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg px-4 py-6 text-center text-sm text-muted-foreground">
                      Нет подразделений
                    </div>
                  )}
                </div>

                {/* Дополнительно: город и зарплата */}
                {(displayInternship.city || displayInternship.salary) ? (
                  <div className="pt-2 border-t space-y-2">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Дополнительно</div>
                    <div className="flex flex-wrap gap-6">
                      {displayInternship.city && (
                        <div>
                          <span className="text-sm text-muted-foreground">Город</span>
                          <p className="text-sm font-medium">{displayInternship.city}</p>
                        </div>
                      )}
                      {displayInternship.salary && (
                        <div>
                          <span className="text-sm text-muted-foreground">Зарплата</span>
                          <p className="text-sm font-medium">{displayInternship.salary.toLocaleString("ru-RU")} ₽</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </CardContent>
              )}
            </Card>
          </div>

          {/* Стажеры — коллапсируемый блок */}
          <div className="w-full grid grid-cols-1 gap-4 mb-6">
            <Card className="min-w-0 w-full">
              <CardHeader className="rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    aria-label={staffBlockOpen ? "Свернуть" : "Развернуть"}
                    onClick={() => setStaffBlockOpen((v) => !v)}
                  >
                    <ChevronDown
                      className={cn("h-5 w-5 transition-transform", !staffBlockOpen && "-rotate-90")}
                    />
                  </Button>
                  <CardTitle className="text-lg">Стажеры</CardTitle>
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
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="staff-full-view"
                        checked={staffFullView}
                        onCheckedChange={(value) => {
                          const checked = Boolean(value);
                          setStaffFullView(checked);
                          if (checked) {
                            setStaffCurrentPage(1);
                          }
                        }}
                      />
                      <Label
                        htmlFor="staff-full-view"
                        className="text-sm font-normal text-muted-foreground cursor-pointer whitespace-nowrap"
                      >
                        Показать полный вид
                      </Label>
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
                            Экспорт в Excel краткий вид
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileUp className="mr-2 h-4 w-4" />
                            Экспорт в Excel полный вид
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Фильтры
                      </Button>
                      <Button size="sm" onClick={() => setAddStaffDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Добавить стажера
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg overflow-x-auto overflow-y-hidden">
                  <Table className={staffFullView ? "min-w-[1200px]" : "min-w-full"}>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm font-semibold sticky left-0 z-10 bg-background">
                          ФИО
                        </TableHead>
                        <TableHead className="text-sm font-semibold">ВУЗ</TableHead>
                        <TableHead className="text-sm font-semibold">Должность</TableHead>
                        <TableHead className="text-sm font-semibold">ССП</TableHead>
                        <TableHead className="text-sm font-semibold">ВСП</TableHead>
                        <TableHead className="text-sm font-semibold max-w-[8.5rem]">
                          <span className="block">Дата приема на</span>
                          <span className="block">стажировку</span>
                        </TableHead>
                        <TableHead className="text-sm font-semibold max-w-[8.5rem]">
                          <span className="block">Дата окончания</span>
                          <span className="block">стажировки</span>
                        </TableHead>
                        <TableHead className="text-sm font-semibold">Результат стажировки</TableHead>
                        <TableHead className="text-sm font-semibold max-w-[8.5rem]">
                          <span className="block">Дата приема в</span>
                          <span className="block">ССП/ВСП</span>
                        </TableHead>
                        {staffFullView && (
                          <>
                            <TableHead className="text-sm font-semibold max-w-[8.5rem]">
                              <span className="block">Дата увольнения</span>
                            </TableHead>
                            <TableHead className="text-sm font-semibold">Этап увольнения</TableHead>
                            <TableHead className="text-sm font-semibold">Трудовой стаж в банке</TableHead>
                            <TableHead className="text-sm font-semibold">Комментарий</TableHead>
                          </>
                        )}
                        <TableHead className="text-sm font-semibold text-center">Статус</TableHead>
                        <TableHead className="text-sm font-semibold text-center">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const totalPages = Math.ceil(filteredStaffIndicators.length / staffItemsPerPage);
                        const startIndex = (staffCurrentPage - 1) * staffItemsPerPage;
                        const endIndex = startIndex + staffItemsPerPage;
                        const paginatedStaff = filteredStaffIndicators.slice(startIndex, endIndex);
                        return paginatedStaff.map((row) => (
                        <TableRow
                          key={row.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setCareerModalStaff(row)}
                        >
                          <TableCell className="px-4 whitespace-normal sticky left-0 z-10 bg-background">
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
                                "text-sm px-2 py-0.5",
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
                          {staffFullView && (
                            <>
                              <TableCell className="px-4 whitespace-normal max-w-[8.5rem]">
                                {row.dismissalDate ? formatDateRu(row.dismissalDate) : "—"}
                              </TableCell>
                              <TableCell className="px-4 whitespace-normal">
                                {getDismissalStage(row.dismissalDate, row.internshipEndDate)}
                              </TableCell>
                              <TableCell className="px-4 whitespace-normal">
                                {getTenureInBank(row.departmentHireDate, row.dismissalDate)}
                              </TableCell>
                              <TableCell className="px-4 whitespace-normal">
                                {getStaffComment(row) || "—"}
                              </TableCell>
                            </>
                          )}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              {row.status === "dismissed" ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="text-sm px-2 py-0.5 cursor-help bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                                    >
                                      Уволен
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs p-3 space-y-1.5">
                                    <p><span className="font-medium">Дата увольнения:</span> {row.dismissalDate ? formatDateRu(row.dismissalDate) : "—"}</p>
                                    <p><span className="font-medium">Этап увольнения:</span> {getDismissalStage(row.dismissalDate, row.internshipEndDate)}</p>
                                    <p><span className="font-medium">Трудовой стаж в банке:</span> {getTenureInBank(row.departmentHireDate, row.dismissalDate)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={cn("text-sm px-2 py-0.5", getStatusBadgeColor("active"))}
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
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
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

      {/* Модальное окно комментария к стажеру (стажеры) */}
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

      {/* Модальное окно: Карьерный путь сотрудника в банке (стилистика модалок ЛК ДРП / Практиканты) */}
      <Dialog open={!!careerModalStaff} onOpenChange={(open) => !open && setCareerModalStaff(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">Карьерный путь в банке</DialogTitle>
            {careerModalStaff && (
              <DialogDescription className="text-muted-foreground">
                <span className="block text-sm font-medium text-foreground">
                  {careerModalStaff.fullName}
                </span>
                {careerModalStaff.university && (
                  <span className="block text-sm mt-1">
                    ВУЗ: {getUniversityShortName(careerModalStaff.university)}
                  </span>
                )}
              </DialogDescription>
            )}
          </DialogHeader>
          {careerModalStaff && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Этапы карьеры</Label>
                <ol className="space-y-3">
                  <li>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm font-medium text-foreground">Стажировка</p>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium text-foreground">Период:</span> {formatDateRu(careerModalStaff.internshipStartDate)} — {formatDateRu(careerModalStaff.internshipEndDate)}</p>
                        <p><span className="font-medium text-foreground">ССП:</span> {careerModalStaff.ssp || "—"}</p>
                        <p><span className="font-medium text-foreground">ВСП:</span> {careerModalStaff.vsp || "—"}</p>
                        <p><span className="font-medium text-foreground">Результат:</span> {careerModalStaff.internshipResult}</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm font-medium text-foreground">{careerModalStaff.positionDepartment || "Должность в подразделении"}</p>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium text-foreground">ССП:</span> {careerModalStaff.ssp || "—"}</p>
                        <p><span className="font-medium text-foreground">ВСП:</span> {careerModalStaff.vsp || "—"}</p>
                        <p>
                          <span className="font-medium text-foreground">Период:</span>{" "}
                          {careerModalStaff.departmentHireDate
                            ? `${formatDateRu(careerModalStaff.departmentHireDate)} — ${careerModalStaff.dismissalDate ? formatDateRu(careerModalStaff.dismissalDate) : "н.в."}`
                            : "—"}
                        </p>
                        {careerModalStaff.status === "dismissed" && (
                          <p><span className="font-medium text-foreground">Статус:</span> Уволен</p>
                        )}
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Текущий стаж в банке</Label>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xl font-semibold tabular-nums text-foreground">{getCurrentTenure(careerModalStaff)}</p>
                  {careerModalStaff.status === "active" && careerModalStaff.departmentHireDate && (
                    <p className="text-sm text-muted-foreground mt-1">с {formatDateRu(careerModalStaff.departmentHireDate)} по н.в.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCareerModalStaff(null)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно: Добавить стажера */}
      <Dialog open={addStaffDialogOpen} onOpenChange={setAddStaffDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить стажера</DialogTitle>
            <DialogDescription>Заполните данные по полям таблицы кадровых показателей</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-staff-fullName">ФИО *</Label>
              <Input
                id="new-staff-fullName"
                value={newStaffForm.fullName}
                onChange={(e) => setNewStaffForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Фамилия Имя Отчество"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-staff-university">ВУЗ *</Label>
              <Select
                value={newStaffForm.university}
                onValueChange={(v) => setNewStaffForm((p) => ({ ...p, university: v }))}
              >
                <SelectTrigger id="new-staff-university">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_UNIVERSITIES_FOR_STAFF.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-staff-position">Должность</Label>
              <Input
                id="new-staff-position"
                value={newStaffForm.position}
                onChange={(e) => setNewStaffForm((p) => ({ ...p, position: e.target.value }))}
                placeholder="Например: Аналитик-исследователь"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-staff-ssp">ССП</Label>
                <Input
                  id="new-staff-ssp"
                  value={newStaffForm.ssp}
                  onChange={(e) => setNewStaffForm((p) => ({ ...p, ssp: e.target.value }))}
                  placeholder="Департамент"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-staff-vsp">ВСП</Label>
                <Input
                  id="new-staff-vsp"
                  value={newStaffForm.vsp}
                  onChange={(e) => setNewStaffForm((p) => ({ ...p, vsp: e.target.value }))}
                  placeholder="Управление / отдел"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-staff-start">Дата приема на стажировку *</Label>
                <Input
                  id="new-staff-start"
                  type="date"
                  value={newStaffForm.internshipStartDate}
                  onChange={(e) => setNewStaffForm((p) => ({ ...p, internshipStartDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-staff-end">Дата окончания стажировки *</Label>
                <Input
                  id="new-staff-end"
                  type="date"
                  value={newStaffForm.internshipEndDate}
                  onChange={(e) => setNewStaffForm((p) => ({ ...p, internshipEndDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-staff-result">Результат стажировки</Label>
                <Select
                  value={newStaffForm.internshipResult}
                  onValueChange={(v: "Переведен" | "Уволен") => setNewStaffForm((p) => ({ ...p, internshipResult: v }))}
                >
                  <SelectTrigger id="new-staff-result">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Переведен">Переведен</SelectItem>
                    <SelectItem value="Уволен">Уволен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-staff-departmentHire">Дата приема в ССП/ВСП</Label>
                <Input
                  id="new-staff-departmentHire"
                  type="date"
                  value={newStaffForm.departmentHireDate}
                  onChange={(e) => setNewStaffForm((p) => ({ ...p, departmentHireDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-staff-status">Статус</Label>
              <Select
                value={newStaffForm.status}
                onValueChange={(v: "active" | "dismissed") => setNewStaffForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger id="new-staff-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Работает</SelectItem>
                  <SelectItem value="dismissed">Уволен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleAddStaffSubmit}
              disabled={!newStaffForm.fullName.trim() || !newStaffForm.internshipStartDate || !newStaffForm.internshipEndDate}
            >
              Добавить
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
              Подробная история изменений для «{displayInternship?.name?.trim() || displayInternship?.title || "стажировки"}»
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
                            <Badge variant="outline" className="text-sm">
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

      {/* Редактирование стажировки — только основные поля, раскладка как в «Добавить стажировку» */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать стажировку</DialogTitle>
            <DialogDescription>
              Измените направление, название, даты или статус стажировки
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 1-я строка: программа и направление */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="edit-internship-type">Программа <span className="text-destructive">*</span></Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100]">
                      <p>Выберите программу: GPB.Level Up, GPB.Experience, GPB.IT Factory или Стажировка МГИМО</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={editFormData.type}
                  onValueChange={(v) => setEditFormData((prev) => ({ ...prev, type: v }))}
                >
                  <SelectTrigger id="edit-internship-type" className="w-full">
                    <SelectValue placeholder="Выберите программу" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERNSHIP_TYPE_OPTIONS.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="edit-internship-direction">Направление</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100]">
                      <p>Выберите направление стажировки (например, разработка, аналитика, кибербезопасность)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={editFormData.direction}
                  onValueChange={(v) => setEditFormData((prev) => ({ ...prev, direction: v }))}
                >
                  <SelectTrigger id="edit-internship-direction" className="w-full">
                    <SelectValue placeholder="Выберите направление" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Разработка", "Аналитика", "Кибербезопасность", "Дизайн", "Product / бизнес", "DevOps / инфраструктура"].map(
                      (direction) => (
                        <SelectItem key={direction} value={direction}>
                          {direction}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2-я строка: даты и статус */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="edit-internship-startDate">Дата начала <span className="text-destructive">*</span></Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100]">
                      <p>Укажите дату начала стажировки</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="edit-internship-startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="edit-internship-endDate">Дата окончания <span className="text-destructive">*</span></Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100]">
                      <p>Укажите дату окончания стажировки</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="edit-internship-endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="edit-internship-status">Статус <span className="text-destructive">*</span></Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100]">
                      <p>Выберите статус: в процессе или завершена</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={editFormData.status}
                  onValueChange={(v) => setEditFormData((prev) => ({ ...prev, status: v as InternshipStatus }))}
                >
                  <SelectTrigger id="edit-internship-status" className="w-full">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">В процессе</SelectItem>
                    <SelectItem value="completed">Завершена</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-1">
                <Label htmlFor="edit-internship-name">Название стажировки <span className="text-muted-foreground font-normal">(необязательно)</span></Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="z-[100]">
                    <p>Можно указать название стажировки (например, период или тема набора) или оставить пустым</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="edit-internship-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Название стажировки"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editFormData.type || !editFormData.startDate || !editFormData.endDate}
            >
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Редактирование блока «Информация»: воронка, документ xlsx, подразделения */}
      <Dialog open={infoBlockEditOpen} onOpenChange={setInfoBlockEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать блок информации</DialogTitle>
            <DialogDescription>
              Воронка, прикреплённый документ и подразделения
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Воронка (количество)</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Заявки</Label>
                  <Input
                    type="number"
                    min={0}
                    value={infoBlockForm.funnel.applications}
                    onChange={(e) =>
                      setInfoBlockForm((prev) => ({
                        ...prev,
                        funnel: { ...prev.funnel, applications: parseInt(e.target.value, 10) || 0 },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Целевые заявки</Label>
                  <Input
                    type="number"
                    min={0}
                    value={infoBlockForm.funnel.targetApplications}
                    onChange={(e) =>
                      setInfoBlockForm((prev) => ({
                        ...prev,
                        funnel: { ...prev.funnel, targetApplications: parseInt(e.target.value, 10) || 0 },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Собеседования</Label>
                  <Input
                    type="number"
                    min={0}
                    value={infoBlockForm.funnel.interviews}
                    onChange={(e) =>
                      setInfoBlockForm((prev) => ({
                        ...prev,
                        funnel: { ...prev.funnel, interviews: parseInt(e.target.value, 10) || 0 },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Документ (xlsx)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleInfoBlockFileChange}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Приложить xlsx
                </Button>
                {infoBlockForm.attachedFileName && (
                  <span className="text-sm text-muted-foreground truncate">{infoBlockForm.attachedFileName}</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Подразделения</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Название подразделения"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDepartment())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addDepartment}>
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <ul className="space-y-1.5 mt-2">
                {infoBlockForm.departments.map((name, index) => (
                  <li key={index} className="flex items-center justify-between gap-2 text-sm py-1.5 px-2 rounded bg-muted/50">
                    <span>{name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeDepartment(index)}
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoBlockEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveInfoBlockEdit}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
