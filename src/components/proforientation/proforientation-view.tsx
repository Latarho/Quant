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
import { useProforientation } from "@/contexts/proforientation-context";
import { INTEREST_DIRECTIONS } from "@/lib/proforientation/types";
import type { OrientationScores, ProforientationApplication } from "@/lib/proforientation/types";
import { openResultsPrintWindow } from "@/lib/proforientation/print-pdf";
import { getCurrentBankEmployee } from "@/lib/auth/current-user";
import { formatDateOrDefault, formatDateTimeShortRu } from "@/lib/date-utils";
import { ApplicationStatusBadge } from "@/components/proforientation/proforientation-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Calendar, ClipboardList, FileDown, Plus, UserCircle } from "lucide-react";
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
  employeeEmail: string;
  employeePhone: string;
  childFullName: string;
  childBirthDate: string;
  childSchoolGrade: string;
  interestDirections: string[];
  comment: string;
};

function buildApplicationFormFromCurrentUser(): ApplicationFormState {
  const u = getCurrentBankEmployee();
  return {
    employeeFullName: u.fullName,
    employeeTabNumber: u.tabNumber,
    employeeDepartment: u.department,
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

  /** Заявки для администрирования: не завершённые */
  const adminQueue = useMemo(
    () => sortedApplications.filter((a) => a.status !== "completed"),
    [sortedApplications]
  );

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
      <Tabs defaultValue="applications" className="flex w-full min-w-0 flex-col gap-3">
        <TabsList variant="grid2">
          <TabsTrigger value="applications" className="gap-2">
            <ClipboardList className="size-4" />
            Заявки
          </TabsTrigger>
          <TabsTrigger value="drp">Администрирование профориентации</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-3 w-full min-w-0 space-y-4 data-[state=inactive]:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Заявки на профориентацию</h2>
              <p className="text-sm text-muted-foreground">
                Статусы и сведения по заявкам меняются по мере прохождения этапов в ДРП. Новую заявку можно подать через
                кнопку «Создать заявку».
              </p>
            </div>
            <Button type="button" className="gap-2 shrink-0" onClick={openNewDialog}>
              <Plus className="size-4" />
              Создать заявку
            </Button>
          </div>

          {sortedApplications.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {sortedApplications.map((a) => (
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
                        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="size-3.5 shrink-0" aria-hidden />
                          <span>{formatDateTimeShortRu(a.createdAt)}</span>
                        </div>
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="shrink-0 text-sm font-semibold">Создатель заявки:</span>
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                              {employeeInitials(a.employeeFullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0 text-sm leading-snug">
                            <span className="font-medium text-foreground">{a.employeeFullName}</span>
                            {a.employeeDepartment ? (
                              <span className="text-muted-foreground"> · {a.employeeDepartment}</span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={a.status} />
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex flex-1 flex-col gap-1.5 !px-3.5 !pb-3 !pt-4">
                    <div className="rounded-md border border-border/80 bg-muted/30 p-2">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Участник тестирования
                      </p>
                      <p className="mt-1.5 min-w-0 text-sm font-semibold leading-snug text-foreground">
                        {a.childFullName}
                      </p>
                      <div className="mt-1.5 space-y-1 text-sm">
                        <p className="min-w-0 leading-snug">
                          <span className="text-muted-foreground">Дата рождения: </span>
                          <span className="font-medium text-foreground">
                            {formatDateOrDefault(a.childBirthDate)}
                          </span>
                        </p>
                        <p className="min-w-0 leading-snug">
                          <span className="text-muted-foreground">Класс / курс: </span>
                          <span className="font-medium text-foreground">{a.childSchoolGrade || "—"}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Направления интереса
                      </p>
                      {a.interestDirections.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
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
                        <p className="mt-1.5 text-sm text-muted-foreground">Не указаны</p>
                      )}
                    </div>
                    {a.comment ? (
                      <div className="rounded-md border border-dashed border-border/60 bg-muted/20 p-2">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Комментарий</p>
                        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{a.comment}</p>
                      </div>
                    ) : null}
                    {(a.status === "in_progress" || a.status === "completed") && a.drpResponsibleFullName ? (
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="shrink-0 text-sm font-semibold">Ответственный сотрудник ДРП:</span>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {employeeInitials(a.drpResponsibleFullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 text-sm leading-snug">
                          <span className="font-medium text-foreground">{a.drpResponsibleFullName}</span>
                        </span>
                      </div>
                    ) : null}
                  </CardContent>
                  <CardFooter className="mt-auto shrink-0 border-t !px-3.5 !pb-2 !pt-2 flex flex-wrap items-center justify-end gap-1.5">
                    {a.status === "completed" && a.result ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => openResultsPrintWindow(a)}
                      >
                        <FileDown className="size-4" />
                        Открыть PDF (печать)
                      </Button>
                    ) : null}
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
                        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="size-3.5 shrink-0" aria-hidden />
                          <span>{formatDateTimeShortRu(a.createdAt)}</span>
                        </div>
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="shrink-0 text-sm font-semibold">Создатель заявки:</span>
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                              {employeeInitials(a.employeeFullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0 text-sm leading-snug">
                            <span className="font-medium text-foreground">{a.employeeFullName}</span>
                            {a.employeeDepartment ? (
                              <span className="text-muted-foreground"> · {a.employeeDepartment}</span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={a.status} />
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-4 text-sm">
                    <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Участник тестирования
                      </p>
                      <p className="mt-2 min-w-0 text-base font-semibold leading-snug text-foreground">
                        {a.childFullName}
                      </p>
                      <dl className="mt-2 space-y-1.5">
                        <div className="min-w-0 leading-snug">
                          <span className="text-muted-foreground">Дата рождения: </span>
                          <span className="font-medium text-foreground">
                            {formatDateOrDefault(a.childBirthDate)}
                          </span>
                        </div>
                        <div className="min-w-0 leading-snug">
                          <span className="text-muted-foreground">Класс / курс: </span>
                          <span className="font-medium text-foreground">{a.childSchoolGrade || "—"}</span>
                        </div>
                      </dl>
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
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Направления интереса
                      </p>
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
                    </div>
                    {a.comment ? (
                      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3">
                        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Комментарий</p>
                        <p className="mt-2 line-clamp-6 text-sm text-muted-foreground whitespace-pre-wrap">
                          {a.comment}
                        </p>
                      </div>
                    ) : null}
                    {(a.status === "in_progress" || a.status === "completed") && a.drpResponsibleFullName ? (
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="shrink-0 text-sm font-semibold">Ответственный сотрудник ДРП:</span>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {employeeInitials(a.drpResponsibleFullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 text-sm leading-snug">
                          <span className="font-medium text-foreground">{a.drpResponsibleFullName}</span>
                        </span>
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
                              drpScheduledDate: new Date().toISOString().slice(0, 10),
                              drpResponsibleFullName: getCurrentBankEmployee().fullName,
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
          <form onSubmit={handleSubmitNew} className="flex flex-col gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="po-emp-name">ФИО сотрудника</Label>
                  <Input
                    id="po-emp-name"
                    readOnly
                    required
                    value={form.employeeFullName}
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po-tab">Табельный номер</Label>
                  <Input id="po-tab" readOnly value={form.employeeTabNumber} className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-dept">Подразделение / блок</Label>
                  <Input id="po-dept" readOnly value={form.employeeDepartment} className="bg-muted/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po-email">Корпоративная почта</Label>
                  <Input
                    id="po-email"
                    type="email"
                    readOnly
                    required
                    value={form.employeeEmail}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-phone">Телефон</Label>
                  <Input id="po-phone" type="tel" readOnly value={form.employeePhone} className="bg-muted/50" />
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                <span className="text-sm font-medium">Участник тестирования</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="po-child">ФИО участника</Label>
                  <Input
                    id="po-child"
                    required
                    value={form.childFullName}
                    onChange={(e) => setForm((f) => ({ ...f, childFullName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po-birth">Дата рождения</Label>
                  <Input
                    id="po-birth"
                    type="date"
                    required
                    value={form.childBirthDate}
                    onChange={(e) => setForm((f) => ({ ...f, childBirthDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="po-grade">Класс / курс</Label>
                  <Input
                    id="po-grade"
                    value={form.childSchoolGrade}
                    onChange={(e) => setForm((f) => ({ ...f, childSchoolGrade: e.target.value }))}
                    placeholder="например, 9 класс"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Интересы / предполагаемые направления</Label>
                <div className="grid grid-cols-2 gap-4">
                  {INTEREST_DIRECTIONS.map((d) => (
                    <label key={d.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.interestDirections.includes(d.id)}
                        onCheckedChange={() => toggleInterest(d.id)}
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-comment">Комментарий</Label>
                <Textarea
                  id="po-comment"
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Пожелания по срокам, особенности …"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewApplicationOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" className="gap-2">
                <Plus className="size-4" />
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
