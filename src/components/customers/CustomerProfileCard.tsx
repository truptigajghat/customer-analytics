import React from 'react';
import type { Customer } from '../../types/customer';
import { formatCurrency } from '../../utils/formatters';
import { StatusBadge, riskToVariant } from '../common/StatusBadge';

interface CustomerProfileCardProps {
  customer: Customer;
  action?: React.ReactNode;
}

export function CustomerProfileCard({
  customer,
  action,
}: CustomerProfileCardProps) {
  const fields = [
    { label: 'Tenure', value: `${customer.tenure} months`, mono: true },
    { label: 'Contract Type', value: customer.Contract, mono: false },
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
    { label: 'Payment Method', value: customer.PaymentMethod, mono: false },
    { label: 'Internet Service', value: customer.InternetService, mono: false },
    {
      label: 'Phone / Lines',
      value:
        customer.PhoneService === 'Yes'
          ? `Yes (${customer.MultipleLines === 'Yes' ? 'Multiple' : 'Single'})`
          : 'No Phone Service',
      mono: false,
    },
    {
      label: 'Security & Support',
      value: `Security: ${customer.OnlineSecurity} · Support: ${customer.TechSupport}`,
      mono: false,
    },
  ];

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="font-mono-num font-medium text-[var(--text-primary)]">
              {customer.customerID}
            </span>
            <span aria-hidden="true">·</span>
            <span>{customer.segment} Segment</span>
            <span aria-hidden="true">·</span>
            <span>Last active {customer.lastActive}</span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            {customer.name}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {customer.email} · {customer.gender} · Age {customer.ageGroup}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={customer.Churn === 'Yes' ? 'Churned' : 'Active'}
            variant={customer.Churn === 'Yes' ? 'danger' : 'success'}
          />
          <StatusBadge
            label={`${customer.riskTier} Risk`}
            variant={riskToVariant(customer.riskTier)}
          />
          {action}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] font-medium text-[var(--text-muted)]">
              {item.label}
            </dt>
            <dd
              className={`mt-0.5 text-sm font-medium text-[var(--text-primary)] ${
                item.mono ? 'font-mono-num' : ''
              }`}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
