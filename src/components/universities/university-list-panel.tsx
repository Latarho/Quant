"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCooperationLineBadgeColor } from "@/lib/badge-colors";
import { getCooperationLineLabel } from "@/lib/universities/constants";
import type { University } from "@/types/universities";

export interface UniversityListPanelProps {
  universities: University[];
  selectedUniversityId: string | null;
  onSelectUniversity: (id: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: () => void;
}

function CooperationLineBadges({ university }: { university: University }) {
  const hasLines =
    (university.cooperationLines && university.cooperationLines.length > 0) || !!university.cooperationLine;
  if (!hasLines) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {university.cooperationLines && university.cooperationLines.length > 0 &&
        university.cooperationLines.map((record, idx) => (
          <Badge
            key={record.id || idx}
            variant="outline"
            className={`text-xs ${getCooperationLineBadgeColor(record.line)}`}
          >
            {getCooperationLineLabel(record.line)}
          </Badge>
        ))}
      {(!university.cooperationLines || university.cooperationLines.length === 0) && university.cooperationLine &&
        (Array.isArray(university.cooperationLine) ? (
          university.cooperationLine.map((line, idx) => (
            <Badge key={idx} variant="outline" className={`text-xs ${getCooperationLineBadgeColor(line)}`}>
              {getCooperationLineLabel(line)}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className={`text-xs ${getCooperationLineBadgeColor(university.cooperationLine)}`}>
            {getCooperationLineLabel(university.cooperationLine)}
          </Badge>
        ))}
    </div>
  );
}

export function UniversityListPanel({
  universities,
  selectedUniversityId,
  onSelectUniversity,
  sortOrder,
  onSortOrderChange,
}: UniversityListPanelProps) {
  return (
    <div className="w-[20rem] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-full">
      <div className="p-2 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">ВУЗы</h3>
            <Badge variant="secondary" className="text-xs">
              {universities.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onSortOrderChange}
            title={sortOrder === "asc" ? "Сортировать по убыванию" : "Сортировать по возрастанию"}
          >
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="space-y-1 p-2">
          {universities.map((university) => {
            const hasActiveLine =
              university.cooperationLines?.some((cl) => cl.isActive !== false) ||
              university.branchCurators?.some((curator) =>
                curator.cooperationLines?.some((cl) => cl.isActive !== false)
              );

            return (
              <div key={university.id} className="space-y-1">
                <div
                  className={cn(
                    "p-2 rounded-md cursor-pointer transition-colors flex items-start gap-2",
                    selectedUniversityId === university.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => onSelectUniversity(university.id)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "mt-1.5 shrink-0 h-2 w-2 rounded-full",
                          hasActiveLine ? "bg-green-500 dark:bg-green-400" : "bg-muted-foreground/40"
                        )}
                        aria-hidden
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{hasActiveLine ? "Активная работа с ВУЗом" : "Неактивная работа с ВУЗом"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm break-words">{university.name}</div>
                    {(university.shortName ||
                      university.cooperationLines?.length ||
                      university.cooperationLine) && (
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {university.shortName && (
                          <div className="text-xs text-muted-foreground">{university.shortName}</div>
                        )}
                        <CooperationLineBadges university={university} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
