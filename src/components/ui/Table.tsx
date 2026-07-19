import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
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
}: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-graphite-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-graphite-200 bg-graphite-50/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'whitespace-nowrap px-3 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-graphite-500 sm:px-4',
                  alignClass[col.align ?? 'left'],
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
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
                  className={cn('px-3 py-3 text-graphite-700 sm:px-4', alignClass[col.align ?? 'left'], col.className)}
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
