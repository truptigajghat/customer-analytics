import type { Customer, RiskTier } from './customer';

export interface ContributingFactor {
  factor: string;
  detail: string;
  impact: 'increases_risk' | 'reduces_risk';
  weight: number; // 0 to 100 relative contribution for UI bar display
}

export interface RetentionAction {
  id: string;
  title: string;
  description: string;
  priority: 'Immediate' | 'Recommended' | 'Optional';
  estimatedImpact: string;
}

export interface ChurnPredictionResult {
  customerID: string;
  customer: Customer;
  churnProbability: number; // 0.0 to 1.0 (placeholder sample data)
  riskCategory: RiskTier;
  modelReference: string;
  generatedAt: string;
  contributingFactors: ContributingFactor[];
  suggestedActions: RetentionAction[];
  isDemoData: true;
  disclaimer: string;
}

export interface ConfusionMatrixData {
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
  truePositive: number;
}

export interface CurvePoint {
  x: number;
  logisticRegression: number;
  decisionTree: number;
  randomForest: number;
  baseline?: number;
}

export interface ModelComparisonItem {
  id: 'logistic_regression' | 'decision_tree' | 'random_forest';
  name: string;
  shortName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  trainingNote: string;
  confusionMatrix: ConfusionMatrixData;
}

export interface ModelPerformanceData {
  models: ModelComparisonItem[];
  rocCurve: CurvePoint[];
  precisionRecallCurve: CurvePoint[];
  isDemoData: true;
  disclaimer: string;
}

export interface ChurnDriverItem {
  id: string;
  driver: string;
  churnRateImpact: string;
  relativeImportance: number;
  summary: string;
}

export interface RetentionOpportunity {
  id: string;
  title: string;
  targetSegment: string;
  revenueAtRisk: number;
  potentialSavedAccounts: number;
  recommendedTactic: string;
}

export interface BusinessInsightsData {
  totalMrrAtRisk: number;
  highRiskAccountsCount: number;
  projectedAnnualSavings: number;
  avgRetentionLiftPotential: number;
  keyDrivers: ChurnDriverItem[];
  revenueAtRiskByContract: {
    contract: string;
    mrrAtRisk: number;
    customersAtRisk: number;
  }[];
  opportunities: RetentionOpportunity[];
  recommendations: string[];
  isDemoData: true;
}

export interface InsightChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isDemoResponse?: boolean;
}
