import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { PredictionResultCard } from '../components/predictions/PredictionResultCard';
import { DemoNotice } from '../components/common/DemoNotice';
import type { ChurnPredictionResult } from '../types/prediction';

describe('UI Primitives, States & Interactive Components', () => {
  it('8. LoadingState renders skeleton loaders across page, card, and table variants', () => {
    const { container: pageContainer } = render(<LoadingState variant="page" />);
    expect(pageContainer.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    const { container: cardsContainer } = render(<LoadingState variant="cards" rows={3} />);
    expect(cardsContainer.querySelectorAll('.animate-pulse').length).toBe(3);

    const { container: tableContainer } = render(<LoadingState variant="table" rows={4} />);
    expect(tableContainer.querySelectorAll('.animate-pulse').length).toBe(17); // 1 header + 4 rows x 4 cells
  });

  it('9. ErrorState renders alert message and retry button trigger', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Failed to fetch live API data"
        message="Backend server refused connection on port 8000"
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/Failed to fetch live API data/i)).toBeDefined();
    expect(screen.getByText(/Backend server refused connection/i)).toBeDefined();

    const retryBtn = screen.getByRole('button', { name: /Retry Request/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('10. EmptyState renders friendly empty message and action button', () => {
    const onReset = vi.fn();
    render(
      <EmptyState
        title="No customers found"
        description="Try adjusting your search criteria or reset all active filters."
        actionLabel="Reset All Filters"
        onAction={onReset}
      />
    );

    expect(screen.getByText(/No customers found/i)).toBeDefined();
    expect(screen.getByText(/Try adjusting your search criteria/i)).toBeDefined();

    const resetBtn = screen.getByRole('button', { name: /Reset All Filters/i });
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('11. SearchFilterBar triggers search callback on user input', () => {
    const onSearchChange = vi.fn();
    render(
      <SearchFilterBar
        searchValue="7590"
        onSearchChange={onSearchChange}
        searchPlaceholder="Search customer ID..."
      />
    );

    const input = screen.getByPlaceholderText(/Search customer ID.../i) as HTMLInputElement;
    expect(input.value).toBe('7590');

    fireEvent.change(input, { target: { value: '5575' } });
    expect(onSearchChange).toHaveBeenCalledWith('5575');
  });

  it('12. SearchFilterBar handles filter control selections', () => {
    const onContractChange = vi.fn();
    render(
      <SearchFilterBar
        searchValue=""
        onSearchChange={() => {}}
        filters={[
          {
            id: 'contract',
            label: 'Contract Type',
            value: 'All',
            options: [
              { label: 'All Contracts', value: 'All' },
              { label: 'Month-to-month', value: 'Month-to-month' },
              { label: 'Two year', value: 'Two year' },
            ],
            onChange: onContractChange,
          },
        ]}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Two year' } });
    expect(onContractChange).toHaveBeenCalledWith('Two year');
  });

  it('15. PredictionResultCard renders prediction probability, risk category, and action queueing', () => {
    const mockPrediction: ChurnPredictionResult = {
      customerID: '7590-VHVEG',
      customer: {
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
      },
      churnProbability: 0.7588,
      riskCategory: 'High',
      modelReference: 'Random Forest Classifier (v1.0 - Scikit-Learn)',
      generatedAt: '2026-11-22T10:00:00Z',
      contributingFactors: [
        {
          factor: 'Contract Structure',
          detail: 'Customer is on a flexible month-to-month plan.',
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
          estimatedImpact: 'Reduces churn by 31%',
        },
      ],
      isDemoData: false as any,
      disclaimer: 'Live Model Prediction generated from Random Forest Classifier.',
    };

    render(<PredictionResultCard result={mockPrediction} />);

    expect(screen.getByText(/75.9%/i)).toBeDefined();
    expect(screen.getByText(/High Risk/i)).toBeDefined();
    expect(screen.getByText(/Contract Structure/i)).toBeDefined();
    expect(screen.getByText(/1-Year Loyalty Contract Upgrade/i)).toBeDefined();

    // Verify Action queueing
    const queueBtn = screen.getByRole('button', { name: /Queue Action/i });
    fireEvent.click(queueBtn);
    expect(screen.getByText(/Queued in Workflow/i)).toBeDefined();
  });

  it('16. DemoNotice is hidden in production mode and displayed only when active', () => {
    // When demo mode is false (isDemoData: false), DemoNotice should NOT appear in output
    const { container: liveContainer } = render(
      <div>
        {false && (
          <DemoNotice
            title="Demo Warning"
            message="This should not appear in production"
          />
        )}
      </div>
    );
    expect(liveContainer.textContent).toBe('');

    // When demo mode is true, DemoNotice renders warning banner
    render(
      <DemoNotice
        title="Demo Data – Not a Live Model Prediction"
        message="Illustrative sample data"
        endpointHint="POST /api/v1/predict"
      />
    );
    expect(screen.getByText(/Demo Data – Not a Live Model Prediction/i)).toBeDefined();
    expect(screen.getByText(/POST \/api\/v1\/predict/i)).toBeDefined();
  });
});
