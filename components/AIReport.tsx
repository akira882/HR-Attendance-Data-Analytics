'use client';

interface AIReportProps {
  report: string;
}

export default function AIReport({ report }: AIReportProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">
            AI ANALYSIS REPORT
          </h3>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg p-10 shadow-sm border border-blue-100">
          <div className="prose prose-sm max-w-none">
            {report.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine === '') {
                return <div key={index} className="h-4" />;
              }

              // 見出し（# または 数字.）
              if (trimmedLine.startsWith('#') || /^\d+\./.test(trimmedLine)) {
                const content = trimmedLine.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');
                return (
                  <h4 key={index} className="text-base font-bold text-gray-900 mt-8 mb-4 border-l-4 border-blue-600 pl-4 bg-blue-50/50 py-2 rounded-r">
                    {content}
                  </h4>
                );
              }

              // 箇条書き（-, *, •）
              if (/^[-*•]/.test(trimmedLine)) {
                return (
                  <div key={index} className="flex items-start gap-4 ml-2 mb-3 group">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      ✓
                    </span>
                    <span className="text-gray-800 leading-relaxed font-medium">
                      {trimmedLine.replace(/^[-*•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                    </span>
                  </div>
                );
              }

              // 強調（**bold**）の簡易的な除去（表示を綺麗にするため）
              const cleanLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1');

              // 通常の段落
              return (
                <p key={index} className="text-gray-800 mb-4 leading-relaxed pl-1">
                  {cleanLine}
                </p>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-200 flex items-center justify-between text-[10px] text-blue-800 font-bold uppercase tracking-widest opacity-60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Engine: Google Gemini 1.5 Flash</span>
          </div>
          <span>Security Certified Analysis Process</span>
        </div>
      </div>
    </div>
  );
}
