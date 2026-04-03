"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  INTEREST_DIRECTIONS,
  ORIENTATION_TEST_BADGE_LABEL,
  ORIENTATION_TEST_DESCRIPTION,
  resolveOrientationTestState,
} from "@/lib/proforientation/types";
import type { OrientationTestWorkflowStatus, ProforientationApplication } from "@/lib/proforientation/types";
import { ChevronDown, ExternalLink, FileText, GraduationCap, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateOrDefault, formatDateTimeShortRu } from "@/lib/date-utils";
import { BADGE_COLORS } from "@/lib/badge-colors";
import { Separator } from "@/components/ui/separator";

function personInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  return (parts[0] ?? "").slice(0, 2).toUpperCase() || "?";
}

/** Единый вид тегов с системой: outline + семантические цвета из BADGE_COLORS */
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
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group w-full min-w-0 rounded-xl border border-border bg-card shadow-sm">
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50",
          "group-data-[state=open]:border-b group-data-[state=open]:border-border"
        )}
      >
        <span className="text-lg font-semibold leading-none">{title}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-6 px-6 pb-6 pt-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ProforientationApplicationDetailBody({
  application: a,
}: {
  application: ProforientationApplication;
}) {
  const hasResult = Boolean(a.result);
  const hasRecommendations = Boolean(a.result?.recommendations.length);
  const orientationTest = resolveOrientationTestState(a);
  const showTestLink = orientationTest.status === "awaiting_pass" && Boolean(orientationTest.testUrl);
  const showResultsPdf =
    orientationTest.status === "results_ready" && Boolean(orientationTest.resultsPdfUrl);

  return (
    <div className="w-full space-y-6">
      <CollapseSection title="Информация о заявке" defaultOpen>
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <section
              className={cn(
                "flex flex-col rounded-xl border border-border/70 bg-muted/20 p-4 shadow-sm",
                "dark:bg-muted/10"
              )}
            >
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <UserRound className="size-4 shrink-0" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">Сотрудник банка</span>
              </div>
              <div className="flex min-w-0 gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-primary text-base font-medium text-primary-foreground">
                    {personInitials(a.employeeFullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold leading-snug text-foreground">{a.employeeFullName}</p>
                  {a.employeeDepartment ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{a.employeeDepartment}</p>
                  ) : null}
                </div>
              </div>
              <Separator className="my-4" />
              <dl className="grid gap-x-3 gap-y-2.5 text-sm sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:gap-x-4">
                <dt className="text-muted-foreground">Почта</dt>
                <dd className="break-all font-medium">{a.employeeEmail}</dd>
                <dt className="text-muted-foreground">Телефон</dt>
                <dd className="font-medium">{a.employeePhone || "—"}</dd>
              </dl>
            </section>

            <section
              className={cn(
                "flex flex-col rounded-xl border border-border/70 bg-muted/20 p-4 shadow-sm",
                "dark:bg-muted/10"
              )}
            >
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="size-4 shrink-0" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">Участник тестирования</span>
              </div>
              <p className="text-base font-semibold leading-snug text-foreground">{a.childFullName}</p>
              <Separator className="my-4" />
              <dl className="grid gap-x-3 gap-y-2.5 text-sm sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:gap-x-4">
                <dt className="text-muted-foreground">Дата рождения</dt>
                <dd className="font-medium">{formatDateOrDefault(a.childBirthDate)}</dd>
                <dt className="text-muted-foreground">Класс / курс</dt>
                <dd className="font-medium">{a.childSchoolGrade || "—"}</dd>
              </dl>
            </section>
          </div>

          <section className="rounded-xl border border-border/70 bg-muted/20 p-4 shadow-sm dark:bg-muted/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Направления интереса
            </p>
            <div className="flex flex-wrap gap-1.5">
              {a.interestDirections.length > 0 ? (
                a.interestDirections.map((id) => {
                  const label = INTEREST_DIRECTIONS.find((d) => d.id === id)?.label ?? id;
                  return (
                    <Badge key={id} variant="secondary" className="text-sm font-normal">
                      {label}
                    </Badge>
                  );
                })
              ) : (
                <span className="text-sm text-muted-foreground">Не указаны</span>
              )}
            </div>
          </section>

          {a.comment ? (
            <section className="rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 dark:bg-muted/5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Комментарий</p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{a.comment}</p>
            </section>
          ) : null}

          {(a.status === "in_progress" || a.status === "completed") && a.drpResponsibleFullName ? (
            <section className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 shadow-sm dark:bg-muted/10">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="shrink-0 text-sm font-semibold">Ответственный сотрудник ДРП:</span>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                    {personInitials(a.drpResponsibleFullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="font-medium text-foreground">{a.drpResponsibleFullName}</span>
                </span>
              </div>
            </section>
          ) : null}

          {(a.drpScheduledDate || a.drpComment) && (
            <section className="rounded-xl border border-border/70 bg-muted/20 p-4 shadow-sm dark:bg-muted/10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Данные ДРП</p>
              <dl className="grid gap-x-3 gap-y-3 text-sm sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:gap-x-4">
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
            </section>
          )}
        </div>
      </CollapseSection>

      <CollapseSection title="Тесты на профориентацию" defaultOpen>
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
                Завершено:{" "}
                {formatDateTimeShortRu(a.result.completedAt)}
              </p>
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

      <CollapseSection title="Рекомендации" defaultOpen={hasRecommendations}>
        {hasResult && a.result && hasRecommendations ? (
          <div className="border rounded-lg overflow-x-auto overflow-y-hidden">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-sm font-semibold">ВУЗ</TableHead>
                  <TableHead className="w-20 text-right text-sm font-semibold">Совпадение</TableHead>
                  <TableHead className="text-sm font-semibold">Обоснование</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.result.recommendations.map((rec) => (
                  <TableRow key={rec.universityId} className="hover:bg-muted/50">
                    <TableCell className="px-4 whitespace-normal">
                      <div className="text-sm font-medium">{rec.universityShortName}</div>
                      <div className="text-sm text-muted-foreground">{rec.universityName}</div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal text-right text-sm font-medium tabular-nums">
                      {rec.fitScore}
                    </TableCell>
                    <TableCell className="px-4 whitespace-normal text-sm">{rec.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Рекомендации появятся после завершения процедуры и расчёта результатов.
          </p>
        )}
      </CollapseSection>
    </div>
  );
}
