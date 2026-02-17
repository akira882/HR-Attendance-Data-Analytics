'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  MonthlySummary,
  DepartmentSummary,
  DailySummary,
} from '@/lib/types';

interface DashboardProps {
  monthlySummary: MonthlySummary;
  departmentSummaries: DepartmentSummary[];
  dailySummaries: DailySummary[];
}

export default function Dashboard({
  monthlySummary,
  departmentSummaries,
  dailySummaries,
}: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="総労働時間"
          value={`${monthlySummary.totalWorkingHours.toLocaleString()}h`}
          subtitle={`平均 ${monthlySummary.averageWorkingHours}h/日`}
          icon="clock"
          color="blue"
        />
        <KPICard
          title="総残業時間"
          value={`${monthlySummary.totalOvertimeHours.toLocaleString()}h`}
          subtitle={`平均 ${monthlySummary.averageOvertimeHours}h/日`}
          icon="alert"
          color="orange"
        />
        <KPICard
          title="有給取得率"
          value={`${monthlySummary.paidLeaveUsageRate}%`}
          subtitle="データなし"
          icon="calendar"
          color="green"
        />
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 残業時間推移グラフ */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            残業時間の推移
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySummaries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalOvertimeHours"
                name="残業時間"
                stroke="#2E75B6"
                strokeWidth={2}
                dot={{ fill: '#2E75B6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 部署別残業ランキング */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            部署別残業ランキング
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSummaries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar
                dataKey="totalOvertimeHours"
                name="残業時間"
                fill="#1F4E79"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 部署別詳細テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            部署別詳細データ
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部署
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  社員数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  総残業時間
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平均残業時間
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departmentSummaries.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {dept.employeeCount}名
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {dept.totalOvertimeHours.toLocaleString()}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {dept.averageOvertimeHours.toLocaleString()}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: 'clock' | 'alert' | 'calendar';
  color: 'blue' | 'orange' | 'green';
}

function KPICard({ title, value, subtitle, icon, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
  };

  const icons = {
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    alert: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
    calendar: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
