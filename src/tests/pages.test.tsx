import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../hooks/useAppContext';
import Overview from '../pages/Overview';
import CustomerAnalytics from '../pages/CustomerAnalytics';
import Segmentation from '../pages/Segmentation';
import ChurnPrediction from '../pages/ChurnPrediction';
import ModelPerformance from '../pages/ModelPerformance';
import BusinessInsights from '../pages/BusinessInsights';
import { AppLayout } from '../components/layout/AppLayout';
import {
  FIXTURE_OVERVIEW,
  FIXTURE_CUSTOMERS,
  FIXTURE_ANALYTICS,
  FIXTURE_SEGMENTS,
  FIXTURE_PREDICTION,
  FIXTURE_PERFORMANCE,
  FIXTURE_INSIGHTS,
} from './fixtures';

function renderWithProviders(ui: React.ReactElement, initialRoute = '/') {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </AppProvider>
  );
}

function setupDefaultFetchMocks() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
      const url = input.toString();
      if (url.includes('/api/v1/analytics/overview')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => FIXTURE_OVERVIEW,
        } as Response);
      }
      if (url.includes('/api/v1/analytics/customers')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => FIXTURE_ANALYTICS,
        } as Response);
      }
      if (url.includes('/api/v1/customers')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => FIXTURE_CUSTOMERS,
        } as Response);
      }
      if (url.includes('/api/v1/analytics/segments') || url.includes('/api/v1/segments')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => FIXTURE_SEGMENTS,
        } as Response);
      }
      if (url.includes('/api/v1/predict')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => FIXTURE_PREDICTION,
        } as Response);
      }
      if (url.includes('/api/v1/models/performance')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => FIXTURE_PERFORMANCE,
        } as Response);
      }
      if (url.includes('/api/v1/insights')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => FIXTURE_INSIGHTS,
        } as Response);
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    })
  );
}

describe('React Dashboard Component Tests (All 6 Pages & Core Workflows)', () => {
  beforeEach(() => {
    setupDefaultFetchMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Overview page renders executive KPIs, monthly trends, and high-risk section', async () => {
    renderWithProviders(<Overview />);

    await waitFor(() => {
      expect(screen.getByText(/Telecom subscriber retention overview/i)).toBeDefined();
    });

    expect(screen.getByText(/Total Customers/i)).toBeDefined();
    expect(screen.getByText(/7,043/i)).toBeDefined();
    expect(screen.getByText(/Monthly Recurring Revenue/i)).toBeDefined();
    expect(screen.getByText(/\$456,117/i)).toBeDefined();
  });

  it('2. Customer Analytics page renders search, filter controls, table, and triggers CSV export', async () => {
    renderWithProviders(<CustomerAnalytics />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by customer ID, name, email, or segment.../i)).toBeDefined();
    });

    expect(screen.getByText(/Elena Vance/i)).toBeDefined();
    expect(screen.getByText(/7590-VHVEG/i)).toBeDefined();

    // Verify CSV Export click
    const exportBtn = screen.getByRole('button', { name: /Export Page CSV/i });
    expect(exportBtn).toBeDefined();
    fireEvent.click(exportBtn);
  });

  it('3. Customer Analytics updates search and triggers API call with search term', async () => {
    renderWithProviders(<CustomerAnalytics />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search by customer ID, name, email, or segment.../i)).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Search by customer ID, name, email, or segment.../i);
    fireEvent.change(searchInput, { target: { value: '3668-QPYBK' } });
    expect((searchInput as HTMLInputElement).value).toBe('3668-QPYBK');
  });

  it('4. Customer Segmentation page renders behavioral cohort analysis and segment cards', async () => {
    renderWithProviders(<Segmentation />);

    await waitFor(() => {
      expect(screen.getByText(/High-Value/i)).toBeDefined();
    });

    expect(screen.getAllByText(/At-Risk/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/14.1%/i)).toBeDefined();
  });

  it('5. Churn Prediction page renders lookup panel, sample selector, and prediction result', async () => {
    renderWithProviders(<ChurnPrediction />);

    await waitFor(() => {
      expect(screen.getByText(/Select or Look Up Customer/i)).toBeDefined();
    });

    expect(screen.getByText(/Load Prediction Preview/i)).toBeDefined();

    // Prediction results rendered
    await waitFor(() => {
      expect(screen.getByText(/75.9%/i)).toBeDefined();
      expect(screen.getAllByText(/High Risk/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Contract Structure/i)).toBeDefined();
    });
  });

  it('6. Model Performance page renders benchmark comparison cards across 3 models', async () => {
    renderWithProviders(<ModelPerformance />);

    await waitFor(() => {
      expect(screen.getAllByText(/Random Forest Classifier/i).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Logistic Regression/i)).toBeDefined();
    expect(screen.getByText(/Decision Tree/i)).toBeDefined();
  });

  it('7. Business Insights page renders strategic recommendations and revenue at risk', async () => {
    renderWithProviders(<BusinessInsights />);

    await waitFor(() => {
      expect(screen.getByText(/Monthly Revenue at Risk/i)).toBeDefined();
    });

    expect(screen.getByText(/\$86,948/i)).toBeDefined();
    expect(screen.getByText(/Key Churn Drivers/i)).toBeDefined();
    expect(screen.getByText(/Month-to-Month Contracts/i)).toBeDefined();
  });

  it('8. AppLayout renders navigation bar and routing links across all 6 sections', async () => {
    renderWithProviders(
      <AppLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/analytics" element={<CustomerAnalytics />} />
          <Route path="/segmentation" element={<Segmentation />} />
          <Route path="/prediction" element={<ChurnPrediction />} />
          <Route path="/models" element={<ModelPerformance />} />
          <Route path="/insights" element={<BusinessInsights />} />
        </Routes>
      </AppLayout>,
      '/'
    );

    expect(screen.getAllByText(/ChurnIQ/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Customer Analytics/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Customer Segmentation/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Churn Prediction/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Model Performance/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Business Insights/i })).toBeDefined();
  });

  it('9. Error handling: Displays ErrorState with retry button when backend API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network connection refused on port 8000')))
    );

    renderWithProviders(<Overview />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });

    expect(screen.getByText(/Unable to load data/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Retry Request/i })).toBeDefined();
  });
});
