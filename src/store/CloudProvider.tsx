import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { FinanceData } from '../types';
import { Button } from '../components/Button';
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
    return <div className="grid min-h-screen place-items-center text-content-faint">與 Google Sheet 同步中…</div>;
  }

  if (status === 'error' && !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-4">
        <div className="w-full max-w-sm rounded-card bg-surface p-7 text-center shadow-card ring-1 ring-line">
          <div className="flex justify-center">
            <AlertTriangle size={32} className="text-warn" />
          </div>
          <h1 className="mt-2 text-base font-bold text-content">無法連接 Google Sheet</h1>
          <p className="mt-2 break-words text-xs text-content-faint">{lastError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button onClick={load}>重試</Button>
            <Button variant="secondary" onClick={disconnect}>
              重新輸入連接資料
            </Button>
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
