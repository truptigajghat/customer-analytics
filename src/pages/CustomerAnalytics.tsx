import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import {
  CHART_COLORS,
  RECHARTS_AXIS_TICK,
  RECHARTS_TOOLTIP_STYLE,
} from '../components/charts/chartTheme';
import { ChartCard } from '../components/common/ChartCard';
import { DataTable, type DataTableColumn } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import {
  SearchFilterBar,
  type FilterControl,
} from '../components/common/SearchFilterBar';
import { StatusBadge, riskToVariant } from '../components/common/StatusBadge';
import { CustomerDetailModal } from '../components/customers/CustomerDetailModal';
import { useAppContext } from '../hooks/useAppContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { getCustomerAnalytics } from '../services/analyticsService';
import { getCustomers } from '../services/customerService';
import type {
  Customer,
  CustomerFilters,
  CustomerSortField,
  SortDirection,
} from '../types/customer';
import { csvEscape, formatCurrency, formatNumber } from '../utils/formatters';

const DEFAULT_FILTERS: CustomerFilters = {
  search: '',
  gender: 'All',
  contract: 'All',
  paymentMethod: 'All',
  tenureRange: 'All',
  internetService: 'All',
  status: 'All',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.cyan, CHART_COLORS.emerald, CHART_COLORS.amber];

export default function CustomerAnalytics() {
  const { dashboardPrefs } = useAppContext();
  const [filters, setFilters] = useState<CustomerFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<CustomerSortField>('tenure');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [page, setPage] = useState<number>(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const hasActiveFilters = useMemo(
    () =>
      filters.search !== '' ||
      filters.gender !== 'All' ||
      filters.contract !== 'All' ||
      filters.paymentMethod !== 'All' ||
      filters.tenureRange !== 'All' ||
      filters.internetService !== 'All' ||
      filters.status !== 'All',
    [filters]
  );

  const analyticsState = useAsyncData(
    () => getCustomerAnalytics(filters),
    [filters]
  );

  const tableState = useAsyncData(
    () =>
      getCustomers({
        filters,
        sortBy,
        sortDir,
        page,
        pageSize: dashboardPrefs.rowsPerPage,
      }),
    [filters, sortBy, sortDir, page, dashboardPrefs.rowsPerPage]
  );

  const updateFilter = <K extends keyof CustomerFilters>(
    key: K,
    val: CustomerFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleSortChange = (key: string) => {
    const field = key as CustomerSortField;
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleExportCsv = () => {
    const rows = tableState.data?.items || [];
    if (rows.length === 0) return;
    const headers = [
      'CustomerID',
      'Name',
      'Gender',
      'AgeGroup',
      'TenureMonths',
      'Contract',
      'PaymentMethod',
      'InternetService',
      'MonthlyCharges',
      'TotalCharges',
      'Churn',
      'RiskTier',
    ];
    const lines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.customerID,
          r.name,
          r.gender,
          r.ageGroup,
          r.tenure,
          r.Contract,
          r.PaymentMethod,
          r.InternetService,
          r.MonthlyCharges,
          r.TotalCharges,
          r.Churn,
          r.riskTier,
        ]
          .map(csvEscape)
          .join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'churniq-customer-analytics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterControls: FilterControl[] = [
    {
      id: 'filter-gender',
      label: 'Gender',
      value: filters.gender,
      onChange: (v) => updateFilter('gender', v as CustomerFilters['gender']),
      options: [
        { label: 'All Genders', value: 'All' },
        { label: 'Female', value: 'Female' },
        { label: 'Male', value: 'Male' },
      ],
    },
    {
      id: 'filter-contract',
      label: 'Contract Type',
      value: filters.contract,
      onChange: (v) => updateFilter('contract', v as CustomerFilters['contract']),
      options: [
        { label: 'All Contracts', value: 'All' },
        { label: 'Month-to-month', value: 'Month-to-month' },
        { label: 'One year', value: 'One year' },
        { label: 'Two year', value: 'Two year' },
      ],
    },
    {
      id: 'filter-payment',
      label: 'Payment Method',
      value: filters.paymentMethod,
      onChange: (v) =>
        updateFilter('paymentMethod', v as CustomerFilters['paymentMethod']),
      options: [
        { label: 'All Methods', value: 'All' },
        { label: 'Electronic check', value: 'Electronic check' },
        { label: 'Mailed check', value: 'Mailed check' },
        { label: 'Bank transfer (automatic)', value: 'Bank transfer (automatic)' },
        { label: 'Credit card (automatic)', value: 'Credit card (automatic)' },
      ],
    },
    {
      id: 'filter-tenure',
      label: 'Tenure',
      value: filters.tenureRange,
      onChange: (v) =>
        updateFilter('tenureRange', v as CustomerFilters['tenureRange']),
      options: [
        { label: 'All Tenures', value: 'All' },
        { label: '0–12 months', value: '0-12' },
        { label: '13–24 months', value: '13-24' },
        { label: '25–48 months', value: '25-48' },
        { label: '49+ months', value: '49+' },
      ],
    },
    {
      id: 'filter-internet',
      label: 'Internet Service',
      value: filters.internetService,
      onChange: (v) =>
        updateFilter('internetService', v as CustomerFilters['internetService']),
      options: [
        { label: 'All Services', value: 'All' },
        { label: 'Fiber optic', value: 'Fiber optic' },
        { label: 'DSL', value: 'DSL' },
        { label: 'No internet', value: 'No' },
      ],
    },
    {
      id: 'filter-status',
      label: 'Customer Status',
      value: filters.status,
      onChange: (v) => updateFilter('status', v as CustomerFilters['status']),
      options: [
        { label: 'All Statuses', value: 'All' },
        { label: 'Active (Retained)', value: 'No' },
        { label: 'Churned', value: 'Yes' },
      ],
    },
  ];

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'customerID',
      header: 'Customer ID',
      sortable: true,
      render: (c) => (
        <span className="font-mono-num font-medium text-[var(--text-primary)]">
          {c.customerID}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Subscriber',
      sortable: true,
      render: (c) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">{c.name}</p>
          <p className="text-[11px] text-[var(--text-muted)]">
            {c.gender} · {c.ageGroup}
          </p>
        </div>
      ),
    },
    {
      key: 'Contract',
      header: 'Contract',
      sortable: true,
      render: (c) => <span>{c.Contract}</span>,
    },
    {
      key: 'PaymentMethod',
      header: 'Payment Method',
      render: (c) => (
        <span className="text-[var(--text-secondary)]">{c.PaymentMethod}</span>
      ),
    },
    {
      key: 'tenure',
      header: 'Tenure',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-mono-num">{c.tenure} mo</span>
      ),
    },
    {
      key: 'MonthlyCharges',
      header: 'Monthly',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-mono-num font-medium">
          {formatCurrency(c.MonthlyCharges, 2)}
        </span>
      ),
    },
    {
      key: 'TotalCharges',
      header: 'Lifetime Value',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-mono-num text-[var(--text-secondary)]">
          {formatCurrency(c.TotalCharges, 2)}
        </span>
      ),
    },
    {
      key: 'riskTier',
      header: 'Status / Risk',
      sortable: true,
      render: (c) =>
        c.Churn === 'Yes' ? (
          <StatusBadge label="Churned" variant="danger" />
        ) : (
          <StatusBadge
            label={`${c.riskTier} Risk`}
            variant={riskToVariant(c.riskTier)}
          />
        ),
    },
  ];

  const analytics = analyticsState.data;

  return (
    <div className="space-y-6">
      {/* Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Sample Directory Count
          </p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-[var(--text-primary)]">
            {analytics ? formatNumber(analytics.totalCustomers) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Matching Filtered Customers
          </p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-[var(--accent-primary)]">
            {analytics ? formatNumber(analytics.filteredCount) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Filtered Avg. Monthly Charge
          </p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-[var(--text-primary)]">
            {analytics && analytics.filteredCount > 0
              ? formatCurrency(
                  analytics.byContract.reduce(
                    (sum, b) => sum + (b.avgMonthlyCharges || 0) * b.count,
                    0
                  ) / analytics.filteredCount,
                  2
                )
              : '$0.00'}
          </p>
        </div>
      </div>

      {/* Interactive Filter Controls */}
      <SearchFilterBar
        searchValue={filters.search}
        onSearchChange={(val) => updateFilter('search', val)}
        searchPlaceholder="Search by customer ID, name, email, or segment..."
        filters={filterControls}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        rightSlot={
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!tableState.data || tableState.data.items.length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Export Page CSV
          </button>
        }
      />

      {/* Error / Loading / Charts */}
      {analyticsState.loading ? (
        <LoadingState variant="cards" rows={6} />
      ) : analyticsState.error || !analytics ? (
        <ErrorState
          message={analyticsState.error || 'Failed to compute analytics distributions.'}
          onRetry={analyticsState.refetch}
        />
      ) : analytics.filteredCount === 0 ? (
        <EmptyState
          title="No matching customer records"
          description="No sample customers match the active combination of filters. Reset filters to view all distributions."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-5">
          {/* Row 1: Gender, Age Group, Contract Type */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ChartCard
              title="Distribution by Gender"
              subtitle="Active vs. churned split across gender"
            >
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.byGender}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                    >
                      {analytics.byGender.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Distribution by Age Group"
              subtitle="Subscriber count and churned count by age bracket"
            >
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byAgeGroup}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                    <Bar dataKey="count" name="Total" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" name="Churned" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Customers by Contract Type"
              subtitle="Contract term length vs. churn volume"
            >
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byContract}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                    <Bar dataKey="count" name="Total" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" name="Churned" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Row 2: Payment Method + Tenure Distribution */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard
              title="Customers by Payment Method"
              subtitle="Total volume and churned accounts by billing settlement method"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.byPaymentMethod}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 24, bottom: 4 }}
                  >
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={145}
                      tick={RECHARTS_AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                    <Bar dataKey="count" name="Customers" fill={CHART_COLORS.cyan} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="churned" name="Churned" fill={CHART_COLORS.rose} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Customers by Tenure"
              subtitle="Account longevity distribution and churn incidence"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byTenure}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                    <Bar dataKey="count" name="Customers" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" name="Churned" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Row 3: Monthly Charges Distribution + CLV Visualization */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard
              title="Monthly Charges Distribution"
              subtitle="Customer concentration across monthly billing tiers"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byMonthlyCharges}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                    <Bar dataKey="count" name="Subscribers" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" name="Churned" fill={CHART_COLORS.rose} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Customer Lifetime Value (CLV) by Tenure"
              subtitle="Average cumulative total charges across tenure cohorts"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.clvByTenure}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="tenureBucket" tick={RECHARTS_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={RECHARTS_AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={RECHARTS_TOOLTIP_STYLE}
                      formatter={(val) => [formatCurrency(Number(val ?? 0), 0), 'Avg CLV']}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgClv"
                      name="Average CLV"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: CHART_COLORS.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Searchable, Sortable Customer Data Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Customer Directory
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Click any row to inspect full subscriber profile and service configuration
            </p>
          </div>
        </div>

        {tableState.loading ? (
          <LoadingState variant="table" rows={6} />
        ) : tableState.error || !tableState.data ? (
          <ErrorState
            message={tableState.error || 'Unable to load customer records.'}
            onRetry={tableState.refetch}
          />
        ) : tableState.data.items.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Adjust your search query or filters to inspect matching subscriber records."
            actionLabel="Clear Filters"
            onAction={resetFilters}
          />
        ) : (
          <DataTable
            columns={columns}
            data={tableState.data.items}
            rowKey={(c) => c.customerID}
            onRowClick={(c) => setSelectedCustomer(c)}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            page={tableState.data.page}
            totalPages={tableState.data.totalPages}
            totalItems={tableState.data.total}
            pageSize={tableState.data.pageSize}
            onPageChange={(nextPage) => setPage(nextPage)}
            compact={dashboardPrefs.compactTables}
          />
        )}
      </div>

      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
