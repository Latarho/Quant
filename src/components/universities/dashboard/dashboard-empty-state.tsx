import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  message: string;
  className?: string;
  minHeight?: number;
}

export function DashboardEmptyState({
  message,
  className,
  minHeight = 280,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border border-dashed bg-muted/20 px-4",
        className
      )}
      style={{ minHeight }}
    >
      <p className="text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
