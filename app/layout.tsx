import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '勤怠データ自動集計ダッシュボード - AI人事業務自動化デモ',
  description: 'Google Gemini AIを活用した勤怠データの自動エラー検知・集計・レポート生成システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
