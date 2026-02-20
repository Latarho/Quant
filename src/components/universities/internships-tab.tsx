"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Plus, Search, X, Filter, Clock, Users, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInternshipStatusText, getInternshipStatusColor } from "@/lib/internships/display-utils";
import type { Internship, InternshipStatus } from "@/types/internships";

export interface InternshipsTabProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: {
    statuses: InternshipStatus[];
    universities: string[];
  };
  onFiltersChange: (filters: { statuses: InternshipStatus[]; universities: string[] }) => void;
  isFiltersDialogOpen: boolean;
  onFiltersDialogChange: (open: boolean) => void;
  filteredInternships: Internship[];
  uniqueUniversities: Array<{ id: string; name: string }>;
  selectedInternshipId: string | null;
  onCreateClick: () => void;
}

export function InternshipsTab({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  isFiltersDialogOpen,
  onFiltersDialogChange,
  filteredInternships,
  uniqueUniversities,
  selectedInternshipId,
  onCreateClick,
}: InternshipsTabProps) {
  const router = useRouter();
  const hasActiveFilters = filters.statuses.length > 0 || filters.universities.length > 0;

  return (
    <>
      {/* Поиск и фильтры */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию стажировки или вузу..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Dialog open={isFiltersDialogOpen} onOpenChange={onFiltersDialogChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {filters.statuses.length + filters.universities.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-lg">Фильтры</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Статус</Label>
                <div className="space-y-1.5">
                  {(["planned", "recruiting", "active", "completed"] as InternshipStatus[]).map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-status-${status}`}
                        checked={filters.statuses.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onFiltersChange({
                              ...filters,
                              statuses: [...filters.statuses, status],
                            });
                          } else {
                            onFiltersChange({
                              ...filters,
                              statuses: filters.statuses.filter((s) => s !== status),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`filter-status-${status}`} className="text-sm font-normal cursor-pointer">
                        {getInternshipStatusText(status)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">ВУЗ</Label>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {uniqueUniversities.map((university) => (
                    <div key={university.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-university-${university.id}`}
                        checked={filters.universities.includes(university.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onFiltersChange({
                              ...filters,
                              universities: [...filters.universities, university.id],
                            });
                          } else {
                            onFiltersChange({
                              ...filters,
                              universities: filters.universities.filter((id) => id !== university.id),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`filter-university-${university.id}`} className="text-sm font-normal cursor-pointer">
                        {university.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ statuses: [], universities: [] })}
              >
                Сбросить
              </Button>
              <Button size="sm" onClick={() => onFiltersDialogChange(false)}>
                Применить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={onCreateClick} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Добавить стажировку
        </Button>
      </div>

      {/* Канбан доска стажировок */}
      {filteredInternships.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Стажировки не найдены</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery || hasActiveFilters
                  ? "Попробуйте изменить фильтры"
                  : "Создайте первую стажировку, чтобы начать работу"}
              </p>
              {!searchQuery && !hasActiveFilters && (
                <Button onClick={onCreateClick} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить стажировку
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-4 gap-[18px] w-full">
          {[
            { status: "planned" as InternshipStatus, label: "Запланированные", icon: Clock },
            { status: "recruiting" as InternshipStatus, label: "Набор участников", icon: Users },
            { status: "active" as InternshipStatus, label: "Активные стажировки", icon: Calendar },
            { status: "completed" as InternshipStatus, label: "Завершенные", icon: CheckCircle2 },
          ].map(({ status, label, icon: Icon }) => {
            const columnInternships = filteredInternships
              .filter((i) => i.status === status)
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

            let headerBgColor = "bg-blue-100 dark:bg-blue-900";
            let headerBorderColor = "border-blue-300 dark:border-blue-700";
            let headerIconColor = "text-blue-700 dark:text-blue-200";

            if (status === "planned") {
              headerBgColor = "bg-blue-100 dark:bg-blue-900";
              headerBorderColor = "border-blue-300 dark:border-blue-700";
              headerIconColor = "text-blue-700 dark:text-blue-200";
            } else if (status === "recruiting") {
              headerBgColor = "bg-green-100 dark:bg-green-900";
              headerBorderColor = "border-green-300 dark:border-green-700";
              headerIconColor = "text-green-700 dark:text-green-200";
            } else if (status === "active") {
              headerBgColor = "bg-purple-100 dark:bg-purple-900";
              headerBorderColor = "border-purple-300 dark:border-purple-700";
              headerIconColor = "text-purple-700 dark:text-purple-200";
            } else if (status === "completed") {
              headerBgColor = "bg-gray-100 dark:bg-gray-800";
              headerBorderColor = "border-gray-300 dark:border-gray-700";
              headerIconColor = "text-gray-700 dark:text-gray-200";
            }

            return (
              <div key={status} className="flex flex-col">
                <div
                  className={cn(headerBgColor, "border-2", headerBorderColor, "rounded-lg p-4 mb-3 shadow-sm")}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", headerIconColor)} />
                    <h3 className={cn("font-bold text-base", headerIconColor)}>{label}</h3>
                    <Badge variant="secondary" className="ml-auto text-xs font-semibold px-2.5 py-0.5">
                      {columnInternships.length}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-[18px] min-h-[400px]">
                  {columnInternships.map((internship) => (
                    <Card
                      key={internship.id}
                      className={cn(
                        "transition-all hover:shadow-md h-[224px] flex flex-col overflow-hidden",
                        selectedInternshipId === internship.id && "ring-2 ring-primary"
                      )}
                    >
                      <CardHeader className="pb-2 flex-shrink-0 overflow-hidden">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <CardTitle className="text-base mb-1 line-clamp-2 leading-tight break-words">
                              {internship.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {internship.startDate.toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }).replace(/\//g, ".")}{" "}
                                  -{" "}
                                  {internship.endDate.toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }).replace(/\//g, ".")}
                                </span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <Badge
                              variant="outline"
                              className={cn(
                                getInternshipStatusColor(internship.status),
                                "text-xs px-2 py-0.5 whitespace-nowrap"
                              )}
                            >
                              {getInternshipStatusText(internship.status)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-[2px] pb-2 px-6 flex-1 flex flex-col min-h-0">
                        {internship.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words mb-3 flex-shrink-0">
                            {internship.description}
                          </p>
                        )}
                        <div className="mt-auto flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/universities/internship/${internship.id}`);
                            }}
                          >
                            Подробнее
                            <ArrowRight className="h-3.5 w-3.5 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
