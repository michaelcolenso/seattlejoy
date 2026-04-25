const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatCurrency(n: number): string {
  return currencyFmt.format(n);
}

export function formatRelativeDate(epochMs: number): string {
  const diffMs = Date.now() - epochMs;
  const diffDays = Math.round(diffMs / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  if (diffDays < 365) return rtf.format(-Math.round(diffDays / 30), 'month');
  return rtf.format(-Math.round(diffDays / 365), 'year');
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
