# Fintable · 個人理財網站

一個以 **Google Sheet 為資料庫**的個人理財追蹤網站，資料跨裝置自動同步。由原本的 Google Sheet 資產報表改造而來。

線上版：https://Joe4NYC.github.io/fintable/

## 功能

- **儀表板**：總資產、淨資產、日常流動資金、投資/現金配置環形圖、財務目標進度、借貸總覽。
- **每月收支**：逐月收入/支出/存款比率記帳，可新增/編輯/刪除；收支柱狀圖、存款比率折線圖、月均收支。
- **財務目標**：設定目標金額與日期，自動算達成率、尚差金額、剩餘天數（依日期由近到遠排序）。
- **預算**：固定收入/支出項目編輯，計算可支配收入，並與歷史月平均對比。
- **設定**：雲端同步狀態、資產數值調整、JSON 備份匯出/匯入、清空。

> 存款比率沿用原 Google Sheet 定義：（收入 − 支出）/ 支出。
> 總資產 = 投資組合總額 + 流動現金總額；淨資產 = 總資產 − 借貸。

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產出 dist/
```

## Google Sheet 自動同步（首次使用必做）

資料存在你自己的 Google Sheet，**跨裝置自動同步**，也可直接在 Sheet 檢視/編輯。

設定步驟（約 5 分鐘，一次性）：

1. 到 https://sheets.new 新建一張空白 Google Sheet。
2. 選單 **擴充功能 → Apps Script**，把 `apps-script/Code.gs` 的內容整段貼進去（覆蓋預設程式）。
3. 把第一行的 `SECRET` 改成你自己的密鑰（任意一串字，例如 `my-secret-123`）。儲存。
4. 右上 **部署 → 新增部署作業**：
   - 類型選 **網頁應用程式**
   - **執行身分：我（你的帳號）**
   - **具存取權的使用者：任何人**
   - 按「部署」，第一次會要你授權（用你的 Google 帳號登入同意）。
5. 複製產生的 **網頁應用程式網址**（以 `/exec` 結尾）。
6. 開啟網站 → 在「連接你的 Google Sheet」畫面貼上網址與密鑰 → 「連接」。

> 更新 `Code.gs` 後，需到 **部署 → 管理部署作業 → 編輯 → 版本選「新版本」→ 部署** 才會生效。

之後在任何裝置打開網站，輸入同一組網址與密鑰即可自動同步；右上角會顯示「☁ 已同步」。

## 安全模型

- 資料以明文存在你自己的 Google Sheet（受你的 Google 帳號保護），密鑰存在瀏覽器。這跟你原本用 Google Sheet 的安全程度相同。
- 本 repo 與部署包**不含任何真實財務數字**；`private/`、`*.pdf` 已 gitignore。

## 部署（GitHub Pages）

推送到 `main` 後 GitHub Actions 會自動建置並部署到 GitHub Pages。網站本身不含資料，任何人打開都只會看到「連接 Google Sheet」畫面。

## 技術

Vite + React + TypeScript + Tailwind CSS + Recharts；後端用 Google Apps Script Web App 讀寫 Google Sheet。
