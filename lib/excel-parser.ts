import * as XLSX from 'xlsx';
import {
  AttendanceRecord,
  AttendanceError,
  MonthlySummary,
  DepartmentSummary,
  EmployeeSummary,
  DailySummary,
} from './types';

// ユーティリティ: 完全一致をチェック
function exactMatch(text: string | any, keywords: string[]): boolean {
  if (typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase();
  return keywords.some(k => clean === k.toLowerCase());
}

// ユーティリティ: 部分一致をチェック
function partialMatch(text: string | any, keywords: string[]): boolean {
  if (typeof text !== 'string' || keywords.length === 0) return false;
  const clean = text.trim().toLowerCase();
  return keywords.some(k => clean.includes(k.toLowerCase()));
}

// ユーティリティ: Excelのシリアル値（0.71等）または文字列を時刻文字列（17:00等）に変換
function formatExcelTime(value: any): string {
  if (value === null || value === undefined || value === '') return '';

  // 数値の場合
  if (typeof value === 'number') {
    // Excelの時刻シリアル値（0〜1の範囲）
    if (value > 0 && value < 1) {
      const totalMinutes = Math.round(value * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // 日時シリアル値の場合（1以上）、小数部分のみを使用
    if (value >= 1) {
      const timePart = value - Math.floor(value);
      if (timePart > 0) {
        const totalMinutes = Math.round(timePart * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
    }

    // 0の場合は空文字を返す（時刻が設定されていない）
    if (value === 0) return '';

    // その他の数値はそのまま文字列化（エラーとして扱う）
    return String(value);
  }

  // 文字列の場合
  const str = String(value).trim();

  // 空文字
  if (!str) return '';

  // "HH:MM:SS" -> "HH:MM"
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    return str.substring(0, 5);
  }

  // "HH:MM" 形式はそのまま
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const [h, m] = str.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }

  // その他はそのまま返す
  return str;
}

// Excelファイルをパースして勤怠データを抽出
export function parseExcelFile(fileBuffer: ArrayBuffer): AttendanceRecord[] {
  const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // RAWデータ（2次元配列）として取得
  const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

  // 1. ヘッダー行を特定する
  let headerIndex = -1;
  const colIndices: Record<string, number> = {
    id: -1, name: -1, dept: -1, date: -1, checkIn: -1, checkOut: -1, break: -1, overtime: -1
  };

  // より具体的なキーワードを優先するため、完全一致用と部分一致用に分ける
  const exactKeywords = {
    id: ['社員ID', '社員番号', 'employeeId'],
    name: ['氏名', 'employeeName'],
    dept: ['部署', '部門', 'department'],
    date: ['日付', 'date'],
    checkIn: ['出勤時刻', 'checkIn'],
    checkOut: ['退勤時刻', 'checkOut'],
    break: ['休憩分', 'break'],
    overtime: ['残業時間', 'overtime']
  };

  const partialKeywords = {
    id: ['ID', '番号'],
    name: ['名前', '氏', '名'],
    dept: ['所属'],
    date: [],
    checkIn: ['出勤', '始業'],
    checkOut: ['退勤', '終業'],
    break: ['休憩'],
    overtime: ['残業']
  };

  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    const tempIndices: any = {};

    // ステップ1: 完全一致で列をマッピング
    row.forEach((cell, idx) => {
      const cellStr = String(cell || '').trim();
      if (!cellStr) return;

      if (!tempIndices.id && exactMatch(cellStr, exactKeywords.id)) tempIndices.id = idx;
      else if (!tempIndices.name && exactMatch(cellStr, exactKeywords.name)) tempIndices.name = idx;
      else if (!tempIndices.dept && exactMatch(cellStr, exactKeywords.dept)) tempIndices.dept = idx;
      else if (!tempIndices.date && exactMatch(cellStr, exactKeywords.date)) tempIndices.date = idx;
      else if (!tempIndices.checkIn && exactMatch(cellStr, exactKeywords.checkIn)) tempIndices.checkIn = idx;
      else if (!tempIndices.checkOut && exactMatch(cellStr, exactKeywords.checkOut)) tempIndices.checkOut = idx;
      else if (!tempIndices.break && exactMatch(cellStr, exactKeywords.break)) tempIndices.break = idx;
      else if (!tempIndices.overtime && exactMatch(cellStr, exactKeywords.overtime)) tempIndices.overtime = idx;
    });

    // ステップ2: 完全一致で見つからなかった列を部分一致で探す
    row.forEach((cell, idx) => {
      const cellStr = String(cell || '').trim();
      if (!cellStr) return;

      // すでにマッピングされている列はスキップ
      if (Object.values(tempIndices).includes(idx)) return;

      if (!tempIndices.id && partialMatch(cellStr, partialKeywords.id)) tempIndices.id = idx;
      else if (!tempIndices.name && partialMatch(cellStr, partialKeywords.name)) tempIndices.name = idx;
      else if (!tempIndices.dept && partialMatch(cellStr, partialKeywords.dept)) tempIndices.dept = idx;
      else if (!tempIndices.checkIn && partialMatch(cellStr, partialKeywords.checkIn)) tempIndices.checkIn = idx;
      else if (!tempIndices.checkOut && partialMatch(cellStr, partialKeywords.checkOut)) tempIndices.checkOut = idx;
      else if (!tempIndices.break && partialMatch(cellStr, partialKeywords.break)) tempIndices.break = idx;
      else if (!tempIndices.overtime && partialMatch(cellStr, partialKeywords.overtime)) tempIndices.overtime = idx;
    });

    const matchCount = Object.keys(tempIndices).length;

    // 重要なカラムが半分以上見つかればそこをヘッダーとする
    if (matchCount >= 4) {
      headerIndex = i;
      Object.assign(colIndices, tempIndices);
      console.log('🔍 検出されたヘッダー行:', i);
      console.log('📋 ヘッダー内容:', row);
      console.log('🗂️  列マッピング:', colIndices);
      break;
    }
  }

  // ヘッダーが見つからない場合は従来の方式を試みるか、空を返す
  if (headerIndex === -1) {
    console.warn('⚠️ ヘッダー行が見つかりませんでした');
    return [];
  }

  const records: AttendanceRecord[] = [];

  // 2. データ行を抽出する（ヘッダー以降）
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    const id = String(row[colIndices.id] || '').trim();
    const name = String(row[colIndices.name] || '').trim();

    // 社員IDまたは氏名がない行は空行として無視する
    if (!id && !name) continue;

    const checkInRaw = row[colIndices.checkIn];
    const checkOutRaw = row[colIndices.checkOut];
    const checkInFormatted = formatExcelTime(checkInRaw);
    const checkOutFormatted = formatExcelTime(checkOutRaw);

    // デバッグ: 最初の3件と、エラーがありそうな行をログ出力
    const shouldLog = records.length < 3 || !checkInFormatted || !checkOutFormatted;
    if (shouldLog) {
      console.log(`📝 行${i + 1} (列インデックス - checkIn:${colIndices.checkIn}, checkOut:${colIndices.checkOut}):`, {
        id,
        name,
        checkInRaw: JSON.stringify(checkInRaw),
        checkInFormatted: `"${checkInFormatted}"`,
        checkOutRaw: JSON.stringify(checkOutRaw),
        checkOutFormatted: `"${checkOutFormatted}"`,
        breakRaw: row[colIndices.break],
        overtimeRaw: row[colIndices.overtime],
      });
    }

    records.push({
      employeeId: id,
      employeeName: name,
      department: String(row[colIndices.dept] || '').trim(),
      date: String(row[colIndices.date] || '').trim(),
      checkIn: checkInFormatted,
      checkOut: checkOutFormatted,
      breakMinutes: Number(row[colIndices.break] || 0),
      overtimeHours: Number(row[colIndices.overtime] || 0),
    });
  }

  console.log(`✅ ${records.length}件のレコードをパースしました`);
  return records;
}

// 勤怠データをCSV形式に変換（Claude APIに送信用）
export function convertToCSV(records: AttendanceRecord[]): string {
  const headers = ['社員ID', '氏名', '部署', '日付', '出勤時刻', '退勤時刻', '休憩分', '残業時間'];
  const rows = records.map(r => [
    r.employeeId,
    r.employeeName,
    r.department,
    r.date,
    r.checkIn,
    r.checkOut,
    r.breakMinutes,
    r.overtimeHours,
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// 基本的なエラーチェック（Claude APIの前処理として実行）
export function performBasicValidation(records: AttendanceRecord[]): AttendanceError[] {
  const errors: AttendanceError[] = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2; // ヘッダー行を考慮

    // 欠損データチェック
    if (!record.checkIn) {
      errors.push({
        rowNumber,
        column: '出勤時刻',
        errorType: 'missing_data',
        description: '出勤時刻が入力されていません',
        suggestedFix: '出勤時刻を入力してください',
      });
    }

    if (!record.checkOut) {
      errors.push({
        rowNumber,
        column: '退勤時刻',
        errorType: 'missing_data',
        description: '退勤時刻が入力されていません',
        suggestedFix: '退勤時刻を入力してください',
      });
    }

    // 論理矛盾チェック（退勤 < 出勤）
    if (record.checkIn && record.checkOut) {
      const checkInTime = parseTime(record.checkIn);
      const checkOutTime = parseTime(record.checkOut);

      if (checkOutTime < checkInTime) {
        errors.push({
          rowNumber,
          column: '出勤時刻/退勤時刻',
          errorType: 'logic_error',
          description: `退勤時刻(${record.checkOut})が出勤時刻(${record.checkIn})より早い`,
          suggestedFix: '時刻を確認し、正しい時刻を入力してください',
        });
      }
    }

    // 異常値チェック（残業時間100時間超）
    if (record.overtimeHours > 100) {
      errors.push({
        rowNumber,
        column: '残業時間',
        errorType: 'abnormal_value',
        description: `残業時間が${record.overtimeHours}時間と異常に多い（過労死ライン超過）`,
        suggestedFix: '残業時間を確認してください。80時間超の場合は産業医面談が必要です',
      });
    }
  });

  return errors;
}

// 月次サマリーの集計
export function calculateMonthlySummary(records: AttendanceRecord[]): MonthlySummary {
  const totalWorkingHours = records.reduce((sum, r) => {
    if (r.checkIn && r.checkOut) {
      const hours = calculateWorkingHours(r.checkIn, r.checkOut, r.breakMinutes);
      return sum + hours;
    }
    return sum;
  }, 0);

  const totalOvertimeHours = records.reduce((sum, r) => sum + r.overtimeHours, 0);
  const workingDays = new Set(records.filter(r => r.checkIn && r.checkOut).map(r => r.date)).size;

  return {
    totalWorkingHours: Math.round(totalWorkingHours * 10) / 10,
    totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
    paidLeaveUsageRate: 0, // サンプルデータには有給情報がないため0
    averageWorkingHours: workingDays > 0 ? Math.round((totalWorkingHours / workingDays) * 10) / 10 : 0,
    averageOvertimeHours: workingDays > 0 ? Math.round((totalOvertimeHours / workingDays) * 10) / 10 : 0,
  };
}

// 部署別集計
export function calculateDepartmentSummaries(records: AttendanceRecord[]): DepartmentSummary[] {
  const departmentMap = new Map<string, { total: number; count: number; employees: Set<string> }>();

  records.forEach(record => {
    if (!departmentMap.has(record.department)) {
      departmentMap.set(record.department, { total: 0, count: 0, employees: new Set() });
    }
    const dept = departmentMap.get(record.department)!;
    dept.total += record.overtimeHours;
    dept.count += 1;
    dept.employees.add(record.employeeId);
  });

  return Array.from(departmentMap.entries())
    .map(([department, data]) => ({
      department,
      totalOvertimeHours: Math.round(data.total * 10) / 10,
      averageOvertimeHours: Math.round((data.total / data.employees.size) * 10) / 10,
      employeeCount: data.employees.size,
    }))
    .sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours);
}

// 個人別集計
export function calculateEmployeeSummaries(records: AttendanceRecord[]): EmployeeSummary[] {
  const employeeMap = new Map<string, EmployeeSummary>();

  records.forEach(record => {
    if (!employeeMap.has(record.employeeId)) {
      employeeMap.set(record.employeeId, {
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department,
        totalWorkingHours: 0,
        totalOvertimeHours: 0,
        workingDays: 0,
      });
    }

    const employee = employeeMap.get(record.employeeId)!;
    if (record.checkIn && record.checkOut) {
      employee.totalWorkingHours += calculateWorkingHours(
        record.checkIn,
        record.checkOut,
        record.breakMinutes
      );
      employee.workingDays += 1;
    }
    employee.totalOvertimeHours += record.overtimeHours;
  });

  return Array.from(employeeMap.values()).map(emp => ({
    ...emp,
    totalWorkingHours: Math.round(emp.totalWorkingHours * 10) / 10,
    totalOvertimeHours: Math.round(emp.totalOvertimeHours * 10) / 10,
  }));
}

// 日別集計（グラフ用）
export function calculateDailySummaries(records: AttendanceRecord[]): DailySummary[] {
  const dailyMap = new Map<string, { total: number; employees: Set<string> }>();

  records.forEach(record => {
    if (!dailyMap.has(record.date)) {
      dailyMap.set(record.date, { total: 0, employees: new Set() });
    }
    const day = dailyMap.get(record.date)!;
    day.total += record.overtimeHours;
    day.employees.add(record.employeeId);
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      totalOvertimeHours: Math.round(data.total * 10) / 10,
      employeeCount: data.employees.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ユーティリティ: 時刻文字列をパース（HH:MM形式）
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// ユーティリティ: 労働時間を計算（時間単位）
function calculateWorkingHours(checkIn: string, checkOut: string, breakMinutes: number): number {
  const checkInMinutes = parseTime(checkIn);
  const checkOutMinutes = parseTime(checkOut);
  const workingMinutes = checkOutMinutes - checkInMinutes - breakMinutes;
  return Math.max(0, workingMinutes / 60);
}
