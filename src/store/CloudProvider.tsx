import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { FinanceData } from '../types';
import { FinanceProvider } from './FinanceContext';
import { clearCloudConfig, getCloudConfig, pull, push, readCache } from './cloud';

export type SyncStatus = 'loading' | 'synced' | 'syncing' | 'offline' | 'error';

interface SyncState {
  status: SyncStatus;
  lastError: string | null;
  disconnect: () => void;
  retry: () => void;
}

const SyncContext = createContext<SyncState | null>(null);
export function useSync(): SyncState | null {
  return useContext(SyncContext);
}

export function CloudProvider({ children }: { children: ReactNode }) {
  const cfg = getCloudConfig()!; // RootGate 已確保存在
  const [status, setStatus] = useState<SyncStatus>('loading');
  const [lastError, setLastError] = useState<string | null>(null);
  const [data, setData] = useState<FinanceData | null>(null);

  const skipFirst = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = () => {
    setStatus('loading');
    setLastError(null);
    pull(cfg)
      .then((d) => {
        skipFirst.current = true;
        setData(d);
        setStatus('synced');
      })
      .catch((err) => {
        const cache = readCache();
        if (cache) {
          skipFirst.current = true;
          setData(cache);
          setStatus('offline');
          setLastError(String(err.message || err));
        } else {
          setStatus('error');
          setLastError(String(err.message || err));
        }
      });
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (next: FinanceData) => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return; // 略過載入後的首次回呼
    }
    if (timer.current) clearTimeout(timer.current);
    setStatus('syncing');
    timer.current = setTimeout(() => {
      push(cfg, next)
        .then(() => setStatus('synced'))
        .catch((err) => {
          setStatus('error');
          setLastError(String(err.message || err));
        });
    }, 800);
  };

  const disconnect = () => {
    clearCloudConfig();
    location.reload();
  };

  if (status === 'loading') {
    return <div className="grid min-h-screen place-items-center text-slate-400">與 Google Sheet 同步中…</div>;
  }

  if (status === 'error' && !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-sm ring-1 ring-slate-200">
          <div className="text-3xl">⚠️</div>
          <h1 className="mt-2 text-base font-bold text-slate-800">無法連接 Google Sheet</h1>
          <p className="mt-2 break-words text-xs text-slate-400">{lastError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={load} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              重試
            </button>
            <button onClick={disconnect} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              重新輸入連接資料
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SyncContext.Provider value={{ status, lastError, disconnect, retry: load }}>
      <FinanceProvider initialData={data!} onChange={handleChange}>
        {children}
      </FinanceProvider>
    </SyncContext.Provider>
  );
}
