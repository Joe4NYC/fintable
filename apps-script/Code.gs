/**
 * Fintable — Google Sheet 後端 (Apps Script Web App)
 *
 * 部署步驟見專案 README「Google Sheet 自動同步」章節。
 * 重點：
 *  1. 改下面的 SECRET 為你自己的密鑰（任意一串字，網站連接時要填一樣的）。
 *  2. 「部署 → 新增部署作業 → 類型：網頁應用程式」
 *     - 執行身分：我（你自己）
 *     - 具存取權的使用者：任何人
 *  3. 複製產生的 /exec 網址，貼到網站「設定 → 雲端同步」。
 *
 * 資料以結構化分頁儲存，你可以直接在 Google Sheet 檢視/編輯。
 */

const SECRET = '在這裡換成你自己的密鑰';

const TABS = {
  monthly: '每月收支',
  goals: '財務目標',
  budget: '預算',
  assets: '資產',
  loans: '借貸',
  settings: '設定',
  snapshots: '資產快照',
};

function doGet() {
  return json({ ok: true, service: 'fintable', ts: new Date().toISOString() });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.token !== SECRET) return json({ ok: false, error: 'unauthorized' });

    if (body.action === 'load') {
      return json({
        ok: true,
        data: readAll(),
        snapshots: readSnapshots(),
        updatedAt: getUpdatedAt() || null,
      });
    }
    if (body.action === 'save') {
      // 多裝置寫入保護：避免兩部裝置互相覆蓋
      const lock = LockService.getScriptLock();
      if (!lock.tryLock(10000)) return json({ ok: false, error: 'busy' });
      try {
        const stored = getUpdatedAt();
        if (!body.force && body.baseUpdatedAt !== undefined && stored && body.baseUpdatedAt !== stored) {
          return json({ ok: false, error: 'conflict' });
        }
        writeAll(body.data || {});
        upsertSnapshot((body.data || {}).assets || {});
        const ts = new Date().toISOString();
        setUpdatedAt(ts);
        return json({ ok: true, updatedAt: ts, snapshots: readSnapshots() });
      } finally {
        lock.releaseLock();
      }
    }
    return json({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function sheetByName(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers && headers.length) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sh;
}

function rows(sh) {
  const last = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, lastCol).getValues();
}

function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

// ---------- 讀取 ----------
function readAll() {
  const monthlySh = sheetByName(TABS.monthly, ['月份', '收入', '支出', '備註']);
  const monthly = rows(monthlySh)
    .filter((r) => String(r[0]).trim() !== '')
    .map((r, i) => ({
      id: 'm' + (i + 1),
      month: String(r[0]).trim(),
      income: num(r[1]),
      expense: num(r[2]),
      note: String(r[3] || ''),
    }));

  const goalsSh = sheetByName(TABS.goals, ['名稱', '目標金額', '目標日期']);
  const goals = rows(goalsSh)
    .filter((r) => String(r[0]).trim() !== '')
    .map((r, i) => ({
      id: 'g' + (i + 1),
      name: String(r[0]).trim(),
      targetAmount: num(r[1]),
      targetDate: toDateStr(r[2]),
    }));

  const budgetSh = sheetByName(TABS.budget, ['類型', '項目', '金額']);
  const fixedIncome = [];
  const fixedExpense = [];
  rows(budgetSh).forEach((r) => {
    const type = String(r[0]).trim();
    const item = { name: String(r[1] || '').trim(), amount: num(r[2]) };
    if (!item.name) return;
    if (type === '支出') fixedExpense.push(item);
    else fixedIncome.push(item);
  });

  const assetsSh = sheetByName(TABS.assets, ['項目', '數值']);
  const aMap = {};
  rows(assetsSh).forEach((r) => (aMap[String(r[0]).trim()] = num(r[1])));

  const loansSh = sheetByName(TABS.loans, ['名稱', '金額']);
  const loans = rows(loansSh)
    .filter((r) => String(r[0]).trim() !== '')
    .map((r) => ({ name: String(r[0]).trim(), amount: num(r[1]) }));

  const settingsSh = sheetByName(TABS.settings, ['設定', '值']);
  const sMap = {};
  rows(settingsSh).forEach((r) => (sMap[String(r[0]).trim()] = String(r[1] || '').trim()));

  return {
    settings: { currency: sMap.currency || 'HKD', locale: sMap.locale || 'zh-HK' },
    goals: goals,
    monthly: monthly,
    budget: { fixedIncome: fixedIncome, fixedExpense: fixedExpense },
    assets: {
      investmentTotal: aMap.investmentTotal || 0,
      liquidCash: aMap.liquidCash || 0,
      loans: loans,
    },
  };
}

function toDateStr(v) {
  // 用方法偵測而非 instanceof（跨執行環境較穩健）
  if (v && typeof v.getFullYear === 'function') {
    const y = v.getFullYear();
    const m = ('0' + (v.getMonth() + 1)).slice(-2);
    const d = ('0' + v.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }
  return String(v || '').trim();
}

// ---------- 寫入 ----------
function writeTable(name, headers, dataRows) {
  const sh = sheetByName(name, headers);
  const maxRows = sh.getMaxRows();
  if (maxRows > 1) sh.getRange(2, 1, maxRows - 1, sh.getMaxColumns()).clearContent();
  if (dataRows.length) {
    sh.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);
  }
}

function writeAll(data) {
  const monthly = (data.monthly || []).map((m) => [
    "'" + String(m.month), // 前置 ' 強制文字，避免被當日期
    num(m.income),
    num(m.expense),
    String(m.note || ''),
  ]);
  // 月份欄設為文字格式
  const monthlySh = sheetByName(TABS.monthly, ['月份', '收入', '支出', '備註']);
  if (monthlySh.getMaxRows() > 1)
    monthlySh.getRange(2, 1, monthlySh.getMaxRows() - 1, monthlySh.getMaxColumns()).clearContent();
  if (monthly.length) {
    monthlySh.getRange(2, 1, monthly.length, 1).setNumberFormat('@');
    monthlySh
      .getRange(2, 1, monthly.length, 4)
      .setValues((data.monthly || []).map((m) => [String(m.month), num(m.income), num(m.expense), String(m.note || '')]));
  }

  const goalsSh = sheetByName(TABS.goals, ['名稱', '目標金額', '目標日期']);
  if (goalsSh.getMaxRows() > 1)
    goalsSh.getRange(2, 1, goalsSh.getMaxRows() - 1, goalsSh.getMaxColumns()).clearContent();
  const goalRows = (data.goals || []).map((g) => [
    String(g.name || ''),
    num(g.targetAmount),
    String(g.targetDate || ''),
  ]);
  if (goalRows.length) {
    goalsSh.getRange(2, 3, goalRows.length, 1).setNumberFormat('@'); // 日期欄存為文字
    goalsSh.getRange(2, 1, goalRows.length, 3).setValues(goalRows);
  }

  const budgetRows = []
    .concat((data.budget && data.budget.fixedIncome) || [])
    .map((it) => ['收入', String(it.name || ''), num(it.amount)])
    .concat(
      ((data.budget && data.budget.fixedExpense) || []).map((it) => ['支出', String(it.name || ''), num(it.amount)])
    );
  writeTable(TABS.budget, ['類型', '項目', '金額'], budgetRows);

  const a = data.assets || {};
  writeTable(TABS.assets, ['項目', '數值'], [
    ['investmentTotal', num(a.investmentTotal)],
    ['liquidCash', num(a.liquidCash)],
  ]);

  writeTable(
    TABS.loans,
    ['名稱', '金額'],
    (a.loans || []).map((l) => [String(l.name || ''), num(l.amount)])
  );

  const s = data.settings || {};
  writeTable(TABS.settings, ['設定', '值'], [
    ['currency', String(s.currency || 'HKD')],
    ['locale', String(s.locale || 'zh-HK')],
  ]);
}

// ---------- 資產快照（每日一行，儲存時自動記錄） ----------
function readSnapshots() {
  const sh = sheetByName(TABS.snapshots, ['日期', '總資產', '淨資產']);
  return rows(sh)
    .filter((r) => String(r[0]).trim() !== '')
    .map((r) => ({ date: toDateStr(r[0]), totalAssets: num(r[1]), netAssets: num(r[2]) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function upsertSnapshot(assets) {
  const sh = sheetByName(TABS.snapshots, ['日期', '總資產', '淨資產']);
  const total = num(assets.investmentTotal) + num(assets.liquidCash);
  const loans = (assets.loans || []).reduce(function (acc, l) {
    return acc + num(l.amount);
  }, 0);
  const net = total - loans;
  const today = toDateStr(new Date());

  const all = rows(sh);
  let rowIdx = -1;
  for (let i = 0; i < all.length; i++) {
    if (toDateStr(all[i][0]) === today) {
      rowIdx = i + 2;
      break;
    }
  }
  if (rowIdx === -1) {
    sh.appendRow([today, total, net]);
  } else {
    sh.getRange(rowIdx, 1, 1, 3).setValues([[today, total, net]]);
  }
}

// ---------- 版本戳（多裝置寫入保護用） ----------
function getUpdatedAt() {
  return PropertiesService.getScriptProperties().getProperty('updatedAt') || '';
}

function setUpdatedAt(ts) {
  PropertiesService.getScriptProperties().setProperty('updatedAt', ts);
}
