"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  GraduationCap,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { CHART } from "@/lib/dashboard";
import type { DashboardDrpLineMetrics } from "@/lib/dashboard";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface DrpTabProps {
  line: DashboardDrpLineMetrics;
}

export function DrpTab({ line }: DrpTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="ВУЗов с ДРП"
          value={line.universities}
          icon={<GraduationCap className="size-6 text-primary" />}
        />
        <MetricCard
          label="Стажеров"
          value={line.interns}
          subtitle={`Активных: ${line.activeInterns}`}
          icon={<Users className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
        <MetricCard
          label="Практикантов"
          value={line.practitioners}
          icon={<UserCheck className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
        <MetricCard
          label="Мероприятий"
          value={line.events}
          icon={<Calendar className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Топ-5 ВУЗов по сотрудникам (ДРП)</CardTitle>
            <CardDescription>Количество сотрудников из ВУЗов с линией ДРП</CardDescription>
          </CardHeader>
          <CardContent>
            {line.topUniversities.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={line.topUniversities.map((uni) => ({
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
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="employees"
                    fill={CHART.barAccent}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState message="Нет данных" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Оценка практикантов (ДРП)</CardTitle>
            <CardDescription>Распределение по статусу соответствия</CardDescription>
          </CardHeader>
          <CardContent>
            {line.practitioners > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Превосходит",
                        value: line.practitionersByStatus.exceeds,
                      },
                      {
                        name: "Соответствует",
                        value: line.practitionersByStatus.meets,
                      },
                      {
                        name: "Не соответствует",
                        value: line.practitionersByStatus.notMeets,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
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
              <DashboardEmptyState message="Нет данных" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Мероприятия по типам (ДРП)</CardTitle>
            <CardDescription>Распределение мероприятий по типам</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { name: "Деловая игра", value: line.eventsByType.businessGame },
                  { name: "Кейс-чемпионат", value: line.eventsByType.caseChampionship },
                  { name: "Защита диплома", value: line.eventsByType.diplomaDefense },
                  { name: "Вебинар", value: line.eventsByType.webinar },
                  { name: "Лекция", value: line.eventsByType.lecture },
                  { name: "Конференция", value: line.eventsByType.conference },
                  { name: "Мастер-класс", value: line.eventsByType.masterClass },
                  { name: "Контакт", value: line.eventsByType.contact },
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
                <Bar
                  dataKey="value"
                  fill={CHART.barAccent}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Кадровые показатели (ДРП)</CardTitle>
            <CardDescription>Стажеры и практиканты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">Всего стажеров</span>
                <span className="font-semibold tabular-nums">{line.interns}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">Активных стажеров</span>
                <span className="font-semibold tabular-nums">{line.activeInterns}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">Всего практикантов</span>
                <span className="font-semibold tabular-nums">{line.practitioners}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">Сотрудников всего</span>
                <span className="font-semibold tabular-nums">{line.employees}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
