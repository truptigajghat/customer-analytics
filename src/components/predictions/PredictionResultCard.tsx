import React, { useState } from 'react';
import { Check, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import type { ChurnPredictionResult } from '../../types/prediction';
import { formatProbability } from '../../utils/formatters';
import { DemoNotice } from '../common/DemoNotice';
import { StatusBadge, riskToVariant } from '../common/StatusBadge';

interface PredictionResultCardProps {
  result: ChurnPredictionResult;
}

export function PredictionResultCard({ result }: PredictionResultCardProps) {
  const [queuedActions, setQueuedActions] = useState<Record<string, boolean>>({});

  const probPercent = Math.round(result.churnProbability * 100);
  const barColor =
    result.riskCategory === 'High'
      ? 'bg-rose-500'
      : result.riskCategory === 'Medium'
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  const toggleAction = (id: string) => {
    setQueuedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-5">
      <DemoNotice
        title="Demo Data – Not a Live Model Prediction"
        message={result.disclaimer}
        endpointHint="POST /api/v1/predict"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Probability & Risk Indicator */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Sample Churn Probability
            </h3>
            <StatusBadge
              label={`${result.riskCategory} Risk`}
              variant={riskToVariant(result.riskCategory)}
            />
          </div>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-mono-num text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {formatProbability(result.churnProbability)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              placeholder score
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
              <span>0% Low</span>
              <span>50% Moderate</span>
              <span>100% High</span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${probPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-1.5 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-secondary)]">
            <div className="flex justify-between">
              <span>Source</span>
              <span className="font-medium text-[var(--text-primary)]">
                Sample Preview Adapter
              </span>
            </div>
            <div className="flex justify-between">
              <span>Customer ID</span>
              <span className="font-mono-num font-medium text-[var(--text-primary)]">
                {result.customerID}
              </span>
            </div>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Contributing Risk Factors (Illustrative)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Key account attributes influencing retention posture in the sample profile
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {result.contributingFactors.map((item) => {
              const increases = item.impact === 'increases_risk';
              return (
                <div
                  key={item.factor}
                  className="border-b border-[var(--border-subtle)] pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {increases ? (
                        <TrendingUp
                          className="h-4 w-4 shrink-0 text-rose-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <TrendingDown
                          className="h-4 w-4 shrink-0 text-emerald-500"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {item.factor}
                      </span>
                    </div>
                    <span
                      className={`font-mono-num text-xs font-medium ${
                        increases
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {increases ? 'Increases Risk' : 'Stabilizes'} · {item.weight}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Suggested Retention Actions */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert
            className="h-4 w-4 text-[var(--accent-primary)]"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Suggested Retention Actions
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Select playbooks to queue in your retention workflow preview
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {result.suggestedActions.map((action) => {
            const isQueued = Boolean(queuedActions[action.id]);
            return (
              <div
                key={action.id}
                className="flex flex-col justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/45 p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <StatusBadge
                      label={action.priority}
                      variant={
                        action.priority === 'Immediate'
                          ? 'danger'
                          : action.priority === 'Recommended'
                            ? 'warning'
                            : 'info'
                      }
                      showIcon={false}
                    />
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {action.estimatedImpact}
                    </span>
                  </div>
                  <h4 className="mt-2.5 text-xs font-semibold text-[var(--text-primary)]">
                    {action.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {action.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAction(action.id)}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isQueued
                      ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {isQueued && <Check className="h-3.5 w-3.5" />}
                  {isQueued ? 'Queued in Workflow' : 'Queue Action'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
