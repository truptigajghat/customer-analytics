/**
 * ChurnIQ API Client Configuration
 * --------------------------------
 * Prepared for integration with the Python FastAPI backend developed separately
 * in Google Antigravity.
 *
 * Currently serves deterministic sample/mock data in demo mode so the complete
 * frontend UI can be previewed without a live backend server.
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const USE_DEMO_DATA = true;

export class ApiError extends Error {
  status: number;
  endpoint: string;

  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

export interface ApiSimulationConfig {
  simulateLatencyMs: number;
  simulateErrorOnce: boolean;
}

const simulationConfig: ApiSimulationConfig = {
  simulateLatencyMs: 120,
  simulateErrorOnce: false,
};

export function setSimulationConfig(partial: Partial<ApiSimulationConfig>): void {
  Object.assign(simulationConfig, partial);
}

export function getSimulationConfig(): ApiSimulationConfig {
  return { ...simulationConfig };
}

export async function runDemoDelay(endpoint: string): Promise<void> {
  if (simulationConfig.simulateLatencyMs > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, simulationConfig.simulateLatencyMs)
    );
  }
  if (simulationConfig.simulateErrorOnce) {
    simulationConfig.simulateErrorOnce = false;
    throw new ApiError(
      `Simulated API connection error while requesting ${endpoint}. Verify FastAPI backend at ${API_BASE_URL}.`,
      503,
      endpoint
    );
  }
}

/**
 * Standard HTTP request wrapper for future FastAPI endpoints.
 * Ready for Bearer auth headers and JSON payload serialization.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new ApiError(
        errorText || `Request failed with status ${response.status}`,
        response.status,
        endpoint
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
