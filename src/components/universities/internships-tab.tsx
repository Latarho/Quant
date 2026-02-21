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
import { Plus, Calendar, ArrowRight, Filter, BarChart3 } from "lucide-react";
import { useInternships } from "@/contexts/internships-context";
import type { InternshipStatus } from "@/types/internships";
import { getStatusBadgeColor } from "@/lib/badge-colors";
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
  const [formData, setFormData] = useState({
    type: "GPB.Level Up",
    startDate: "",
    endDate: "",
    status: "planned" as InternshipStatus,
  });

  const currentTabLabel = INTERNSHIP_TABS.find((t) => t.value === activeTab)?.label ?? "";

  const handleOpenModal = () => {
    setFormData({
      type: currentTabLabel,
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
            {INTERNSHIP_TABS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex justify-end">
            <Button onClick={handleOpenModal} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Добавить стажировку
            </Button>
          </div>
        </div>
        {INTERNSHIP_TABS.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {(() => {
              const list = internships.filter(
                (i) => i.title === INTERNSHIP_TABS.find((t) => t.value === value)?.label
              );
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
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="outline" className="text-xs font-semibold">
                                {internship.title}
                              </Badge>
                              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-semibold">
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
                          </div>
                          <div className="border-t my-2 w-full" />
                          <div className="w-full">
                          <div className="w-full flex-shrink-0 rounded-lg min-w-0">
                            <div className="w-full box-border">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Filter className="h-4 w-4 text-primary" />
                                <span className="text-base font-semibold text-foreground">Воронка</span>
                              </div>
                              <div className="flex gap-1.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1">
                                    <div className="text-sm font-bold text-foreground leading-tight">0</div>
                                    <div className="text-xs text-muted-foreground uppercase">Заявки</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Количество заявок</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1">
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">{internship.maxParticipants ?? 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Целевые заявки</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Целевые заявки</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1">
                                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight">{internship.currentParticipants ?? 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase">Прошли</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Прошли отборочные этапы</p>
                                </TooltipContent>
                              </Tooltip>
                              </div>
                            </div>
                          </div>
                          <div className="w-full flex-shrink-0 rounded-lg min-w-0 mt-2">
                            <div className="w-full box-border">
                              <div className="flex items-center gap-1.5 mb-1">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                <span className="text-base font-semibold text-foreground">Результаты</span>
                              </div>
                              <div className="flex gap-1.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1">
                                    <div className="text-sm font-bold text-foreground leading-tight">20</div>
                                    <div className="text-xs text-muted-foreground uppercase">Стажеры</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Стажеры</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1">
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">17</div>
                                    <div className="text-xs text-muted-foreground uppercase">Сотрудники</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Сотрудники, работающие в банке на текущий момент</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-background/80 rounded border border-primary/20 text-center cursor-help min-w-0 flex-1">
                                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight">85%</div>
                                    <div className="text-xs text-muted-foreground uppercase">Конверсия</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Конверсия</p>
                                </TooltipContent>
                              </Tooltip>
                              </div>
                            </div>
                          </div>
                          <div className="border-t my-2 w-full" />
                          <p className="text-sm text-muted-foreground">
                            Нанимающих подразделений: <span className="font-medium text-foreground">{internship.hiringDepartmentsCount ?? 0}</span>
                          </p>
                          </div>
                        </div>
                        <div className="border-t pt-3 mt-auto shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center text-primary"
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить стажировку</DialogTitle>
            <DialogDescription>Заполните информацию о стажировке</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="internship-type">Тип стажировки</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger id="internship-type">
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
                <Label htmlFor="internship-start">Дата начала</Label>
                <Input
                  id="internship-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="internship-end">Дата окончания</Label>
                <Input
                  id="internship-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="internship-status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as InternshipStatus })}
                >
                  <SelectTrigger id="internship-status">
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
