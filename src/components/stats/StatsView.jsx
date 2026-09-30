import { MonthlyTotalUnitsChart, UserMonthlyUnitsChart } from '../ElectricityCharts'

export function StatsView({ refreshChartTrigger }) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 animate-[fadeIn_0.3s_ease-out]">
      <h2 className="text-2xl font-bold text-orange-100 mb-2 text-left flex items-center gap-2">
        <span className="text-orange-500">⚡</span> สถิติการใช้ไฟฟ้ารวม
      </h2>
      {/* Chart of total units every month */}
      <div className="cosmic-chart w-full rounded-2xl border border-purple-500/30 bg-black/60 shadow-[0_0_30px_rgba(255,102,0,0.15)] backdrop-blur-md p-2 relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-orange-600/10 blur-3xl rounded-full pointer-events-none"></div>
        <MonthlyTotalUnitsChart refreshTrigger={refreshChartTrigger} />
      </div>

      <h2 className="text-2xl font-bold text-orange-100 mb-2 mt-4 text-left flex items-center gap-2">
        <span className="text-purple-500">👥</span> สถิติแยกตามบุคคล
      </h2>
      {/* Chart of unit amount for each user every month */}
      <div className="cosmic-chart w-full rounded-2xl border border-orange-500/30 bg-black/60 shadow-[0_0_30px_rgba(128,0,128,0.15)] backdrop-blur-md p-2 relative overflow-hidden">
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-purple-600/10 blur-3xl rounded-full pointer-events-none"></div>
        <UserMonthlyUnitsChart refreshTrigger={refreshChartTrigger} />
      </div>
    </div>
  );
}
