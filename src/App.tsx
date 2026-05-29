import { useState } from 'react';
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
        資料儲存在本機瀏覽器 · 記得到「設定」定期匯出備份
      </footer>
    </div>
  );
}
