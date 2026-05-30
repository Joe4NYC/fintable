import { useState } from 'react';
import {
  Cloud,
  CloudOff,
  LayoutDashboard,
  Loader,
  NotebookText,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSync } from './store/CloudProvider';
import type { SyncStatus } from './store/CloudProvider';
import { Dashboard } from './pages/Dashboard';
import { Monthly } from './pages/Monthly';
import { Goals } from './pages/Goals';
import { Budget } from './pages/Budget';
import { Settings } from './pages/Settings';

type TabId = 'dashboard' | 'monthly' | 'goals' | 'budget' | 'settings';

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: '儀表板', icon: LayoutDashboard },
  { id: 'monthly', label: '每月收支', icon: NotebookText },
  { id: 'goals', label: '財務目標', icon: Target },
  { id: 'budget', label: '預算', icon: Wallet },
  { id: 'settings', label: '設定', icon: SettingsIcon },
];

const syncLabel: Record<SyncStatus, { text: string; cls: string; icon: LucideIcon; spin?: boolean }> = {
  loading: { text: '同步中…', cls: 'bg-surface-2 text-content-muted', icon: Loader, spin: true },
  syncing: { text: '儲存中…', cls: 'bg-warn/15 text-warn', icon: Loader, spin: true },
  synced: { text: '已同步', cls: 'bg-brand/15 text-brand', icon: Cloud },
  offline: { text: '離線（用快取）', cls: 'bg-warn/15 text-warn', icon: CloudOff },
  error: { text: '同步失敗', cls: 'bg-danger/15 text-danger', icon: CloudOff },
};

function SyncBadge() {
  const sync = useSync();
  if (!sync) return null;
  const s = syncLabel[sync.status];
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.cls}`}
      title={sync.lastError ?? undefined}
    >
      <Icon size={12} className={s.spin ? 'animate-spin' : ''} />
      {s.text}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-brand" />
            <h1 className="text-lg font-bold text-content">Fintable</h1>
            <span className="hidden text-xs text-content-faint sm:inline">個人理財</span>
            <SyncBadge />
          </div>
          {/* 桌面：頂部導覽 */}
          <nav className="hidden gap-1 sm:flex">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                    active ? 'bg-brand text-slate-950' : 'text-content-muted hover:bg-surface-2 hover:text-content'
                  }`}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:pb-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'monthly' && <Monthly />}
        {tab === 'goals' && <Goals />}
        {tab === 'budget' && <Budget />}
        {tab === 'settings' && <Settings />}
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-6 pb-24 text-center text-xs text-content-faint sm:pb-6">
        資料同步在你的 Google Sheet · 記得到「設定」定期匯出備份
      </footer>

      {/* 手機：底部導覽列 */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-5xl">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                  active ? 'text-brand' : 'text-content-faint'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
