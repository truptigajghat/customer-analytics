import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DemoNotice } from '../components/common/DemoNotice';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { CustomerProfileCard } from '../components/customers/CustomerProfileCard';
import { PredictionResultCard } from '../components/predictions/PredictionResultCard';
import { MOCK_CUSTOMERS } from '../data/mockCustomers';
import { useAsyncData } from '../hooks/useAsyncData';
import { predictCustomerChurn } from '../services/predictionService';

const QUICK_SAMPLES = [
  { id: 'CUST-7590', label: 'CUST-7590 · High Risk Sample' },
  { id: 'CUST-7892', label: 'CUST-7892 · Medium Risk Sample' },
  { id: 'CUST-5575', label: 'CUST-5575 · Low Risk Sample' },
];

export default function ChurnPrediction() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('customerId') || 'CUST-7590';

  const [activeCustomerId, setActiveCustomerId] = useState<string>(initialId);
  const [idInput, setIdInput] = useState<string>(initialId);
  const [directoryFilter, setDirectoryFilter] = useState<string>('');

  useEffect(() => {
    const paramId = searchParams.get('customerId');
    if (paramId && paramId !== activeCustomerId) {
      setActiveCustomerId(paramId);
      setIdInput(paramId);
    }
  }, [searchParams, activeCustomerId]);

  const { data, loading, error, refetch } = useAsyncData(
    () => predictCustomerChurn(activeCustomerId),
    [activeCustomerId]
  );

  const filteredDirectory = useMemo(() => {
    const q = directoryFilter.trim().toLowerCase();
    if (!q) return MOCK_CUSTOMERS.slice(0, 12);
    return MOCK_CUSTOMERS.filter(
      (c) =>
        c.customerID.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [directoryFilter]);

  const handleSelectCustomer = (customerID: string) => {
    const trimmed = customerID.trim();
    if (!trimmed) return;
    setActiveCustomerId(trimmed);
    setIdInput(trimmed);
    setSearchParams({ customerId: trimmed });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSelectCustomer(idInput);
  };

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Demo Data – Not a Live Model Prediction"
        message="This interface previews the churn prediction workflow with illustrative sample records. Connect the Python FastAPI ML service to generate live inference scores."
        endpointHint="VITE_API_BASE_URL/api/v1/predict"
      />

      {/* Customer Lookup & Search Panel */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Select or Look Up Customer
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Enter a Customer ID or select from the sample subscriber directory
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2.5">
            <div className="relative min-w-[200px] flex-1">
              <input
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="Enter Customer ID (e.g. CUST-7590)"
                aria-label="Customer ID"
                className="font-mono-num h-9 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-9 rounded-lg bg-[var(--accent-primary)] px-4 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)] whitespace-nowrap shrink-0"
            >
              Load Prediction Preview
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Sample presets:
            </span>
            {QUICK_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectCustomer(sample.id)}
                className={`rounded-lg border px-2.5 py-1 text-xs transition-colors whitespace-nowrap ${
                  activeCustomerId.toUpperCase() === sample.id
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/12 font-medium text-[var(--accent-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Directory Search */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={directoryFilter}
              onChange={(e) => setDirectoryFilter(e.target.value)}
              placeholder="Filter customer directory..."
              aria-label="Filter customer directory"
              className="h-8.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] pr-3 pl-8 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div className="mt-3 max-h-32 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {filteredDirectory.map((c) => (
              <button
                key={c.customerID}
                type="button"
                onClick={() => handleSelectCustomer(c.customerID)}
                className={`flex w-full items-center justify-between py-2 px-1.5 text-left text-xs transition-colors hover:bg-[var(--bg-elevated)] ${
                  c.customerID === activeCustomerId
                    ? 'text-[var(--accent-primary)] font-medium'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-mono-num text-[11px] text-[var(--text-muted)] shrink-0 ml-2">
                  {c.customerID}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Summary + Prediction Placeholder Result */}
      {loading ? (
        <LoadingState variant="page" />
      ) : error || !data ? (
        <ErrorState
          title="Customer lookup error"
          message={
            error ||
            `Could not find customer "${activeCustomerId}" in the sample directory.`
          }
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-6">
          <CustomerProfileCard customer={data.customer} />
          <PredictionResultCard result={data} />
        </div>
      )}
    </div>
  );
}
