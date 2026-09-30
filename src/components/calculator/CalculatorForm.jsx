export function CalculatorForm({ state, actions }) {
  const {
    billsSum, oakMeter, mixMeter, iceMeter, cdMeter, totalUnits, loading, existingId, prevMonth
  } = state;

  const {
    setBillsSum, setOakMeter, setMixMeter, setIceMeter, setCdMeter, setTotalUnits, handleSubmit
  } = actions;

  return (
    <div className="cosmic-card rounded-2xl p-6 sm:p-8 text-left border border-purple-500/30 bg-black/60 shadow-[0_0_30px_rgba(255,102,0,0.15)] backdrop-blur-md relative overflow-hidden">
      {/* Decorative spider web or glow could go here */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full pointer-events-none"></div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-x-8 md:gap-y-6">
        {/* ค่าไฟรวม */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bills-sum" className="font-semibold text-orange-200">
            ค่าไฟรวมทั้งบ้าน (บาท)
          </label>
          <input
            type="number"
            id="bills-sum"
            name="bills_sum"
            value={billsSum}
            onChange={(e) => setBillsSum(e.target.value)}
            placeholder="เช่น 3500"
            className="px-4 py-2.5 rounded-lg border border-orange-900/50 bg-black/40 text-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-md"
          />
        </div>

        {/*จำนวนหน่วยทั้งหมด*/}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="total-units" className="font-semibold text-orange-200">
            จำนวนหน่วยทั้งหมดที่ใช้
          </label>
          <input
            type="number"
            id="total-units"
            name="total_units"
            value={totalUnits}
            onChange={(e) => setTotalUnits(e.target.value)}
            placeholder="เช่น 230"
            className="px-4 py-2.5 rounded-lg border border-orange-900/50 bg-black/40 text-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-md"
          />
        </div>

        {/* โอ๊ค */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="oak-meter" className="font-semibold text-orange-200">
            มิเตอร์ 1 (โอ๊ค)
          </label>
          <p className="text-xs text-orange-300/70">
            ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.oak_meter?.toLocaleString()} หน่วย` : '-'}
          </p>
          <input
            type="number"
            id="oak-meter"
            name="oak_meter"
            value={oakMeter}
            onChange={(e) => setOakMeter(e.target.value)}
            placeholder="หน่วยไฟ"
            className="px-4 py-2.5 rounded-lg border border-orange-900/50 bg-black/40 text-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-md"
          />
        </div>

        {/* มิกซ์ */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mix-meter" className="font-semibold text-orange-200">
            มิเตอร์ 2 (มิกซ์)
          </label>
          <p className="text-xs text-orange-300/70">
            ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.mix_meter?.toLocaleString()} หน่วย` : '-'}
          </p>
          <input
            type="number"
            id="mix-meter"
            name="mix_meter"
            value={mixMeter}
            onChange={(e) => setMixMeter(e.target.value)}
            placeholder="หน่วยไฟ"
            className="px-4 py-2.5 rounded-lg border border-orange-900/50 bg-black/40 text-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-md"
          />
        </div>

        {/* ไอซ์ */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ice-meter" className="font-semibold text-orange-200">
            มิเตอร์ 3 (ไอซ์)
          </label>
          <p className="text-xs text-orange-300/70">
            ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.ice_meter?.toLocaleString()} หน่วย` : '-'}
          </p>
          <input
            type="number"
            id="ice-meter"
            name="ice_meter"
            value={iceMeter}
            onChange={(e) => setIceMeter(e.target.value)}
            placeholder="หน่วยไฟ"
            className="px-4 py-2.5 rounded-lg border border-orange-900/50 bg-black/40 text-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-md"
          />
        </div>

        {/* ซีดี */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cd-meter" className="font-semibold text-orange-200">
            มิเตอร์ 4 (ซีดี)
          </label>
          <p className="text-xs text-orange-300/70">
            ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.cd_meter?.toLocaleString()} หน่วย` : '-'}
          </p>
          <input
            type="number"
            id="cd-meter"
            name="cd_meter"
            value={cdMeter}
            onChange={(e) => setCdMeter(e.target.value)}
            placeholder="หน่วยไฟ"
            className="px-4 py-2.5 rounded-lg border border-orange-900/50 bg-black/40 text-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-md"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer text-center shadow-[0_0_20px_rgba(255,102,0,0.3)] hover:shadow-[0_0_25px_rgba(128,0,128,0.5)] hover:-translate-y-0.5 bg-gradient-to-r from-orange-600 to-purple-700 hover:from-orange-500 hover:to-purple-600 text-white border border-orange-500/50"
          >
            {loading ? '🦇 กำลังร่ายมนตร์...' : existingId ? '🎃 คำนวณ & อัปเดต' : '🎃 คำนวณ & บันทึก'}
          </button>
        </div>
      </form>
    </div>
  );
}
