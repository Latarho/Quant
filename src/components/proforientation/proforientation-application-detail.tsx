"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProforientationRecommendationsSection } from "@/components/proforientation/proforientation-recommendations-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { Textarea } from "@/components/ui/textarea";
import {
  INTEREST_DIRECTIONS,
  ORIENTATION_TEST_BADGE_LABEL,
  ORIENTATION_TEST_DESCRIPTION,
  resolveOrientationTestState,
} from "@/lib/proforientation/types";
import type { OrientationScores, OrientationTestWorkflowStatus, ProforientationApplication } from "@/lib/proforientation/types";
import { ChevronDown, ExternalLink, FileText, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateOrDefault, formatDateTimeShortRu } from "@/lib/date-utils";
import { BADGE_COLORS } from "@/lib/badge-colors";
import { useProforientation } from "@/contexts/proforientation-context";

const TEST_WORKFLOW_OPTIONS: { value: OrientationTestWorkflowStatus; label: string }[] = [
  { value: "pending_link", label: ORIENTATION_TEST_BADGE_LABEL.pending_link },
  { value: "awaiting_pass", label: ORIENTATION_TEST_BADGE_LABEL.awaiting_pass },
  { value: "awaiting_results", label: ORIENTATION_TEST_BADGE_LABEL.awaiting_results },
  { value: "results_ready", label: ORIENTATION_TEST_BADGE_LABEL.results_ready },
];

function personInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  return (parts[0] ?? "").slice(0, 2).toUpperCase() || "?";
}

function orientationTestStatusBadgeClass(status: OrientationTestWorkflowStatus): string {
  switch (status) {
    case "pending_link":
      return BADGE_COLORS.planned;
    case "awaiting_pass":
      return BADGE_COLORS.inProgress;
    case "awaiting_results":
      return BADGE_COLORS.pending;
    case "results_ready":
      return BADGE_COLORS.completed;
    default:
      return BADGE_COLORS.notStarted;
  }
}

function CollapseSection({
  title,
  defaultOpen = true,
  headerAction,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group w-full min-w-0 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex w-full items-center justify-between gap-2 px-6 py-4">
        <CollapsibleTrigger
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-left outline-none transition-colors hover:bg-muted/50",
            "focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
              "group-data-[state=closed]:-rotate-90"
            )}
            aria-hidden
          />
          <span className="text-lg font-semibold leading-none">{title}</span>
        </CollapsibleTrigger>
        {headerAction ? <div className="flex shrink-0 items-center">{headerAction}</div> : null}
      </div>
      <CollapsibleContent>
        <div className="space-y-6 px-6 pb-6 pt-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function BlockEditButton({ onClick, disabled, title }: { onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      aria-label="Редактировать"
      title={title ?? "Редактировать"}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}

export function ProforientationApplicationDetailBody({
  application: a,
}: {
  application: ProforientationApplication;
}) {
  const { updateApplication } = useProforientation();
  const hasResult = Boolean(a.result);
  const orientationTest = resolveOrientationTestState(a);
  const showTestLink = orientationTest.status === "awaiting_pass" && Boolean(orientationTest.testUrl);
  const showResultsPdf =
    orientationTest.status === "results_ready" && Boolean(orientationTest.resultsPdfUrl);

  const hasDrpData = Boolean(a.drpScheduledDate || a.drpComment);

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoChildName, setInfoChildName] = useState(a.childFullName);
  const [infoBirth, setInfoBirth] = useState(a.childBirthDate);
  const [infoGrade, setInfoGrade] = useState(a.childSchoolGrade);
  const [infoInterests, setInfoInterests] = useState<string[]>(a.interestDirections);
  const [infoComment, setInfoComment] = useState(a.comment);
  const [infoDrpDate, setInfoDrpDate] = useState(a.drpScheduledDate ?? "");
  const [infoDrpComment, setInfoDrpComment] = useState(a.drpComment ?? "");

  const openInfoDialog = useCallback(() => {
    setInfoChildName(a.childFullName);
    setInfoBirth(a.childBirthDate);
    setInfoGrade(a.childSchoolGrade);
    setInfoInterests([...a.interestDirections]);
    setInfoComment(a.comment);
    setInfoDrpDate(a.drpScheduledDate ?? "");
    setInfoDrpComment(a.drpComment ?? "");
    setInfoOpen(true);
  }, [a]);

  const toggleInfoInterest = (id: string) => {
    setInfoInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveInfo = () => {
    updateApplication(a.id, {
      childFullName: infoChildName.trim(),
      childBirthDate: infoBirth,
      childSchoolGrade: infoGrade,
      interestDirections: [...infoInterests],
      comment: infoComment,
      drpScheduledDate: infoDrpDate.trim() || undefined,
      drpComment: infoDrpComment.trim() || undefined,
    });
    setInfoOpen(false);
  };

  const [testsOpen, setTestsOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<OrientationTestWorkflowStatus>(
    a.orientationTest?.status ?? "pending_link"
  );
  const [testUrl, setTestUrl] = useState(a.orientationTest?.testUrl ?? "");
  const [testPdfUrl, setTestPdfUrl] = useState(a.orientationTest?.resultsPdfUrl ?? "");

  const openTestsDialog = useCallback(() => {
    setTestStatus(a.orientationTest?.status ?? "pending_link");
    setTestUrl(a.orientationTest?.testUrl ?? "");
    setTestPdfUrl(a.orientationTest?.resultsPdfUrl ?? "");
    setTestsOpen(true);
  }, [a]);

  const saveTests = () => {
    if (hasResult) {
      updateApplication(a.id, {
        orientationTest: {
          status: "results_ready",
          testUrl: testUrl.trim() || undefined,
          resultsPdfUrl: testPdfUrl.trim() || undefined,
        },
      });
    } else {
      updateApplication(a.id, {
        orientationTest: {
          status: testStatus,
          testUrl: testUrl.trim() || undefined,
          resultsPdfUrl: testPdfUrl.trim() || undefined,
        },
      });
    }
    setTestsOpen(false);
  };

  const [recOpen, setRecOpen] = useState(false);
  const [recScores, setRecScores] = useState<OrientationScores>({
    analytical: 0,
    technical: 0,
    social: 0,
    creative: 0,
  });
  const [recSummary, setRecSummary] = useState("");

  const openRecDialog = useCallback(() => {
    if (!a.result) return;
    setRecScores({ ...a.result.scores });
    setRecSummary(a.result.summary);
    setRecOpen(true);
  }, [a]);

  const saveRec = () => {
    if (!a.result) return;
    updateApplication(a.id, {
      result: {
        ...a.result,
        scores: { ...recScores },
        summary: recSummary,
      },
    });
    setRecOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      <CollapseSection
        title="Информация"
        defaultOpen
        headerAction={<BlockEditButton onClick={openInfoDialog} />}
      >
        <div className="space-y-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="shrink-0 text-sm font-semibold">Создатель заявки:</span>
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                {personInitials(a.employeeFullName)}
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
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Участник тестирования</p>
            <p className="mt-2 min-w-0 text-sm font-semibold leading-snug text-foreground">{a.childFullName}</p>
            <p className="mt-2 min-w-0 flex flex-wrap items-baseline gap-x-1 text-sm leading-snug">
              <span className="text-muted-foreground">Дата рождения: </span>
              <span className="font-medium text-foreground">{formatDateOrDefault(a.childBirthDate)}</span>
              <span className="text-muted-foreground/40" aria-hidden>
                ·
              </span>
              <span className="text-muted-foreground">Класс / курс: </span>
              <span className="font-medium text-foreground">{a.childSchoolGrade || "—"}</span>
            </p>
            <div className="mt-3 border-t border-border/60 pt-3">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Направления интереса</p>
              {a.interestDirections.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.interestDirections.map((id) => {
                    const label = INTEREST_DIRECTIONS.find((d) => d.id === id)?.label ?? id;
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
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{a.comment}</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Не указан</p>
              )}
            </div>
          </div>

          {(a.status === "in_progress" || a.status === "completed") && a.drpResponsibleFullName ? (
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="shrink-0 text-sm font-semibold">Ответственный сотрудник ДРП:</span>
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                  {personInitials(a.drpResponsibleFullName)}
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

          {hasDrpData ? (
            <div className="rounded-md border border-border/80 bg-muted/30 p-3">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Данные ДРП</p>
              <dl className="mt-2 grid gap-x-3 gap-y-2 text-sm sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:gap-x-4">
                {a.drpScheduledDate ? (
                  <>
                    <dt className="text-muted-foreground">Дата записи</dt>
                    <dd className="font-medium">{formatDateOrDefault(a.drpScheduledDate)}</dd>
                  </>
                ) : null}
                {a.drpComment ? (
                  <>
                    <dt className="self-start text-muted-foreground">Комментарий ДРП</dt>
                    <dd className="whitespace-pre-wrap font-medium leading-relaxed">{a.drpComment}</dd>
                  </>
                ) : null}
              </dl>
            </div>
          ) : null}
        </div>
      </CollapseSection>

      <CollapseSection
        title="Тесты на профориентацию"
        defaultOpen
        headerAction={<BlockEditButton onClick={openTestsDialog} />}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-sm font-medium",
                orientationTestStatusBadgeClass(orientationTest.status)
              )}
            >
              {ORIENTATION_TEST_BADGE_LABEL[orientationTest.status]}
            </Badge>
            <span className="min-w-0 text-sm leading-snug text-muted-foreground">
              {ORIENTATION_TEST_DESCRIPTION[orientationTest.status]}
            </span>
          </div>

          {showTestLink && orientationTest.testUrl ? (
            <a
              href={orientationTest.testUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit max-w-full items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" />
              Пройти тест
            </a>
          ) : null}

          {showResultsPdf && orientationTest.resultsPdfUrl ? (
            <a
              href={orientationTest.resultsPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit max-w-full items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <FileText className="size-3.5 shrink-0" />
              PDF с результатами теста
            </a>
          ) : null}

          {hasResult && a.result ? (
            <>
              <p className="text-sm text-muted-foreground">
                Завершено в системе:{" "}
                {formatDateTimeShortRu(a.result.completedAt)}
              </p>
              {a.result.externalReport ? (
                <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-sm shadow-sm dark:bg-muted/10">
                  <p className="font-semibold text-foreground">Отчёт внешней системы тестирования</p>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-x-4">
                    <dt className="text-muted-foreground">Название теста</dt>
                    <dd className="font-medium">{a.result.externalReport.productLabel}</dd>
                    <dt className="text-muted-foreground">Дата и время теста</dt>
                    <dd className="font-medium">{formatDateTimeShortRu(a.result.externalReport.testedAt)}</dd>
                    <dt className="text-muted-foreground">Длительность</dt>
                    <dd className="font-medium">{a.result.externalReport.durationLabel}</dd>
                    <dt className="text-muted-foreground">Номер сеанса</dt>
                    <dd className="font-mono text-sm font-medium">{a.result.externalReport.sessionId}</dd>
                  </dl>
                </div>
              ) : null}
              {a.result.scores ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      ["Аналитика", a.result.scores.analytical],
                      ["Техника / ИТ", a.result.scores.technical],
                      ["Коммуникации", a.result.scores.social],
                      ["Творчество", a.result.scores.creative],
                    ] as const
                  ).map(([label, v]) => (
                    <div
                      key={label}
                      className="rounded-lg border bg-muted/30 p-4 text-center dark:bg-muted/20"
                    >
                      <div className="text-2xl font-semibold tabular-nums text-foreground">{v}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Баллы по профилю пока не сохранены.</p>
              )}
              {a.result.summary ? (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">Заключение</p>
                  <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{a.result.summary}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Результаты тестирования появятся после прохождения теста и обработки данных ДРП.
            </p>
          )}
        </div>
      </CollapseSection>

      <CollapseSection
        title="Рекомендации"
        defaultOpen={hasResult}
        headerAction={
          <BlockEditButton
            onClick={openRecDialog}
            disabled={!hasResult}
            title={hasResult ? "Редактировать" : "Сначала сохраните результаты теста"}
          />
        }
      >
        <ProforientationRecommendationsSection result={a.result} interestDirectionIds={a.interestDirections} />
      </CollapseSection>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать информацию</DialogTitle>
            <DialogDescription>
              Участник тестирования, направления интереса, комментарий и данные записи ДРП.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-po-child">ФИО участника</Label>
              <Input
                id="edit-po-child"
                value={infoChildName}
                onChange={(e) => setInfoChildName(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-po-birth">Дата рождения</Label>
                <Input id="edit-po-birth" type="date" value={infoBirth} onChange={(e) => setInfoBirth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-po-grade">Класс / курс</Label>
                <Input
                  id="edit-po-grade"
                  value={infoGrade}
                  onChange={(e) => setInfoGrade(e.target.value)}
                  placeholder="например, 9 класс"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Направления интереса</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {INTEREST_DIRECTIONS.map((d) => (
                  <label key={d.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={infoInterests.includes(d.id)}
                      onCheckedChange={() => toggleInfoInterest(d.id)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-po-comment">Комментарий к заявке</Label>
              <Textarea
                id="edit-po-comment"
                value={infoComment}
                onChange={(e) => setInfoComment(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-po-drp-date">Дата записи (ДРП)</Label>
              <Input
                id="edit-po-drp-date"
                type="date"
                value={infoDrpDate}
                onChange={(e) => setInfoDrpDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-po-drp-comment">Комментарий ДРП</Label>
              <Textarea
                id="edit-po-drp-comment"
                value={infoDrpComment}
                onChange={(e) => setInfoDrpComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setInfoOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={saveInfo}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={testsOpen} onOpenChange={setTestsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать тестирование</DialogTitle>
            <DialogDescription>
              {hasResult
                ? "Заявка с результатами: этап отображается как завершённый. Можно изменить ссылки на тест и PDF."
                : "Этап прохождения теста и ссылки для участника."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!hasResult ? (
              <div className="space-y-2">
                <Label>Этап</Label>
                <Select value={testStatus} onValueChange={(v) => setTestStatus(v as OrientationTestWorkflowStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_WORKFLOW_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="edit-test-url">Ссылка на прохождение теста</Label>
              <Input
                id="edit-test-url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-test-pdf">URL PDF с результатами</Label>
              <Input
                id="edit-test-pdf"
                value={testPdfUrl}
                onChange={(e) => setTestPdfUrl(e.target.value)}
                placeholder="/path или https://…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTestsOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={saveTests}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recOpen} onOpenChange={setRecOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать результаты и заключение</DialogTitle>
            <DialogDescription>
              Баллы 0–100 и текст заключения. Список рекомендаций по вузам пересчитается автоматически.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {(
              [
                ["analytical", "Аналитика"],
                ["technical", "Техника / ИТ"],
                ["social", "Коммуникации"],
                ["creative", "Творчество"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`rec-${key}`}>{label}</Label>
                <Input
                  id={`rec-${key}`}
                  type="number"
                  min={0}
                  max={100}
                  value={recScores[key]}
                  onChange={(e) =>
                    setRecScores((s) => ({ ...s, [key]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="space-y-2 pb-2">
            <Label htmlFor="rec-summary">Заключение</Label>
            <Textarea
              id="rec-summary"
              value={recSummary}
              onChange={(e) => setRecSummary(e.target.value)}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRecOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={saveRec}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
