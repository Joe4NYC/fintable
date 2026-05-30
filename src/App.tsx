import { useState } from 'react';
import { useSync } from './store/CloudProvider';
import type { SyncStatus } from './store/CloudProvider';
import { Dashboard } from './pages/Dashboard';
import { Monthly } from './pages/Monthly';
import { Goals } from './pages/Goals';
import { Budget } from './pages/Budget';
import { Settings } from './pages/Settings';

type TabId = 'dashboard' | 'monthly' | 'goals' | 'budget' | 'settings';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: '儀表板', icon: '📊' },
  { id: 'monthly', label: '每月收支', icon: '🧾' },
  { id: 'goals', label: '財務目標', icon: '🎯' },
  { id: 'budget', label: '預算', icon: '💰' },
  { id: 'settings', label: '設定', icon: '⚙️' },
];

const syncLabel: Record<SyncStatus, { text: string; cls: string }> = {
  loading: { text: '同步中…', cls: 'bg-slate-100 text-slate-500' },
  syncing: { text: '儲存中…', cls: 'bg-amber-100 text-amber-700' },
  synced: { text: '已同步', cls: 'bg-emerald-100 text-emerald-700' },
  offline: { text: '離線（用快取）', cls: 'bg-amber-100 text-amber-700' },
  error: { text: '同步失敗', cls: 'bg-rose-100 text-rose-700' },
};

function SyncBadge() {
  const sync = useSync();
  if (!sync) return null;
  const s = syncLabel[sync.status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${s.cls}`} title={sync.lastError ?? undefined}>
      ☁ {s.text}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h1 className="text-lg font-bold text-slate-800">Fintable</h1>
            <span className="text-xs text-slate-400">個人理財</span>
            <SyncBadge />
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="mr-1">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'monthly' && <Monthly />}
        {tab === 'goals' && <Goals />}
        {tab === 'budget' && <Budget />}
        {tab === 'settings' && <Settings />}
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-slate-400">
        資料同步在你的 Google Sheet · 記得到「設定」定期匯出備份
      </footer>
    </div>
  );
}
