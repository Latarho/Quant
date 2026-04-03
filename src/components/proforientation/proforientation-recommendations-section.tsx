"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { INTEREST_DIRECTIONS, type ProforientationResult, type UniversityRecommendation } from "@/lib/proforientation/types";
import { getCyberActivityInsight } from "@/lib/proforientation/university-activity";
import { formatDateTimeShortRu } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  Info,
  LineChart,
  Scale,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "border-amber-500/60 bg-amber-500/10 text-amber-900 dark:text-amber-100";
  if (rank === 2) return "border-slate-400/60 bg-slate-400/10 text-slate-800 dark:text-slate-100";
  if (rank === 3) return "border-orange-700/40 bg-orange-800/10 text-orange-950 dark:text-orange-100";
  return "border-border bg-muted/50 text-muted-foreground";
}

function recommendationPracticalTip(rec: UniversityRecommendation, rank: number): string {
  if (rank === 1) {
    return "Первый в списке даёт наибольший расчётный индекс по текущей модели и данным платформы. Имеет смысл сверить программы и сроки приёма с планами семьи и с профильными ЕГЭ.";
  }
  if ((rec.cyberSharePercent ?? 0) >= 25 && (rec.cyberRelatedInterns ?? 0) > 0) {
    return "Высокая доля стажёров из этого вуза в направлениях ИБ и смежных ИТ — дополнительный сигнал при интересе к кибербезопасности и инженерным трекам.";
  }
  if ((rec.totalInternsWithBank ?? 0) >= 5) {
    return "Стабильный поток стажёров в банк обычно сочетается с налаженной работой с работодателями — удобно ориентироваться на практику и знакомство с отраслью.";
  }
  return "Используйте строку как отправную точку: сравните с проходными баллами прошлых лет, олимпиадами и географией, а не только с индексом совпадения.";
}

function scoreProfileHint(scores: ProforientationResult["scores"]): string {
  const t = (scores.technical + scores.analytical) / 2;
  const max = Math.max(scores.analytical, scores.technical, scores.social, scores.creative);
  if (max === scores.technical || max === scores.analytical) {
    return "По результатам теста выражены аналитика и/или техника — в модели рекомендаций этим шкалам задан больший вес.";
  }
  if (max === scores.social) {
    return "По результатам теста выражены коммуникации — в модели учитывается и «объём» стажировок вуза в банке.";
  }
  return "Профиль по тесту относительно сбалансирован; рекомендации учитывают все четыре шкалы и данные о стажировках.";
}

export function ProforientationRecommendationsSection({
  result,
  interestDirectionIds,
}: {
  result: ProforientationResult | undefined;
  interestDirectionIds: string[];
}) {
  const platformInsight = getCyberActivityInsight();
  const interestLabels =
    interestDirectionIds.length > 0
      ? interestDirectionIds
          .map((id) => INTEREST_DIRECTIONS.find((d) => d.id === id)?.label ?? id)
          .join(", ")
      : null;

  if (!result) {
    return (
      <p className="text-sm text-muted-foreground">
        Рекомендации появятся после завершения процедуры и расчёта результатов.
      </p>
    );
  }

  const list = result.recommendations;
  if (list.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground dark:bg-muted/10">
          <p className="font-medium text-foreground">Список рекомендаций пуст</p>
          <p className="mt-2">
            В справочнике ВУЗов нет данных для расчёта или набор стажировок не позволяет построить рейтинг. После
            наполнения карточек вузов и отметок о стажировках в банке пересчёт станет доступен автоматически.
          </p>
        </div>
        {platformInsight ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Справочно по платформе: </span>
            {platformInsight}
          </p>
        ) : null}
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Открыть справочник ВУЗов
          <ArrowUpRight className="size-3.5 shrink-0" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Методология и контекст */}
      <div className="rounded-xl border border-border/70 bg-muted/25 p-4 shadow-sm dark:bg-muted/10">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 space-y-3 text-sm leading-relaxed">
            <p className="font-semibold text-foreground">Как сформированы рекомендации</p>
            <ul className="list-inside list-disc space-y-1.5 text-muted-foreground marker:text-primary/80">
              <li>
                Индекс совпадения считается по результатам теста (четыре шкалы) и по агрегированным данным справочника
                о стажировках в банке по каждому вузу.
              </li>
              <li>
                В модели больший вес получают технический и аналитический профиль, затем доля «кибер/ИБ» среди
                стажёров вуза и устойчивость потока.
              </li>
              <li>
                Показываются до пяти вузов с наибольшим индексом; порядок — расчётный, а не официальный рейтинг
                вуза или программы.
              </li>
              <li>
                Блок носит информационный характер: окончательный выбор учитывает экзамены, бюджет, переезд и правила
                приёма конкретного года.
              </li>
            </ul>
            {interestLabels ? (
              <p className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-foreground">
                <span className="font-medium">Заявленные интересы: </span>
                {interestLabels}
              </p>
            ) : null}
            {result.externalReport ? (
              <p className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-foreground">
                <span className="font-medium">Связь с PDF-отчётом: </span>
                баллы профиля (0–100) приведены в соответствие с тестом «{result.externalReport.productLabel}» (
                {formatDateTimeShortRu(result.externalReport.testedAt)}, сеанс {result.externalReport.sessionId}).
                Блок ниже дополняет таблицы профессий и направлений из отчёта оценкой по данным о стажировках в банке.
              </p>
            ) : null}
            {result.scores ? (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Связь с тестом: </span>
                {scoreProfileHint(result.scores)}
              </p>
            ) : null}
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">По данным платформы: </span>
              {platformInsight}
            </p>
          </div>
        </div>
      </div>

      {/* Краткая сводка по баллам — контекст к таблице */}
      {result.scores ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["Аналитика", result.scores.analytical],
              ["Техника / ИТ", result.scores.technical],
              ["Коммуникации", result.scores.social],
              ["Творчество", result.scores.creative],
            ] as const
          ).map(([label, v]) => (
            <div
              key={label}
              className="rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-center shadow-sm"
            >
              <div className="text-lg font-semibold tabular-nums text-foreground">{v}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Карточки по вузам */}
      <div className="space-y-4">
        {list.map((rec, i) => {
          const rank = i + 1;
          const fit = Math.min(100, Math.max(0, rec.fitScore));
          return (
            <article
              key={rec.universityId}
              className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="flex min-w-0 flex-1 gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-8 min-w-8 shrink-0 justify-center px-2 text-sm font-bold tabular-nums",
                      rankBadgeClass(rank)
                    )}
                  >
                    {rank}
                  </Badge>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <h3 className="text-base font-semibold leading-snug text-foreground">{rec.universityShortName}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{rec.universityName}</p>
                  </div>
                </div>
                <div className="w-full shrink-0 sm:max-w-[220px]">
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <LineChart className="size-3.5 shrink-0" aria-hidden />
                      Индекс совпадения
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">{rec.fitScore}</span>
                  </div>
                  <Progress value={fit} className="h-2" />
                  <p className="mt-1 text-[11px] text-muted-foreground">Условная шкала до 100 по модели платформы</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 p-4 sm:grid-cols-3">
                <div className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 dark:bg-muted/10">
                  <Users className="size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">В банке (всего)</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                      {rec.totalInternsWithBank ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Стажёров из вуза в данных справочника</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 dark:bg-muted/10">
                  <Shield className="size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ИБ / кибер / ИТ</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                      {rec.cyberRelatedInterns ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">По эвристике должности и подразделения</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 dark:bg-muted/10">
                  <BarChart3 className="size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Доля ИБ и кибер
                    </p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                      {rec.cyberSharePercent != null ? `${rec.cyberSharePercent}%` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Среди стажёров этого вуза в банке</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-4 pb-4">
                <div className="rounded-lg border border-border/60 bg-muted/15 p-3 dark:bg-muted/5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <BookOpen className="size-3.5 shrink-0" aria-hidden />
                    Обоснование
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{rec.reason}</p>
                </div>
                <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm leading-relaxed text-foreground">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-medium text-foreground">На что обратить внимание</p>
                    <p className="mt-1 text-muted-foreground">{recommendationPracticalTip(rec, rank)}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Сводная таблица */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Scale className="size-4 text-muted-foreground" aria-hidden />
          <p className="text-sm font-semibold text-foreground">Сводное сравнение</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-10 text-center text-sm font-semibold">#</TableHead>
                <TableHead className="min-w-[140px] text-sm font-semibold">Вуз</TableHead>
                <TableHead className="w-24 text-right text-sm font-semibold">Индекс</TableHead>
                <TableHead className="w-20 text-right text-sm font-semibold">В банке</TableHead>
                <TableHead className="w-20 text-right text-sm font-semibold">ИБ/кибер</TableHead>
                <TableHead className="min-w-[7.5rem] text-right text-sm font-semibold">Доля ИБ и кибер</TableHead>
                <TableHead className="min-w-[220px] text-sm font-semibold">Кратко</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((rec, i) => (
                <TableRow key={rec.universityId} className="hover:bg-muted/40">
                  <TableCell className="text-center text-sm font-medium tabular-nums text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="text-sm font-medium">{rec.universityShortName}</div>
                    <div className="text-xs text-muted-foreground">{rec.universityName}</div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold tabular-nums">{rec.fitScore}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{rec.totalInternsWithBank ?? "—"}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{rec.cyberRelatedInterns ?? "—"}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {rec.cyberSharePercent != null ? `${rec.cyberSharePercent}%` : "—"}
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal text-sm text-muted-foreground">
                    {rec.reason.length > 160 ? `${rec.reason.slice(0, 157)}…` : rec.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border/70 bg-muted/10 px-3 py-2.5 text-xs text-muted-foreground dark:bg-muted/5">
        <span>Данные о стажировках — срез справочника; при изменении карточек вузов пересчёт может обновиться.</span>
        <Link
          href="/universities"
          className="inline-flex shrink-0 items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
        >
          Справочник ВУЗов
          <ArrowUpRight className="size-3 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
