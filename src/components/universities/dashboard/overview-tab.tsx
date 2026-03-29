"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  Handshake,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { CHART } from "@/lib/dashboard";
import type { DashboardOverviewMetrics } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format-utils";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface OverviewTabProps {
  metrics: DashboardOverviewMetrics;
  eventsPeriodLabel: string;
}

export function OverviewTab({ metrics, eventsPeriodLabel }: OverviewTabProps) {
  const totalPractitionersWithStatus =
    metrics.practitionersByStatus.exceeds +
    metrics.practitionersByStatus.meets +
    metrics.practitionersByStatus.notMeets;

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Bento: крупный акцент + компактная сетка */}
      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card shadow-sm lg:col-span-5">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                ВУЗов-партнёров
              </p>
              <p className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
                {metrics.totalUniversities}
              </p>
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Активная сеть сотрудничества
              </p>
            </div>
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
              <GraduationCap className="size-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7 lg:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Активных договоров"
            value={metrics.activeContracts}
            subtitle={
              metrics.expiringContracts > 0
                ? `${metrics.expiringContracts} истекают в течение 90 дней`
                : undefined
            }
            subtitleClassName={
              metrics.expiringContracts > 0 ? "text-destructive" : undefined
            }
            icon={<FileText className="size-6 text-primary" />}
            iconBgClassName="bg-primary/10"
          />
          <MetricCard
            label="Стажеров (всего)"
            value={metrics.totalInterns}
            subtitle={`Активных: ${metrics.activeInterns}`}
            icon={<Users className="size-6 text-primary" />}
            iconBgClassName="bg-primary/10"
          />
          <MetricCard
            label="Практикантов"
            value={metrics.totalPractitioners}
            icon={<UserCheck className="size-6 text-primary" />}
            iconBgClassName="bg-primary/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
        <Card className="flex flex-col lg:col-span-6 xl:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Мероприятия</CardTitle>
            <CardDescription>{eventsPeriodLabel}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3">
                <p className="text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
                  {metrics.totalEvents}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {metrics.eventsByStatus.completed} завершено
                  </Badge>
                  <Badge variant="outline">{metrics.eventsByStatus.planned} план</Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {metrics.eventsByStatus.inProgress} в работе
                  </Badge>
                </div>
              </div>
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Calendar className="size-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-6 xl:col-span-7 sm:gap-4">
          <MetricCard
            label="Кафедр банка"
            value={metrics.totalBankDepartments}
            icon={<Building2 className="size-6 text-primary" />}
            iconBgClassName="bg-primary/10"
          />
          <MetricCard
            label="Проектов ЦНТР"
            value={metrics.totalProjects}
            icon={<TrendingUp className="size-6 text-primary" />}
            iconBgClassName="bg-primary/10"
          />
          <MetricCard
            label="Финансирование ЦНТР"
            value={formatCurrency(metrics.totalFunding)}
            icon={<Handshake className="size-6 text-primary" />}
            iconBgClassName="bg-primary/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Распределение по линиям сотрудничества</CardTitle>
            <CardDescription>Количество ВУЗов по каждой линии</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "ДРП", value: metrics.linesCounts.drp },
                    { name: "БКО", value: metrics.linesCounts.bko },
                    { name: "ЦНТР", value: metrics.linesCounts.cntr },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={72}
                  dataKey="value"
                >
                  <Cell fill={CHART.lineDrp} />
                  <Cell fill={CHART.lineBko} />
                  <Cell fill={CHART.lineCntr} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg">Мероприятия по типам</CardTitle>
            <CardDescription>{eventsPeriodLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={[
                  { name: "Деловая игра", value: metrics.eventsByType.businessGame },
                  { name: "Кейс-чемпионат", value: metrics.eventsByType.caseChampionship },
                  { name: "Защита диплома", value: metrics.eventsByType.diplomaDefense },
                  { name: "Вебинар", value: metrics.eventsByType.webinar },
                  { name: "Лекция", value: metrics.eventsByType.lecture },
                  { name: "Конференция", value: metrics.eventsByType.conference },
                  { name: "Мастер-класс", value: metrics.eventsByType.masterClass },
                  { name: "Контакт", value: metrics.eventsByType.contact },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill={CHART.barAccent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg">Топ-5 ВУЗов по сотрудникам</CardTitle>
            <CardDescription>Количество сотрудников из ВУЗа</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topUniversitiesByEmployees.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={metrics.topUniversitiesByEmployees.map((uni) => ({
                    name: uni.shortName || uni.name,
                    employees: uni.allEmployees || 0,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="employees"
                    fill={CHART.barDefault}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState message="Нет данных о сотрудниках" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Статусы договоров</CardTitle>
            <CardDescription>Обзор состояния договорной базы</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Действующие", value: metrics.activeContracts },
                    { name: "Истекают", value: metrics.expiringContracts },
                    { name: "Просрочены", value: metrics.expiredContracts },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                  outerRadius={88}
                  dataKey="value"
                >
                  <Cell fill={CHART.positive} />
                  <Cell fill={CHART.warning} />
                  <Cell fill={CHART.danger} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-lg">Оценка практикантов</CardTitle>
            <CardDescription>Распределение по статусу соответствия</CardDescription>
          </CardHeader>
          <CardContent>
            {totalPractitionersWithStatus > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Превосходит",
                        value: metrics.practitionersByStatus.exceeds,
                      },
                      {
                        name: "Соответствует",
                        value: metrics.practitionersByStatus.meets,
                      },
                      {
                        name: "Не соответствует",
                        value: metrics.practitionersByStatus.notMeets,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={92}
                    dataKey="value"
                  >
                    <Cell fill={CHART.positive} />
                    <Cell fill={CHART.barAccent} />
                    <Cell fill={CHART.danger} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState message="Нет данных об оценках" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-lg">Результаты кейс-чемпионатов</CardTitle>
            <CardDescription>Статистика участников</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { name: "Победители", value: metrics.caseResults.winners },
                  { name: "Призёры", value: metrics.caseResults.prizeWinners },
                  { name: "Участники", value: metrics.caseResults.participated },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <Cell fill={CHART.caseGold} />
                  <Cell fill={CHART.warning} />
                  <Cell fill={CHART.barAccent} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-lg">География партнерств</CardTitle>
            <CardDescription>Топ-5 городов по количеству ВУЗов</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topCities.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={metrics.topCities.map(([city, count]) => ({ city, count }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART.barDefault} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState message="Нет данных о городах" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-lg">Охват BKO продуктами</CardTitle>
            <CardDescription>Количество ВУЗов с подключенными продуктами</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={[
                  { name: "ЗП студенты", value: metrics.bkoStats.salaryStudents },
                  { name: "ЗП сотрудники", value: metrics.bkoStats.salaryEmployees },
                  { name: "ИЭ", value: metrics.bkoStats.ie },
                  { name: "ТЭ", value: metrics.bkoStats.te },
                  { name: "СБП", value: metrics.bkoStats.sbp },
                  { name: "АДМ", value: metrics.bkoStats.adm },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill={CHART.positive} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-primary/15 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-xl">Динамика партнерств по годам</CardTitle>
          <CardDescription>
            Количество новых партнерств по году начала сотрудничества
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.yearsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={metrics.yearsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={CHART.barAccent}
                  strokeWidth={2}
                  dot={{ fill: CHART.barAccent, r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Новых партнерств"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <DashboardEmptyState
              message="Нет данных о годах начала сотрудничества"
              minHeight={340}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
