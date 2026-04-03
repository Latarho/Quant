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
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  INTEREST_DIRECTIONS,
  ORIENTATION_TEST_BADGE_LABEL,
  ORIENTATION_TEST_DESCRIPTION,
  resolveOrientationTestState,
} from "@/lib/proforientation/types";
import type { OrientationTestWorkflowStatus, ProforientationApplication } from "@/lib/proforientation/types";
import { ChevronDown, ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateOrDefault, formatDateTimeShortRu } from "@/lib/date-utils";

function orientationTestBadgeVariant(
  status: OrientationTestWorkflowStatus
): "default" | "secondary" | "outline" {
  switch (status) {
    case "awaiting_pass":
      return "default";
    case "awaiting_results":
    case "results_ready":
      return "secondary";
    default:
      return "outline";
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
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">Сотрудник банка</p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[minmax(0,140px)_1fr] sm:gap-x-4">
            <dt className="text-sm text-muted-foreground">ФИО</dt>
            <dd className="text-sm font-medium">{a.employeeFullName}</dd>
            <dt className="text-sm text-muted-foreground">Табельный номер</dt>
            <dd className="text-sm font-medium">{a.employeeTabNumber || "—"}</dd>
            <dt className="text-sm text-muted-foreground">Подразделение</dt>
            <dd className="text-sm font-medium">{a.employeeDepartment || "—"}</dd>
            <dt className="text-sm text-muted-foreground">Почта</dt>
            <dd className="break-all text-sm font-medium">{a.employeeEmail}</dd>
            <dt className="text-sm text-muted-foreground">Телефон</dt>
            <dd className="text-sm font-medium">{a.employeePhone || "—"}</dd>
          </dl>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            Участник тестирования
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[minmax(0,140px)_1fr] sm:gap-x-4">
            <dt className="text-sm text-muted-foreground">ФИО</dt>
            <dd className="text-sm font-medium">{a.childFullName}</dd>
            <dt className="text-sm text-muted-foreground">Дата рождения</dt>
            <dd className="text-sm font-medium">{formatDateOrDefault(a.childBirthDate)}</dd>
            <dt className="text-sm text-muted-foreground">Класс / курс</dt>
            <dd className="text-sm font-medium">{a.childSchoolGrade || "—"}</dd>
          </dl>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">Направления интереса</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {a.interestDirections.length > 0 ? (
              a.interestDirections.map((id) => {
                const label = INTEREST_DIRECTIONS.find((d) => d.id === id)?.label ?? id;
                return (
                  <Badge key={id} variant="outline" className="font-normal text-sm">
                    {label}
                  </Badge>
                );
              })
            ) : (
              <span className="text-sm text-muted-foreground">Не указаны</span>
            )}
          </div>
        </div>
        {a.comment ? (
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">Комментарий</p>
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{a.comment}</p>
          </div>
        ) : null}
        {(a.drpScheduledDate || a.drpComment) && (
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">Данные ДРП</p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[minmax(0,140px)_1fr] sm:gap-x-4">
              {a.drpScheduledDate ? (
                <>
                  <dt className="text-sm text-muted-foreground">Дата записи</dt>
                  <dd className="text-sm font-medium">{formatDateOrDefault(a.drpScheduledDate)}</dd>
                </>
              ) : null}
              {a.drpComment ? (
                <>
                  <dt className="text-sm text-muted-foreground">Комментарий ДРП</dt>
                  <dd className="whitespace-pre-wrap text-sm font-medium">{a.drpComment}</dd>
                </>
              ) : null}
            </dl>
          </div>
        )}
      </CollapseSection>

      <CollapseSection title="Тесты на профориентацию" defaultOpen>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <Badge
              variant={orientationTestBadgeVariant(orientationTest.status)}
              className="shrink-0 rounded-md px-2 text-sm font-semibold leading-tight"
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
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-semibold">ВУЗ</TableHead>
                  <TableHead className="text-right text-sm font-semibold w-20">Совпадение</TableHead>
                  <TableHead className="text-sm font-semibold">Обоснование</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.result.recommendations.map((rec) => (
                  <TableRow key={rec.universityId}>
                    <TableCell>
                      <div className="text-sm font-medium">{rec.universityShortName}</div>
                      <div className="text-sm text-muted-foreground">{rec.universityName}</div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">{rec.fitScore}</TableCell>
                    <TableCell className="text-sm">{rec.reason}</TableCell>
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
