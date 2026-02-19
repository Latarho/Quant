/**
 * Общий компонент для пагинации таблиц
 */

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string; // Единственное число (например, "элемент")
  itemsLabel?: string; // 2-4 (например, "элемента")
  itemsManyLabel?: string; // 5+ (например, "элементов")
  className?: string;
}

/**
 * Склонение существительных в зависимости от числа
 */
function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few;
  }
  return many;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "элемент",
  itemsLabel = "элемента",
  itemsManyLabel = "элементов",
  className,
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const label = pluralize(totalItems, itemLabel, itemsLabel, itemsManyLabel);

  if (totalPages <= 1) {
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground">
          Найдено: <span className="font-semibold text-foreground">{totalItems}</span> {label}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className || ""}`}>
      <div className="text-sm text-muted-foreground">
        Показано {startItem}–{endItem} из{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> {label}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                className="h-8 w-8"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
