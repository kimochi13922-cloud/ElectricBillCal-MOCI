/**
 * Helper to render trend badge for cost/currency changes (Baht)
 * In financial context, increased cost is highlighted with red/orange warning (▲), lowered cost with green (▼).
 */
function CostTrendBadge({ current, prev }) {
  if (prev === null || prev === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/40 text-purple-200 border border-purple-500/30">
        📌 ตั้งต้น (Baseline)
      </span>
    )
  }

  const diff = current - prev
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/40 text-gray-400 border border-gray-600/30">
        ➖ เท่าเดิม
      </span>
    )
  }

  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : null
  const formattedDiff = Math.abs(diff).toLocaleString()

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-900/40 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(255,0,0,0.2)]">
        <span>▲</span> +{formattedDiff} บาท {pct ? `(+${pct}%)` : ''}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-900/40 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(0,255,0,0.2)]">
      <span>▼</span> -{formattedDiff} บาท {pct ? `(${pct}%)` : ''}
    </span>
  )
}

/**
 * Helper to render trend badge for electricity usage changes (Units)
 */
function UnitsTrendBadge({ current, prev }) {
  if (prev === null || prev === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/40 text-gray-500 border border-gray-700/50">
        -
      </span>
    )
  }

  const diff = current - prev
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/40 text-gray-400 border border-gray-600/30">
        0 หน่วย
      </span>
    )
  }

  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : null
  const formattedDiff = Math.abs(diff).toLocaleString()

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-900/40 text-orange-400 border border-orange-500/50">
        ▲ +{formattedDiff} หน่วย {pct ? `(+${pct}%)` : ''}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-900/40 text-green-400 border border-green-500/50">
      ▼ -{formattedDiff} หน่วย {pct ? `(${pct}%)` : ''}
    </span>
  )
}

export function MonthStatsComparison({ resultData }) {
  if (!resultData) return null

  const {
    billsSum = 0,
    totalUnits = 0,
    oakPay = 0,
    mixPay = 0,
    icePay = 0,
    cdPay = 0,
    oakUnits = 0,
    mixUnits = 0,
    iceUnits = 0,
    cdUnits = 0,
    prevMonthLabel,
    prevBillsSum,
    prevTotalUnits,
    prevOakPay,
    prevMixPay,
    prevIcePay,
    prevCdPay,
    prevOakUnits,
    prevMixUnits,
    prevIceUnits,
    prevCdUnits,
  } = resultData

  const hasPrev = prevBillsSum !== undefined && prevBillsSum !== null

  const users = [
    {
      name: 'โอ๊ค',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-black/60',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      pay: oakPay,
      prevPay: prevOakPay,
      units: oakUnits,
      prevUnits: prevOakUnits,
    },
    {
      name: 'มิกซ์',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-black/60',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      pay: mixPay,
      prevPay: prevMixPay,
      units: mixUnits,
      prevUnits: prevMixUnits,
    },
    {
      name: 'ไอซ์',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-black/60',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-400',
      pay: icePay,
      prevPay: prevIcePay,
      units: iceUnits,
      prevUnits: prevIceUnits,
    },
    {
      name: 'ซีดี',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-black/60',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-400',
      pay: cdPay,
      prevPay: prevCdPay,
      units: cdUnits,
      prevUnits: prevCdUnits,
    },
  ]

  return (
    <div className="mt-6 pt-6 border-t border-orange-900/50 w-full text-left">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h4 className="text-base font-bold text-orange-200 flex items-center gap-2 drop-shadow-sm">
          <span className="p-1.5 rounded-lg bg-orange-900/50 border border-orange-500/30 text-orange-400 text-sm">📊</span>
          การเปลี่ยนแปลงเปรียบเทียบกับเดือนก่อน
        </h4>
        {hasPrev && prevMonthLabel && (
          <span className="text-xs font-medium px-3 py-1 bg-black/60 border border-purple-500/40 text-purple-300 rounded-full shadow-[0_0_10px_rgba(128,0,128,0.3)]">
            เปรียบเทียบกับ {prevMonthLabel}
          </span>
        )}
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* House Total Bill Card */}
        <div className="p-4 rounded-xl bg-black/50 border border-orange-500/30 shadow-[0_0_15px_rgba(255,102,0,0.1)] flex flex-col justify-between hover:border-orange-500/60 transition-colors">
          <div>
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
              🏠 ค่าไฟรวมทั้งบ้าน
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white drop-shadow-[0_0_5px_rgba(255,165,0,0.5)]">
                {billsSum.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-orange-200/50">บาท</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-orange-900/40 flex items-center justify-between">
            <span className="text-xs text-orange-300/70">
              {hasPrev ? `เดือนก่อน: ${prevBillsSum?.toLocaleString()} ฿` : 'เดือนแรกในระบบ'}
            </span>
            <CostTrendBadge current={billsSum} prev={prevBillsSum} />
          </div>
        </div>

        {/* Total Units Card */}
        <div className="p-4 rounded-xl bg-black/50 border border-purple-500/30 shadow-[0_0_15px_rgba(128,0,128,0.1)] flex flex-col justify-between hover:border-purple-500/60 transition-colors">
          <div>
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
              ⚡ จำนวนหน่วยไฟฟ้ารวม
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white drop-shadow-[0_0_5px_rgba(128,0,128,0.5)]">
                {totalUnits.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-purple-200/50">หน่วย</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-purple-900/40 flex items-center justify-between">
            <span className="text-xs text-purple-300/70">
              {hasPrev ? `เดือนก่อน: ${prevTotalUnits?.toLocaleString()} หน่วย` : 'เดือนแรกในระบบ'}
            </span>
            <UnitsTrendBadge current={totalUnits} prev={prevTotalUnits} />
          </div>
        </div>
      </div>

      {/* Individual Breakdown Cards Grid */}
      <h5 className="text-xs font-bold text-orange-300/70 uppercase tracking-wider mb-3">
        🕷️ เปรียบเทียบยอดรายบุคคล
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {users.map((u) => (
          <div
            key={u.name}
            className={`p-3.5 rounded-xl border ${u.borderColor} ${u.bgColor} transition-all hover:shadow-[0_0_15px_rgba(255,102,0,0.15)]`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${u.color} shadow-[0_0_5px_rgba(255,255,255,0.5)]`} />
                <span className={`font-bold text-sm ${u.textColor}`}>{u.name}</span>
              </div>
              <CostTrendBadge current={u.pay} prev={u.prevPay} />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 mt-1 border-t border-orange-900/30">
              <div className="text-orange-200/70">
                ยอดชำระ: <span className="font-semibold text-white ml-1">{u.pay.toLocaleString()} <span className="font-normal text-xs text-orange-200/40">บาท</span></span>
              </div>
              <div className="text-purple-200/70">
                ใช้ไป: <span className="font-semibold text-white ml-1">{u.units.toLocaleString()} <span className="font-normal text-xs text-purple-200/40">หน่วย</span></span>
              </div>
            </div>
            {u.prevUnits !== null && u.prevUnits !== undefined && (
              <div className="flex justify-end mt-2 pt-2 border-t border-purple-900/20 text-[11px]">
                <UnitsTrendBadge current={u.units} prev={u.prevUnits} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
