import React from 'react';

interface LoadingStateProps {
  rows?: number;
  variant?: 'cards' | 'table' | 'page';
}

export function LoadingState({
  rows = 5,
  variant = 'page',
}: LoadingStateProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
          >
            <div className="h-3.5 w-28 rounded bg-[var(--bg-elevated)]" />
            <div className="mt-4 h-7 w-24 rounded bg-[var(--bg-elevated)]" />
            <div className="mt-3 h-3 w-36 rounded bg-[var(--bg-elevated)]" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 px-4 py-3">
          <div className="h-4 w-48 animate-pulse rounded bg-[var(--bg-subtle)]" />
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--bg-elevated)]" />
              <div className="h-4 w-36 animate-pulse rounded bg-[var(--bg-elevated)]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[var(--bg-elevated)]" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-[var(--bg-elevated)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
          >
            <div className="h-3.5 w-28 rounded bg-[var(--bg-elevated)]" />
            <div className="mt-4 h-7 w-24 rounded bg-[var(--bg-elevated)]" />
            <div className="mt-3 h-3 w-36 rounded bg-[var(--bg-elevated)]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />
        <div className="h-72 animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]" />
      </div>
    </div>
  );
}
