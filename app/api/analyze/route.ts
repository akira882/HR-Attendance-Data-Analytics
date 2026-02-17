import { NextRequest, NextResponse } from 'next/server';
import {
  parseExcelFile,
  convertToCSV,
  performBasicValidation,
  calculateMonthlySummary,
  calculateDepartmentSummaries,
  calculateEmployeeSummaries,
  calculateDailySummaries,
} from '@/lib/excel-parser';
import { detectErrors, generateMonthlyReport } from '@/lib/claude-client';
import { AnalysisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルがアップロードされていません' },
        { status: 400 }
      );
    }

    // Excelファイルを読み込み
    const arrayBuffer = await file.arrayBuffer();
    const records = parseExcelFile(arrayBuffer);

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'データが見つかりません。Excelファイルの形式を確認してください' },
        { status: 400 }
      );
    }

    // 基本的なバリデーション（ローカル処理）
    const basicErrors = performBasicValidation(records);

    // CSV形式に変換してClaude APIでエラー検知
    const csvData = convertToCSV(records);
    let aiErrors: typeof basicErrors = [];

    try {
      aiErrors = await detectErrors(csvData);
    } catch (error) {
      console.error('AI error detection failed:', error);
      // AI検知に失敗しても基本エラーは返す
    }

    // エラーをマージ（重複排除）
    const allErrors = [...basicErrors, ...aiErrors];
    const uniqueErrors = Array.from(
      new Map(allErrors.map(e => [`${e.rowNumber}-${e.column}`, e])).values()
    );

    // 集計処理
    const monthlySummary = calculateMonthlySummary(records);
    const departmentSummaries = calculateDepartmentSummaries(records);
    const employeeSummaries = calculateEmployeeSummaries(records);
    const dailySummaries = calculateDailySummaries(records);

    // AIレポート生成
    let aiReport = '';
    try {
      aiReport = await generateMonthlyReport(
        csvData,
        monthlySummary,
        departmentSummaries,
        uniqueErrors
      );
    } catch (error) {
      console.error('AI report generation failed:', error);
      aiReport = '月次レポートの生成に失敗しました。データ集計は正常に完了しています。';
    }

    const result: AnalysisResult = {
      errors: uniqueErrors,
      monthlySummary,
      departmentSummaries,
      employeeSummaries,
      dailySummaries,
      aiReport,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: 'データ解析中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
