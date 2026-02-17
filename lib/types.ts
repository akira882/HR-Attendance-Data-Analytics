// 勤怠データの型定義
export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  breakMinutes: number;
  overtimeHours: number;
}

// エラー検知結果の型定義
export interface AttendanceError {
  rowNumber: number;
  column: string;
  errorType: 'missing_data' | 'logic_error' | 'abnormal_value';
  description: string;
  suggestedFix: string;
}

// 月次集計結果の型定義
export interface MonthlySummary {
  totalWorkingHours: number;
  totalOvertimeHours: number;
  paidLeaveUsageRate: number;
  averageWorkingHours: number;
  averageOvertimeHours: number;
}

// 部署別集計の型定義
export interface DepartmentSummary {
  department: string;
  totalOvertimeHours: number;
  averageOvertimeHours: number;
  employeeCount: number;
}

// 個人別集計の型定義
export interface EmployeeSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  totalWorkingHours: number;
  totalOvertimeHours: number;
  workingDays: number;
}

// 日別集計の型定義（グラフ表示用）
export interface DailySummary {
  date: string;
  totalOvertimeHours: number;
  employeeCount: number;
}

// 解析結果の型定義
export interface AnalysisResult {
  errors: AttendanceError[];
  monthlySummary: MonthlySummary;
  departmentSummaries: DepartmentSummary[];
  employeeSummaries: EmployeeSummary[];
  dailySummaries: DailySummary[];
  aiReport: string;
}
