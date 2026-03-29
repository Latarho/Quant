"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  subtitleClassName?: string;
  icon: React.ReactNode;
  iconBgClassName?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  subtitleClassName,
  icon,
  iconBgClassName = "bg-primary/10",
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className={cn("text-sm mt-1", subtitleClassName ?? "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn("flex size-12 items-center justify-center rounded-full", iconBgClassName)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
