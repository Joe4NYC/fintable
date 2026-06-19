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

// 總資產：投資組合總額 + 流動現金總額
export function totalAssets(assets: Assets): number {
  return assets.investmentTotal + (assets.liquidCash || 0);
}

// 淨資產：總資產 − 借貸
export function netAssets(assets: Assets): number {
  return totalAssets(assets) - totalLoans(assets);
}

export function investmentAmount(assets: Assets): number {
  return assets.investmentTotal;
}

export function cashAmount(assets: Assets): number {
  return assets.liquidCash || 0;
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
  // 穩健解析：支援 "2027-01-01" 或完整日期字串；無效則 daysLeft = NaN
  const target = new Date(goal.targetDate);
  const daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000);
  return { achievementRatio, toGo, daysLeft };
}

export interface GoalProjection {
  alreadyMet: boolean; // 已達標
  reachable: boolean; // 依目前儲蓄速度是否會達標
  monthsNeeded: number | null; // 還需多少個月（向上取整）
  projectedDate: string | null; // 預計達標年月 "YYYY-MM"
  diffMonths: number | null; // 對比目標日期：負＝提前，正＝延遲（目標日期無效則 null）
}

// 依「平均每月結餘」推算目標預計達標日，並與目標日期比較。
export function projectGoal(
  goal: Goal,
  currentNet: number,
  avgMonthlyNet: number,
  today = new Date()
): GoalProjection {
  if (currentNet >= goal.targetAmount) {
    return { alreadyMet: true, reachable: true, monthsNeeded: 0, projectedDate: null, diffMonths: null };
  }
  if (avgMonthlyNet <= 0) {
    return { alreadyMet: false, reachable: false, monthsNeeded: null, projectedDate: null, diffMonths: null };
  }
  const monthsNeeded = Math.ceil((goal.targetAmount - currentNet) / avgMonthlyNet);
  const proj = new Date(today.getFullYear(), today.getMonth() + monthsNeeded, 1);
  const projectedDate = `${proj.getFullYear()}-${String(proj.getMonth() + 1).padStart(2, '0')}`;

  let diffMonths: number | null = null;
  const target = new Date(goal.targetDate);
  if (!isNaN(target.getTime())) {
    diffMonths = (proj.getFullYear() - target.getFullYear()) * 12 + (proj.getMonth() - target.getMonth());
  }
  return { alreadyMet: false, reachable: true, monthsNeeded, projectedDate, diffMonths };
}

// 預算每月可支配 = 固定收入 − 固定支出
export function disposable(fixedIncome: BudgetItem[], fixedExpense: BudgetItem[]): number {
  return sum(fixedIncome) - sum(fixedExpense);
}

// 日常流動資金可撐月數 = 流動現金總額 /（月支出）
export function runwayMonths(data: FinanceData): number {
  const avgMonthExpense = averageExpense(data.monthly);
  const liquid = data.assets.liquidCash || 0;
  if (avgMonthExpense === 0) return 0;
  return liquid / avgMonthExpense;
}
