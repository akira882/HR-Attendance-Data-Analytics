const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// サンプルデータ生成
function generateSampleData() {
  const employees = [
    { id: 'E001', name: '佐藤太郎', department: '開発部' },
    { id: 'E002', name: '鈴木花子', department: '開発部' },
    { id: 'E003', name: '高橋健一', department: '開発部' },
    { id: 'E004', name: '田中美咲', department: '開発部' },
    { id: 'E005', name: '伊藤次郎', department: '開発部' },
    { id: 'E006', name: '渡辺由美', department: '開発部' },
    { id: 'E007', name: '山本誠', department: '開発部' },
    { id: 'E008', name: '中村明子', department: '営業部' },
    { id: 'E009', name: '小林大輔', department: '営業部' },
    { id: 'E010', name: '加藤恵子', department: '営業部' },
    { id: 'E011', name: '吉田拓也', department: '営業部' },
    { id: 'E012', name: '山田美穂', department: '営業部' },
    { id: 'E013', name: '佐々木翔', department: '営業部' },
    { id: 'E014', name: '松本愛', department: '管理部' },
    { id: 'E015', name: '井上健太', department: '管理部' },
    { id: 'E016', name: '木村麻衣', department: '管理部' },
    { id: 'E017', name: '林雄一', department: '管理部' },
    { id: 'E018', name: '斎藤春香', department: '管理部' },
    { id: 'E019', name: '清水大樹', department: '管理部' },
    { id: 'E020', name: '森田絵里', department: '管理部' },
  ];

  const data = [];
  const workingDays = 22;
  const startDate = new Date('2024-11-01');

  // 意図的なエラーを仕込むための行インデックス
  const errorRows = {
    missingData: [15, 42, 78], // 3件の欠損データ
    logicError: [95, 130], // 2件の論理矛盾
    abnormalValue: [201], // 1件の異常値
  };

  let rowIndex = 0;

  employees.forEach((employee) => {
    for (let day = 0; day < workingDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      // 土日をスキップ
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // 基本の勤怠データ
      let checkIn = '09:00';
      let checkOut = '18:00';
      let breakMinutes = 60;
      let overtimeHours = 0;

      // 開発部は残業が多い傾向
      if (employee.department === '開発部') {
        checkOut = ['18:30', '19:00', '19:30', '20:00', '20:30'][Math.floor(Math.random() * 5)];
        overtimeHours = parseFloat((Math.random() * 3.5).toFixed(1));
      } else if (employee.department === '営業部') {
        // 営業部は中程度の残業
        checkOut = ['18:00', '18:30', '19:00', '19:30'][Math.floor(Math.random() * 4)];
        overtimeHours = parseFloat((Math.random() * 2.5).toFixed(1));
      } else {
        // 管理部は残業少なめ
        checkOut = ['18:00', '18:15', '18:30'][Math.floor(Math.random() * 3)];
        overtimeHours = parseFloat((Math.random() * 1.5).toFixed(1));
      }

      // 意図的なエラーを仕込む
      if (errorRows.missingData.includes(rowIndex)) {
        checkIn = ''; // 出勤時刻を空白に
      }

      if (errorRows.logicError.includes(rowIndex)) {
        checkIn = '18:00';
        checkOut = '09:00'; // 退勤が出勤より早い
      }

      if (errorRows.abnormalValue.includes(rowIndex)) {
        overtimeHours = 120.5; // 過労死ライン超の異常値
      }

      data.push({
        社員ID: employee.id,
        氏名: employee.name,
        部署: employee.department,
        日付: dateStr,
        出勤時刻: checkIn,
        退勤時刻: checkOut,
        休憩分: breakMinutes,
        残業時間: overtimeHours,
      });

      rowIndex++;
    }
  });

  return data;
}

// Excelファイルを生成
function generateExcelFile() {
  const data = generateSampleData();

  // ワークブックを作成
  const workbook = XLSX.utils.book_new();

  // ワークシートを作成
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 列幅を調整
  worksheet['!cols'] = [
    { wch: 10 }, // 社員ID
    { wch: 12 }, // 氏名
    { wch: 10 }, // 部署
    { wch: 12 }, // 日付
    { wch: 10 }, // 出勤時刻
    { wch: 10 }, // 退勤時刻
    { wch: 8 }, // 休憩分
    { wch: 10 }, // 残業時間
  ];

  // ワークシートをワークブックに追加
  XLSX.utils.book_append_sheet(workbook, worksheet, '勤怠データ');

  // ファイルを保存
  const outputPath = path.join(__dirname, '..', 'public', 'attendances_sample.xlsx');
  XLSX.writeFile(workbook, outputPath);

  console.log(`✅ サンプルExcelファイルを生成しました: ${outputPath}`);
  console.log(`📊 データ件数: ${data.length}件`);
  console.log(`⚠️  エラー件数: 6件（欠損3件、論理矛盾2件、異常値1件）`);
}

// スクリプト実行
try {
  generateExcelFile();
} catch (error) {
  console.error('エラーが発生しました:', error);
  process.exit(1);
}
