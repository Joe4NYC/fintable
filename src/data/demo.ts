import type { FinanceData } from '../types';

// 試用模式用的「範例資料」：完全虛構，僅供新訪客體驗介面與圖表。
// 數字刻意編排成存款穩步上升，讓累計存款趨勢圖看得出方向。
export const demoData: FinanceData = {
  settings: { currency: 'HKD', locale: 'zh-HK' },
  goals: [
    { id: 'd-g1', name: '日本旅行基金', targetAmount: 50000, targetDate: '2026-09-01' },
    { id: 'd-g2', name: '置業首期', targetAmount: 300000, targetDate: '2028-01-01' },
  ],
  monthly: [
    { id: 'd-m1', month: '2025-08', income: 18000, expense: 12000, note: '' },
    { id: 'd-m2', month: '2025-09', income: 18000, expense: 13500, note: '添置電腦' },
    { id: 'd-m3', month: '2025-10', income: 18500, expense: 11000, note: '' },
    { id: 'd-m4', month: '2025-11', income: 19000, expense: 14000, note: '' },
    { id: 'd-m5', month: '2025-12', income: 23000, expense: 20000, note: '年尾旅行 + 禮物' },
    { id: 'd-m6', month: '2026-01', income: 18500, expense: 10500, note: '農曆年利是' },
    { id: 'd-m7', month: '2026-02', income: 19000, expense: 12500, note: '' },
    { id: 'd-m8', month: '2026-03', income: 18500, expense: 9800, note: '' },
    { id: 'd-m9', month: '2026-04', income: 20500, expense: 15000, note: '' },
    { id: 'd-m10', month: '2026-05', income: 19000, expense: 11200, note: '' },
  ],
  budget: {
    fixedIncome: [
      { name: '工資', amount: 18000 },
      { name: '兼職', amount: 1500 },
    ],
    fixedExpense: [
      { name: '租金', amount: 6000 },
      { name: '飲食', amount: 4000 },
      { name: '交通', amount: 1200 },
      { name: '娛樂', amount: 1500 },
      { name: '訂閱服務', amount: 500 },
    ],
  },
  assets: {
    investmentTotal: 120000,
    liquidCash: 85000,
    loans: [{ name: '學生貸款', amount: 30000 }],
  },
};
