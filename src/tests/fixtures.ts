import type { DashboardOverviewData, CustomerAnalyticsData, CustomerSegmentationData } from '../types/analytics';
import type { PaginatedCustomersResponse, Customer } from '../types/customer';
import type { ChurnPredictionResult, ModelPerformanceData, BusinessInsightsData } from '../types/prediction';

export const MOCK_CUSTOMER: Customer = {
  customerID: '7590-VHVEG',
  name: 'Elena Vance',
  email: 'elena.vance@example.com',
  gender: 'Female',
  SeniorCitizen: 0,
  ageGroup: '45-59',
  Partner: 'Yes',
  Dependents: 'No',
  tenure: 1,
  PhoneService: 'No',
  MultipleLines: 'No phone service',
  InternetService: 'DSL',
  OnlineSecurity: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 29.85,
  TotalCharges: 29.85,
  Churn: 'No',
  segment: 'New',
  riskTier: 'High',
  lastActive: '2026-11-20',
  supportTickets90d: 2,
};

export const FIXTURE_OVERVIEW: DashboardOverviewData = {
  dateRange: '12m',
  isDemoData: false,
  kpis: [
    {
      id: 'total-customers',
      label: 'Total Customers',
      value: '7,043',
      numericValue: 7043,
      changePercent: 5.4,
      trendDirection: 'up',
      positiveIsGood: true,
      comparisonLabel: 'vs prior year',
    },
    {
      id: 'mrr',
      label: 'Monthly Recurring Revenue',
      value: '$456,117',
      numericValue: 456117,
      changePercent: 8.1,
      trendDirection: 'up',
      positiveIsGood: true,
      comparisonLabel: 'vs prior period',
    },
  ],
  monthlyTrends: [
    {
      month: 'Nov 2026',
      totalCustomers: 7005,
      activeCustomers: 6890,
      churnedCustomers: 115,
      newCustomers: 239,
      churnRate: 1.64,
      retentionRate: 98.36,
      mrr: 446200,
    },
  ],
  retentionCohorts: [
    { cohort: '2026-Q1', size: 1420, month1: 96.5, month3: 91.2, month6: 84.5, month12: 78.2 },
  ],
  recentActivity: [
    {
      id: 'act_1',
      customerID: '7590-VHVEG',
      customerName: 'Elena Vance',
      event: 'Predicted High Churn Risk',
      category: 'risk',
      timestamp: '2026-11-20T10:30:00Z',
      contract: 'Month-to-month',
      monthlyCharges: 29.85,
      riskTier: 'High',
    },
  ],
};

export const FIXTURE_CUSTOMERS: PaginatedCustomersResponse = {
  items: [MOCK_CUSTOMER],
  total: 7043,
  page: 1,
  pageSize: 10,
  totalPages: 705,
  isDemoData: false,
};

export const FIXTURE_PREDICTION: ChurnPredictionResult = {
  customerID: '7590-VHVEG',
  customer: MOCK_CUSTOMER,
  churnProbability: 0.7588,
  riskCategory: 'High',
  modelReference: 'Random Forest Classifier (v1.0 - Scikit-Learn)',
  generatedAt: '2026-11-22T10:00:00Z',
  contributingFactors: [
    {
      factor: 'Contract Structure',
      detail: 'Month-to-month agreement increases attrition likelihood.',
      impact: 'increases_risk',
      weight: 92,
    },
  ],
  suggestedActions: [
    {
      id: 'act_loyalty',
      title: '1-Year Loyalty Contract Upgrade',
      description: 'Offer a 15% discount for 12 months.',
      priority: 'Immediate',
      estimatedImpact: 'Reduces churn likelihood by 31%',
    },
  ],
  isDemoData: false as any,
  disclaimer: 'Live Prediction generated from trained Random Forest Model on Scikit-Learn.',
};

export const FIXTURE_PERFORMANCE: ModelPerformanceData = {
  isDemoData: false as any,
  disclaimer: 'Live Model Performance computed on held-out test split.',
  models: [
    {
      id: 'random_forest',
      name: 'Random Forest Classifier',
      shortName: 'Random Forest',
      accuracy: 0.753,
      precision: 0.5229,
      recall: 0.7941,
      f1Score: 0.6306,
      rocAuc: 0.8441,
      trainingNote: 'Ensemble of 150 trees, max_depth=9',
      confusionMatrix: {
        trueNegative: 764,
        falsePositive: 271,
        falseNegative: 77,
        truePositive: 297,
      },
    },
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      shortName: 'LogReg',
      accuracy: 0.7381,
      precision: 0.5043,
      recall: 0.7834,
      f1Score: 0.6136,
      rocAuc: 0.8417,
      trainingNote: 'L2 regularization, balanced weights',
      confusionMatrix: {
        trueNegative: 747,
        falsePositive: 288,
        falseNegative: 81,
        truePositive: 293,
      },
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree',
      shortName: 'Decision Tree',
      accuracy: 0.7317,
      precision: 0.4967,
      recall: 0.8048,
      f1Score: 0.6143,
      rocAuc: 0.8299,
      trainingNote: 'Pruned depth=5',
      confusionMatrix: {
        trueNegative: 730,
        falsePositive: 305,
        falseNegative: 73,
        truePositive: 301,
      },
    },
  ],
  rocCurve: [
    { x: 0, logisticRegression: 0, decisionTree: 0, randomForest: 0, baseline: 0 },
    { x: 1, logisticRegression: 1, decisionTree: 1, randomForest: 1, baseline: 1 },
  ],
  precisionRecallCurve: [
    { x: 0, logisticRegression: 1, decisionTree: 1, randomForest: 1 },
    { x: 1, logisticRegression: 0.26, decisionTree: 0.26, randomForest: 0.26 },
  ],
};

export const FIXTURE_SEGMENTS: CustomerSegmentationData = {
  totalCustomers: 7043,
  isDemoData: false,
  segments: [
    {
      id: 'at_risk',
      name: 'At-Risk',
      description: 'Month-to-month contracts exhibiting early churn indicators.',
      customerCount: 992,
      percentOfTotal: 14.1,
      avgMonthlyCharges: 74.5,
      avgTenureMonths: 11.2,
      churnRate: 46.2,
      mrrContribution: 73904,
      recommendedPlaybook: 'Immediate 1-year contract discount',
    },
    {
      id: 'high_value',
      name: 'High-Value',
      description: 'Top quartile spenders with sustained engagement.',
      customerCount: 1420,
      percentOfTotal: 20.2,
      avgMonthlyCharges: 98.2,
      avgTenureMonths: 48.5,
      churnRate: 8.5,
      mrrContribution: 139444,
      recommendedPlaybook: 'Dedicated Executive Sponsor',
    },
  ],
};

export const FIXTURE_INSIGHTS: BusinessInsightsData = {
  isDemoData: false as any,
  totalMrrAtRisk: 86948,
  highRiskAccountsCount: 992,
  projectedAnnualSavings: 365181.6,
  avgRetentionLiftPotential: 32.5,
  keyDrivers: [
    {
      id: 'contract_m2m',
      driver: 'Month-to-Month Contracts',
      churnRateImpact: '+16.2% vs baseline',
      relativeImportance: 92,
      summary: 'Month-to-month subscribers account for 88.5% of all churn events.',
    },
  ],
  revenueAtRiskByContract: [
    { contract: 'Month-to-month', mrrAtRisk: 73904, customersAtRisk: 840 },
  ],
  opportunities: [
    {
      id: 'opp_annual_contract',
      title: 'Annual Contract Migration Campaign',
      targetSegment: 'Month-to-Month with Tenure > 6 Mo',
      revenueAtRisk: 39126,
      potentialSavedAccounts: 347,
      recommendedTactic: 'Offer a 15% discount guarantee for 12 months with price-lock assurance.',
    },
  ],
  recommendations: [
    'Prioritize month-to-month fiber optic accounts for proactive loyalty outreach within 30 days of sign-up.',
  ],
};

export const FIXTURE_ANALYTICS: CustomerAnalyticsData = {
  totalCustomers: 7043,
  filteredCount: 7043,
  isDemoData: false,
  byGender: [
    { name: 'Female', count: 3488, churned: 939, churnRate: 26.9, avgMonthlyCharges: 64.7 },
    { name: 'Male', count: 3555, churned: 930, churnRate: 26.2, avgMonthlyCharges: 64.8 },
  ],
  byAgeGroup: [
    { name: '18-29', count: 1650, churned: 410, churnRate: 24.8, avgMonthlyCharges: 61.2 },
  ],
  byContract: [
    { name: 'Month-to-month', count: 3875, churned: 1655, churnRate: 42.7, avgMonthlyCharges: 66.4 },
    { name: 'One year', count: 1473, churned: 166, churnRate: 11.3, avgMonthlyCharges: 65.0 },
    { name: 'Two year', count: 1695, churned: 48, churnRate: 2.8, avgMonthlyCharges: 60.8 },
  ],
  byPaymentMethod: [
    { name: 'Electronic check', count: 2365, churned: 1071, churnRate: 45.3, avgMonthlyCharges: 74.2 },
  ],
  byTenure: [
    { name: '0-12 mo', count: 2186, churned: 1037, churnRate: 47.4, avgMonthlyCharges: 58.2 },
  ],
  byMonthlyCharges: [
    { name: '$0-$35', count: 1850, churned: 220, churnRate: 11.9, avgMonthlyCharges: 23.4 },
  ],
  clvByTenure: [
    { tenureBucket: '0-12 mo', avgClv: 520, avgMonthlyCharges: 58.2, customerCount: 2186 },
  ],
};
