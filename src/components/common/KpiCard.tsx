import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { KpiMetric } from '../../types/analytics';

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  const isUp = metric.trendDirection === 'up';
  const isNeutral = metric.trendDirection === 'neutral';

  const isFavorable = isNeutral
    ? null
    : metric.positiveIsGood
      ? isUp
      : !isUp;

  const trendColor =
    isFavorable === null
      ? 'text-[var(--text-secondary)]'
      : isFavorable
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-rose-600 dark:text-rose-400';

  const TrendIcon = isNeutral
    ? Minus
    : isUp
      ? ArrowUpRight
      : ArrowDownRight;

  const formattedDelta = `${metric.changePercent > 0 ? '+' : ''}${metric.changePercent}%`;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-colors duration-150 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-[var(--text-secondary)]">
          {metric.label}
        </p>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-3">
        <p className="font-mono-num text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {metric.value}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        <span className={`inline-flex items-center gap-0.5 font-mono-num font-medium ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formattedDelta}
        </span>
        <span className="text-[var(--text-muted)] truncate">
          {metric.comparisonLabel}
        </span>
      </div>
    </div>
  );
}
