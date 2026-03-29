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
import { GraduationCap, TrendingUp, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { CHART } from "@/lib/dashboard";
import type { DashboardBkoLineMetrics } from "@/lib/dashboard";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface BkoTabProps {
  line: DashboardBkoLineMetrics;
}

export function BkoTab({ line }: BkoTabProps) {
  const transactional =
    line.withIE + line.withTE + line.withSBP + line.withADM;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="ВУЗов с БКО"
          value={line.total}
          icon={<GraduationCap className="size-6 text-primary" />}
        />
        <MetricCard
          label="ЗП студенты"
          value={line.withSalaryStudents}
          subtitle={
            line.total > 0
              ? `${Math.round((line.withSalaryStudents / line.total) * 100)}% охват`
              : undefined
          }
          icon={<Users className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
        <MetricCard
          label="ЗП сотрудники"
          value={line.withSalaryEmployees}
          subtitle={
            line.total > 0
              ? `${Math.round((line.withSalaryEmployees / line.total) * 100)}% охват`
              : undefined
          }
          icon={<UserCheck className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
        <MetricCard
          label="Транзакционные"
          value={transactional}
          subtitle="ВУЗов"
          icon={<TrendingUp className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Охват продуктами БКО</CardTitle>
            <CardDescription>Количество ВУЗов с подключенными продуктами</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { name: "ЗП студенты", value: line.withSalaryStudents },
                  { name: "ЗП сотрудники", value: line.withSalaryEmployees },
                  { name: "ИЭ", value: line.withIE },
                  { name: "ТЭ", value: line.withTE },
                  { name: "СБП", value: line.withSBP },
                  { name: "АДМ", value: line.withADM },
                  { name: "Лимит", value: line.withLimit },
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
                <Bar
                  dataKey="value"
                  fill={CHART.positive}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Распределение продуктов БКО</CardTitle>
            <CardDescription>Процент охвата по категориям</CardDescription>
          </CardHeader>
          <CardContent>
            {line.total > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Зарплатные проекты",
                        value: line.withSalaryStudents + line.withSalaryEmployees,
                      },
                      {
                        name: "Транзакционные",
                        value: transactional,
                      },
                      {
                        name: "Другие",
                        value: Math.max(
                          0,
                          line.total -
                            (line.withSalaryStudents +
                              line.withSalaryEmployees +
                              transactional)
                        ),
                      },
                    ].filter((d) => d.value > 0)}
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
                    <Cell fill={CHART.cntrViolet} />
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
      </div>
    </div>
  );
}
