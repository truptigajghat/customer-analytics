import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SortDirection } from '../../types/customer';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  sortKey?: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortDir?: SortDirection;
  onSortChange?: (sortKey: string) => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  compact?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  sortBy,
  sortDir,
  onSortChange,
  page = 1,
  totalPages = 1,
  totalItems,
  pageSize,
  onPageChange,
  compact = false,
}: DataTableProps<T>) {
  const rowPad = compact ? 'py-2' : 'py-2.5';

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/70">
              {columns.map((col) => {
                const activeSortKey = col.sortKey || col.key;
                const isSorted = sortBy === activeSortKey;
                const alignClass =
                  col.align === 'right' ? 'text-right' : 'text-left';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 font-medium text-[var(--text-secondary)] whitespace-nowrap ${alignClass} ${col.className || ''}`}
                  >
                    {col.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(activeSortKey)}
                        className={`inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors ${
                          col.align === 'right' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-45" />
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

          <tbody className="divide-y divide-[var(--border-subtle)]">
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors duration-100 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-[var(--bg-elevated)]/65'
                    : 'hover:bg-[var(--bg-elevated)]/40'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 ${rowPad} text-[var(--text-primary)] whitespace-nowrap ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-4 py-3 text-xs text-[var(--text-secondary)]">
          <div className="tabular-nums">
            {totalItems !== undefined && pageSize !== undefined ? (
              <span>
                Showing{' '}
                <strong className="font-medium text-[var(--text-primary)]">
                  {Math.min((page - 1) * pageSize + 1, totalItems)}
                </strong>
                –
                <strong className="font-medium text-[var(--text-primary)]">
                  {Math.min(page * pageSize, totalItems)}
                </strong>{' '}
                of{' '}
                <strong className="font-medium text-[var(--text-primary)]">
                  {totalItems}
                </strong>{' '}
                records
              </span>
            ) : (
              <span>
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="font-mono-num px-2 text-xs text-[var(--text-secondary)]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
