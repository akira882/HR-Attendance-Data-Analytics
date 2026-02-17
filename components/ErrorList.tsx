'use client';

import { AttendanceError } from '@/lib/types';

interface ErrorListProps {
  errors: AttendanceError[];
}

export default function ErrorList({ errors }: ErrorListProps) {
  if (errors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <span className="text-green-800 font-bold text-sm uppercase tracking-widest">[ CLEAN ]</span>
          <span className="text-green-800 font-medium">
            エラーなし：データ整合性は正常です
          </span>
        </div>
      </div>
    );
  }

  const getErrorTypeLabel = (type: AttendanceError['errorType']) => {
    switch (type) {
      case 'missing_data':
        return '欠損データ';
      case 'logic_error':
        return '論理矛盾';
      case 'abnormal_value':
        return '異常値';
      default:
        return 'エラー';
    }
  };

  const getErrorTypeColor = (type: AttendanceError['errorType']) => {
    switch (type) {
      case 'missing_data':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'logic_error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'abnormal_value':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-red-50 border-b border-red-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-red-800 font-bold text-sm uppercase tracking-widest">[ {errors.length} ERRORS DETECTED ]</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {errors.map((error, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded bg-gray-900 text-white text-xs font-bold tracking-tighter">
                  L{error.rowNumber}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  <span
                    className={`
                      inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest border
                      ${getErrorTypeColor(error.errorType)}
                    `}
                  >
                    {getErrorTypeLabel(error.errorType)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    COLUMN: {error.column}
                  </span>
                </div>

                <p className="text-sm text-gray-900 font-medium mb-3">{error.description}</p>

                <div className="pt-3 border-t border-gray-100 flex items-start gap-4">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">SUGGESTION:</span>
                  <span className="text-xs text-blue-800 font-medium leading-relaxed">
                    {error.suggestedFix}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
