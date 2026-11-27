import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight } from 'lucide-react';
import {
  CHART_COLORS,
  RECHARTS_AXIS_TICK,
  RECHARTS_TOOLTIP_STYLE,
} from '../components/charts/chartTheme';
import { ChartCard } from '../components/common/ChartCard';
import { DataTable, type DataTableColumn } from '../components/common/DataTable';
import { ErrorState } from '../components/common/ErrorState';
import { KpiCard } from '../components/common/KpiCard';
import { LoadingState } from '../components/common/LoadingState';
import { StatusBadge, riskToVariant } from '../components/common/StatusBadge';
import { CustomerDetailModal } from '../components/customers/CustomerDetailModal';
import { MOCK_CUSTOMERS } from '../data/mockCustomers';
import { useAppContext } from '../hooks/useAppContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { USE_DEMO_DATA } from '../services/api';
import { getDashboardOverview } from '../services/analyticsService';
import { getCustomerById, getCustomers } from '../services/customerService';
import type { CustomerActivityItem } from '../types/analytics';
import type { Customer } from '../types/customer';
import { formatCurrency } from '../utils/formatters';

export default function Overview() {
  const { dateRange, dashboardPrefs } = useAppContext();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data, loading, error, refetch } = useAsyncData(
    () => getDashboardOverview(dateRange),
    [dateRange]
  );

  const highRiskState = useAsyncData(
    () =>
      getCustomers({
        filters: { status: 'No' },
        sortBy: 'riskTier',
        sortDir: 'desc',
        pageSize: 5,
      }),
    []
  );

  const highRiskCustomers = useMemo(() => {
    if (highRiskState.data?.items && highRiskState.data.items.length > 0) {
      return highRiskState.data.items;
    }
    if (USE_DEMO_DATA) {
      return MOCK_CUSTOMERS.filter(
        (c) => c.Churn === 'No' && c.riskTier === 'High'
      ).slice(0, 5);
    }
    return [];
  }, [highRiskState.data]);

  const activityColumns: DataTableColumn<CustomerActivityItem>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">{row.customerName}</p>
          <p className="font-mono-num text-[11px] text-[var(--text-muted)]">
            {row.customerID}
          </p>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Activity Event',
      render: (row) => (
        <span className="text-[var(--text-secondary)]">{row.event}</span>
      ),
    },
    {
      key: 'contract',
      header: 'Contract',
      render: (row) => <span>{row.contract}</span>,
    },
    {
      key: 'monthlyCharges',
      header: 'MRR',
      align: 'right',
      render: (row) => (
        <span className="font-mono-num font-medium">
          {formatCurrency(row.monthlyCharges, 2)}
        </span>
      ),
    },
    {
      key: 'riskTier',
      header: 'Risk Tier',
      render: (row) => (
        <StatusBadge
          label={`${row.riskTier} Risk`}
          variant={riskToVariant(row.riskTier)}
        />
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      align: 'right',
      render: (row) => (
        <span className="font-mono-num text-[var(--text-muted)]">
          {row.timestamp}
        </span>
      ),
    },
  ];

  const openCustomerById = async (customerID: string) => {
    try {
      const found = await getCustomerById(customerID);
      if (found) setSelectedCustomer(found);
    } catch {
      if (USE_DEMO_DATA) {
        const fallback = MOCK_CUSTOMERS.find((c) => c.customerID === customerID);
        if (fallback) setSelectedCustomer(fallback);
      }
    }
  };

  if (loading) return <LoadingState variant="page" />;
  if (error || !data) {
    return (
      <ErrorState
        message={error || 'Unable to load dashboard overview.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Intro Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--text-secondary)]">
            Telecom subscriber retention overview · Sample preview dataset ({dateRange.toUpperCase()} window)
          </p>
        </div>
        <Link
          to="/prediction"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)] whitespace-nowrap shrink-0"
        >
          Inspect Churn Risk
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Primary Charts Row: Customer Growth + Monthly Churn Trend */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="Customer Growth Trajectory"
          subtitle="Total subscriber base and net new acquisitions by month"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.monthlyTrends}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={RECHARTS_AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="totalCustomers"
                  name="Total Customers"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#growthGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="activeCustomers"
                  name="Active Customers"
                  stroke={CHART_COLORS.emerald}
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Monthly Churn Rate Trend"
          subtitle="Percentage of active subscribers churning per billing cycle"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.monthlyTrends}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={RECHARTS_AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  domain={[3, 8]}
                />
                <Tooltip
                  contentStyle={RECHARTS_TOOLTIP_STYLE}
                  formatter={(value) => [`${Number(value ?? 0).toFixed(2)}%`, 'Churn Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="churnRate"
                  name="Churn Rate"
                  stroke={CHART_COLORS.rose}
                  strokeWidth={2.25}
                  dot={{ r: 3, fill: CHART_COLORS.rose }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Secondary Row: Active vs Churned BarChart + Retention Cohort Overview */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="Active vs. Churned Volume"
          subtitle="Monthly retained subscriber count alongside churned exits"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.monthlyTrends}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                <Bar
                  dataKey="newCustomers"
                  name="New Acquisitions"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="churnedCustomers"
                  name="Churned Customers"
                  fill={CHART_COLORS.rose}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Customer Retention Overview"
          subtitle="Quarterly cohort survival benchmarks (% retained at Month 1, 3, 6, 12)"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  <th className="py-2.5 pr-3 font-medium">Cohort</th>
                  <th className="py-2.5 px-3 text-right font-medium">Accounts</th>
                  <th className="py-2.5 px-3 text-right font-medium">Mo 1</th>
                  <th className="py-2.5 px-3 text-right font-medium">Mo 3</th>
                  <th className="py-2.5 px-3 text-right font-medium">Mo 6</th>
                  <th className="py-2.5 pl-3 text-right font-medium">Mo 12</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono-num">
                {data.retentionCohorts.map((row) => (
                  <tr key={row.cohort} className="hover:bg-[var(--bg-elevated)]/40">
                    <td className="py-3 pr-3 font-sans font-semibold text-[var(--text-primary)]">
                      {row.cohort}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--text-secondary)]">
                      {row.size.toLocaleString()}
                    </td>
                    {[row.month1, row.month3, row.month6, row.month12].map(
                      (val, idx) => (
                        <td key={idx} className="py-3 px-3 text-right">
                          {val > 0 ? (
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${
                                val >= 90
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : val >= 80
                                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {val.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs">
            <div>
              <p className="text-[var(--text-muted)]">Latest Monthly Retention</p>
              <p className="font-mono-num mt-0.5 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {data.monthlyTrends[data.monthlyTrends.length - 1].retentionRate.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">12-Month Cohort Benchmark</p>
              <p className="font-mono-num mt-0.5 text-lg font-semibold text-[var(--text-primary)]">
                75.8%
              </p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Section: High-Risk Customer Summary + Recent Customer Activity Table */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCard
          title="High-Risk Customer Summary"
          subtitle="Active accounts requiring retention review"
          action={
            <Link
              to="/analytics"
              className="text-xs font-medium text-[var(--accent-primary)] hover:underline whitespace-nowrap"
            >
              View Directory
            </Link>
          }
        >
          <div className="divide-y divide-[var(--border-subtle)]">
            {highRiskCustomers.map((c) => (
              <div
                key={c.customerID}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(c)}
                    className="text-left text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] truncate block"
                  >
                    {c.name}
                  </button>
                  <p className="font-mono-num text-[11px] text-[var(--text-muted)] truncate">
                    {c.customerID} · {c.tenure}m · {formatCurrency(c.MonthlyCharges, 2)}/mo
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/prediction?customerId=${encodeURIComponent(c.customerID)}`)
                  }
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] whitespace-nowrap shrink-0"
                >
                  Inspect Risk
                </button>
              </div>
            ))}
          </div>
        </ChartCard>

        <div className="xl:col-span-2">
          <ChartCard
            title="Recent Customer Activity"
            subtitle="Latest billing, support, and contract events across monitored accounts"
          >
            <DataTable
              columns={activityColumns}
              data={data.recentActivity}
              rowKey={(r) => r.id}
              onRowClick={(r) => openCustomerById(r.customerID)}
              compact={dashboardPrefs.compactTables}
            />
          </ChartCard>
        </div>
      </div>

      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
