import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AssetSnapshot, FinanceData } from '../types';
import { Button } from '../components/Button';
import { FinanceProvider } from './FinanceContext';
import { clearCloudConfig, getCloudConfig, pull, push, readCache, readSnapCache } from './cloud';

export type SyncStatus = 'loading' | 'synced' | 'syncing' | 'offline' | 'error' | 'conflict';

interface SyncState {
  status: SyncStatus;
  lastError: string | null;
  snapshots: AssetSnapshot[];
  disconnect: () => void;
  retry: () => void;
  resolveConflict: (mode: 'reload' | 'overwrite') => void;
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
  const [snapshots, setSnapshots] = useState<AssetSnapshot[]>(() => readSnapCache());

  const skipFirst = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const version = useRef<string | null>(null); // 最後已知的雲端版本戳
  const pendingData = useRef<FinanceData | null>(null); // 最新一份待同步資料（衝突時用）

  const load = () => {
    setStatus('loading');
    setLastError(null);
    pull(cfg)
      .then((res) => {
        skipFirst.current = true;
        version.current = res.updatedAt;
        setData(res.data);
        setSnapshots(res.snapshots);
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

  const sync = (next: FinanceData, force = false) => {
    push(cfg, next, version.current, { force })
      .then((res) => {
        if (res.ok) {
          version.current = res.updatedAt;
          setSnapshots(res.snapshots);
          pendingData.current = null;
          setStatus('synced');
        } else {
          // 雲端有較新資料（其他裝置改過）→ 交給使用者決定
          setStatus('conflict');
        }
      })
      .catch((err) => {
        setStatus('error');
        setLastError(String(err.message || err));
      });
  };

  const handleChange = (next: FinanceData) => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return; // 略過載入後的首次回呼
    }
    pendingData.current = next;
    if (timer.current) clearTimeout(timer.current);
    if (status !== 'conflict') setStatus('syncing');
    timer.current = setTimeout(() => sync(next), 800);
  };

  const resolveConflict = (mode: 'reload' | 'overwrite') => {
    if (mode === 'reload') {
      location.reload(); // 重新載入雲端版本（放棄此處未同步的修改）
    } else if (pendingData.current) {
      setStatus('syncing');
      sync(pendingData.current, true); // 以本機資料強制覆蓋雲端
    }
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
    <SyncContext.Provider value={{ status, lastError, snapshots, disconnect, retry: load, resolveConflict }}>
      {status === 'conflict' && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 bg-warn px-4 py-2 text-center text-sm text-slate-950">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <AlertTriangle size={14} />
            雲端有較新的資料（可能在其他裝置改過）
          </span>
          <span className="flex gap-2">
            <button
              onClick={() => resolveConflict('reload')}
              className="rounded-md bg-slate-950/90 px-3 py-1 text-xs font-medium text-white hover:bg-slate-950"
            >
              載入雲端版本
            </button>
            <button
              onClick={() => resolveConflict('overwrite')}
              className="rounded-md border border-slate-950/40 px-3 py-1 text-xs font-medium text-slate-950 hover:bg-slate-950/10"
            >
              以此處覆蓋
            </button>
          </span>
        </div>
      )}
      <FinanceProvider initialData={data!} onChange={handleChange}>
        {children}
      </FinanceProvider>
    </SyncContext.Provider>
  );
}
