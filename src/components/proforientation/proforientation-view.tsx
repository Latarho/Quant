"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { useProforientation } from "@/contexts/proforientation-context";
import { INTEREST_DIRECTIONS } from "@/lib/proforientation/types";
import type { OrientationScores, ProforientationStatus } from "@/lib/proforientation/types";
import { getCurrentBankEmployee } from "@/lib/auth/current-user";
import { formatDateDDMMYYYYRu, formatDateOrDefault } from "@/lib/date-utils";
import { ApplicationStatusBadge, STATUS_LABEL } from "@/components/proforientation/proforientation-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, CalendarDays, CircleHelp, Filter, Plus, SortAsc, SortDesc, UserCircle, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function employeeInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  const one = parts[0] ?? "";
  return one.slice(0, 2).toUpperCase() || "?";
}

type ApplicationFormState = {
  employeeFullName: string;
  employeeTabNumber: string;
  employeeDepartment: string;
  employeePosition: string;
  employeeEmail: string;
  employeePhone: string;
  childFullName: string;
  childBirthDate: string;
  childSchoolGrade: string;
  interestDirections: string[];
  comment: string;
};

type ApplicationsSortBy = "createdAt" | "childFullName" | "employeeFullName";

const PROFORIENTATION_STATUS_OPTIONS: { value: ProforientationStatus; label: string }[] = (
  ["created", "in_progress", "completed"] as const
).map((value) => ({ value, label: STATUS_LABEL[value] }));

function buildApplicationFormFromCurrentUser(): ApplicationFormState {
  const u = getCurrentBankEmployee();
  return {
    employeeFullName: u.fullName,
    employeeTabNumber: u.tabNumber,
    employeeDepartment: u.department,
    employeePosition: u.position,
    employeeEmail: u.email,
    employeePhone: u.phone,
    childFullName: "",
    childBirthDate: "",
    childSchoolGrade: "",
    interestDirections: [],
    comment: "",
  };
}

export function ProforientationView() {
  const router = useRouter();
  const { applications, submitApplication, updateStatus, setResult } = useProforientation();

  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [applications]
  );

  /** Порядковый номер заявки (№1 — самая ранняя по дате создания), одинаковый во всех списках */
  const applicationNumberById = useMemo(() => {
    const byCreated = [...applications].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const map = new Map<string, number>();
    byCreated.forEach((app, i) => map.set(app.id, i + 1));
    return map;
  }, [applications]);

  /** Заявки для администрирования: не завершённые */
  const adminQueue = useMemo(
    () => sortedApplications.filter((a) => a.status !== "completed"),
    [sortedApplications]
  );

  const [applicationsFiltersOpen, setApplicationsFiltersOpen] = useState(false);
  const [appFilterStatuses, setAppFilterStatuses] = useState<ProforientationStatus[]>([]);
  const [appFilterInterestIds, setAppFilterInterestIds] = useState<string[]>([]);
  const [appSortBy, setAppSortBy] = useState<ApplicationsSortBy>("createdAt");
  const [appSortOrder, setAppSortOrder] = useState<"asc" | "desc">("desc");

  const filteredApplications = useMemo(() => {
    const list = sortedApplications.filter((a) => {
      if (appFilterStatuses.length > 0 && !appFilterStatuses.includes(a.status)) return false;
      if (
        appFilterInterestIds.length > 0 &&
        !appFilterInterestIds.some((id) => a.interestDirections.includes(id))
      ) {
        return false;
      }
      return true;
    });
    const mult = appSortOrder === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (appSortBy === "createdAt") {
        return mult * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      if (appSortBy === "childFullName") {
        return mult * a.childFullName.localeCompare(b.childFullName, "ru", { sensitivity: "base" });
      }
      return mult * a.employeeFullName.localeCompare(b.employeeFullName, "ru", { sensitivity: "base" });
    });
  }, [sortedApplications, appFilterStatuses, appFilterInterestIds, appSortBy, appSortOrder]);

  const applicationsActiveFilterCount = appFilterStatuses.length + appFilterInterestIds.length;

  const resetApplicationsFilters = () => {
    setAppFilterStatuses([]);
    setAppFilterInterestIds([]);
    setAppSortBy("createdAt");
    setAppSortOrder("desc");
  };

  const [newApplicationOpen, setNewApplicationOpen] = useState(false);
  const [form, setForm] = useState<ApplicationFormState>(() => buildApplicationFormFromCurrentUser());

  const [resultDialogId, setResultDialogId] = useState<string | null>(null);
  const [scores, setScores] = useState<OrientationScores>({
    analytical: 72,
    technical: 78,
    social: 55,
    creative: 48,
  });
  const [summary, setSummary] = useState(
    "Выражен интерес к техническим и аналитическим задачам. Рекомендуется развитие в направлениях ИТ, прикладной математики и финансовых технологий."
  );

  const resetForm = () => setForm(buildApplicationFormFromCurrentUser());

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication({
      ...form,
      interestDirections: [...form.interestDirections],
    });
    resetForm();
    setNewApplicationOpen(false);
  };

  const toggleInterest = (id: string) => {
    setForm((f) => ({
      ...f,
      interestDirections: f.interestDirections.includes(id)
        ? f.interestDirections.filter((x) => x !== id)
        : [...f.interestDirections, id],
    }));
  };

  const openNewDialog = () => {
    resetForm();
    setNewApplicationOpen(true);
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Tabs defaultValue="applications" className="flex w-full min-w-0 flex-col">
        <div className="space-y-4 mb-4">
          <TabsList variant="grid2" className="min-h-9 h-9 min-w-[min(100%,24rem)] w-full">
            <TabsTrigger value="applications" className="flex items-center justify-center gap-2">
              Заявки
              <Badge variant="secondary" className="text-sm font-medium shrink-0">
                {applications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="drp" className="flex min-w-0 items-center justify-center gap-2 px-2">
              <span className="min-w-0 truncate" title="Администрирование профориентации">
                Администрирование профориентации
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="applications" className="mt-4 w-full min-w-0 space-y-3 data-[state=inactive]:hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-semibold">Заявки на профориентацию</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Справка по разделу заявок"
                    >
                      <CircleHelp className="size-4" aria-hidden />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" sideOffset={6} className="max-w-sm text-left text-pretty">
                    Статусы и сведения по заявкам меняются по мере прохождения этапов в ДРП. Новую заявку можно подать через
                    кнопку «Создать заявку».
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApplicationsFiltersOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
                {applicationsActiveFilterCount > 0 ? (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {applicationsActiveFilterCount}
                  </Badge>
                ) : null}
              </Button>
              <Button type="button" size="default" className="shrink-0" onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Создать заявку
              </Button>
            </div>
          </div>

          {(() => {
            const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
            appFilterStatuses.forEach((s) => {
              activeFilters.push({
                label: `Статус: ${STATUS_LABEL[s]}`,
                onRemove: () => setAppFilterStatuses((prev) => prev.filter((x) => x !== s)),
              });
            });
            appFilterInterestIds.forEach((id) => {
              const dir = INTEREST_DIRECTIONS.find((d) => d.id === id);
              if (dir) {
                activeFilters.push({
                  label: `Направление: ${dir.label}`,
                  onRemove: () => setAppFilterInterestIds((prev) => prev.filter((x) => x !== id)),
                });
              }
            });
            if (activeFilters.length === 0) return null;
            return (
              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    <span className="text-sm">{filter.label}</span>
                    <button
                      type="button"
                      onClick={filter.onRemove}
                      className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Удалить фильтр"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            );
          })()}

          {applications.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="rounded-full bg-muted p-3">
                  <UserCircle className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Заявок пока нет</p>
                  <p className="text-sm text-muted-foreground">
                    Создайте первую заявку на профориентацию для участника тестирования
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : filteredApplications.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <p className="font-medium">По выбранным фильтрам заявок нет</p>
                <p className="text-sm text-muted-foreground">Измените условия в диалоге «Фильтры» или сбросьте их.</p>
                <Button type="button" variant="outline" size="sm" onClick={resetApplicationsFilters}>
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredApplications.map((a) => (
                <Card
                  key={a.id}
                  className={cn(
                    /* сброс дефолтов Card: gap-6 py-6 дают лишнюю высоту */
                    "gap-0 py-0 flex h-full flex-col overflow-hidden transition-shadow",
                    a.status === "completed" && "border-primary/30 shadow-sm"
                  )}
                >
                  <CardHeader className="!gap-1.5 !px-3.5 !pb-2 !pt-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-base text-muted-foreground">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="sr-only">Номер заявки</span>
                            <span
                              className="inline-flex h-4 shrink-0 items-center font-semibold tabular-nums leading-none text-muted-foreground"
                              aria-hidden
                            >
                              №
                            </span>
                            <span
                              className="font-semibold tabular-nums text-foreground"
                              title={`Внутренний идентификатор: ${a.id}`}
                            >
                              {applicationNumberById.get(a.id) ?? "—"}
                            </span>
                          </span>
                          <span className="text-muted-foreground/40" aria-hidden>
                            ·
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="sr-only">Дата создания заявки</span>
                            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                            <span className="font-medium text-foreground">
                              {formatDateDDMMYYYYRu(a.createdAt)}
                            </span>
                          </span>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={a.status} />
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex flex-1 flex-col gap-4 !px-3.5 !pb-3 !pt-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="shrink-0 text-sm font-semibold">Создатель заявки:</span>
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {employeeInitials(a.employeeFullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-sm leading-snug">
                        <span className="font-medium text-foreground">{a.employeeFullName}</span>
                        {a.employeePosition.trim() ? (
                          <span className="mt-0.5 block text-muted-foreground">{a.employeePosition}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-md border border-border/80 bg-muted/30 p-3">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Участник тестирования
                      </p>
                      <p className="mt-2 min-w-0 text-sm font-semibold leading-snug text-foreground">
                        {a.childFullName}
                      </p>
                      <p className="mt-2 min-w-0 flex flex-wrap items-baseline gap-x-1 text-sm leading-snug">
                        <span className="text-muted-foreground">Дата рождения: </span>
                        <span className="font-medium text-foreground">
                          {formatDateOrDefault(a.childBirthDate)}
                        </span>
                        <span className="text-muted-foreground/40" aria-hidden>
                          ·
                        </span>
                        <span className="text-muted-foreground">Класс / курс: </span>
                        <span className="font-medium text-foreground">{a.childSchoolGrade || "—"}</span>
                      </p>
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                          Направления интереса
                        </p>
                        {a.interestDirections.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {a.interestDirections.map((id) => {
                              const label =
                                INTEREST_DIRECTIONS.find((d) => d.id === id)?.label ?? id;
                              return (
                                <Badge key={id} variant="secondary" className="text-sm font-normal">
                                  {label}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">Не указаны</p>
                        )}
                      </div>
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Комментарий</p>
                        {a.comment ? (
                          <p className="mt-2 line-clamp-4 text-sm text-muted-foreground whitespace-pre-wrap">
                            {a.comment}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">Не указан</p>
                        )}
                      </div>
                    </div>
                    {(a.status === "in_progress" || a.status === "completed") && a.drpResponsibleFullName ? (
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="shrink-0 text-sm font-semibold">Ответственный сотрудник ДРП:</span>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {employeeInitials(a.drpResponsibleFullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 text-sm leading-snug">
                          <span className="font-medium text-foreground">{a.drpResponsibleFullName}</span>
                          {a.drpResponsiblePosition?.trim() ? (
                            <span className="mt-0.5 block text-muted-foreground">{a.drpResponsiblePosition}</span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                  <CardFooter className="mt-auto shrink-0 border-t !px-3.5 !pb-2 !pt-2 flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/proforientation/${encodeURIComponent(a.id)}`);
                      }}
                    >
                      Подробнее <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drp" className="mt-4 w-full min-w-0 space-y-4 data-[state=inactive]:hidden">
          <div>
            <h2 className="text-lg font-semibold">Администрирование профориентации</h2>
            <p className="text-sm text-muted-foreground">
              Переведите заявку в работу, затем внесите результаты — в карточке сотрудника появятся заключение и PDF.
            </p>
          </div>

          {adminQueue.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">Заявок в очереди нет</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {adminQueue.map((a) => (
                <Card key={a.id} className="flex h-full flex-col overflow-hidden">
                  <CardHeader className="space-y-2 p-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-base text-muted-foreground">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="sr-only">Номер заявки</span>
                            <span
                              className="inline-flex h-4 shrink-0 items-center font-semibold tabular-nums leading-none text-muted-foreground"
                              aria-hidden
                            >
                              №
                            </span>
                            <span
                              className="font-semibold tabular-nums text-foreground"
                              title={`Внутренний идентификатор: ${a.id}`}
                            >
                              {applicationNumberById.get(a.id) ?? "—"}
                            </span>
                          </span>
                          <span className="text-muted-foreground/40" aria-hidden>
                            ·
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="sr-only">Дата создания заявки</span>
                            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                            <span className="font-medium text-foreground">
                              {formatDateDDMMYYYYRu(a.createdAt)}
                            </span>
                          </span>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={a.status} />
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex flex-1 flex-col gap-4 p-4 pt-4 text-sm">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="shrink-0 text-sm font-semibold">Создатель заявки:</span>
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {employeeInitials(a.employeeFullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-sm leading-snug">
                        <span className="font-medium text-foreground">{a.employeeFullName}</span>
                        {a.employeePosition.trim() ? (
                          <span className="mt-0.5 block text-muted-foreground">{a.employeePosition}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Участник тестирования
                      </p>
                      <p className="mt-2 min-w-0 text-base font-semibold leading-snug text-foreground">
                        {a.childFullName}
                      </p>
                      <p className="mt-2 min-w-0 flex flex-wrap items-baseline gap-x-1 leading-snug">
                        <span className="text-muted-foreground">Дата рождения: </span>
                        <span className="font-medium text-foreground">
                          {formatDateOrDefault(a.childBirthDate)}
                        </span>
                        <span className="text-muted-foreground/40" aria-hidden>
                          ·
                        </span>
                        <span className="text-muted-foreground">Класс / курс: </span>
                        <span className="font-medium text-foreground">{a.childSchoolGrade || "—"}</span>
                      </p>
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                          Направления интереса
                        </p>
                        {a.interestDirections.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {a.interestDirections.map((id) => {
                              const label =
                                INTEREST_DIRECTIONS.find((d) => d.id === id)?.label ?? id;
                              return (
                                <Badge key={id} variant="secondary" className="text-sm font-normal">
                                  {label}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">Не указаны</p>
                        )}
                      </div>
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Комментарий</p>
                        {a.comment ? (
                          <p className="mt-2 line-clamp-6 text-sm text-muted-foreground whitespace-pre-wrap">
                            {a.comment}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">Не указан</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Контакт сотрудника</p>
                      <dl className="mt-2 space-y-2">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <dt className="shrink-0 text-sm text-muted-foreground">Корпоративная почта</dt>
                          <dd className="min-w-0 break-all text-right font-medium sm:text-right">{a.employeeEmail}</dd>
                        </div>
                      </dl>
                    </div>
                    {(a.status === "in_progress" || a.status === "completed") && a.drpResponsibleFullName ? (
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="shrink-0 text-sm font-semibold">Ответственный сотрудник ДРП:</span>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {employeeInitials(a.drpResponsibleFullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 text-sm leading-snug">
                          <span className="font-medium text-foreground">{a.drpResponsibleFullName}</span>
                          {a.drpResponsiblePosition?.trim() ? (
                            <span className="mt-0.5 block text-muted-foreground">{a.drpResponsiblePosition}</span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                  <CardFooter className="mt-auto flex shrink-0 flex-col gap-2 border-t px-4 pb-4 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {a.status === "created" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          type="button"
                          onClick={() =>
                            updateStatus(a.id, "in_progress", {
                              drpResponsibleFullName: getCurrentBankEmployee().fullName,
                              drpResponsiblePosition: getCurrentBankEmployee().position,
                            })
                          }
                        >
                          В процессе
                        </Button>
                      )}
                      {a.status === "in_progress" && (
                        <Button size="sm" type="button" onClick={() => setResultDialogId(a.id)}>
                          Внести результаты
                        </Button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-primary sm:w-auto sm:self-end"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/proforientation/${encodeURIComponent(a.id)}`);
                      }}
                    >
                      Подробнее <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={applicationsFiltersOpen} onOpenChange={setApplicationsFiltersOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Фильтры и сортировка</DialogTitle>
            <DialogDescription>Настройте фильтры для списка заявок на профориентацию</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Статус заявки</Label>
              <MultiSelect
                options={PROFORIENTATION_STATUS_OPTIONS.map(({ value, label }) => ({ value, label }))}
                selected={appFilterStatuses}
                onChange={(selected) => setAppFilterStatuses(selected as ProforientationStatus[])}
                placeholder="Все статусы"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Направления интереса</Label>
              <MultiSelect
                options={INTEREST_DIRECTIONS.map((d) => ({ value: d.id, label: d.label }))}
                selected={appFilterInterestIds}
                onChange={setAppFilterInterestIds}
                placeholder="Все направления"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Сортировка</Label>
              <div className="flex items-center gap-2">
                <Select value={appSortBy} onValueChange={(v) => setAppSortBy(v as ApplicationsSortBy)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Сортировать по" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">По дате создания</SelectItem>
                    <SelectItem value="childFullName">По ФИО участника</SelectItem>
                    <SelectItem value="employeeFullName">По ФИО создателя</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAppSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                  title={appSortOrder === "asc" ? "По возрастанию" : "По убыванию"}
                >
                  {appSortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetApplicationsFilters();
              }}
            >
              Сбросить фильтры
            </Button>
            <Button type="button" onClick={() => setApplicationsFiltersOpen(false)}>
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={newApplicationOpen}
        onOpenChange={(open) => {
          setNewApplicationOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новая заявка на профориентацию</DialogTitle>
            <DialogDescription>
              Данные сотрудника подставляются из профиля текущего пользователя. Укажите сведения об участнике
              тестирования и отправьте заявку — она поступит в ДРП для записи на процедуру.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitNew} className="contents">
            <div className="space-y-4 py-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="shrink-0 text-sm font-semibold">Создатель заявки:</span>
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {employeeInitials(form.employeeFullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0">
                  <Label htmlFor="po-emp-name" className="sr-only">
                    ФИО сотрудника
                  </Label>
                  <Input
                    id="po-emp-name"
                    readOnly
                    required
                    value={form.employeeFullName}
                    className="h-auto min-h-0 border-0 bg-transparent px-0 py-0 text-sm font-medium leading-snug text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Label htmlFor="po-position" className="sr-only">
                    Должность
                  </Label>
                  <Input
                    id="po-position"
                    readOnly
                    value={form.employeePosition}
                    className="h-auto min-h-0 border-0 bg-transparent px-0 py-0 text-sm leading-snug text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="po-child">
                  ФИО участника тестирования <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="po-child"
                  required
                  value={form.childFullName}
                  onChange={(e) => setForm((f) => ({ ...f, childFullName: e.target.value }))}
                  placeholder="Фамилия Имя Отчество"
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[180px] flex-1 space-y-2">
                  <Label htmlFor="po-birth">
                    Дата рождения <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="po-birth"
                    type="date"
                    required
                    value={form.childBirthDate}
                    onChange={(e) => setForm((f) => ({ ...f, childBirthDate: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="min-w-[180px] flex-1 space-y-2">
                  <Label htmlFor="po-grade">Класс / курс</Label>
                  <Input
                    id="po-grade"
                    value={form.childSchoolGrade}
                    onChange={(e) => setForm((f) => ({ ...f, childSchoolGrade: e.target.value }))}
                    placeholder="например, 9 класс"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label>Направления интереса</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {INTEREST_DIRECTIONS.map((d) => (
                    <label
                      key={d.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 text-sm transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={form.interestDirections.includes(d.id)}
                        onCheckedChange={() => toggleInterest(d.id)}
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="po-comment">Комментарий</Label>
                <Textarea
                  id="po-comment"
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Пожелания по срокам, особенности …"
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewApplicationOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-1" />
                Создать заявку
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resultDialogId} onOpenChange={(o) => !o && setResultDialogId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Результаты профориентации</DialogTitle>
            <DialogDescription>
              Баллы по шкале 0–100 и краткое заключение. Рекомендации по вузам сформируются автоматически.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Аналитика</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={scores.analytical}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, analytical: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Техника / ИТ</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={scores.technical}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, technical: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Коммуникации</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={scores.social}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, social: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Творчество</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={scores.creative}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, creative: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Заключение</Label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setResultDialogId(null)}>
              Отмена
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!resultDialogId) return;
                setResult(resultDialogId, scores, summary);
                setResultDialogId(null);
              }}
            >
              Сохранить и закрыть заявку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
