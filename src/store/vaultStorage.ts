import type { FinanceData } from '../types';
import { decryptVault, encryptVault, isVault } from '../utils/crypto';
import type { Vault } from '../utils/crypto';

export const VAULT_KEY = 'fintable.vault.v1';

export function readLocalVault(): Vault | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isVault(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeLocalVault(vault: Vault): void {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
}

export function clearLocalVault(): void {
  localStorage.removeItem(VAULT_KEY);
}

// 嘗試載入隨部署包附帶的加密檔 public/vault.json（讓任何裝置開網址即可取得加密資料）
export async function fetchBundledVault(): Promise<Vault | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}vault.json`, { cache: 'no-store' });
    if (!res.ok) return null;
    const parsed = await res.json();
    return isVault(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function unlockToData(passphrase: string, vault: Vault): Promise<FinanceData> {
  const json = await decryptVault(passphrase, vault);
  return JSON.parse(json) as FinanceData;
}

export async function encryptData(passphrase: string, data: FinanceData): Promise<Vault> {
  return encryptVault(passphrase, JSON.stringify(data));
}
