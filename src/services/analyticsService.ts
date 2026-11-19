import {
  MOCK_BUSINESS_INSIGHTS,
  MOCK_MONTHLY_TRENDS,
  MOCK_RECENT_ACTIVITY,
  MOCK_RETENTION_COHORTS,
  MOCK_SEGMENTS,
} from '../data/mockAnalytics';
import { MOCK_CUSTOMERS } from '../data/mockCustomers';
import type {
  ClvPoint,
  CustomerAnalyticsData,
  CustomerSegmentationData,
  DashboardOverviewData,
  DateRangeOption,
  DistributionBucket,
} from '../types/analytics';
import type { Customer, CustomerFilters } from '../types/customer';
import type { BusinessInsightsData } from '../types/prediction';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { USE_DEMO_DATA, apiRequest, runDemoDelay } from './api';
import { filterCustomerList } from './customerService';

/**
 * Expected FastAPI Endpoint: GET /api/v1/analytics/overview?range={dateRange}
 */
export async function getDashboardOverview(
  dateRange: DateRangeOption = '12m'
): Promise<DashboardOverviewData> {
  if (!USE_DEMO_DATA) {
    return apiRequest<DashboardOverviewData>(
      `/api/v1/analytics/overview?range=${dateRange}`
    );
  }

  await runDemoDelay('/api/v1/analytics/overview');

  const sliceCount =
    dateRange === '30d' ? 2 : dateRange === '90d' ? 3 : dateRange === '6m' ? 6 : 12;
  const trends = MOCK_MONTHLY_TRENDS.slice(-sliceCount);
  const latest = trends[trends.length - 1];
  const prev = trends[0];

  const churnedSum = trends.reduce((sum, m) => sum + m.churnedCustomers, 0);
  const avgChurnRate =
    trends.reduce((sum, m) => sum + m.churnRate, 0) / trends.length;
  const customerGrowthPct =
    ((latest.totalCustomers - prev.totalCustomers) / prev.totalCustomers) * 100;
  const activeGrowthPct =
    ((latest.activeCustomers - prev.activeCustomers) / prev.activeCustomers) * 100;
  const mrrGrowthPct = ((latest.mrr - prev.mrr) / prev.mrr) * 100;
  const churnDelta = latest.churnRate - prev.churnRate;

  const rangeLabel =
    dateRange === '30d'
      ? 'vs prior 30d'
      : dateRange === '90d'
        ? 'vs 90d start'
        : dateRange === '6m'
          ? 'vs 6m start'
          : 'vs 12m start';

  const atRiskCount = Math.round(latest.activeCustomers * 0.167);

  return {
    dateRange,
    isDemoData: true,
    monthlyTrends: trends,
    retentionCohorts: MOCK_RETENTION_COHORTS,
    recentActivity: MOCK_RECENT_ACTIVITY,
    kpis: [
      {
        id: 'total-customers',
        label: 'Total Customers',
        value: formatNumber(latest.totalCustomers),
        numericValue: latest.totalCustomers,
        changePercent: Number(customerGrowthPct.toFixed(1)),
        trendDirection: customerGrowthPct >= 0 ? 'up' : 'down',
        positiveIsGood: true,
        comparisonLabel: rangeLabel,
      },
      {
        id: 'active-customers',
        label: 'Active Customers',
        value: formatNumber(latest.activeCustomers),
        numericValue: latest.activeCustomers,
        changePercent: Number(activeGrowthPct.toFixed(1)),
        trendDirection: activeGrowthPct >= 0 ? 'up' : 'down',
        positiveIsGood: true,
        comparisonLabel: rangeLabel,
      },
      {
        id: 'churned-customers',
        label: 'Churned (Period)',
        value: formatNumber(churnedSum),
        numericValue: churnedSum,
        changePercent: -6.4,
        trendDirection: 'down',
        positiveIsGood: false,
        comparisonLabel: rangeLabel,
      },
      {
        id: 'overall-churn-rate',
        label: 'Overall Churn Rate',
        value: `${avgChurnRate.toFixed(2)}%`,
        numericValue: avgChurnRate,
        changePercent: Number(churnDelta.toFixed(2)),
        trendDirection: churnDelta <= 0 ? 'down' : 'up',
        positiveIsGood: false,
        comparisonLabel: rangeLabel,
      },
      {
        id: 'mrr',
        label: 'Monthly Recurring Revenue',
        value: formatCurrency(latest.mrr),
        numericValue: latest.mrr,
        changePercent: Number(mrrGrowthPct.toFixed(1)),
        trendDirection: mrrGrowthPct >= 0 ? 'up' : 'down',
        positiveIsGood: true,
        comparisonLabel: rangeLabel,
      },
      {
        id: 'at-risk',
        label: 'Customers at Risk',
        value: formatNumber(atRiskCount),
        numericValue: atRiskCount,
        changePercent: -4.2,
        trendDirection: 'down',
        positiveIsGood: false,
        comparisonLabel: '16.7% of active base',
      },
    ],
  };
}

function buildBuckets(
  customers: Customer[],
  groups: string[],
  accessor: (c: Customer) => string
): DistributionBucket[] {
  return groups.map((group) => {
    const matches = customers.filter((c) => accessor(c) === group);
    const churned = matches.filter((c) => c.Churn === 'Yes').length;
    const count = matches.length;
    const avgMonthlyCharges =
      count > 0
        ? Number(
            (matches.reduce((s, m) => s + m.MonthlyCharges, 0) / count).toFixed(2)
          )
        : 0;
    return {
      name: group,
      count,
      churned,
      churnRate: count > 0 ? Number(((churned / count) * 100).toFixed(1)) : 0,
      avgMonthlyCharges,
    };
  });
}

/**
 * Expected FastAPI Endpoint: GET /api/v1/analytics/customers
 */
export async function getCustomerAnalytics(
  filters: Partial<CustomerFilters> = {}
): Promise<CustomerAnalyticsData> {
  if (!USE_DEMO_DATA) {
    return apiRequest<CustomerAnalyticsData>('/api/v1/analytics/customers');
  }

  await runDemoDelay('/api/v1/analytics/customers');

  const filtered = filterCustomerList(MOCK_CUSTOMERS, filters);

  const tenureGroups = ['0-12 mo', '13-24 mo', '25-48 mo', '49+ mo'];
  const getTenureGroup = (c: Customer) => {
    if (c.tenure <= 12) return '0-12 mo';
    if (c.tenure <= 24) return '13-24 mo';
    if (c.tenure <= 48) return '25-48 mo';
    return '49+ mo';
  };

  const chargeGroups = ['$0-$35', '$36-$70', '$71-$95', '$96+'];
  const getChargeGroup = (c: Customer) => {
    if (c.MonthlyCharges <= 35) return '$0-$35';
    if (c.MonthlyCharges <= 70) return '$36-$70';
    if (c.MonthlyCharges <= 95) return '$71-$95';
    return '$96+';
  };

  const clvByTenure: ClvPoint[] = tenureGroups.map((bucket) => {
    const matches = filtered.filter((c) => getTenureGroup(c) === bucket);
    const count = matches.length;
    return {
      tenureBucket: bucket,
      customerCount: count,
      avgClv:
        count > 0
          ? Math.round(matches.reduce((s, c) => s + c.TotalCharges, 0) / count)
          : 0,
      avgMonthlyCharges:
        count > 0
          ? Number(
              (matches.reduce((s, c) => s + c.MonthlyCharges, 0) / count).toFixed(2)
            )
          : 0,
    };
  });

  return {
    totalCustomers: MOCK_CUSTOMERS.length,
    filteredCount: filtered.length,
    isDemoData: true,
    byGender: buildBuckets(filtered, ['Female', 'Male'], (c) => c.gender),
    byAgeGroup: buildBuckets(
      filtered,
      ['18-29', '30-44', '45-59', '60+'],
      (c) => c.ageGroup
    ),
    byContract: buildBuckets(
      filtered,
      ['Month-to-month', 'One year', 'Two year'],
      (c) => c.Contract
    ),
    byPaymentMethod: buildBuckets(
      filtered,
      [
        'Electronic check',
        'Mailed check',
        'Bank transfer (automatic)',
        'Credit card (automatic)',
      ],
      (c) => c.PaymentMethod
    ),
    byTenure: buildBuckets(filtered, tenureGroups, getTenureGroup),
    byMonthlyCharges: buildBuckets(filtered, chargeGroups, getChargeGroup),
    clvByTenure,
  };
}

/**
 * Expected FastAPI Endpoint: GET /api/v1/analytics/segments
 */
export async function getCustomerSegments(): Promise<CustomerSegmentationData> {
  if (!USE_DEMO_DATA) {
    return apiRequest<CustomerSegmentationData>('/api/v1/analytics/segments');
  }

  await runDemoDelay('/api/v1/analytics/segments');

  return {
    totalCustomers: 7142,
    segments: MOCK_SEGMENTS,
    isDemoData: true,
  };
}

/**
 * Expected FastAPI Endpoint: GET /api/v1/insights
 */
export async function getBusinessInsights(): Promise<BusinessInsightsData> {
  if (!USE_DEMO_DATA) {
    return apiRequest<BusinessInsightsData>('/api/v1/insights');
  }

  await runDemoDelay('/api/v1/insights');

  return MOCK_BUSINESS_INSIGHTS;
}
