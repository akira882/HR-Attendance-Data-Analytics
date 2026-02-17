const fs = require('fs');
const path = require('path');

// TypeScriptファイルを動的にインポートするために、Node.jsの実行時コンパイルを使用
const excelPath = path.join(__dirname, '..', 'public', 'attendances_sample.xlsx');

// 簡易テスト用に、パース処理を直接実行
const XLSX = require('xlsx');

// formatExcelTime関数のコピー
function formatExcelTime(value) {
  if (value === null || value === undefined || value === '') return '';

  if (typeof value === 'number') {
    if (value >= 0 && value < 1) {
      const totalMinutes = Math.round(value * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    if (value >= 0 && value <= 24) {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return String(value);
  }

  const str = String(value).trim();
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    return str.substring(0, 5);
  }
  return str;
}

// matchesKeyword関数のコピー
function matchesKeyword(text, keywords) {
  if (typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase();

  // 完全一致を優先
  for (const k of keywords) {
    if (clean === k.toLowerCase()) return true;
  }

  // 部分一致をチェック
  for (const k of keywords) {
    if (clean.includes(k.toLowerCase()) || k.toLowerCase().includes(clean)) {
      return true;
    }
  }

  return false;
}

// Excelファイルをパース
const fileBuffer = fs.readFileSync(excelPath);
const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: false });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('=== Excelファイル解析テスト ===\n');

// ヘッダー検出
let headerIndex = -1;
const colIndices = {
  id: -1, name: -1, dept: -1, date: -1, checkIn: -1, checkOut: -1, break: -1, overtime: -1
};

const keywords = {
  id: ['社員ID', 'ID', '社員番号'],
  name: ['氏名', '名前', 'employeeName'],
  dept: ['部署', '部門', '所属', 'department'],
  date: ['日付', 'date'],
  checkIn: ['出勤時刻', '出勤', '始業', 'checkIn'],
  checkOut: ['退勤時刻', '退勤', '終業', 'checkOut'],
  break: ['休憩分', '休憩', 'break'],
  overtime: ['残業時間', '残業', 'overtime']
};

for (let i = 0; i < Math.min(rows.length, 20); i++) {
  const row = rows[i];
  if (!Array.isArray(row)) continue;

  let matchCount = 0;
  const tempIndices = {};

  row.forEach((cell, idx) => {
    const cellStr = String(cell || '').trim();
    if (!cellStr) return;

    if (!tempIndices.overtime && matchesKeyword(cellStr, keywords.overtime)) {
      tempIndices.overtime = idx;
      matchCount++;
      return;
    }
    if (!tempIndices.checkOut && matchesKeyword(cellStr, keywords.checkOut)) {
      tempIndices.checkOut = idx;
      matchCount++;
      return;
    }
    if (!tempIndices.checkIn && matchesKeyword(cellStr, keywords.checkIn)) {
      tempIndices.checkIn = idx;
      matchCount++;
      return;
    }
    if (!tempIndices.break && matchesKeyword(cellStr, keywords.break)) {
      tempIndices.break = idx;
      matchCount++;
      return;
    }
    if (!tempIndices.id && matchesKeyword(cellStr, keywords.id)) {
      tempIndices.id = idx;
      matchCount++;
      return;
    }
    if (!tempIndices.name && matchesKeyword(cellStr, keywords.name)) {
      tempIndices.name = idx;
      matchCount++;
      return;
    }
    if (!tempIndices.dept && matchesKeyword(cellStr, keywords.dept)) {
      tempIndices.dept = idx;
      matchCount++;
      return;
    }
    if (!tempIndices.date && matchesKeyword(cellStr, keywords.date)) {
      tempIndices.date = idx;
      matchCount++;
      return;
    }
  });

  if (matchCount >= 4) {
    headerIndex = i;
    Object.assign(colIndices, tempIndices);
    console.log(`✅ ヘッダー行を検出: 行${i + 1}`);
    console.log('📋 ヘッダー内容:', row);
    console.log('🗂️  列マッピング:', colIndices);
    console.log();
    break;
  }
}

if (headerIndex === -1) {
  console.error('❌ ヘッダー行が見つかりませんでした');
  process.exit(1);
}

// データ行をパース（最初の5件のみ）
console.log('=== データ行の解析（最初の5件） ===\n');

let count = 0;
for (let i = headerIndex + 1; i < rows.length && count < 5; i++) {
  const row = rows[i];
  if (!Array.isArray(row)) continue;

  const id = String(row[colIndices.id] || '').trim();
  const name = String(row[colIndices.name] || '').trim();

  if (!id && !name) continue;

  const checkInRaw = row[colIndices.checkIn];
  const checkOutRaw = row[colIndices.checkOut];
  const checkInFormatted = formatExcelTime(checkInRaw);
  const checkOutFormatted = formatExcelTime(checkOutRaw);

  console.log(`📝 行${i + 1}:`);
  console.log(`   社員ID: ${id}`);
  console.log(`   氏名: ${name}`);
  console.log(`   出勤時刻 (raw): ${JSON.stringify(checkInRaw)} → (formatted): "${checkInFormatted}"`);
  console.log(`   退勤時刻 (raw): ${JSON.stringify(checkOutRaw)} → (formatted): "${checkOutFormatted}"`);
  console.log();

  count++;
}

console.log('✅ テスト完了');
