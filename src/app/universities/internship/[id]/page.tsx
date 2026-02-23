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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileDown, FileUp, FileText, Filter, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusBadgeColor } from "@/lib/badge-colors";
import type { InternshipStatus, ApplicationStatus } from "@/types/internships";
import { mockInternships } from "@/lib/internships/mock-data";
import { useInternships } from "@/contexts/internships-context";

/** Запись кадровых показателей стажировки (формат как в ДРП — сотрудники) */
interface StaffIndicatorRow {
  id: string;
  fullName: string;
  university: string;
  positionDepartment: string;
  internshipStartDate: string;
  internshipEndDate: string;
  internshipResult: string;
  departmentHireDate: string | null;
  dismissalDate: string | null;
  status: "active" | "dismissed";
}

const formatDateRu = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
};

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

const MOCK_STAFF_INDICATORS_BASE: Omit<StaffIndicatorRow, "university">[] = [
  { id: "1", fullName: "Иванов Иван Иванович", positionDepartment: "Аналитик / Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: "2025-03-20", dismissalDate: null, status: "active" },
  { id: "2", fullName: "Петрова Анна Сергеевна", positionDepartment: "Разработчик / IT-департамент", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Превосходит", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "3", fullName: "Сидоров Петр Олегович", positionDepartment: "Стажёр / Риски", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: "2025-03-25", dismissalDate: null, status: "active" },
  { id: "4", fullName: "Козлова Мария Александровна", positionDepartment: "Аналитик данных / Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "5", fullName: "Новиков Дмитрий Игоревич", positionDepartment: "Стажёр / Корпоративный блок", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Превосходит", departmentHireDate: "2025-04-01", dismissalDate: null, status: "active" },
  { id: "6", fullName: "Волкова Елена Сергеевна", positionDepartment: "Специалист / Операционный блок", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "7", fullName: "Морозов Алексей Владимирович", positionDepartment: "Стажёр / Риски", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Не соответствует", departmentHireDate: null, dismissalDate: "2025-03-20", status: "dismissed" },
  { id: "8", fullName: "Соколова Ольга Николаевна", positionDepartment: "Аналитик / Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: "2025-03-28", dismissalDate: null, status: "active" },
  { id: "9", fullName: "Лебедев Андрей Петрович", positionDepartment: "Разработчик / IT-департамент", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Превосходит", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "10", fullName: "Кузнецова Татьяна Михайловна", positionDepartment: "Стажёр / HR-направление", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "11", fullName: "Попов Сергей Андреевич", positionDepartment: "Аналитик данных / Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: "2025-04-07", dismissalDate: null, status: "active" },
  { id: "12", fullName: "Васильева Наталья Олеговна", positionDepartment: "Стажёр / Финансы", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Превосходит", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "13", fullName: "Федоров Игорь Дмитриевич", positionDepartment: "Специалист / Юридический блок", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "14", fullName: "Михайлова Юлия Викторовна", positionDepartment: "Аналитик / Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: "2025-03-22", dismissalDate: null, status: "active" },
  { id: "15", fullName: "Егоров Павел Александрович", positionDepartment: "Разработчик / IT-департамент", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Превосходит", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "16", fullName: "Никитина Анастасия Игоревна", positionDepartment: "Стажёр / Маркетинг", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "17", fullName: "Орлов Владимир Сергеевич", positionDepartment: "Аналитик данных / Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: "2025-04-01", dismissalDate: null, status: "active" },
  { id: "18", fullName: "Захарова Кристина Дмитриевна", positionDepartment: "Стажёр / Риски", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Не соответствует", departmentHireDate: null, dismissalDate: "2025-03-19", status: "dismissed" },
  { id: "19", fullName: "Семёнов Роман Николаевич", positionDepartment: "Аналитик / Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "20", fullName: "Голубева Дарья Андреевна", positionDepartment: "Разработчик / IT-департамент", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Превосходит", departmentHireDate: "2025-03-24", dismissalDate: null, status: "active" },
  { id: "21", fullName: "Виноградов Артём Олегович", positionDepartment: "Стажёр / Корпоративный блок", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "22", fullName: "Борисова Виктория Павловна", positionDepartment: "Специалист / Операционный блок", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "23", fullName: "Королёв Максим Ильич", positionDepartment: "Аналитик данных / Data Science", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Превосходит", departmentHireDate: "2025-03-26", dismissalDate: null, status: "active" },
  { id: "24", fullName: "Герасимова Екатерина Владимировна", positionDepartment: "Стажёр / Финансы", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: null, dismissalDate: null, status: "active" },
  { id: "25", fullName: "Тихонов Глеб Сергеевич", positionDepartment: "Аналитик / Отдел аналитики", internshipStartDate: "2025-01-14", internshipEndDate: "2025-03-19", internshipResult: "Соответствует", departmentHireDate: "2025-04-02", dismissalDate: null, status: "active" },
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

  const staffIndicators = useMemo((): StaffIndicatorRow[] => {
    const universityName = selectedInternship?.universityName ?? "";
    return MOCK_STAFF_INDICATORS_BASE.map((row) => ({ ...row, university: universityName }));
  }, [selectedInternship?.universityName]);

  const [showFullView, setShowFullView] = useState(false);
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [staffItemsPerPage, setStaffItemsPerPage] = useState(10);
  const [staffFilter, setStaffFilter] = useState<"all" | "active">("all");
  const [infoBlockOpen, setInfoBlockOpen] = useState(true);
  const [staffBlockOpen, setStaffBlockOpen] = useState(true);

  const filteredStaffIndicators = useMemo(() => {
    if (staffFilter === "active") {
      return staffIndicators.filter((row) => row.status === "active");
    }
    return staffIndicators;
  }, [staffIndicators, staffFilter]);

  // Устанавливаем название стажировки в breadcrumbs
  useEffect(() => {
    if (selectedInternship) {
      setCustomLabel(selectedInternship.title);
    }
    // Очищаем при размонтировании
    return () => {
      setCustomLabel(null);
    };
  }, [selectedInternship, setCustomLabel]);

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
            <h1 className="text-2xl font-bold tracking-tight">{selectedInternship.title}</h1>
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              {selectedInternship.name && (
                <>
                  <span>{selectedInternship.name}</span>
                  <span aria-hidden>•</span>
                </>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                {selectedInternship.startDate.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, ".")}{" "}
                —{" "}
                {selectedInternship.endDate.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, ".")}
              </span>
              <span>{selectedInternship.universityName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(getInternshipStatusColor(selectedInternship.status))}>
            {getInternshipStatusText(selectedInternship.status)}
          </Badge>
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
                  <p className="text-sm">{selectedInternship.description}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Формат</Label>
                  <p className="text-sm">
                    {selectedInternship.location === 'remote' ? 'Удаленно' : 
                     selectedInternship.location === 'office' ? 'Офис' : 'Гибридно'}
                  </p>
                </div>
                {selectedInternship.city && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Город</Label>
                    <p className="text-sm">{selectedInternship.city}</p>
                  </div>
                )}
                {selectedInternship.salary && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Зарплата</Label>
                    <p className="text-sm">{selectedInternship.salary.toLocaleString('ru-RU')} ₽</p>
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
                      {filteredStaffIndicators.length === 1 ? "сотрудник" : filteredStaffIndicators.length > 1 && filteredStaffIndicators.length < 5 ? "сотрудника" : "сотрудников"}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStaffFilter("all");
                        setStaffCurrentPage(1);
                      }}
                    >
                      Показать всех
                    </Button>
                    <Button
                      variant={staffFilter === "active" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setStaffFilter("active");
                        setStaffCurrentPage(1);
                      }}
                    >
                      Работающие на текущий момент
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="staff-full-view"
                        checked={showFullView}
                        onCheckedChange={(checked) => setShowFullView(checked === true)}
                      />
                      <Label htmlFor="staff-full-view" className="text-sm font-normal cursor-pointer whitespace-nowrap">
                        Показать полный вид
                      </Label>
                    </div>
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
                {/* Применённый фильтр над таблицей — только когда выбран не «Все» (как в ДРП) */}
                {staffFilter === "active" && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      <span className="text-sm">Работающие на текущий момент</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStaffFilter("all");
                          setStaffCurrentPage(1);
                        }}
                        className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label="Сбросить фильтр"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                )}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm font-medium">ФИО</TableHead>
                        <TableHead className="text-sm font-medium">ВУЗ</TableHead>
                        <TableHead className="text-sm font-medium">Должность / Подразделение (стажировка)</TableHead>
                        <TableHead className="text-sm font-medium">Дата приема на стажировку</TableHead>
                        <TableHead className="text-sm font-medium">Дата окончания стажировки</TableHead>
                        <TableHead className="text-sm font-medium">Результат стажировки</TableHead>
                        <TableHead className="text-sm font-medium">Дата приема в Подразделение</TableHead>
                        <TableHead className="text-sm font-medium">Дата увольнения</TableHead>
                        <TableHead className="text-sm font-medium">Текущий статус</TableHead>
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
                          <TableCell className="px-4 whitespace-normal font-medium">{row.fullName}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{getUniversityShortName(row.university)}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{row.positionDepartment}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{formatDateRu(row.internshipStartDate)}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{formatDateRu(row.internshipEndDate)}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{row.internshipResult}</TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {row.departmentHireDate ? formatDateRu(row.departmentHireDate) : "—"}
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {row.dismissalDate ? formatDateRu(row.dismissalDate) : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-2 py-0.5",
                                row.status === "active"
                                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                                  : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                              )}
                            >
                              {row.status === "active" ? "Работает" : "Уволен"}
                            </Badge>
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
    </div>
  );
}
