import React from 'react';
import { Info } from 'lucide-react';

interface DemoNoticeProps {
  title?: string;
  message: string;
  endpointHint?: string;
}

export function DemoNotice({
  title = 'Demo Data – Not a Live Model Prediction',
  message,
  endpointHint,
}: DemoNoticeProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2.5">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-300">
            {title}
          </p>
          <p className="text-xs text-amber-700/90 dark:text-amber-200/80">
            {message}
          </p>
        </div>
      </div>
      {endpointHint && (
        <span className="font-mono-num shrink-0 rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-300">
          {endpointHint}
        </span>
      )}
    </div>
  );
}
