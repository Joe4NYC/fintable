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

// 把任意日期格式（ISO 或長字串）統一顯示為 YYYY-MM-DD
export function formatDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 把任意日期格式安全解析為時間戳（無效則回傳 NaN）
export function parseDateMs(value: string): number {
  return new Date(value).getTime();
}
