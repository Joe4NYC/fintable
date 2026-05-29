# Fintable · 個人理財網站

一個純前端、可離線、**密碼加密**的個人理財追蹤網站。資料用你的密碼經 AES-GCM 加密後才儲存（localStorage / vault.json），沒有密碼一律是亂碼。由原本的 Google Sheet 資產報表改造而來。

線上版：https://Joe4NYC.github.io/fintable/

## 功能

- **儀表板**：總資產、淨資產、緊急後備金、日常流動資金、投資/現金配置環形圖、財務目標進度、借貸總覽。
- **每月收支**：逐月收入/支出/存款比率記帳，可新增/編輯/刪除；收支柱狀圖、存款比率折線圖、月均收支。
- **財務目標**：設定目標金額與日期，自動算達成率、尚差金額、剩餘天數。
- **預算**：固定收入/支出項目編輯，計算可支配收入，並與歷史月平均對比。
- **設定**：加密匯出/匯入、更改密碼、立即鎖定；資產數值調整；明文備份與清空。

> 存款比率沿用原 Google Sheet 定義：（收入 − 支出）/ 支出。

## 安全模型

- 你的真實財務數字的**明文絕不進入 git 或部署包**：放在 `private/data.json`（已 gitignore）。
- 只有用你密碼加密後的 `vault.json`（亂碼）會被部署，安全性取決於密碼強度。
- 密碼用於加密、**無法找回**；忘記密碼資料救不回，請牢記並保留加密備份。

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產出 dist/
```

## 部署你的加密資料到線上版

1. 把真實資料放到 `private/data.json`（格式見該檔）。
2. 本機產生加密檔（會要你輸入密碼，密碼只留在你電腦）：
   ```bash
   node scripts/make-vault.mjs        # 產生 public/vault.json
   ```
3. 把加密檔提交並推送（`vault.json` 預設被 gitignore，需強制加入）：
   ```bash
   git add -f public/vault.json && git commit -m "Add encrypted vault" && git push
   ```
4. GitHub Actions 會自動重新部署。任何裝置打開網址 → 輸入密碼 → 解鎖。

> 不想把資料（即使加密）放上 repo？也可在線上版用「從加密備份檔還原」，每部裝置匯入一次 `vault.json` 即可，資料只留在該裝置瀏覽器。

## 技術

Vite + React + TypeScript + Tailwind CSS + Recharts。WebCrypto（PBKDF2-SHA256 150k + AES-GCM 256）。
