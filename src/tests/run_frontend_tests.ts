/**
 * ChurnQ Frontend Automated Test Suite
 * =====================================
 * Tests UI formatting utilities, customer filtering logic, sorting routines,
 * API error instances, and component data contract integrity.
 *
 * Execution:
 *   npx tsx src/tests/run_frontend_tests.ts
 */

import {
  csvEscape,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatProbability,
} from '../utils/formatters';
import { riskToVariant } from '../components/common/StatusBadge';
import { filterCustomerList } from '../services/customerService';
import { ApiError } from '../services/api';
import { MOCK_CUSTOMERS } from '../data/mockCustomers';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('================================================================');
console.log('                CHURNQ FRONTEND TEST SUITE                      ');
console.log('================================================================');

// 1. Formatters Test Suite
console.log('\n--- 1. Testing Formatters & Utilities ---');
assert(formatCurrency(29.85) === '$30', 'formatCurrency default rounding', formatCurrency(29.85));
assert(formatCurrency(29.85, 2) === '$29.85', 'formatCurrency with 2 decimal places', formatCurrency(29.85, 2));
assert(formatNumber(7043) === '7,043', 'formatNumber with commas', formatNumber(7043));
assert(formatPercent(75.3) === '75.3%', 'formatPercent with explicit value', formatPercent(75.3));
assert(formatProbability(0.7588) === '75.9%', 'formatProbability from fraction', formatProbability(0.7588));
assert(csvEscape('Hello, World') === '"Hello, World"', 'csvEscape with comma');
assert(csvEscape('CleanString') === 'CleanString', 'csvEscape without comma');

// 2. Status Badge Variant Mapping
console.log('\n--- 2. Testing StatusBadge Variant Mapping ---');
assert(riskToVariant('High') === 'danger', 'riskToVariant("High") -> danger');
assert(riskToVariant('Medium') === 'warning', 'riskToVariant("Medium") -> warning');
assert(riskToVariant('Low') === 'success', 'riskToVariant("Low") -> success');

// 3. Customer Filtering Logic
console.log('\n--- 3. Testing Customer Filtering & Search Logic ---');
const totalMockCount = MOCK_CUSTOMERS.length;
assert(totalMockCount > 0, 'Mock customers array is populated');

const searchResult = filterCustomerList(MOCK_CUSTOMERS, { search: 'CUST-7590' });
assert(searchResult.length >= 1, 'Search by customerID returns matching customer');
assert(searchResult[0].customerID === 'CUST-7590', 'Search result matches exact customerID');

const contractFilter = filterCustomerList(MOCK_CUSTOMERS, { contract: 'Two year' });
assert(
  contractFilter.every((c) => c.Contract === 'Two year'),
  'Contract filter strictly matches "Two year"'
);

const tenureFilter = filterCustomerList(MOCK_CUSTOMERS, { tenureRange: '0-12' });
assert(
  tenureFilter.every((c) => c.tenure <= 12),
  'Tenure filter "0-12" strictly matches tenure <= 12'
);

const highTenureFilter = filterCustomerList(MOCK_CUSTOMERS, { tenureRange: '49+' });
assert(
  highTenureFilter.every((c) => c.tenure >= 49),
  'Tenure filter "49+" strictly matches tenure >= 49'
);

// 4. API Error Class
console.log('\n--- 4. Testing API Error Classes ---');
const err = new ApiError('Not found', 404, '/api/v1/customers/test');
assert(err.name === 'ApiError', 'ApiError name is ApiError');
assert(err.status === 404, 'ApiError status is 404');
assert(err.endpoint === '/api/v1/customers/test', 'ApiError endpoint is captured');
assert(err.message === 'Not found', 'ApiError message is preserved');

// 5. Data Contract Integrity
console.log('\n--- 5. Testing Data Contract Fields ---');
const sampleCust = MOCK_CUSTOMERS[0];
const requiredCustFields: (keyof typeof sampleCust)[] = [
  'customerID',
  'name',
  'email',
  'gender',
  'tenure',
  'MonthlyCharges',
  'TotalCharges',
  'Contract',
  'PaymentMethod',
  'Churn',
  'segment',
  'riskTier',
];
for (const field of requiredCustFields) {
  assert(field in sampleCust, `Customer contract contains field: ${String(field)}`);
}

console.log('\n================================================================');
console.log(`FRONTEND SUITE RESULTS: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
