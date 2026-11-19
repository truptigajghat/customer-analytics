import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Customer } from '../../types/customer';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { StatusBadge, riskToVariant } from '../common/StatusBadge';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDetailModal({
  customer,
  onClose,
}: CustomerDetailModalProps) {
  const navigate = useNavigate();

  if (!customer) return null;

  const handleInspectPrediction = () => {
    onClose();
    navigate(`/prediction?customerId=${encodeURIComponent(customer.customerID)}`);
  };

  const rows = [
    { label: 'Customer ID', value: customer.customerID, mono: true },
    { label: 'Segment', value: customer.segment },
    { label: 'Gender / Age', value: `${customer.gender} · ${customer.ageGroup}` },
    {
      label: 'Household',
      value: `Partner: ${customer.Partner} · Dependents: ${customer.Dependents}`,
    },
    { label: 'Tenure', value: `${customer.tenure} months`, mono: true },
    { label: 'Contract', value: customer.Contract },
    { label: 'Payment Method', value: customer.PaymentMethod },
    { label: 'Paperless Billing', value: customer.PaperlessBilling },
    {
      label: 'Monthly Charges',
      value: formatCurrency(customer.MonthlyCharges, 2),
      mono: true,
    },
    {
      label: 'Total Charges',
      value: formatCurrency(customer.TotalCharges, 2),
      mono: true,
    },
    { label: 'Internet Service', value: customer.InternetService },
    { label: 'Phone Service', value: `${customer.PhoneService} (${customer.MultipleLines})` },
    { label: 'Online Security', value: customer.OnlineSecurity },
    { label: 'Tech Support', value: customer.TechSupport },
    { label: 'Streaming TV', value: customer.StreamingTV },
    { label: '90d Support Tickets', value: String(customer.supportTickets90d), mono: true },
  ];

  return (
    <Modal
      isOpen={Boolean(customer)}
      onClose={onClose}
      title={customer.name}
      subtitle={`${customer.customerID} · ${customer.email}`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <StatusBadge
              label={customer.Churn === 'Yes' ? 'Churned Account' : 'Active Account'}
              variant={customer.Churn === 'Yes' ? 'danger' : 'success'}
            />
            <StatusBadge
              label={`${customer.riskTier} Risk Tier`}
              variant={riskToVariant(customer.riskTier)}
            />
          </div>

          <button
            type="button"
            onClick={handleInspectPrediction}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)] whitespace-nowrap shrink-0"
          >
            Open Churn Prediction View
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-2 text-xs"
            >
              <dt className="text-[var(--text-secondary)]">{row.label}</dt>
              <dd
                className={`font-medium text-[var(--text-primary)] ${
                  row.mono ? 'font-mono-num' : ''
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Modal>
  );
}
