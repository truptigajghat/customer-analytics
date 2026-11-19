import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to load data',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/5 px-6 py-10 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-500">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry Request
        </button>
      )}
    </div>
  );
}
