import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { StatusBadge } from '../components/common/StatusBadge';
import { MOCK_CUSTOMERS } from '../data/mockCustomers';
import { useAsyncData } from '../hooks/useAsyncData';
import { getCustomerSegments } from '../services/analyticsService';
import { getCustomers } from '../services/customerService';
import { USE_DEMO_DATA } from '../services/api';
import type { SegmentMetric } from '../types/analytics';
import { formatCurrency, formatNumber } from '../utils/formatters';

const SEGMENT_BAR_COLORS: Record<string, string> = {
  'High-Value': CHART_COLORS.emerald,
  Loyal: CHART_COLORS.primary,
  New: CHART_COLORS.cyan,
  'Price-Sensitive': CHART_COLORS.amber,
  'At-Risk': '#f97316',
  Lost: CHART_COLORS.rose,
};

export default function Segmentation() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsyncData(
    () => getCustomerSegments(),
    []
  );
  const [selectedSegmentName, setSelectedSegmentName] = useState<string>('At-Risk');

  const selectedSegment: SegmentMetric | undefined = useMemo(
    () => data?.segments.find((s) => s.name === selectedSegmentName) || data?.segments[0],
    [data, selectedSegmentName]
  );

  const membersState = useAsyncData(
    () => getCustomers({ filters: { search: selectedSegmentName }, pageSize: 6 }),
    [selectedSegmentName]
  );

  const sampleMembers = useMemo(() => {
    if (membersState.data?.items && membersState.data.items.length > 0) {
      return membersState.data.items;
    }
    if (USE_DEMO_DATA) {
      return MOCK_CUSTOMERS.filter((c) => c.segment === selectedSegmentName);
    }
    return [];
  }, [membersState.data, selectedSegmentName]);

  if (loading) return <LoadingState variant="page" />;
  if (error || !data) {
    return (
      <ErrorState
        message={error || 'Unable to load customer segmentation data.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--text-secondary)]">
          Six behavioral & value segments across{' '}
          <span className="font-mono-num font-semibold text-[var(--text-primary)]">
            {formatNumber(data.totalCustomers)}
          </span>{' '}
          total accounts · Click any segment card to inspect members and playbook
        </p>
      </div>

      {/* 6 Segment Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.segments.map((seg) => {
          const isSelected = seg.name === selectedSegmentName;
          const riskVariant =
            seg.churnRate >= 30
              ? 'danger'
              : seg.churnRate >= 12
                ? 'warning'
                : 'success';

          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => setSelectedSegmentName(seg.name)}
              className={`rounded-xl border p-5 text-left transition-colors duration-150 ${
                isSelected
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/6'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {seg.name} Customers
                  </h3>
                  <p className="font-mono-num mt-0.5 text-xs text-[var(--text-secondary)]">
                    {formatNumber(seg.customerCount)} accounts · {seg.percentOfTotal.toFixed(1)}% of base
                  </p>
                </div>
                <StatusBadge
                  label={`${seg.churnRate.toFixed(1)}% Churn`}
                  variant={riskVariant}
                  showIcon={false}
                />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                {seg.description}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3 text-xs">
                <div>
                  <span className="block text-[11px] text-[var(--text-muted)]">
                    Avg Monthly
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {formatCurrency(seg.avgMonthlyCharges, 2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-[var(--text-muted)]">
                    Avg Tenure
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {seg.avgTenureMonths.toFixed(1)} mo
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-[var(--text-muted)]">
                    MRR Share
                  </span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">
                    {formatCurrency(seg.mrrContribution)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Segment Comparison Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="Customer Distribution by Segment"
          subtitle="Account volume across behavioral and lifecycle cohorts"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.segments}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                <Bar dataKey="customerCount" name="Customers" radius={[4, 4, 0, 0]}>
                  {data.segments.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={SEGMENT_BAR_COLORS[entry.name] || CHART_COLORS.primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Segment Churn Rate & Average Monthly Spend"
          subtitle="Comparing churn percentage against ARPU across segments"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.segments}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                <Bar
                  dataKey="avgMonthlyCharges"
                  name="Avg Monthly ($)"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="churnRate"
                  name="Churn Rate (%)"
                  fill={CHART_COLORS.rose}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Selected Segment Playbook & Sample Members */}
      {selectedSegment && (
        <ChartCard
          title={`${selectedSegment.name} Segment Playbook & Sample Accounts`}
          subtitle={selectedSegment.recommendedPlaybook}
        >
          <div className="divide-y divide-[var(--border-subtle)]">
            {sampleMembers.map((c) => (
              <div
                key={c.customerID}
                className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 text-xs"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {c.name}{' '}
                    <span className="font-mono-num font-normal text-[var(--text-muted)]">
                      · {c.customerID}
                    </span>
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    {c.Contract} · {c.InternetService} · {c.PaymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono-num">
                    <p className="font-medium text-[var(--text-primary)]">
                      {formatCurrency(c.MonthlyCharges, 2)}/mo
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {c.tenure} mo tenure
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/prediction?customerId=${encodeURIComponent(c.customerID)}`)
                    }
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] whitespace-nowrap"
                  >
                    Open Prediction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
