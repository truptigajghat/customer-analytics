import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <section
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </section>
  );
}
