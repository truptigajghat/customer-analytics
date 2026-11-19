import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
