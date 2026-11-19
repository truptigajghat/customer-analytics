import { MOCK_MODEL_PERFORMANCE } from '../data/mockAnalytics';
import { buildDemoPredictionMeta } from '../data/mockCustomers';
import type {
  ChurnPredictionResult,
  ModelPerformanceData,
} from '../types/prediction';
import { USE_DEMO_DATA, apiRequest, runDemoDelay } from './api';
import { getCustomerById } from './customerService';

/**
 * Expected FastAPI Endpoint: POST /api/v1/predict
 * Note: Returns illustrative DEMO placeholder prediction data only until
 * the Python ML backend is connected.
 */
export async function predictCustomerChurn(
  customerId: string
): Promise<ChurnPredictionResult> {
  if (!USE_DEMO_DATA) {
    return apiRequest<ChurnPredictionResult>('/api/v1/predict', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId }),
    });
  }

  await runDemoDelay('/api/v1/predict');

  const customer = await getCustomerById(customerId);
  const demoMeta = buildDemoPredictionMeta(customer);

  return {
    customerID: customer.customerID,
    customer,
    churnProbability: demoMeta.probability,
    riskCategory: demoMeta.riskCategory,
    modelReference: 'Frontend Sample Preview (FastAPI ML Pending)',
    generatedAt: new Date().toISOString(),
    contributingFactors: demoMeta.factors,
    suggestedActions: demoMeta.actions,
    isDemoData: true,
    disclaimer:
      'Demo Data – Not a Live Model Prediction. Connect your FastAPI ML endpoint to compute live churn scores.',
  };
}

/**
 * Expected FastAPI Endpoint: GET /api/v1/models/performance
 */
export async function getModelPerformance(): Promise<ModelPerformanceData> {
  if (!USE_DEMO_DATA) {
    return apiRequest<ModelPerformanceData>('/api/v1/models/performance');
  }

  await runDemoDelay('/api/v1/models/performance');

  return MOCK_MODEL_PERFORMANCE;
}
