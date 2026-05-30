import type { FinanceData } from '../types';

// 公開安全的空白範本：不含任何真實財務數字。
// 真實資料只存在使用者自己的 Google Sheet；此檔僅作為「清空資料」用的空白範本。
export const seedData: FinanceData = {
  settings: { currency: 'HKD', locale: 'zh-HK' },
  goals: [{ id: 'g1', name: '我的財務目標', targetAmount: 100000, targetDate: '2027-01-01' }],
  monthly: [],
  budget: {
    fixedIncome: [{ name: '工資', amount: 0 }],
    fixedExpense: [{ name: '餐飲', amount: 0 }],
  },
  assets: {
    investmentTotal: 0,
    liquidCash: 0,
    loans: [],
  },
};
