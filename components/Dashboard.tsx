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
  EmployeeSummary,
} from '@/lib/types';

interface DashboardProps {
  monthlySummary: MonthlySummary;
  departmentSummaries: DepartmentSummary[];
  dailySummaries: DailySummary[];
  employeeSummaries: EmployeeSummary[];
}

export default function Dashboard({
  monthlySummary,
  departmentSummaries,
  dailySummaries,
  employeeSummaries,
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
            残業時間の推移
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySummaries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="totalOvertimeHours"
                name="残業時間"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 部署別残業ランキング */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
            部署別残業ランキング
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentSummaries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar
                dataKey="totalOvertimeHours"
                name="残業時間"
                fill="#312e81"
                radius={[0, 10, 10, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 部署別詳細テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            DEPARTMENTAL DETAILS
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">部署</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">社員数</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">総残業</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">平均残業</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departmentSummaries.map((dept, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{dept.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-medium">{dept.employeeCount}名</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{dept.totalOvertimeHours.toLocaleString()}h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-bold bg-blue-50/20 group-hover:bg-blue-50/50">{dept.averageOvertimeHours.toLocaleString()}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 個人別詳細テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            INDIVIDUAL PERFORMANCE DETAILS
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">社員ID / 氏名</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">部署</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">稼働日数</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">総労働時間</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">総残業時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employeeSummaries
                .sort((a, b) => b.totalOvertimeHours - a.totalOvertimeHours)
                .map((emp, index) => (
                  <tr key={index} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold mb-0.5">{emp.employeeId}</span>
                        <span className="text-sm font-bold text-gray-900">{emp.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 uppercase tracking-tighter">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-medium">{emp.workingDays}日</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">{emp.totalWorkingHours.toLocaleString()}h</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-black ${emp.totalOvertimeHours > 45 ? 'text-red-600 bg-red-50/30' : 'text-gray-900 group-hover:bg-indigo-50/50'
                      }`}>
                      {emp.totalOvertimeHours.toLocaleString()}h
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
