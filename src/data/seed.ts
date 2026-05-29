import type { FinanceData } from '../types';

// 公開安全的空白範本：不含任何真實財務數字。
// 真實資料只透過「加密保險庫」(vault.json / 加密匯入) 載入，明文絕不進入此檔或部署包。
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
    investmentRatio: 0,
    cashRatio: 0,
    emergencyFund: 0,
    loans: [],
  },
};
