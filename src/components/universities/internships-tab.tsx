"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus, Calendar, ArrowRight, BarChart3, HelpCircle, X, Search } from "lucide-react";
import { useInternships } from "@/contexts/internships-context";
import { useInternshipExtra } from "@/contexts/internship-extra-context";
import type { InternshipStatus } from "@/types/internships";
import { getStatusBadgeColor, getInternshipTypeBadgeColor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";
import { getBaseStaffIndicators, getStaffSummary } from "@/lib/internships/staff-table-data";

const INTERNSHIP_TABS = [
  { value: "internships", label: "Стажировки" },
  { value: "spot-hiring", label: "Точечный найм" },
] as const;

const PROGRAM_TYPES = ["GPB.Level Up", "GPB.Experience", "GPB.IT Factory", "Стажировка МГИМО"] as const;
const SPOT_HIRING_LABEL = "Точечный найм";

const INTERNSHIP_TYPE_OPTIONS = [...PROGRAM_TYPES, SPOT_HIRING_LABEL] as const;
const MODAL_INTERNSHIP_TYPE_OPTIONS = [...PROGRAM_TYPES] as const;

const INTERNSHIP_DIRECTIONS = [
  "Разработка",
  "Аналитика",
  "Кибербезопасность",
  "Дизайн",
  "Product / бизнес",
  "DevOps / инфраструктура",
] as const;

const STATUS_OPTIONS: { value: InternshipStatus; label: string }[] = [
  { value: "in_progress", label: "В процессе" },
  { value: "completed", label: "Завершена" },
];

const getStatusText = (status: InternshipStatus) =>
  STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

const { totalTrainees: defaultTotalTrainees, currentEmployees: defaultCurrentEmployees, conversionPercent: defaultConversionPercent } =
  getStaffSummary(getBaseStaffIndicators());

const getDefaultDepartmentsForInternship = (internship: { name?: string | null }): string[] => {
  if (internship.name?.trim() === "Data Science") {
    return [
      "Департамент анализа данных",
      "Департамент искусственного интеллекта",
      "Департамент машинного обучения",
    ];
  }
  return [];
};

export function InternshipsTab() {
  const router = useRouter();
  const { internships, addInternship } = useInternships();
  const { departmentsByInternship } = useInternshipExtra();
  const [activeTab, setActiveTab] = useState<(typeof INTERNSHIP_TABS)[number]["value"]>("internships");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internshipFeedFilters, setInternshipFeedFilters] = useState<{
    type: string[];
    direction: string[];
    year: number[];
    status: InternshipStatus[];
  }>({ type: [], direction: [], year: [], status: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    type: "GPB.Level Up" as string,
    direction: "",
    name: "",
    startDate: "",
    endDate: "",
    status: "in_progress" as InternshipStatus,
  });

  const handleOpenModal = () => {
    setFormData({
      type: activeTab === "spot-hiring" ? "Стажировка МГИМО" : "GPB.Level Up",
      direction: "",
      name: "",
      startDate: "",
      endDate: "",
      status: "in_progress",
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    if (!formData.startDate || !formData.endDate) return;
    addInternship({
      type: formData.type,
      direction: formData.direction || undefined,
      name: formData.name.trim() || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <div className="space-y-4 mb-4">
          <TabsList variant="grid2" className="min-h-9 h-9 min-w-[min(100%,24rem)] w-full">
            {INTERNSHIP_TABS.map(({ value, label }) => {
              const count = value === "internships"
                ? internships.filter((i) => PROGRAM_TYPES.includes(i.title as (typeof PROGRAM_TYPES)[number])).length
                : internships.filter((i) => i.title === SPOT_HIRING_LABEL).length;
              return (
                <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                  {label}
                  <Badge variant="secondary" className="text-sm font-medium shrink-0">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-0 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Поиск по названию стажировки"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Button onClick={handleOpenModal} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Добавить стажировку
            </Button>
          </div>
        </div>
        {INTERNSHIP_TABS.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4 space-y-4">
            {(() => {
              const baseList = value === "internships"
                ? internships.filter((i) => PROGRAM_TYPES.includes(i.title as (typeof PROGRAM_TYPES)[number]))
                : internships.filter((i) => i.title === SPOT_HIRING_LABEL);
              const listForType = baseList.filter((i) => {
                if (internshipFeedFilters.direction.length > 0 && (!i.direction || !internshipFeedFilters.direction.includes(i.direction))) return false;
                if (internshipFeedFilters.year.length > 0 && !internshipFeedFilters.year.includes(i.startDate.getFullYear())) return false;
                if (internshipFeedFilters.status.length > 0 && !internshipFeedFilters.status.includes(i.status)) return false;
                return true;
              });
              const listForYear = baseList.filter((i) => {
                if (internshipFeedFilters.type.length > 0 && !internshipFeedFilters.type.includes(i.title)) return false;
                if (internshipFeedFilters.direction.length > 0 && (!i.direction || !internshipFeedFilters.direction.includes(i.direction))) return false;
                if (internshipFeedFilters.status.length > 0 && !internshipFeedFilters.status.includes(i.status)) return false;
                return true;
              });
              const listForStatus = baseList.filter((i) => {
                if (internshipFeedFilters.type.length > 0 && !internshipFeedFilters.type.includes(i.title)) return false;
                if (internshipFeedFilters.year.length > 0 && !internshipFeedFilters.year.includes(i.startDate.getFullYear())) return false;
                if (internshipFeedFilters.direction.length > 0 && (!i.direction || !internshipFeedFilters.direction.includes(i.direction))) return false;
                return true;
              });
              const byType = listForType.reduce<Record<string, number>>((acc, i) => {
                acc[i.title] = (acc[i.title] ?? 0) + 1;
                return acc;
              }, {});
              const yearsMap = listForYear.reduce<Record<number, number>>((acc, i) => {
                const y = i.startDate.getFullYear();
                acc[y] = (acc[y] ?? 0) + 1;
                return acc;
              }, {});
              const yearsSorted = Object.keys(yearsMap).map(Number).sort((a, b) => a - b);
              const byStatus = {
                in_progress: listForStatus.filter((i) => i.status === "in_progress").length,
                completed: listForStatus.filter((i) => i.status === "completed").length,
              };
              const typeOptionsForTab = value === "internships" ? [...PROGRAM_TYPES] : [SPOT_HIRING_LABEL];
              let list = baseList.filter((i) => {
                if (internshipFeedFilters.type.length > 0 && !internshipFeedFilters.type.includes(i.title)) return false;
                if (internshipFeedFilters.direction.length > 0 && (!i.direction || !internshipFeedFilters.direction.includes(i.direction))) return false;
                if (internshipFeedFilters.year.length > 0 && !internshipFeedFilters.year.includes(i.startDate.getFullYear())) return false;
                if (internshipFeedFilters.status.length > 0 && !internshipFeedFilters.status.includes(i.status)) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.trim().toLowerCase();
                  const name = (i.name || "").toLowerCase();
                  if (!name.includes(q)) return false;
                }
                return true;
              });
              list = [...list].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
              const useScroll = list.length >= 5;
              const slots: (typeof list[0] | null)[] = useScroll
                ? [...list]
                : (() => {
                    const s: (typeof list[0] | null)[] = [...list.slice(0, 8)];
                    while (s.length < 8) s.push(null);
                    return s;
                  })();
              return (
                <>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex-1 min-w-[180px] space-y-2">
                      <Label className="text-base font-semibold">Программа</Label>
                      <MultiSelect
                        options={typeOptionsForTab
                          .filter((t) => (byType[t] ?? 0) > 0 || internshipFeedFilters.type.includes(t))
                          .map((t) => ({ value: t, label: `${t} (${byType[t] ?? 0})` }))}
                        selected={internshipFeedFilters.type}
                        onChange={(selected) => setInternshipFeedFilters((p) => ({ ...p, type: selected }))}
                        placeholder="Выберите программы"
                      />
                      {typeOptionsForTab.every((t) => (byType[t] ?? 0) === 0) && (
                        <span className="text-sm text-muted-foreground">Нет данных</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-[180px] space-y-2">
                      <Label className="text-base font-semibold">Направление</Label>
                      <MultiSelect
                        options={INTERNSHIP_DIRECTIONS.map((d) => ({ value: d, label: d }))}
                        selected={internshipFeedFilters.direction}
                        onChange={(selected) => setInternshipFeedFilters((p) => ({ ...p, direction: selected }))}
                        placeholder="Выберите направления"
                      />
                    </div>
                    <div className="flex-1 min-w-[180px] space-y-2">
                      <Label className="text-base font-semibold">Период</Label>
                      <MultiSelect
                        options={yearsSorted.map((y) => ({
                          value: String(y),
                          label: `${y} (${yearsMap[y] ?? 0})`,
                        }))}
                        selected={internshipFeedFilters.year.map(String)}
                        onChange={(selected) =>
                          setInternshipFeedFilters((p) => ({ ...p, year: selected.map(Number) }))
                        }
                        placeholder="Выберите годы"
                      />
                      {yearsSorted.length === 0 && (
                        <span className="text-sm text-muted-foreground">Нет данных</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-[180px] space-y-2">
                      <Label className="text-base font-semibold">Статус</Label>
                      <MultiSelect
                        options={([
{ value: "in_progress", label: "В процессе", count: byStatus.in_progress },
                                          { value: "completed", label: "Завершена", count: byStatus.completed },
                        ] as const)
                          .filter(
                            (item) =>
                              item.count > 0 || internshipFeedFilters.status.includes(item.value as InternshipStatus)
                          )
                          .map(({ value, label, count }) => ({ value, label: `${label} (${count})` }))}
                        selected={internshipFeedFilters.status}
                        onChange={(selected) =>
                          setInternshipFeedFilters((p) => ({ ...p, status: selected as InternshipStatus[] }))
                        }
                        placeholder="Выберите статусы"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-sm text-muted-foreground">
                      Найдено: <span className="font-semibold text-foreground">{list.length}</span>{" "}
                      {list.length === 1 ? "стажировка" : list.length > 1 && list.length < 5 ? "стажировки" : "стажировок"}
                      {list.length !== baseList.length && (
                        <span className="ml-1">из {baseList.length}</span>
                      )}
                    </div>
                  </div>
                  {(() => {
                    const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                    if (internshipFeedFilters.type.length > 0) {
                      activeFilters.push({
                        label: `Программа: ${internshipFeedFilters.type.join(", ")}`,
                        onRemove: () => setInternshipFeedFilters((p) => ({ ...p, type: [] })),
                      });
                    }
                    if (internshipFeedFilters.direction.length > 0) {
                      activeFilters.push({
                        label: `Направление: ${internshipFeedFilters.direction.join(", ")}`,
                        onRemove: () => setInternshipFeedFilters((p) => ({ ...p, direction: [] })),
                      });
                    }
                    if (internshipFeedFilters.year.length > 0) {
                      activeFilters.push({
                        label: `Период: ${internshipFeedFilters.year.join(", ")}`,
                        onRemove: () => setInternshipFeedFilters((p) => ({ ...p, year: [] })),
                      });
                    }
                    if (internshipFeedFilters.status.length > 0) {
                      activeFilters.push({
                        label: `Статус: ${internshipFeedFilters.status.map((s) => getStatusText(s)).join(", ")}`,
                        onRemove: () => setInternshipFeedFilters((p) => ({ ...p, status: [] })),
                      });
                    }
                    if (activeFilters.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {activeFilters.map((filter, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                          >
                            <span className="text-sm">{filter.label}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                filter.onRemove();
                              }}
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
                  {list.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center">
                      Нет стажировок по выбранным фильтрам
                    </div>
                  ) : useScroll ? (
                    <div className="w-full h-[calc(100vh-14rem)] overflow-y-auto">
                      <div className="w-full grid grid-cols-4 gap-4 pb-4 items-start">
                        {slots.map((internship, index) =>
                          internship ? (
                            <Card key={internship.id} className="p-3 min-h-0 flex flex-col relative">
                              <Badge variant="outline" className={cn("absolute top-3 right-3 text-sm shrink-0", getStatusBadgeColor(internship.status))}>
                                {getStatusText(internship.status)}
                              </Badge>
                              <div className="flex-1 min-w-0 flex flex-col">
                                <div className="pr-20">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className={cn("text-sm font-medium shrink-0 w-fit", getInternshipTypeBadgeColor(internship.title))}>
                                      {internship.title}
                                    </Badge>
                                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                      {internship.startDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")}{" "}
                                      —{" "}
                                      {internship.endDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")}
                                    </span>
                                  </div>
                                  {internship.name && <p className="text-base text-muted-foreground mt-1.5">{internship.name}</p>}
                                </div>
                                <div className="border-t my-2 w-full" />
                                <div className="w-full">
                                  <div className="w-full flex-shrink-0 rounded-lg min-w-0 p-2">
                                    <div className="w-full box-border">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <BarChart3 className="h-4 w-4 text-primary" />
                                        <span className="text-base font-semibold text-foreground">Результаты</span>
                                      </div>
                                      <div className="flex items-center gap-0.5">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                              <div className="text-sm font-bold text-foreground leading-tight">{defaultTotalTrainees}</div>
                                              <div className="text-sm text-muted-foreground">Стажеры</div>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Общее количество стажеров (строки в таблице кадровых показателей)</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <span className="w-5 shrink-0 flex-shrink-0" aria-hidden />
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">{defaultCurrentEmployees}</div>
                                              <div className="text-sm text-muted-foreground">Сотрудники</div>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>Сотрудники, работающие в банке на текущий момент</p></TooltipContent>
                                        </Tooltip>
                                        <span className="w-5 shrink-0 flex-shrink-0" aria-hidden />
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                              <div className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight">{defaultConversionPercent != null ? `${defaultConversionPercent}%` : "—"}</div>
                                              <div className="text-sm text-muted-foreground">Конверсия</div>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent><p>Конверсия = Сотрудники / Стажеры, в процентах</p></TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-t pt-3 mt-auto shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="text-sm text-muted-foreground order-2 sm:order-1 flex items-center gap-1.5">
                                  <span>Подразделения:</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className="text-sm font-medium px-2 py-0.5 cursor-help">
                                        {(() => {
                                          const savedDepartments = departmentsByInternship[internship.id];
                                          const fallbackDepartments = getDefaultDepartmentsForInternship(internship);
                                          const departments = (savedDepartments && savedDepartments.length > 0)
                                            ? savedDepartments
                                            : fallbackDepartments;
                                          const fromDepartments = departments.length;
                                          const fallback = internship.hiringDepartmentsCount ?? 0;
                                          return fromDepartments > 0 ? fromDepartments : fallback;
                                        })()}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      {(() => {
                                        const savedDepartments = departmentsByInternship[internship.id];
                                        const fallbackDepartments = getDefaultDepartmentsForInternship(internship);
                                        const departments = (savedDepartments && savedDepartments.length > 0)
                                          ? savedDepartments
                                          : fallbackDepartments;
                                        if (departments.length === 0) {
                                          return <p>Нет данных по подразделениям</p>;
                                        }
                                        return (
                                          <div className="space-y-1">
                                            <p className="font-medium text-sm">Нанимающие подразделения:</p>
                                            <ul className="list-disc list-inside text-sm">
                                              {departments.map((name) => (
                                                <li key={name}>{name}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        );
                                      })()}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-center text-primary order-1 sm:order-2 shrink-0" onClick={(e) => { e.stopPropagation(); router.push(`/universities/internship/${internship.id}`); }}>
                                  Подробнее <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                </Button>
                              </div>
                            </Card>
                          ) : (
                            <div key={`empty-${value}-${index}`} className="h-full min-h-0 rounded-lg bg-muted/30 !shadow-none border-0" />
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[calc(100vh-14rem)] grid grid-cols-4 grid-rows-2 gap-4 items-start">
                      {slots.map((internship, index) =>
                        internship ? (
                          <Card key={internship.id} className="p-3 min-h-0 flex flex-col relative">
                            <Badge variant="outline" className={cn("absolute top-3 right-3 text-sm shrink-0", getStatusBadgeColor(internship.status))}>
                              {getStatusText(internship.status)}
                            </Badge>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <div className="pr-20">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className={cn("text-sm font-medium shrink-0 w-fit", getInternshipTypeBadgeColor(internship.title))}>
                                    {internship.title}
                                  </Badge>
                                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    {internship.startDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")}{" "}
                                    —{" "}
                                    {internship.endDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")}
                                  </span>
                                </div>
                                {internship.name && <p className="text-base text-muted-foreground mt-1.5">{internship.name}</p>}
                              </div>
                              <div className="border-t my-2 w-full" />
                              <div className="w-full">
                                <div className="w-full flex-shrink-0 rounded-lg min-w-0 p-2">
                                  <div className="w-full box-border">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <BarChart3 className="h-4 w-4 text-primary" />
                                      <span className="text-base font-semibold text-foreground">Результаты</span>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                            <div className="text-sm font-bold text-foreground leading-tight">{defaultTotalTrainees}</div>
                                            <div className="text-sm text-muted-foreground">Стажеры</div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Общее количество стажеров (строки в таблице кадровых показателей)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <span className="w-5 shrink-0 flex-shrink-0" aria-hidden />
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">{defaultCurrentEmployees}</div>
                                            <div className="text-sm text-muted-foreground">Сотрудники</div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Сотрудники, работающие в банке на текущий момент</p></TooltipContent>
                                      </Tooltip>
                                      <span className="w-5 shrink-0 flex-shrink-0" aria-hidden />
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                            <div className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight">{defaultConversionPercent != null ? `${defaultConversionPercent}%` : "—"}</div>
                                            <div className="text-sm text-muted-foreground">Конверсия</div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Конверсия = Сотрудники / Стажеры, в процентах</p></TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                              <div className="border-t pt-3 mt-auto shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="text-sm text-muted-foreground order-2 sm:order-1 flex items-center gap-1.5">
                                  <span>Подразделения:</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className="text-sm font-medium px-2 py-0.5 cursor-help">
                                        {(() => {
                                          const savedDepartments = departmentsByInternship[internship.id];
                                          const fallbackDepartments = getDefaultDepartmentsForInternship(internship);
                                          const departments = (savedDepartments && savedDepartments.length > 0)
                                            ? savedDepartments
                                            : fallbackDepartments;
                                          const fromDepartments = departments.length;
                                          const fallback = internship.hiringDepartmentsCount ?? 0;
                                          return fromDepartments > 0 ? fromDepartments : fallback;
                                        })()}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      {(() => {
                                        const savedDepartments = departmentsByInternship[internship.id];
                                        const fallbackDepartments = getDefaultDepartmentsForInternship(internship);
                                        const departments = (savedDepartments && savedDepartments.length > 0)
                                          ? savedDepartments
                                          : fallbackDepartments;
                                        if (departments.length === 0) {
                                          return <p>Нет данных по подразделениям</p>;
                                        }
                                        return (
                                          <div className="space-y-1">
                                            <p className="font-medium text-sm">Нанимающие подразделения:</p>
                                            <ul className="list-disc list-inside text-sm">
                                              {departments.map((name) => (
                                                <li key={name}>{name}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        );
                                      })()}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-center text-primary order-1 sm:order-2 shrink-0" onClick={(e) => { e.stopPropagation(); router.push(`/universities/internship/${internship.id}`); }}>
                                Подробнее <ArrowRight className="h-3.5 w-3.5 ml-2" />
                              </Button>
                            </div>
                          </Card>
                        ) : (
                          <div key={`empty-${value}-${index}`} className="h-full min-h-0 rounded-lg bg-muted/30 !shadow-none border-0" />
                        )
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить стажировку</DialogTitle>
            <DialogDescription>
              Заполните информацию о стажировке
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 1-я строка: программа и направление */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="internship-type">Программа <span className="text-destructive">*</span></Label>
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
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger id="internship-type" className="w-full">
                    <SelectValue placeholder="Выберите программу" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODAL_INTERNSHIP_TYPE_OPTIONS.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="internship-direction">Направление</Label>
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
                  value={formData.direction}
                  onValueChange={(v) => setFormData({ ...formData, direction: v })}
                >
                  <SelectTrigger id="internship-direction" className="w-full">
                    <SelectValue placeholder="Выберите направление" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERNSHIP_DIRECTIONS.map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {direction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2-я строка: даты и статус */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="internship-start">Дата начала <span className="text-destructive">*</span></Label>
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
                  id="internship-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="internship-end">Дата окончания <span className="text-destructive">*</span></Label>
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
                  id="internship-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="internship-status">Статус <span className="text-destructive">*</span></Label>
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
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as InternshipStatus })}
                >
                  <SelectTrigger id="internship-status" className="w-full">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-1">
                <Label htmlFor="internship-name">Название стажировки <span className="text-muted-foreground font-normal">(необязательно)</span></Label>
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
                id="internship-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Название стажировки"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.startDate || !formData.endDate}
            >
              Добавить стажировку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
