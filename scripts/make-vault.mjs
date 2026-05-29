#!/usr/bin/env node
// 本機加密腳本：用你的密碼把 private/data.json 加密成 public/vault.json
// 密碼只在你這部電腦輸入，不會經過網路或任何人。
//
// 用法： node scripts/make-vault.mjs
//
// 演算法與瀏覽器端 src/utils/crypto.ts 完全相同（PBKDF2-SHA256 150k + AES-GCM 256）。

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PBKDF2_ITERATIONS = 150_000;

const b64 = (buf) => Buffer.from(buf).toString('base64');

function prompt(question, { hidden = false } = {}) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((resolve) => {
    if (hidden) {
      const onData = (char) => {
        const c = char.toString();
        if (c === '\n' || c === '\r' || c === '') process.stdout.write('\n');
        else process.stdout.write('*');
      };
      process.stdin.on('data', onData);
      rl.question(question, (answer) => {
        process.stdin.off('data', onData);
        rl.close();
        resolve(answer);
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

async function deriveKey(passphrase, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
}

async function main() {
  const dataPath = join(root, 'private', 'data.json');
  let plaintext;
  try {
    plaintext = await readFile(dataPath, 'utf8');
    JSON.parse(plaintext); // 驗證是合法 JSON
  } catch {
    console.error(`\n✘ 找不到或無法解析 ${dataPath}\n  請先把你的真實理財資料放到 private/data.json。`);
    process.exit(1);
  }

  const pass = await prompt('請輸入加密密碼（至少 6 字元）: ', { hidden: true });
  if (pass.length < 6) {
    console.error('✘ 密碼太短。');
    process.exit(1);
  }
  const confirm = await prompt('再次輸入密碼: ', { hidden: true });
  if (pass !== confirm) {
    console.error('✘ 兩次密碼不一致。');
    process.exit(1);
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  const vault = { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  await mkdir(join(root, 'public'), { recursive: true });
  const outPath = join(root, 'public', 'vault.json');
  await writeFile(outPath, JSON.stringify(vault, null, 2));

  console.log(`\n✅ 已產生加密檔：public/vault.json`);
  console.log('   現在可以部署了。任何人沒有你的密碼都無法解開它。');
}

main();
