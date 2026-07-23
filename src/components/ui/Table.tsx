import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SortDir } from '@/types';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  sortField?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  sortBy?: string;
  sortDir?: SortDir;
  onSortChange?: (field: string) => void;
}

const alignClass: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function Table<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  emptyMessage = 'No records found.',
  sortBy,
  sortDir,
  onSortChange,
}: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-graphite-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-graphite-200 bg-graphite-50/60">
            {columns.map((col) => {
              const isSortable = !!col.sortField && !!onSortChange;
              const isActive = isSortable && sortBy === col.sortField;
              return (
                <th
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-graphite-500',
                    alignClass[col.align ?? 'left'],
                    col.className,
                  )}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange!(col.sortField!)}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1 hover:text-graphite-800',
                        isActive && 'text-graphite-800',
                      )}
                    >
                      {col.header}
                      {isActive ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 text-graphite-300" strokeWidth={2} />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-graphite-100 last:border-0',
                onRowClick && 'cursor-pointer hover:bg-graphite-50',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 text-graphite-700', alignClass[col.align ?? 'left'], col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
