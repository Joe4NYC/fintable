import type { AssetSnapshot, FinanceData } from '../types';

const CLOUD_KEY = 'fintable.cloud.v1';
const CACHE_KEY = 'fintable.cloudcache.v1';
const SNAP_CACHE_KEY = 'fintable.snapcache.v1';

export interface CloudConfig {
  url: string; // Apps Script /exec 網址
  token: string; // 與 Apps Script SECRET 相同的密鑰
}

export function getCloudConfig(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(CLOUD_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CloudConfig;
    return c.url && c.token ? c : null;
  } catch {
    return null;
  }
}

export function setCloudConfig(cfg: CloudConfig): void {
  localStorage.setItem(CLOUD_KEY, JSON.stringify(cfg));
}

export function clearCloudConfig(): void {
  localStorage.removeItem(CLOUD_KEY);
}

// 離線快取：雲端讀不到時退而求其次顯示上次資料
export function readCache(): FinanceData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as FinanceData) : null;
  } catch {
    return null;
  }
}
export function writeCache(data: FinanceData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function readSnapCache(): AssetSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAP_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AssetSnapshot[]) : [];
  } catch {
    return [];
  }
}
function writeSnapCache(snapshots: AssetSnapshot[]): void {
  try {
    localStorage.setItem(SNAP_CACHE_KEY, JSON.stringify(snapshots));
  } catch {
    /* ignore */
  }
}

// 用 text/plain 避免 CORS 預檢；Apps Script 以 e.postData.contents 讀取 body
async function call<T>(cfg: CloudConfig, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: cfg.token, ...payload }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const out = (await res.json()) as { ok: boolean; error?: string } & T;
  if (!out.ok) throw new Error(out.error || '伺服器回報失敗');
  return out;
}

export async function ping(cfg: CloudConfig): Promise<boolean> {
  // 用一次 load 當作連線測試
  await call<{ data: FinanceData }>(cfg, { action: 'load' });
  return true;
}

export interface LoadResult {
  data: FinanceData;
  snapshots: AssetSnapshot[];
  updatedAt: string | null;
}

export async function pull(cfg: CloudConfig): Promise<LoadResult> {
  const out = await call<{ data: FinanceData; snapshots?: AssetSnapshot[]; updatedAt?: string | null }>(cfg, {
    action: 'load',
  });
  writeCache(out.data);
  const snapshots = out.snapshots || [];
  writeSnapCache(snapshots);
  return { data: out.data, snapshots, updatedAt: out.updatedAt ?? null };
}

// push 結果：成功（帶新版本戳與快照），或偵測到雲端有較新資料（衝突）
export type PushResult =
  | { ok: true; updatedAt: string | null; snapshots: AssetSnapshot[] }
  | { ok: false; conflict: true };

export async function push(
  cfg: CloudConfig,
  data: FinanceData,
  baseUpdatedAt: string | null,
  opts?: { force?: boolean }
): Promise<PushResult> {
  try {
    const out = await call<{ updatedAt?: string | null; snapshots?: AssetSnapshot[] }>(cfg, {
      action: 'save',
      data,
      baseUpdatedAt: baseUpdatedAt ?? undefined,
      force: opts?.force ? true : undefined,
    });
    writeCache(data);
    const snapshots = out.snapshots || [];
    writeSnapCache(snapshots);
    return { ok: true, updatedAt: out.updatedAt ?? null, snapshots };
  } catch (err) {
    if ((err as Error).message === 'conflict') return { ok: false, conflict: true };
    throw err;
  }
}
