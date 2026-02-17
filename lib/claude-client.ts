import Anthropic from '@anthropic-ai/sdk';
import { AttendanceError } from './types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// エラー検知用プロンプト
export async function detectErrors(csvData: string): Promise<AttendanceError[]> {
  const prompt = `あなたは人事労務の専門家です。以下の勤怠データCSVを分析し、エラー・異常値・法令違反リスクを検出してください。

勤怠データCSV:
${csvData}

以下の観点でチェックし、JSON形式で出力してください：
1. 欠損データ（出勤時刻・退勤時刻が空白）
2. 論理矛盾（退勤時刻が出勤時刻より早い）
3. 異常値（残業時間が80時間超、100時間超の過労死ライン）
4. その他の異常なパターン

出力形式（JSON配列のみ）:
[
  {
    "rowNumber": 3,
    "column": "出勤時刻",
    "errorType": "missing_data",
    "description": "出勤時刻が入力されていません",
    "suggestedFix": "出勤時刻を入力してください"
  }
]

JSON配列のみを出力してください。説明文は不要です。`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      // JSONのみを抽出（コードブロックや説明文を除去）
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return [];
  } catch (error) {
    console.error('Error detecting errors with Claude:', error);
    return [];
  }
}

// 月次レポート生成用プロンプト
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
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return 'レポート生成に失敗しました。';
  } catch (error) {
    console.error('Error generating report with Claude:', error);
    return 'レポート生成に失敗しました。API接続を確認してください。';
  }
}
