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
import { Building2, GraduationCap, Handshake, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency } from "@/lib/format-utils";
import { CHART, CNTR_FORMAT_LABELS } from "@/lib/dashboard";
import type { DashboardCntrLineMetrics } from "@/lib/dashboard";
import { DashboardEmptyState } from "./dashboard-empty-state";

const CNTR_PIE_COLORS = [
  CHART.cntrViolet,
  CHART.positive,
  CHART.barAccent,
  CHART.caseGold,
] as const;

interface CntrTabProps {
  line: DashboardCntrLineMetrics;
}

export function CntrTab({ line }: CntrTabProps) {
  const formatEntries = Object.entries(line.projectsByFormat);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="ВУЗов с ЦНТР"
          value={line.universities}
          icon={<GraduationCap className="size-6 text-primary" />}
        />
        <MetricCard
          label="Проектов"
          value={line.projects}
          icon={<TrendingUp className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
        <MetricCard
          label="Инфраструктура"
          value={line.infrastructure}
          icon={<Building2 className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
        <MetricCard
          label="Финансирование"
          value={formatCurrency(line.funding)}
          icon={<Handshake className="size-6 text-primary" />}
          iconBgClassName="bg-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Топ-5 проектов по финансированию</CardTitle>
            <CardDescription>Проекты с наибольшим объемом финансирования</CardDescription>
          </CardHeader>
          <CardContent>
            {line.topProjects.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={line.topProjects.map((p) => ({
                    name: (p.projectName || "Проект").substring(0, 20),
                    funding: p.fundingAmount || 0,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar
                    dataKey="funding"
                    fill={CHART.cntrViolet}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState message="Нет данных о проектах с финансированием" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Проекты по формату поддержки</CardTitle>
            <CardDescription>Распределение проектов по форматам</CardDescription>
          </CardHeader>
          <CardContent>
            {formatEntries.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={formatEntries.map(([format, count]) => ({
                      name: CNTR_FORMAT_LABELS[format] || format,
                      value: count,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {formatEntries.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CNTR_PIE_COLORS[index % CNTR_PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState message="Нет данных о форматах поддержки" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Статистика ЦНТР</CardTitle>
            <CardDescription>Общие показатели по линии ЦНТР</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">Всего проектов</span>
                <span className="font-semibold tabular-nums">{line.projects}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">
                  Элементов инфраструктуры
                </span>
                <span className="font-semibold tabular-nums">{line.infrastructure}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">Всего финансирования</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(line.funding)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">Соглашений</span>
                <span className="font-semibold tabular-nums">{line.agreements}</span>
              </div>
              {line.projects > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-sm text-muted-foreground">
                    Средний размер проекта
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Math.round(line.funding / line.projects))}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Распределение финансирования</CardTitle>
            <CardDescription>Объем финансирования по проектам</CardDescription>
          </CardHeader>
          <CardContent>
            {line.topProjects.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={line.topProjects.map((p) => ({
                    name: (p.projectName || "Проект").substring(0, 15),
                    funding: p.fundingAmount || 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}М`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}К`;
                      return String(value);
                    }}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar
                    dataKey="funding"
                    fill={CHART.cntrViolet}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <DashboardEmptyState message="Нет данных о финансировании" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
