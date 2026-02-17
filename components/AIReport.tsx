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
              if (line.trim() === '') {
                return <br key={index} />;
              }

              // 見出し（数字で始まる行）
              if (/^\d+\./.test(line.trim())) {
                return (
                  <h4 key={index} className="text-base font-bold text-gray-900 mt-8 mb-4 border-l-2 border-blue-600 pl-4">
                    {line.trim()}
                  </h4>
                );
              }

              // 箇条書き
              if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                return (
                  <li key={index} className="text-gray-800 ml-4 mb-2 list-none">
                    <span className="text-blue-600 font-bold mr-2">/</span>
                    {line.trim().substring(1).trim()}
                  </li>
                );
              }

              // 通常の段落
              return (
                <p key={index} className="text-gray-800 mb-3 leading-relaxed">
                  {line.trim()}
                </p>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-200 flex items-center justify-between text-[10px] text-blue-800 font-bold uppercase tracking-widest">
          <span>Engine: Claude 4.5 Sonnet</span>
          <span>Security Certified Process</span>
        </div>
      </div>
    </div>
  );
}
