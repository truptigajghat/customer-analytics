import type { CustomerSegmentName, RiskTier } from './customer';

export type DateRangeOption = '30d' | '90d' | '6m' | '12m';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  changePercent: number;
  trendDirection: 'up' | 'down' | 'neutral';
  /** Whether an upward change is positive for the business (e.g. MRR up = good, Churn up = bad) */
  positiveIsGood: boolean;
  comparisonLabel: string;
}

export interface MonthlyTrendPoint {
  month: string;
  totalCustomers: number;
  activeCustomers: number;
  churnedCustomers: number;
  newCustomers: number;
  churnRate: number;
  retentionRate: number;
  mrr: number;
}

export interface CustomerActivityItem {
  id: string;
  customerID: string;
  customerName: string;
  event: string;
  category: 'billing' | 'support' | 'contract' | 'risk' | 'onboarding';
  timestamp: string;
  contract: string;
  monthlyCharges: number;
  riskTier: RiskTier;
}

export interface CohortRetentionRow {
  cohort: string;
  size: number;
  month1: number;
  month3: number;
  month6: number;
  month12: number;
}

export interface DashboardOverviewData {
  dateRange: DateRangeOption;
  kpis: KpiMetric[];
  monthlyTrends: MonthlyTrendPoint[];
  retentionCohorts: CohortRetentionRow[];
  recentActivity: CustomerActivityItem[];
  isDemoData: boolean;
}

export interface DistributionBucket {
  name: string;
  count: number;
  churned: number;
  churnRate: number;
  avgMonthlyCharges?: number;
}

export interface ClvPoint {
  tenureBucket: string;
  avgClv: number;
  avgMonthlyCharges: number;
  customerCount: number;
}

export interface CustomerAnalyticsData {
  totalCustomers: number;
  filteredCount: number;
  byGender: DistributionBucket[];
  byAgeGroup: DistributionBucket[];
  byContract: DistributionBucket[];
  byPaymentMethod: DistributionBucket[];
  byTenure: DistributionBucket[];
  byMonthlyCharges: DistributionBucket[];
  clvByTenure: ClvPoint[];
  isDemoData: boolean;
}

export interface SegmentMetric {
  id: string;
  name: CustomerSegmentName;
  description: string;
  customerCount: number;
  percentOfTotal: number;
  avgMonthlyCharges: number;
  avgTenureMonths: number;
  churnRate: number;
  mrrContribution: number;
  recommendedPlaybook: string;
}

export interface CustomerSegmentationData {
  totalCustomers: number;
  segments: SegmentMetric[];
  isDemoData: boolean;
}
