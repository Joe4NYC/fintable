import type { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';
import { demoData } from '../data/demo';
import { FinanceProvider } from './FinanceContext';

// 試用模式：用範例資料跑整個 App，不連接任何 Google Sheet。
// 不傳 onChange → 所有編輯只留在記憶體，重新整理即還原，不會儲存到任何地方。
export function DemoProvider({ children, onExit }: { children: ReactNode; onExit: () => void }) {
  return (
    <div className="min-h-screen">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-warn px-4 py-2 text-center text-sm text-slate-950">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <FlaskConical size={14} />
          試用模式 · 這是範例資料，任何修改都不會儲存
        </span>
        <button
          onClick={onExit}
          className="rounded-md bg-slate-950/90 px-3 py-1 text-xs font-medium text-white hover:bg-slate-950"
        >
          連接我的 Google Sheet →
        </button>
      </div>
      <FinanceProvider initialData={demoData}>{children}</FinanceProvider>
    </div>
  );
}
