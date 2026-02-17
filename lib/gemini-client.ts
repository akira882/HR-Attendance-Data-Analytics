import { GoogleGenerativeAI } from '@google/generative-ai';
import { AttendanceError } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

/**
 * 勤怠データのCSVからエラーや異常値を検出する（Geminiを使用）
 */
export async function detectErrors(csvData: string): Promise<AttendanceError[]> {
  const prompt = `あなたは人事労務の専門家です。以下の勤怠データCSVを分析し、エラー・異常値・法令違反リスクを検出してください。

勤怠データCSV:
${csvData}

【分析のルール - 判定基準】
1. 標準シフト: 9:00(出勤)〜18:00(退勤) は「労働8時間＋休憩1時間」の計9時間拘束が標準です。
2. 休憩時間: 1日の拘束時間が6時間超で45分、8時間超で1時間の休憩が法定で定められています。通常、1時間の休憩が引かれていることを前提に計算してください。
3. 残業計算: 「(退勤時刻 - 出勤時刻) - 休憩時間 - 8時間 = 残業時間」となります。
   - 例: 09:00〜19:00 は拘束10時間、休憩1時間、実働9時間。よって残業は「1時間」です。
4. エラー判定項目:
   - 欠損: 出勤または退勤時刻が空欄。
   - 論理矛盾: 「(退勤 - 出勤) - 休憩」が「残業時間」と明らかに乖離している場合（許容誤差±0.1時間）。
   - 過重労働: 月間残業が合計ではなく、「個別の残業時間」が極端に多い場合や、法定上限を超えるリスク。

【重要】「正しいデータ」をエラーと判定しないでください。
例えば「9:00-19:00で残業1.0」は正常です。
18:00退勤で残業が0より多い、あるいは19:00退勤で残業が0となっているような「入力の矛盾」のみを指摘してください。

出力形式（JSON配列のみ）:
[
  {
    "rowNumber": 3,
    "column": "出勤時刻",
    "errorType": "missing_data",
    "description": "...",
    "suggestedFix": "..."
  }
]

JSON配列のみを出力してください。説明文は不要です。`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Error detecting errors with Gemini:', error);
    return [];
  }
}

/**
 * 勤怠データから月次の分析レポートを生成する（Geminiを使用）
 */
export async function generateMonthlyReport(
  csvData: string,
  monthlySummary: any,
  departmentSummaries: any[],
  errors: AttendanceError[]
): Promise<string> {
  const prompt = `あなたは人事労務の専門家です。以下の勤怠データを分析し、経営層向けの月次レポートを日本語で作成してください。

【月次サマリー】
- 総労働時間: ${monthlySummary.totalWorkingHours}時間
- 総残業時間: ${monthlySummary.totalOvertimeHours}時間
- 平均労働時間: ${monthlySummary.averageWorkingHours}時間/日
- 平均残業時間: ${monthlySummary.averageOvertimeHours}時間/日

【部署別残業時間】
${departmentSummaries.map(d => `- ${d.department}: ${d.totalOvertimeHours}時間（平均${d.averageOvertimeHours}時間/人）`).join('\n')}

【検出されたエラー】
${errors.length > 0 ? errors.map(e => `- ${e.description} (行${e.rowNumber})`).join('\n') : '- エラーなし'}

以下の構成でレポートを作成してください：
1. 今月のハイライト（2-3文）
2. 部署別の傾向分析（1-2文）
3. 懸念事項と推奨アクション（あれば）
4. データ品質について（エラーがあれば言及）

プロフェッショナルで簡潔な文体で、箇条書きを活用してください。`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating report with Gemini:', error);
    return 'レポート生成に失敗しました。API接続を確認してください。';
  }
}
