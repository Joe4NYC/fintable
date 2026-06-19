export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
}

export interface MonthlyRecord {
  id: string;
  month: string; // YYYY-MM
  income: number;
  expense: number;
  note: string;
}

export interface BudgetItem {
  name: string;
  amount: number;
}

export interface Loan {
  name: string;
  amount: number;
}

export interface Assets {
  investmentTotal: number; // 投資組合總額
  liquidCash: number; // 流動現金總額
  loans: Loan[];
}

// 資產快照：每次儲存時由 Apps Script 自動記錄（每日一行），用來畫真實的淨資產走勢
export interface AssetSnapshot {
  date: string; // YYYY-MM-DD
  totalAssets: number;
  netAssets: number;
}

export interface FinanceData {
  settings: { currency: string; locale: string };
  goals: Goal[];
  monthly: MonthlyRecord[];
  budget: { fixedIncome: BudgetItem[]; fixedExpense: BudgetItem[] };
  assets: Assets;
}
