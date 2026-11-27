import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHART_COLORS,
  RECHARTS_AXIS_TICK,
  RECHARTS_TOOLTIP_STYLE,
} from '../components/charts/chartTheme';
import { ChartCard } from '../components/common/ChartCard';
import { DemoNotice } from '../components/common/DemoNotice';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { useAsyncData } from '../hooks/useAsyncData';
import { getModelPerformance } from '../services/predictionService';
import type { ModelComparisonItem } from '../types/prediction';

export default function ModelPerformance() {
  const { data, loading, error, refetch } = useAsyncData(
    () => getModelPerformance(),
    []
  );
  const [selectedModelId, setSelectedModelId] =
    useState<ModelComparisonItem['id']>('random_forest');

  const selectedModel = useMemo(
    () => data?.models.find((m) => m.id === selectedModelId) || data?.models[0],
    [data, selectedModelId]
  );

  const toPct = (val: number) => (val <= 1.0 ? val * 100 : val);
  const toRatio = (val: number) => (val <= 1.0 ? val : val / 100);

  const comparisonBarData = useMemo(() => {
    if (!data) return [];
    const metrics: { key: keyof ModelComparisonItem; label: string }[] = [
      { key: 'accuracy', label: 'Accuracy' },
      { key: 'precision', label: 'Precision' },
      { key: 'recall', label: 'Recall' },
      { key: 'f1Score', label: 'F1 Score' },
      { key: 'rocAuc', label: 'ROC-AUC' },
    ];
    return metrics.map((m) => {
      const rf = data.models.find((x) => x.id === 'random_forest')!;
      const lr = data.models.find((x) => x.id === 'logistic_regression')!;
      const dt = data.models.find((x) => x.id === 'decision_tree')!;
      return {
        metric: m.label,
        randomForest: Number(toPct(rf[m.key] as number).toFixed(1)),
        logisticRegression: Number(toPct(lr[m.key] as number).toFixed(1)),
        decisionTree: Number(toPct(dt[m.key] as number).toFixed(1)),
      };
    });
  }, [data]);

  if (loading) return <LoadingState variant="page" />;
  if (error || !data || !selectedModel) {
    return (
      <ErrorState
        message={error || 'Unable to load model evaluation metrics.'}
        onRetry={refetch}
      />
    );
  }

  const cm = selectedModel.confusionMatrix;
  const cmTotal = cm.trueNegative + cm.falsePositive + cm.falseNegative + cm.truePositive;

  return (
    <div className="space-y-6">
      {data.isDemoData && (
        <DemoNotice
          title="Illustrative Demo Data – Not Live Trained Model Telemetry"
          message={data.disclaimer}
          endpointHint="GET /api/v1/models/performance"
        />
      )}

      {/* Model Comparison Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {data.models.map((model) => {
          const isSelected = model.id === selectedModel.id;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedModelId(model.id)}
              className={`rounded-xl border p-5 text-left transition-colors duration-150 ${
                isSelected
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/7'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    {model.name}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    {model.trainingNote}
                  </p>
                </div>
                {isSelected && (
                  <span className="rounded-md bg-[var(--accent-primary)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--accent-primary)] whitespace-nowrap">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2 border-t border-[var(--border-subtle)] pt-3 text-xs">
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)]">
                    Acc.
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {toPct(model.accuracy).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)]">
                    Prec.
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {toPct(model.precision).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)]">
                    Recall
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {toPct(model.recall).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)]">
                    F1
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {toPct(model.f1Score).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[var(--text-muted)]">
                    AUC
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--accent-primary)]">
                    {toRatio(model.rocAuc).toFixed(3)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confusion Matrix + Model Metric Comparison */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title={`Confusion Matrix · ${selectedModel.name}`}
          subtitle={
            data.isDemoData
              ? `Illustrative validation holdout matrix (${cmTotal.toLocaleString()} sample records)`
              : `Held-out test split evaluation matrix (${cmTotal.toLocaleString()} verified customers)`
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-[96px_1fr_1fr] gap-2.5 text-xs">
              <div />
              <div className="text-center font-medium text-[var(--text-secondary)]">
                Predicted: Retained
              </div>
              <div className="text-center font-medium text-[var(--text-secondary)]">
                Predicted: Churned
              </div>

              <div className="flex items-center justify-end pr-2 font-medium text-[var(--text-secondary)]">
                Actual: Retained
              </div>
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-center">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  True Negative
                </p>
                <p className="font-mono-num mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                  {cm.trueNegative}
                </p>
                <p className="font-mono-num text-[11px] text-[var(--text-muted)]">
                  {((cm.trueNegative / cmTotal) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-center">
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  False Positive
                </p>
                <p className="font-mono-num mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                  {cm.falsePositive}
                </p>
                <p className="font-mono-num text-[11px] text-[var(--text-muted)]">
                  {((cm.falsePositive / cmTotal) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="flex items-center justify-end pr-2 font-medium text-[var(--text-secondary)]">
                Actual: Churned
              </div>
              <div className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-4 text-center">
                <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                  False Negative
                </p>
                <p className="font-mono-num mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                  {cm.falseNegative}
                </p>
                <p className="font-mono-num text-[11px] text-[var(--text-muted)]">
                  {((cm.falseNegative / cmTotal) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 p-4 text-center">
                <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                  True Positive
                </p>
                <p className="font-mono-num mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                  {cm.truePositive}
                </p>
                <p className="font-mono-num text-[11px] text-[var(--text-muted)]">
                  {((cm.truePositive / cmTotal) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Model Benchmark Comparison"
          subtitle="Side-by-side placeholder percentages across all five evaluation metrics"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonBarData}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="metric" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={RECHARTS_AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  domain={[50, 100]}
                  unit="%"
                />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="randomForest"
                  name="Random Forest"
                  fill={CHART_COLORS.primary}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="logisticRegression"
                  name="Logistic Regression"
                  fill={CHART_COLORS.emerald}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="decisionTree"
                  name="Decision Tree"
                  fill={CHART_COLORS.amber}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ROC Curve + Precision-Recall Curve */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="ROC Curve (Illustrative)"
          subtitle="True Positive Rate vs. False Positive Rate across classification thresholds"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.rocCurve}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  tick={RECHARTS_AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -2, fill: 'var(--chart-axis)', fontSize: 11 }}
                />
                <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="randomForest"
                  name="Random Forest (0.884)"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2.2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="logisticRegression"
                  name="Logistic Reg. (0.847)"
                  stroke={CHART_COLORS.emerald}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="decisionTree"
                  name="Decision Tree (0.791)"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="baseline"
                  name="Random Baseline"
                  stroke={CHART_COLORS.slate}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Precision-Recall Curve (Illustrative)"
          subtitle="Precision trade-off across recall levels for churn positive class"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.precisionRecallCurve}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  tick={RECHARTS_AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Recall', position: 'insideBottom', offset: -2, fill: 'var(--chart-axis)', fontSize: 11 }}
                />
                <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="randomForest"
                  name="Random Forest"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2.2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="logisticRegression"
                  name="Logistic Regression"
                  stroke={CHART_COLORS.emerald}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="decisionTree"
                  name="Decision Tree"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
