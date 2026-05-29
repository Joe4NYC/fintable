export function formatCurrency(value: number, currency = 'HKD'): string {
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-HK', { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(ratio: number, digits = 1): string {
  if (!isFinite(ratio)) return '—';
  return `${(ratio * 100).toFixed(digits)}%`;
}

// 將 YYYY-MM 顯示為 2025/8 之類
export function formatMonth(month: string): string {
  const [y, m] = month.split('-');
  return `${y}/${Number(m)}`;
}
