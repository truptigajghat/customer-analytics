import type {
  CohortRetentionRow,
  CustomerActivityItem,
  MonthlyTrendPoint,
  SegmentMetric,
} from '../types/analytics';
import type {
  BusinessInsightsData,
  ModelPerformanceData,
} from '../types/prediction';

export const MOCK_MONTHLY_TRENDS: MonthlyTrendPoint[] = [
  { month: 'Dec 25', totalCustomers: 6420, activeCustomers: 5980, churnedCustomers: 440, newCustomers: 310, churnRate: 6.85, retentionRate: 93.15, mrr: 412800 },
  { month: 'Jan 26', totalCustomers: 6540, activeCustomers: 6110, churnedCustomers: 430, newCustomers: 345, churnRate: 6.57, retentionRate: 93.43, mrr: 423500 },
  { month: 'Feb 26', totalCustomers: 6615, activeCustomers: 6205, churnedCustomers: 410, newCustomers: 295, churnRate: 6.20, retentionRate: 93.80, mrr: 431200 },
  { month: 'Mar 26', totalCustomers: 6710, activeCustomers: 6320, churnedCustomers: 390, newCustomers: 330, churnRate: 5.81, retentionRate: 94.19, mrr: 442900 },
  { month: 'Apr 26', totalCustomers: 6790, activeCustomers: 6415, churnedCustomers: 375, newCustomers: 315, churnRate: 5.52, retentionRate: 94.48, mrr: 451400 },
  { month: 'May 26', totalCustomers: 6865, activeCustomers: 6490, churnedCustomers: 375, newCustomers: 340, churnRate: 5.46, retentionRate: 94.54, mrr: 458700 },
  { month: 'Jun 26', totalCustomers: 6910, activeCustomers: 6505, churnedCustomers: 405, newCustomers: 325, churnRate: 5.86, retentionRate: 94.14, mrr: 461900 },
  { month: 'Jul 26', totalCustomers: 6955, activeCustomers: 6530, churnedCustomers: 425, newCustomers: 360, churnRate: 6.11, retentionRate: 93.89, mrr: 465300 },
  { month: 'Aug 26', totalCustomers: 7005, activeCustomers: 6595, churnedCustomers: 410, newCustomers: 350, churnRate: 5.85, retentionRate: 94.15, mrr: 471800 },
  { month: 'Sep 26', totalCustomers: 7045, activeCustomers: 6665, churnedCustomers: 380, newCustomers: 345, churnRate: 5.39, retentionRate: 94.61, mrr: 478400 },
  { month: 'Oct 26', totalCustomers: 7090, activeCustomers: 6735, churnedCustomers: 355, newCustomers: 370, churnRate: 5.01, retentionRate: 94.99, mrr: 486900 },
  { month: 'Nov 26', totalCustomers: 7142, activeCustomers: 6812, churnedCustomers: 330, newCustomers: 382, churnRate: 4.62, retentionRate: 95.38, mrr: 494620 },
];

export const MOCK_RETENTION_COHORTS: CohortRetentionRow[] = [
  { cohort: 'Q4 2025', size: 1120, month1: 94.2, month3: 86.5, month6: 79.8, month12: 72.4 },
  { cohort: 'Q1 2026', size: 1245, month1: 95.1, month3: 88.2, month6: 82.1, month12: 75.8 },
  { cohort: 'Q2 2026', size: 1190, month1: 95.8, month3: 89.4, month6: 84.3, month12: 0 },
  { cohort: 'Q3 2026', size: 1310, month1: 96.4, month3: 90.7, month6: 0, month12: 0 },
];

export const MOCK_RECENT_ACTIVITY: CustomerActivityItem[] = [
  {
    id: 'act-101',
    customerID: 'CUST-7590',
    customerName: 'Elena Vance',
    event: '4th support ticket opened within 30 days',
    category: 'support',
    timestamp: '2026-11-17 09:42',
    contract: 'Month-to-month',
    monthlyCharges: 94.85,
    riskTier: 'High',
  },
  {
    id: 'act-102',
    customerID: 'CUST-9305',
    customerName: 'Arthur Pendelton',
    event: 'Electronic check payment retry triggered',
    category: 'billing',
    timestamp: '2026-11-17 08:15',
    contract: 'Month-to-month',
    monthlyCharges: 99.65,
    riskTier: 'High',
  },
  {
    id: 'act-103',
    customerID: 'CUST-1452',
    customerName: 'Sophia Chen',
    event: 'Renewed Two-Year Fiber + Security bundle',
    category: 'contract',
    timestamp: '2026-11-16 17:30',
    contract: 'Two year',
    monthlyCharges: 113.25,
    riskTier: 'Low',
  },
  {
    id: 'act-104',
    customerID: 'CUST-4183',
    customerName: 'Maya Patel',
    event: 'Account flagged for high-usage billing spike',
    category: 'risk',
    timestamp: '2026-11-16 15:18',
    contract: 'Month-to-month',
    monthlyCharges: 90.05,
    riskTier: 'High',
  },
  {
    id: 'act-105',
    customerID: 'CUST-5129',
    customerName: 'Julian Brooks',
    event: 'Requested annual plan upgrade quote',
    category: 'contract',
    timestamp: '2026-11-16 11:05',
    contract: 'One year',
    monthlyCharges: 105.5,
    riskTier: 'Medium',
  },
  {
    id: 'act-106',
    customerID: 'CUST-4929',
    customerName: 'Sebastian Cruz',
    event: 'Early-tenure Fiber service outage reported',
    category: 'support',
    timestamp: '2026-11-15 16:40',
    contract: 'Month-to-month',
    monthlyCharges: 95.5,
    riskTier: 'High',
  },
  {
    id: 'act-107',
    customerID: 'CUST-8869',
    customerName: 'Mila Novak',
    event: 'Completed 90-day onboarding security setup',
    category: 'onboarding',
    timestamp: '2026-11-15 10:22',
    contract: 'Month-to-month',
    monthlyCharges: 49.4,
    riskTier: 'Medium',
  },
];

export const MOCK_SEGMENTS: SegmentMetric[] = [
  {
    id: 'seg-high-value',
    name: 'High-Value',
    description: 'Long-tenure subscribers on multi-service Fiber bundles with top-quartile ARPU.',
    customerCount: 1428,
    percentOfTotal: 20.0,
    avgMonthlyCharges: 104.8,
    avgTenureMonths: 56.4,
    churnRate: 3.1,
    mrrContribution: 149654,
    recommendedPlaybook: 'Executive account reviews, priority SLA routing, and loyalty renewal perks.',
  },
  {
    id: 'seg-loyal',
    name: 'Loyal',
    description: 'Consistent 24+ month tenure customers on annual or two-year agreements with low support friction.',
    customerCount: 1998,
    percentOfTotal: 28.0,
    avgMonthlyCharges: 64.2,
    avgTenureMonths: 48.9,
    churnRate: 4.5,
    mrrContribution: 128271,
    recommendedPlaybook: 'Cross-sell Online Security and Backup add-ons with bundled discounts.',
  },
  {
    id: 'seg-new',
    name: 'New',
    description: 'Recently onboarded customers under 6 months tenure establishing service habits.',
    customerCount: 1071,
    percentOfTotal: 15.0,
    avgMonthlyCharges: 52.4,
    avgTenureMonths: 3.8,
    churnRate: 18.4,
    mrrContribution: 56120,
    recommendedPlaybook: 'Guided 30/60/90-day onboarding check-ins and autopay activation credits.',
  },
  {
    id: 'seg-price-sensitive',
    name: 'Price-Sensitive',
    description: 'Value-focused DSL and voice-only customers sensitive to promotional roll-offs.',
    customerCount: 928,
    percentOfTotal: 13.0,
    avgMonthlyCharges: 38.6,
    avgTenureMonths: 21.2,
    churnRate: 14.2,
    mrrContribution: 35820,
    recommendedPlaybook: 'Transparent rate-lock guarantees and right-sized tier recommendations.',
  },
  {
    id: 'seg-at-risk',
    name: 'At-Risk',
    description: 'Active accounts with month-to-month billing, elevated monthly charges, or repeat support tickets.',
    customerCount: 1142,
    percentOfTotal: 16.0,
    avgMonthlyCharges: 91.5,
    avgTenureMonths: 14.6,
    churnRate: 34.8,
    mrrContribution: 104493,
    recommendedPlaybook: 'Immediate retention intervention: 1-year contract credit and dedicated tech resolution.',
  },
  {
    id: 'seg-lost',
    name: 'Lost',
    description: 'Recently churned accounts analyzed for post-exit pattern attribution and win-back eligibility.',
    customerCount: 575,
    percentOfTotal: 8.0,
    avgMonthlyCharges: 72.1,
    avgTenureMonths: 11.3,
    churnRate: 100.0,
    mrrContribution: 0,
    recommendedPlaybook: '60-day targeted win-back campaign addressing root exit trigger (pricing or service quality).',
  },
];

export const MOCK_MODEL_PERFORMANCE: ModelPerformanceData = {
  isDemoData: true,
  disclaimer:
    'Illustrative Demo Data – Placeholder evaluation metrics representing expected FastAPI ML pipeline outputs. Not live trained model telemetry.',
  models: [
    {
      id: 'random_forest',
      name: 'Random Forest Classifier',
      shortName: 'Random Forest',
      accuracy: 0.842,
      precision: 0.786,
      recall: 0.724,
      f1Score: 0.754,
      rocAuc: 0.884,
      trainingNote: 'Placeholder benchmark · 200 estimators, class-balanced weights',
      confusionMatrix: {
        trueNegative: 942,
        falsePositive: 93,
        falseNegative: 103,
        truePositive: 271,
      },
    },
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      shortName: 'Logistic Reg.',
      accuracy: 0.806,
      precision: 0.731,
      recall: 0.668,
      f1Score: 0.698,
      rocAuc: 0.847,
      trainingNote: 'Placeholder baseline · L2 regularized linear classifier',
      confusionMatrix: {
        trueNegative: 914,
        falsePositive: 121,
        falseNegative: 124,
        truePositive: 250,
      },
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree Classifier',
      shortName: 'Decision Tree',
      accuracy: 0.779,
      precision: 0.684,
      recall: 0.642,
      f1Score: 0.662,
      rocAuc: 0.791,
      trainingNote: 'Placeholder interpretable tree · max depth 6',
      confusionMatrix: {
        trueNegative: 889,
        falsePositive: 146,
        falseNegative: 134,
        truePositive: 240,
      },
    },
  ],
  rocCurve: [
    { x: 0.0, logisticRegression: 0.0, decisionTree: 0.0, randomForest: 0.0, baseline: 0.0 },
    { x: 0.1, logisticRegression: 0.44, decisionTree: 0.38, randomForest: 0.56, baseline: 0.1 },
    { x: 0.2, logisticRegression: 0.63, decisionTree: 0.54, randomForest: 0.74, baseline: 0.2 },
    { x: 0.3, logisticRegression: 0.75, decisionTree: 0.66, randomForest: 0.83, baseline: 0.3 },
    { x: 0.4, logisticRegression: 0.82, decisionTree: 0.74, randomForest: 0.89, baseline: 0.4 },
    { x: 0.5, logisticRegression: 0.87, decisionTree: 0.80, randomForest: 0.92, baseline: 0.5 },
    { x: 0.6, logisticRegression: 0.91, decisionTree: 0.85, randomForest: 0.95, baseline: 0.6 },
    { x: 0.7, logisticRegression: 0.94, decisionTree: 0.89, randomForest: 0.97, baseline: 0.7 },
    { x: 0.8, logisticRegression: 0.97, decisionTree: 0.93, randomForest: 0.985, baseline: 0.8 },
    { x: 0.9, logisticRegression: 0.99, decisionTree: 0.97, randomForest: 0.995, baseline: 0.9 },
    { x: 1.0, logisticRegression: 1.0, decisionTree: 1.0, randomForest: 1.0, baseline: 1.0 },
  ],
  precisionRecallCurve: [
    { x: 0.0, logisticRegression: 0.92, decisionTree: 0.86, randomForest: 0.96 },
    { x: 0.1, logisticRegression: 0.88, decisionTree: 0.81, randomForest: 0.93 },
    { x: 0.2, logisticRegression: 0.84, decisionTree: 0.77, randomForest: 0.90 },
    { x: 0.3, logisticRegression: 0.81, decisionTree: 0.73, randomForest: 0.87 },
    { x: 0.4, logisticRegression: 0.77, decisionTree: 0.69, randomForest: 0.84 },
    { x: 0.5, logisticRegression: 0.73, decisionTree: 0.65, randomForest: 0.80 },
    { x: 0.6, logisticRegression: 0.68, decisionTree: 0.60, randomForest: 0.76 },
    { x: 0.7, logisticRegression: 0.62, decisionTree: 0.54, randomForest: 0.70 },
    { x: 0.8, logisticRegression: 0.54, decisionTree: 0.46, randomForest: 0.62 },
    { x: 0.9, logisticRegression: 0.41, decisionTree: 0.35, randomForest: 0.49 },
    { x: 1.0, logisticRegression: 0.26, decisionTree: 0.26, randomForest: 0.26 },
  ],
};

export const MOCK_BUSINESS_INSIGHTS: BusinessInsightsData = {
  isDemoData: true,
  totalMrrAtRisk: 104493,
  highRiskAccountsCount: 1142,
  projectedAnnualSavings: 428400,
  avgRetentionLiftPotential: 19.4,
  keyDrivers: [
    {
      id: 'drv-1',
      driver: 'Month-to-Month Contract Structure',
      churnRateImpact: '41.8% churn vs 10.9% on 1-Yr',
      relativeImportance: 92,
      summary:
        'Customers without an annual commitment account for nearly 76% of all observed cancellations in the sample cohort.',
    },
    {
      id: 'drv-2',
      driver: 'First-Year Onboarding Friction (0–12 Mo)',
      churnRateImpact: '36.2% churn in first 6 months',
      relativeImportance: 84,
      summary:
        'Churn velocity peaks between months 2 and 5, especially when Technical Support or Online Security is not enabled.',
    },
    {
      id: 'drv-3',
      driver: 'Fiber Optic Pricing Without Support Bundles',
      churnRateImpact: '+18.5% elevated attrition risk',
      relativeImportance: 76,
      summary:
        'High-ARPU Fiber customers paying over $90/mo without bundled security or tech support show heightened price sensitivity.',
    },
    {
      id: 'drv-4',
      driver: 'Manual Electronic Check Settlement',
      churnRateImpact: '2.4x higher churn vs Autopay',
      relativeImportance: 68,
      summary:
        'Electronic check users experience higher billing friction and payment lapse rates compared to automatic card or bank transfer.',
    },
  ],
  revenueAtRiskByContract: [
    { contract: 'Month-to-month', mrrAtRisk: 82450, customersAtRisk: 892 },
    { contract: 'One year', mrrAtRisk: 15890, customersAtRisk: 184 },
    { contract: 'Two year', mrrAtRisk: 6153, customersAtRisk: 66 },
  ],
  opportunities: [
    {
      id: 'opp-1',
      title: 'Annual Commitment Migration Program',
      targetSegment: 'At-Risk Fiber Subscribers',
      revenueAtRisk: 64200,
      potentialSavedAccounts: 290,
      recommendedTactic: 'Offer 2 months at 20% off in exchange for converting to a 1-year contract.',
    },
    {
      id: 'opp-2',
      title: 'Autopay Switching Incentive',
      targetSegment: 'Electronic Check Payers',
      revenueAtRisk: 28900,
      potentialSavedAccounts: 145,
      recommendedTactic: 'Provide a one-time $15 statement credit upon enabling automatic bank or card billing.',
    },
    {
      id: 'opp-3',
      title: '90-Day Concierge Onboarding Touchpoint',
      targetSegment: 'New Customers (0–6 Months)',
      revenueAtRisk: 21400,
      potentialSavedAccounts: 118,
      recommendedTactic: 'Trigger proactive setup call + complimentary Online Security trial at day 21.',
    },
  ],
  recommendations: [
    'Prioritize month-to-month Fiber optic accounts with 2+ support tickets in the past 90 days for immediate retention outreach.',
    'Bundle Online Security and Tech Support into mid-tier Fiber plans to raise switching costs and reduce early-life churn.',
    'Transition Electronic Check customers to Autopay via billing portal prompts and targeted statement credits.',
    'Establish a 45-day post-activation health check for new accounts to stabilize the 0–6 month onboarding cohort.',
  ],
};

export const SUGGESTED_INSIGHT_QUESTIONS = [
  'Why are customers leaving?',
  'Which customer segment has the highest churn?',
  'What are the major churn factors?',
  'How can we improve customer retention?',
];

export function getDemoAssistantReply(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('why') || q.includes('leaving')) {
    return [
      'Based on our sample telecom intelligence dataset (demo data):',
      '',
      '1. Contract Flexibility: Month-to-month customers show a 41.8% churn rate compared to 10.9% on one-year agreements and under 4% on two-year contracts.',
      '2. Early Onboarding Drop-off: Accounts in months 1–6 account for a disproportionate share of cancellations when they lack Tech Support or Online Security.',
      '3. High Monthly Spend Without Value Bundling: Fiber optic customers paying >$90/mo without support add-ons exhibit strong price sensitivity.',
      '',
      'Note: This is a pre-configured frontend preview response. Live NL-to-SQL and ML explanations will connect via the Python FastAPI backend.',
    ].join('\n');
  }

  if (q.includes('segment') || q.includes('highest')) {
    return [
      'Across the 6 active customer segments (demo data):',
      '',
      '• At-Risk Segment: Highest active churn rate at 34.8% (1,142 accounts · $104,493 MRR at risk). These customers typically hold month-to-month contracts with high monthly charges ($91.50 avg) and recent support tickets.',
      '• New Segment (0–6 months): Second highest at 18.4% churn (1,071 accounts). Early stabilization is critical before month 6.',
      '• High-Value Segment: Lowest active churn at 3.1%, protected by multi-year agreements and bundled services.',
    ].join('\n');
  }

  if (q.includes('factor') || q.includes('driver')) {
    return [
      'Top ranked churn factors in the illustrative feature attribution profile:',
      '',
      '1. Contract Type (Month-to-month) — Relative importance: 92/100',
      '2. Tenure under 12 months — Relative importance: 84/100',
      '3. Unbundled Fiber Optic high monthly charges — Relative importance: 76/100',
      '4. Electronic Check payment method — Relative importance: 68/100',
      '5. Absence of Online Security & Tech Support — Relative importance: 61/100',
    ].join('\n');
  }

  if (q.includes('improve') || q.includes('retention') || q.includes('how')) {
    return [
      'Recommended retention actions derived from current cohort patterns (demo data):',
      '',
      '1. Annual Migration Offers: Target month-to-month Fiber accounts with a 15% loyalty credit for 6 months when upgrading to a 1-year contract (est. 290 accounts saved).',
      '2. Autopay Conversion: Offer a $15 one-time statement credit to Electronic Check payers to reduce billing friction.',
      '3. Security Bundling: Include 90 days of complimentary Online Security for New and Price-Sensitive cohorts to strengthen product stickiness.',
      '4. Proactive Support Routing: Escalate accounts logging 2+ support tickets inside 60 days for concierge resolution.',
    ].join('\n');
  }

  return [
    `Summary for "${question}" (Illustrative Frontend Demo Response):`,
    '',
    'In the current sample dataset, $104,493 in Monthly Recurring Revenue is concentrated in the At-Risk segment (1,142 accounts). Focusing retention incentives on month-to-month Fiber optic subscribers and transitioning Electronic Check payers to automated billing yields the highest projected retention lift (+19.4%).',
    '',
    'Connect the Python FastAPI backend in Google Antigravity to enable live database queries and real-time AI insights.',
  ].join('\n');
}
