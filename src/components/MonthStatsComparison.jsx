import React from 'react'

/**
 * Helper to render trend badge for cost/currency changes (Baht)
 * In financial context, increased cost is highlighted with red/orange warning (▲), lowered cost with green (▼).
 */
function CostTrendBadge({ current, prev }) {
  if (prev === null || prev === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        📌 ตั้งต้น (Baseline)
      </span>
    )
  }

  const diff = current - prev
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        ➖ เท่าเดิม
      </span>
    )
  }

  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : null
  const formattedDiff = Math.abs(diff).toLocaleString()

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200/60 shadow-sm">
        <span>▲</span> +{formattedDiff} บาท {pct ? `(+${pct}%)` : ''}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        -
      </span>
    )
  }

  const diff = current - prev
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        0 หน่วย
      </span>
    )
  }

  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : null
  const formattedDiff = Math.abs(diff).toLocaleString()

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
        ▲ +{formattedDiff} หน่วย {pct ? `(+${pct}%)` : ''}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
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
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-100',
      textColor: 'text-blue-700',
      pay: oakPay,
      prevPay: prevOakPay,
      units: oakUnits,
      prevUnits: prevOakUnits,
    },
    {
      name: 'มิกซ์',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100',
      textColor: 'text-emerald-700',
      pay: mixPay,
      prevPay: prevMixPay,
      units: mixUnits,
      prevUnits: prevMixUnits,
    },
    {
      name: 'ไอซ์',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-100',
      textColor: 'text-amber-700',
      pay: icePay,
      prevPay: prevIcePay,
      units: iceUnits,
      prevUnits: prevIceUnits,
    },
    {
      name: 'ซีดี',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50/70',
      borderColor: 'border-purple-100',
      textColor: 'text-purple-700',
      pay: cdPay,
      prevPay: prevCdPay,
      units: cdUnits,
      prevUnits: prevCdUnits,
    },
  ]

  return (
    <div className="mt-6 pt-6 border-t border-gray-100 w-full text-left">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm">📊</span>
          การเปลี่ยนแปลงเปรียบเทียบกับเดือนก่อน
        </h4>
        {hasPrev && prevMonthLabel && (
          <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            เปรียบเทียบกับ {prevMonthLabel}
          </span>
        )}
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* House Total Bill Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              🏠 ค่าไฟรวมทั้งบ้าน
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-800">
                {billsSum.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-gray-500">บาท</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {hasPrev ? `เดือนก่อน: ${prevBillsSum?.toLocaleString()} ฿` : 'เดือนแรกในระบบ'}
            </span>
            <CostTrendBadge current={billsSum} prev={prevBillsSum} />
          </div>
        </div>

        {/* Total Units Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              ⚡ จำนวนหน่วยไฟฟ้ารวม
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-800">
                {totalUnits.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-gray-500">หน่วย</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {hasPrev ? `เดือนก่อน: ${prevTotalUnits?.toLocaleString()} หน่วย` : 'เดือนแรกในระบบ'}
            </span>
            <UnitsTrendBadge current={totalUnits} prev={prevTotalUnits} />
          </div>
        </div>
      </div>

      {/* Individual Breakdown Cards Grid */}
      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
        เปรียบเทียบยอดรายบุคคล
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {users.map((u) => (
          <div
            key={u.name}
            className={`p-3.5 rounded-xl border ${u.borderColor} ${u.bgColor} transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${u.color}`} />
                <span className={`font-bold text-sm ${u.textColor}`}>{u.name}</span>
              </div>
              <CostTrendBadge current={u.pay} prev={u.prevPay} />
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/40">
              <div className="text-gray-600">
                ยอดชำระ: <span className="font-semibold text-gray-800">{u.pay.toLocaleString()} บาท</span>
              </div>
              <div className="text-gray-500">
                ใช้ไป: <span className="font-semibold text-gray-700">{u.units.toLocaleString()} หน่วย</span>
              </div>
            </div>
            {u.prevUnits !== null && u.prevUnits !== undefined && (
              <div className="flex justify-end mt-1 text-[11px]">
                <UnitsTrendBadge current={u.units} prev={u.prevUnits} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
