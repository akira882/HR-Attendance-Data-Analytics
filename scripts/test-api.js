const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

const excelPath = path.join(__dirname, '..', 'public', 'attendances_sample.xlsx');
const fileBuffer = fs.readFileSync(excelPath);

const form = new FormData();
form.append('file', fileBuffer, {
  filename: 'attendances_sample.xlsx',
  contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/analyze',
  method: 'POST',
  headers: form.getHeaders()
};

console.log('🚀 APIテスト開始...\n');
console.log(`📁 ファイル: ${excelPath}`);
console.log(`📊 ファイルサイズ: ${fileBuffer.length} bytes\n`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ レスポンスステータス: ${res.statusCode}\n`);

    try {
      const result = JSON.parse(data);

      console.log('=== 解析結果 ===\n');
      console.log(`📝 総レコード数: ${result.employeeSummaries?.length || 0}名分`);
      console.log(`⚠️  エラー件数: ${result.errors?.length || 0}件\n`);

      if (result.errors && result.errors.length > 0) {
        console.log('🔍 検出されたエラー（最初の5件）:\n');
        result.errors.slice(0, 5).forEach((err, idx) => {
          console.log(`${idx + 1}. 行${err.rowNumber} - ${err.column}: ${err.description}`);
        });
        console.log();
      }

      if (result.monthlySummary) {
        console.log('📊 月次サマリー:');
        console.log(`   総労働時間: ${result.monthlySummary.totalWorkingHours}h`);
        console.log(`   総残業時間: ${result.monthlySummary.totalOvertimeHours}h`);
        console.log();
      }

      if (result.departmentSummaries) {
        console.log('🏢 部署別サマリー:');
        result.departmentSummaries.forEach(dept => {
          console.log(`   ${dept.department}: ${dept.totalOvertimeHours}h (${dept.employeeCount}名)`);
        });
        console.log();
      }

      if (result.aiReport) {
        console.log('🤖 AIレポート:');
        console.log(result.aiReport.substring(0, 200) + '...\n');
      }

      console.log('✅ テスト完了');
    } catch (error) {
      console.error('❌ JSON解析エラー:', error.message);
      console.log('生データ:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ リクエストエラー:', error.message);
  console.log('\n💡 開発サーバーが起動していることを確認してください: npm run dev');
});

form.pipe(req);
