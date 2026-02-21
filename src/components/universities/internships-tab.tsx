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
import { Plus, Calendar, ArrowRight, Filter, BarChart3, ChevronRight, HelpCircle } from "lucide-react";
import { useInternships } from "@/contexts/internships-context";
import type { InternshipStatus } from "@/types/internships";
import { getStatusBadgeColor, getInternshipTypeBadgeColor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";

const INTERNSHIP_TABS = [
  { value: "level-up", label: "GPB.Level Up" },
  { value: "experience", label: "GPB.Experience" },
  { value: "it-factory", label: "GPB.IT Factory" },
  { value: "spot-hiring", label: "Точечный найм" },
] as const;

const STATUS_OPTIONS: { value: InternshipStatus; label: string }[] = [
  { value: "planned", label: "Запланирована" },
  { value: "in_progress", label: "В процессе" },
  { value: "completed", label: "Завершена" },
];

const getStatusText = (status: InternshipStatus) =>
  STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

export function InternshipsTab() {
  const router = useRouter();
  const { internships, addInternship } = useInternships();
  const [activeTab, setActiveTab] = useState<(typeof INTERNSHIP_TABS)[number]["value"]>("level-up");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"startDate_asc" | "startDate_desc" | "status_asc" | "status_desc">("startDate_asc");
  const [formData, setFormData] = useState({
    type: "GPB.Level Up",
    name: "",
    startDate: "",
    endDate: "",
    status: "planned" as InternshipStatus,
  });

  const currentTabLabel = INTERNSHIP_TABS.find((t) => t.value === activeTab)?.label ?? "";

  const handleOpenModal = () => {
    setFormData({
      type: currentTabLabel,
      name: "",
      startDate: "",
      endDate: "",
      status: "planned",
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    if (!formData.startDate || !formData.endDate) return;
    addInternship({
      type: formData.type,
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
          <TabsList variant="grid4" className="min-w-[min(100%,48rem)] w-full">
            {INTERNSHIP_TABS.map(({ value, label }) => {
              const count = internships.filter((i) => i.title === label).length;
              return (
                <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                  {label}
                  <Badge variant="secondary" className="text-xs font-medium shrink-0">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex justify-end items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setIsFiltersDialogOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Фильтры
            </Button>
            <Button onClick={handleOpenModal} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Добавить стажировку
            </Button>
          </div>
        </div>
        {INTERNSHIP_TABS.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {(() => {
              let list = internships.filter(
                (i) => i.title === INTERNSHIP_TABS.find((t) => t.value === value)?.label
              );
              const statusOrder: Record<InternshipStatus, number> = { planned: 0, in_progress: 1, completed: 2 };
              list = [...list].sort((a, b) => {
                if (sortBy === "startDate_asc") return a.startDate.getTime() - b.startDate.getTime();
                if (sortBy === "startDate_desc") return b.startDate.getTime() - a.startDate.getTime();
                if (sortBy === "status_asc") return statusOrder[a.status] - statusOrder[b.status];
                return statusOrder[b.status] - statusOrder[a.status];
              });
              const useScroll = list.length >= 5;
              const slots: (typeof list[0] | null)[] = useScroll
                ? [...list]
                : (() => {
                    const s: (typeof list[0] | null)[] = [...list.slice(0, 4)];
                    while (s.length < 4) s.push(null);
                    return s;
                  })();
              const gridContent = (
                  <>
                  {slots.map((internship, index) =>
                    internship ? (
                      <Card
                        key={internship.id}
                        className="p-3 h-full min-h-0 flex flex-col relative"
                      >
                        <Badge
                          variant="outline"
                          className={cn("absolute top-3 right-3 text-xs shrink-0", getStatusBadgeColor(internship.status))}
                        >
                          {getStatusText(internship.status)}
                        </Badge>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="pr-20">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={cn("text-xs font-medium shrink-0 w-fit", getInternshipTypeBadgeColor(internship.title))}>
                                {internship.title}
                              </Badge>
                              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                {internship.startDate.toLocaleDateString("ru-RU", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }).replace(/\//g, ".")}{" "}
                                —{" "}
                                {internship.endDate.toLocaleDateString("ru-RU", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }).replace(/\//g, ".")}
                              </span>
                            </div>
                            {internship.name && (
                              <p className="text-base text-muted-foreground mt-1.5">{internship.name}</p>
                            )}
                          </div>
                          <div className="border-t my-2 w-full" />
                          <div className="w-full">
                          <div className="w-full flex-shrink-0 rounded-lg min-w-0 bg-muted/30 p-2">
                            <div className="w-full box-border">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Filter className="h-4 w-4 text-primary" />
                                <span className="text-base font-semibold text-foreground">Воронка</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                    <div className="text-sm font-bold text-foreground leading-tight">{internship.totalApplications ?? "—"}</div>
                                    <div className="text-xs text-muted-foreground">Заявки</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Количество заявок</p>
                                </TooltipContent>
                              </Tooltip>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 flex-shrink-0 stroke-[2.5]" aria-hidden />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">{internship.maxParticipants ?? 0}</div>
                                    <div className="text-xs text-muted-foreground">Целевые заявки</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Целевые заявки</p>
                                </TooltipContent>
                              </Tooltip>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 flex-shrink-0 stroke-[2.5]" aria-hidden />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight">{internship.currentParticipants ?? 0}</div>
                                    <div className="text-xs text-muted-foreground">Прошли</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Прошли отборочные этапы</p>
                                </TooltipContent>
                              </Tooltip>
                              </div>
                            </div>
                          </div>
                          <div className="w-full flex-shrink-0 rounded-lg min-w-0 mt-3 p-2">
                            <div className="w-full box-border">
                              <div className="flex items-center gap-1.5 mb-1">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                <span className="text-base font-semibold text-foreground">Результаты</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                    <div className="text-sm font-bold text-foreground leading-tight">{internship.completedTraineesCount ?? "—"}</div>
                                    <div className="text-xs text-muted-foreground">Стажеры</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Стажеры</p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="w-5 shrink-0 flex-shrink-0" aria-hidden />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">{internship.hiredEmployeesCount ?? "—"}</div>
                                    <div className="text-xs text-muted-foreground">Сотрудники</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Сотрудники, работающие в банке на текущий момент</p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="w-5 shrink-0 flex-shrink-0" aria-hidden />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1 py-1">
                                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight">{internship.conversionRatePercent != null ? `${internship.conversionRatePercent}%` : "—"}</div>
                                    <div className="text-xs text-muted-foreground">Конверсия</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Конверсия</p>
                                </TooltipContent>
                              </Tooltip>
                              </div>
                            </div>
                          </div>
                          </div>
                        </div>
                        <div className="border-t pt-3 mt-auto shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-sm text-muted-foreground order-2 sm:order-1">
                            Подразделений: <span className="font-medium text-foreground">{internship.hiringDepartmentsCount ?? 0}</span>
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full sm:w-auto justify-center text-primary order-1 sm:order-2 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/universities/internship/${internship.id}`);
                            }}
                          >
                            Подробнее
                            <ArrowRight className="h-3.5 w-3.5 ml-2" />
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <div
                        key={`empty-${value}-${index}`}
                        className="h-full min-h-0 rounded-lg bg-muted/30 !shadow-none border-0"
                      />
                    )
                  )}
                  </>
              );
              return useScroll ? (
                <div className="w-full h-[calc(100vh-14rem)] overflow-y-auto">
                  <div className="w-full grid grid-cols-2 gap-4 pb-4">
                    {gridContent}
                  </div>
                </div>
              ) : (
                <div className="w-full h-[calc(100vh-14rem)] grid grid-cols-2 grid-rows-2 gap-4">
                  {gridContent}
                </div>
              );
            })()}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Фильтры</DialogTitle>
            <DialogDescription>
              Настройте фильтры для списка стажировок
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Сортировка</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сортировку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDate_asc">По дате начала (сначала ранние)</SelectItem>
                  <SelectItem value="startDate_desc">По дате начала (сначала поздние)</SelectItem>
                  <SelectItem value="status_asc">По статусу (Запланирована → Завершена)</SelectItem>
                  <SelectItem value="status_desc">По статусу (Завершена → Запланирована)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Программа</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Все программы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все программы</SelectItem>
                  {INTERNSHIP_TABS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Статус стажировки</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSortBy("startDate_asc"); setIsFiltersDialogOpen(false); }}>
              Сбросить фильтры
            </Button>
            <Button onClick={() => setIsFiltersDialogOpen(false)}>
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить стажировку</DialogTitle>
            <DialogDescription>
              Заполните информацию о стажировке
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="internship-type">Тип стажировки</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Выберите программу: GPB.Level Up, GPB.Experience или GPB.IT Factory</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger id="internship-type" className="w-full">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERNSHIP_TABS.map(({ value, label }) => (
                      <SelectItem key={value} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="internship-start">Дата начала</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
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
                  <Label htmlFor="internship-end">Дата окончания</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
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
                  <Label htmlFor="internship-status">Статус</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Выберите статус: запланирована, в процессе или завершена</p>
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
                <Label htmlFor="internship-name">Название стажировки</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Укажите название стажировки (например, период или тема набора)</p>
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
