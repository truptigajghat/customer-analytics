export type Gender = 'Female' | 'Male';
export type ContractType = 'Month-to-month' | 'One year' | 'Two year';
export type InternetServiceType = 'Fiber optic' | 'DSL' | 'No';
export type PaymentMethodType =
  | 'Electronic check'
  | 'Mailed check'
  | 'Bank transfer (automatic)'
  | 'Credit card (automatic)';

export type ChurnStatus = 'Yes' | 'No';
export type RiskTier = 'Low' | 'Medium' | 'High';

export type CustomerSegmentName =
  | 'High-Value'
  | 'Loyal'
  | 'New'
  | 'Price-Sensitive'
  | 'At-Risk'
  | 'Lost';

export interface Customer {
  customerID: string;
  name: string;
  email: string;
  gender: Gender;
  SeniorCitizen: 0 | 1;
  ageGroup: '18-29' | '30-44' | '45-59' | '60+';
  Partner: 'Yes' | 'No';
  Dependents: 'Yes' | 'No';
  tenure: number;
  PhoneService: 'Yes' | 'No';
  MultipleLines: 'Yes' | 'No' | 'No phone service';
  InternetService: InternetServiceType;
  OnlineSecurity: 'Yes' | 'No' | 'No internet service';
  TechSupport: 'Yes' | 'No' | 'No internet service';
  StreamingTV: 'Yes' | 'No' | 'No internet service';
  Contract: ContractType;
  PaperlessBilling: 'Yes' | 'No';
  PaymentMethod: PaymentMethodType;
  MonthlyCharges: number;
  TotalCharges: number;
  Churn: ChurnStatus;
  segment: CustomerSegmentName;
  riskTier: RiskTier;
  lastActive: string;
  supportTickets90d: number;
}

export interface CustomerFilters {
  search: string;
  gender: Gender | 'All';
  contract: ContractType | 'All';
  paymentMethod: PaymentMethodType | 'All';
  tenureRange: 'All' | '0-12' | '13-24' | '25-48' | '49+';
  internetService: InternetServiceType | 'All';
  status: ChurnStatus | 'All';
}

export type CustomerSortField =
  | 'customerID'
  | 'name'
  | 'tenure'
  | 'MonthlyCharges'
  | 'TotalCharges'
  | 'Contract'
  | 'riskTier';

export type SortDirection = 'asc' | 'desc';

export interface PaginatedCustomersResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isDemoData: boolean;
}
