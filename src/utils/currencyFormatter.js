const SYMBOLS = {
  GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', INR: '₹', NZD: 'NZ$', SGD: 'S$',
};

export function getCurrencySymbol(code = 'GBP') {
  return SYMBOLS[(code || 'GBP').toUpperCase()] ?? (code || 'GBP');
}

// Abbreviated: £1.2k, £3.5M — used in stat cards and charts
export function formatCurrency(amount, code = 'GBP') {
  const sym = getCurrencySymbol(code);
  const n = parseFloat(amount ?? 0);
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${sym}${(n / 1_000).toFixed(1)}k`;
  return `${sym}${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Exact with two decimal places — used in invoices, line items, plan prices
export function formatCurrencyExact(amount, code = 'GBP') {
  const sym = getCurrencySymbol(code);
  const n = parseFloat(amount ?? 0);
  return `${sym}${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Compact alias — same as formatCurrency; explicit name for stat card / KPI contexts
export const formatCurrencyCompact = formatCurrency;

// Chart tooltip: abbreviated but always shows 2dp below 1k (e.g. £0.00, £999.99, £1.2k)
export function formatCurrencyForChart(amount, code = 'GBP') {
  const sym = getCurrencySymbol(code);
  const n = parseFloat(amount ?? 0);
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${sym}${(n / 1_000).toFixed(1)}k`;
  return `${sym}${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Table cells: always full precision — no abbreviation, locale-formatted
export const formatCurrencyForTable = formatCurrencyExact;
