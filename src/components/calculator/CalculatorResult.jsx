import { MonthStatsComparison } from '../MonthStatsComparison'

export function CalculatorResult({ state, actions }) {
  const { result, exporting, resultRef } = state;
  const { handleExportJpg } = actions;

  if (!result) return null;

  return (
    <div ref={resultRef} className="rounded-2xl p-6 text-center animate-[fadeIn_0.3s_ease-out] relative border border-orange-600/40 bg-black/70 shadow-[0_0_40px_rgba(128,0,128,0.2)] backdrop-blur-md overflow-hidden">
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-orange-600/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="flex justify-end mb-2 no-export">
        <button
          type="button"
          onClick={handleExportJpg}
          disabled={exporting}
          className="px-3.5 py-1.5 rounded-xl bg-orange-900/50 hover:bg-orange-800 text-orange-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 border border-orange-700/50"
        >
          <span>📷</span> {exporting ? 'กำลังบันทึกภาพ...' : 'ส่งออกเป็นภาพ JPG'}
        </button>
      </div>
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-purple-400 mb-4 drop-shadow-sm">
        🕸️ สรุปยอดค่าไฟประจำเดือน{result ? ` ${result.month}` : ''}
      </h2>
      <h3 className="text-xl font-semibold text-orange-300 mb-1 bg-gradient-to-r from-black/60 via-purple-900/20 to-black/60 py-4 rounded-xl border border-purple-500/30 shadow-inner">
        ค่าไฟรวมทั้งบ้าน : <span className="text-white drop-shadow-[0_0_8px_rgba(255,165,0,0.8)] text-2xl ml-2">{result.billsSum.toLocaleString()} บาท</span>
      </h3>
      <h3 className="text-base font-bold text-purple-300 mt-6 mb-3 tracking-wide">🕷️ แยกตามบุคคล</h3>
      <div className="grid grid-cols-2 gap-4 text-orange-100 justify-center items-center">
        <div className="bg-black/50 p-4 rounded-xl border border-orange-900/50 hover:border-orange-500/50 transition-colors shadow-lg">
          <p className="text-sm text-orange-400 mb-1">โอ๊ค</p>
          <p className="text-xl font-bold text-white">{result.oakPay.toLocaleString()} <span className="text-xs font-normal text-orange-200/50">บาท</span></p>
        </div>
        <div className="bg-black/50 p-4 rounded-xl border border-purple-900/50 hover:border-purple-500/50 transition-colors shadow-lg">
          <p className="text-sm text-purple-400 mb-1">มิกซ์</p>
          <p className="text-xl font-bold text-white">{result.mixPay.toLocaleString()} <span className="text-xs font-normal text-purple-200/50">บาท</span></p>
        </div>
        <div className="bg-black/50 p-4 rounded-xl border border-green-900/50 hover:border-green-500/50 transition-colors shadow-lg">
          <p className="text-sm text-green-400 mb-1">ไอซ์</p>
          <p className="text-xl font-bold text-white">{result.icePay.toLocaleString()} <span className="text-xs font-normal text-green-200/50">บาท</span></p>
        </div>
        <div className="bg-black/50 p-4 rounded-xl border border-red-900/50 hover:border-red-500/50 transition-colors shadow-lg">
          <p className="text-sm text-red-400 mb-1">ซีดี</p>
          <p className="text-xl font-bold text-white">{result.cdPay.toLocaleString()} <span className="text-xs font-normal text-red-200/50">บาท</span></p>
        </div>
      </div>

      <div className="mt-8">
        <MonthStatsComparison resultData={result} />
      </div>
    </div>
  );
}
