import type { Assets, BudgetItem, FinanceData, Goal, MonthlyRecord } from '../types';

// 存款比率 =（收入 − 支出）/ 支出（沿用原 Google Sheet 的定義）
export function savingsRatio(record: MonthlyRecord): number {
  if (record.expense === 0) return 0;
  return (record.income - record.expense) / record.expense;
}

export function sum(items: { amount: number }[]): number {
  return items.reduce((acc, x) => acc + x.amount, 0);
}

export function totalLoans(assets: Assets): number {
  return assets.loans.reduce((acc, l) => acc + l.amount, 0);
}

// 總資產：投資組合 + 緊急後備金
export function totalAssets(assets: Assets): number {
  return assets.investmentTotal + assets.emergencyFund;
}

// 淨資產：總資產 − 借貸
export function netAssets(assets: Assets): number {
  return totalAssets(assets) - totalLoans(assets);
}

export function investmentAmount(assets: Assets): number {
  return assets.investmentTotal * assets.investmentRatio;
}

export function cashAmount(assets: Assets): number {
  return assets.investmentTotal * assets.cashRatio;
}

export function averageIncome(monthly: MonthlyRecord[]): number {
  const valid = monthly.filter((m) => m.income > 0 || m.expense > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((acc, m) => acc + m.income, 0) / valid.length;
}

export function averageExpense(monthly: MonthlyRecord[]): number {
  const valid = monthly.filter((m) => m.income > 0 || m.expense > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((acc, m) => acc + m.expense, 0) / valid.length;
}

export interface GoalProgress {
  achievementRatio: number; // 達成率
  toGo: number; // 尚差金額（可為負＝超額達標）
  daysLeft: number; // 剩餘天數
}

export function goalProgress(goal: Goal, currentAssets: number, today = new Date()): GoalProgress {
  const achievementRatio = goal.targetAmount === 0 ? 0 : currentAssets / goal.targetAmount;
  const toGo = goal.targetAmount - currentAssets;
  const target = new Date(goal.targetDate + 'T00:00:00');
  const daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000);
  return { achievementRatio, toGo, daysLeft };
}

// 預算每月可支配 = 固定收入 − 固定支出
export function disposable(fixedIncome: BudgetItem[], fixedExpense: BudgetItem[]): number {
  return sum(fixedIncome) - sum(fixedExpense);
}

// 日常流動資金可撐年數 = 淨可動用現金 /（年支出）
export function runwayYears(data: FinanceData): number {
  const avgMonthExpense = averageExpense(data.monthly);
  const liquid = cashAmount(data.assets) + data.assets.emergencyFund;
  if (avgMonthExpense === 0) return 0;
  return liquid / (avgMonthExpense * 12);
}
