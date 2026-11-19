import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  showIcon?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success:
    'text-emerald-700 bg-emerald-500/10 border-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  warning:
    'text-amber-700 bg-amber-500/10 border-amber-500/25 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  danger:
    'text-rose-700 bg-rose-500/10 border-rose-500/25 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
  info:
    'text-blue-700 bg-blue-500/10 border-blue-500/25 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20',
  neutral:
    'text-slate-700 bg-slate-500/10 border-slate-500/20 dark:text-slate-300 dark:bg-slate-400/10 dark:border-slate-400/20',
};

export function StatusBadge({
  label,
  variant = 'neutral',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const Icon =
    variant === 'success'
      ? CheckCircle2
      : variant === 'warning'
        ? AlertTriangle
        : variant === 'danger'
          ? XCircle
          : Info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
}

export function riskToVariant(risk: 'Low' | 'Medium' | 'High'): StatusVariant {
  if (risk === 'High') return 'danger';
  if (risk === 'Medium') return 'warning';
  return 'success';
}
