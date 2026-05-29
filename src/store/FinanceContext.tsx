import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Assets, BudgetItem, FinanceData, Goal, MonthlyRecord } from '../types';
import { seedData } from '../data/seed';

const newId = () => Math.random().toString(36).slice(2, 10);

interface FinanceContextValue {
  data: FinanceData;
  // 每月收支
  addMonthly: (record: Omit<MonthlyRecord, 'id'>) => void;
  updateMonthly: (id: string, patch: Partial<Omit<MonthlyRecord, 'id'>>) => void;
  removeMonthly: (id: string) => void;
  // 目標
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id'>>) => void;
  removeGoal: (id: string) => void;
  // 預算
  setBudget: (budget: { fixedIncome: BudgetItem[]; fixedExpense: BudgetItem[] }) => void;
  // 資產
  setAssets: (patch: Partial<Assets>) => void;
  // 備份 / 重設
  replaceAll: (data: FinanceData) => void;
  resetToSeed: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

interface FinanceProviderProps {
  children: ReactNode;
  initialData: FinanceData;
  onChange?: (data: FinanceData) => void;
}

export function FinanceProvider({ children, initialData, onChange }: FinanceProviderProps) {
  const [data, setData] = useState<FinanceData>(initialData);

  // 每次資料變動就通知外層（由保險庫負責加密並持久化）
  useEffect(() => {
    onChange?.(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const addMonthly = useCallback(
    (record: Omit<MonthlyRecord, 'id'>) =>
      setData((d) => ({
        ...d,
        monthly: [...d.monthly, { ...record, id: newId() }].sort((a, b) =>
          a.month.localeCompare(b.month)
        ),
      })),
    [setData]
  );

  const updateMonthly = useCallback(
    (id: string, patch: Partial<Omit<MonthlyRecord, 'id'>>) =>
      setData((d) => ({
        ...d,
        monthly: d.monthly
          .map((m) => (m.id === id ? { ...m, ...patch } : m))
          .sort((a, b) => a.month.localeCompare(b.month)),
      })),
    [setData]
  );

  const removeMonthly = useCallback(
    (id: string) =>
      setData((d) => ({ ...d, monthly: d.monthly.filter((m) => m.id !== id) })),
    [setData]
  );

  const addGoal = useCallback(
    (goal: Omit<Goal, 'id'>) =>
      setData((d) => ({ ...d, goals: [...d.goals, { ...goal, id: newId() }] })),
    [setData]
  );

  const updateGoal = useCallback(
    (id: string, patch: Partial<Omit<Goal, 'id'>>) =>
      setData((d) => ({
        ...d,
        goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      })),
    [setData]
  );

  const removeGoal = useCallback(
    (id: string) => setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) })),
    [setData]
  );

  const setBudget = useCallback(
    (budget: { fixedIncome: BudgetItem[]; fixedExpense: BudgetItem[] }) =>
      setData((d) => ({ ...d, budget })),
    [setData]
  );

  const setAssets = useCallback(
    (patch: Partial<Assets>) =>
      setData((d) => ({ ...d, assets: { ...d.assets, ...patch } })),
    [setData]
  );

  const replaceAll = useCallback((next: FinanceData) => setData(next), [setData]);
  const resetToSeed = useCallback(() => setData(seedData), [setData]);

  const value = useMemo<FinanceContextValue>(
    () => ({
      data,
      addMonthly,
      updateMonthly,
      removeMonthly,
      addGoal,
      updateGoal,
      removeGoal,
      setBudget,
      setAssets,
      replaceAll,
      resetToSeed,
    }),
    [
      data,
      addMonthly,
      updateMonthly,
      removeMonthly,
      addGoal,
      updateGoal,
      removeGoal,
      setBudget,
      setAssets,
      replaceAll,
      resetToSeed,
    ]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
