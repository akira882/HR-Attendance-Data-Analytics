'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ErrorList from '@/components/ErrorList';
import Dashboard from '@/components/Dashboard';
import AIReport from '@/components/AIReport';
import { AnalysisResult } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'データ解析に失敗しました');
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-1 bg-blue-600 rounded-full h-12"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                勤怠データ自動集計ダッシュボード
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                EARTHBRAIN エンプロイーサクセス部門向けデモ
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 説明文 */}
          {!analysisResult && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                    SYSTEM CAPABILITIES
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">・</span>
                      <span>Excelファイルから勤怠データを自動読み込み</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">・</span>
                      <span>
                        AIによる高精度エラー検知（欠損データ・論理矛盾・異常値）
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">・</span>
                      <span>月次・部署別・個人別の自動集計</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">・</span>
                      <span>AIが生成する自然言語の月次レポート</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ファイルアップロード */}
          <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

          {/* サンプルファイルダウンロード */}
          {!analysisResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-3">
                    SAMPLE FILES FOR TESTING
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    テスト用のサンプルExcelファイルをダウンロードできます
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/attendances_sample.xlsx"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      クリーンデータ（エラーなし）
                    </a>
                    <a
                      href="/attendances_with_errors.xlsx"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded hover:bg-orange-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      デモ用データ（6件のエラー含む）
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-red-800 font-bold text-sm uppercase mr-2 tracking-widest">[ ERROR ]</span>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* 解析結果 */}
          {analysisResult && (
            <div className="space-y-6 animate-fade-in">
              {/* 成功メッセージ */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-800 font-bold text-sm uppercase mr-2 tracking-widest">[ SUCCESS ]</span>
                  <span className="text-green-800 font-medium">
                    集計完了：月次サマリーを表示中
                  </span>
                </div>
              </div>

              {/* エラーリスト */}
              <ErrorList errors={analysisResult.errors} />

              {/* ダッシュボード */}
              <Dashboard
                monthlySummary={analysisResult.monthlySummary}
                departmentSummaries={analysisResult.departmentSummaries}
                dailySummaries={analysisResult.dailySummaries}
              />

              {/* AIレポート */}
              <AIReport report={analysisResult.aiReport} />
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by Claude Sonnet 4.5 | Developed by 小清水晶 for EARTHBRAIN Interview
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
