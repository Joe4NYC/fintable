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

export interface FinanceData {
  settings: { currency: string; locale: string };
  goals: Goal[];
  monthly: MonthlyRecord[];
  budget: { fixedIncome: BudgetItem[]; fixedExpense: BudgetItem[] };
  assets: Assets;
}
