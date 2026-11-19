import { MOCK_CUSTOMERS } from '../data/mockCustomers';
import type {
  Customer,
  CustomerFilters,
  CustomerSortField,
  PaginatedCustomersResponse,
  SortDirection,
} from '../types/customer';
import { ApiError, USE_DEMO_DATA, apiRequest, runDemoDelay } from './api';

export interface GetCustomersParams {
  filters?: Partial<CustomerFilters>;
  sortBy?: CustomerSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export function filterCustomerList(
  customers: Customer[],
  filters: Partial<CustomerFilters> = {}
): Customer[] {
  const search = (filters.search || '').trim().toLowerCase();

  return customers.filter((c) => {
    if (search) {
      const matchesSearch =
        c.customerID.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.Contract.toLowerCase().includes(search) ||
        c.segment.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    if (filters.gender && filters.gender !== 'All' && c.gender !== filters.gender) {
      return false;
    }
    if (filters.contract && filters.contract !== 'All' && c.Contract !== filters.contract) {
      return false;
    }
    if (
      filters.paymentMethod &&
      filters.paymentMethod !== 'All' &&
      c.PaymentMethod !== filters.paymentMethod
    ) {
      return false;
    }
    if (
      filters.internetService &&
      filters.internetService !== 'All' &&
      c.InternetService !== filters.internetService
    ) {
      return false;
    }
    if (filters.status && filters.status !== 'All' && c.Churn !== filters.status) {
      return false;
    }
    if (filters.tenureRange && filters.tenureRange !== 'All') {
      if (filters.tenureRange === '0-12' && c.tenure > 12) return false;
      if (filters.tenureRange === '13-24' && (c.tenure < 13 || c.tenure > 24)) return false;
      if (filters.tenureRange === '25-48' && (c.tenure < 25 || c.tenure > 48)) return false;
      if (filters.tenureRange === '49+' && c.tenure < 49) return false;
    }

    return true;
  });
}

/**
 * Expected FastAPI Endpoint: GET /api/v1/customers
 */
export async function getCustomers(
  params: GetCustomersParams = {}
): Promise<PaginatedCustomersResponse> {
  if (!USE_DEMO_DATA) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('page_size', String(params.pageSize));
    if (params.sortBy) query.set('sort_by', params.sortBy);
    if (params.sortDir) query.set('sort_dir', params.sortDir);
    return apiRequest<PaginatedCustomersResponse>(`/api/v1/customers?${query.toString()}`);
  }

  await runDemoDelay('/api/v1/customers');

  const filtered = filterCustomerList(MOCK_CUSTOMERS, params.filters);
  const sortBy = params.sortBy || 'tenure';
  const sortDir = params.sortDir || 'desc';

  const riskOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'riskTier') {
      comparison = (riskOrder[a.riskTier] || 0) - (riskOrder[b.riskTier] || 0);
    } else {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }
    }
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const pageSize = params.pageSize || 10;
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page || 1), totalPages);
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    isDemoData: true,
  };
}

/**
 * Expected FastAPI Endpoint: GET /api/v1/customers/{customerId}
 */
export async function getCustomerById(customerId: string): Promise<Customer> {
  if (!USE_DEMO_DATA) {
    return apiRequest<Customer>(`/api/v1/customers/${encodeURIComponent(customerId)}`);
  }

  await runDemoDelay(`/api/v1/customers/${customerId}`);

  const normalized = customerId.trim().toUpperCase();
  const found = MOCK_CUSTOMERS.find(
    (c) => c.customerID.toUpperCase() === normalized
  );

  if (!found) {
    throw new ApiError(
      `Customer ID "${customerId}" was not found in the sample directory.`,
      404,
      `/api/v1/customers/${customerId}`
    );
  }

  return found;
}
