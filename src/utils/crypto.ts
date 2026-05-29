// AES-GCM 加密保險庫工具（瀏覽器 WebCrypto）
// 與 scripts/make-vault.mjs 使用完全相同的參數，確保兩邊可互相解密。

export interface Vault {
  v: 1;
  salt: string; // base64
  iv: string; // base64
  ct: string; // base64（密文）
}

const PBKDF2_ITERATIONS = 150_000;

// TS 5.7 對 Uint8Array 的泛型較嚴格，WebCrypto 接受 BufferSource，這裡統一轉換。
const bs = (v: Uint8Array): BufferSource => v as unknown as BufferSource;

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    bs(new TextEncoder().encode(passphrase)),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: bs(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptVault(passphrase: string, plaintext: string): Promise<Vault> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: bs(iv) },
    key,
    bs(new TextEncoder().encode(plaintext))
  );
  return { v: 1, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
}

export async function decryptVault(passphrase: string, vault: Vault): Promise<string> {
  const salt = fromB64(vault.salt);
  const iv = fromB64(vault.iv);
  const key = await deriveKey(passphrase, salt);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bs(iv) }, key, bs(fromB64(vault.ct)));
  return new TextDecoder().decode(pt);
}

export function isVault(value: unknown): value is Vault {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as Vault).v === 1 &&
    typeof (value as Vault).salt === 'string' &&
    typeof (value as Vault).iv === 'string' &&
    typeof (value as Vault).ct === 'string'
  );
}
