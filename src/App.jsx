import { useState, useRef } from 'react'
import { insertBill, getBillByMonth, updateBill, getAllBills } from './services/billsApi'
import { MonthlyTotalUnitsChart, UserUnitsBreakdownChart, UserMonthlyUnitsChart } from './components/ElectricityCharts'
import './App.css'

const MONTHS = [
  { value: '01', label: 'มกราคม' },
  { value: '02', label: 'กุมภาพันธ์' },
  { value: '03', label: 'มีนาคม' },
  { value: '04', label: 'เมษายน' },
  { value: '05', label: 'พฤษภาคม' },
  { value: '06', label: 'มิถุนายน' },
  { value: '07', label: 'กรกฎาคม' },
  { value: '08', label: 'สิงหาคม' },
  { value: '09', label: 'กันยายน' },
  { value: '10', label: 'ตุลาคม' },
  { value: '11', label: 'พฤศจิกายน' },
  { value: '12', label: 'ธันวาคม' },
]

const YEARS = [
  { value: '2024', label: 'พ.ศ. 2567' },
  { value: '2025', label: 'พ.ศ. 2568' },
  { value: '2026', label: 'พ.ศ. 2569' },
  { value: '2027', label: 'พ.ศ. 2570' },
  { value: '2028', label: 'พ.ศ. 2571' },
]

function App() {
  const [selectedYear, setSelectedYear] = useState('2026')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [billsSum, setBillsSum] = useState('')
  const [oakMeter, setOakMeter] = useState('')
  const [mixMeter, setMixMeter] = useState('')
  const [iceMeter, setIceMeter] = useState('')
  const [cdMeter, setCdMeter] = useState('')
  const [totalUnits, setTotalUnits] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [existingId, setExistingId] = useState(null)
  const [prevMonth, setPrevMonth] = useState(null)
  const [refreshChartTrigger, setRefreshChartTrigger] = useState(0)
  const resultRef = useRef(null)

  const loadMonthData = async (monthValue, yearValue) => {
    setSelectedMonth(monthValue)
    setMessage('')
    setResult(null)
    setExistingId(null)

    if (!monthValue) {
      setBillsSum('')
      setTotalUnits('')
      setOakMeter('')
      setMixMeter('')
      setIceMeter('')
      setCdMeter('')
      setPrevMonth(null)
      return
    }

    let pOak = 0, pMix = 0, pIce = 0, pCd = 0
    let foundPrev = false
    const monthNum = Number(monthValue)
    let prevMonthStr = ''
    if (monthNum > 1) {
      prevMonthStr = `${yearValue}-${String(monthNum - 1).padStart(2, '0')}`
    } else {
      prevMonthStr = `${Number(yearValue) - 1}-12`
    }

    try {
      const prevRecords = await getBillByMonth(prevMonthStr)
      if (prevRecords && prevRecords.length > 0) {
        const p = prevRecords[0]
        setPrevMonth(p)
        foundPrev = true
        pOak = p.oak_meter || 0
        pMix = p.mix_meter || 0
        pIce = p.ice_meter || 0
        pCd = p.cd_meter || 0
        console.log(`📅 Previous Month Data (${prevMonthStr}):`, {
          Oak: pOak,
          Mix: pMix,
          Ice: pIce,
          CD: pCd,
          fullRecord: p,
        })
      } else {
        setPrevMonth(null)
        console.log(`⚠️ No previous month record found for ${prevMonthStr}`)
      }
    } catch (err) {
      setPrevMonth(null)
      console.error(`❌ Error loading previous month (${prevMonthStr}):`, err)
    }

    const yearMonth = `${yearValue}-${monthValue}`
    try {
      const records = await getBillByMonth(yearMonth)
      if (records && records.length > 0) {
        const bill = records[0]
        const oakMeterNum = bill.oak_meter || 0
        const mixMeterNum = bill.mix_meter || 0
        const iceMeterNum = bill.ice_meter || 0
        const cdMeterNum = bill.cd_meter || 0

        setBillsSum(bill.bills_sum?.toString() || '')
        setTotalUnits(bill.total_units?.toString() || '')
        setOakMeter(bill.oak_meter?.toString() || '')
        setMixMeter(bill.mix_meter?.toString() || '')
        setIceMeter(bill.ice_meter?.toString() || '')
        setCdMeter(bill.cd_meter?.toString() || '')
        setExistingId(bill.id)
        setResult({
          month: MONTHS.find((m) => m.value === monthValue)?.label,
          billsSum: bill.bills_sum || 0,
          oakPay: bill.oak_pay || 0,
          mixPay: bill.mix_pay || 0,
          icePay: bill.ice_pay || 0,
          cdPay: bill.cd_pay || 0,
          oakUnits: foundPrev ? Math.max(0, oakMeterNum - pOak) : 0,
          mixUnits: foundPrev ? Math.max(0, mixMeterNum - pMix) : 0,
          iceUnits: foundPrev ? Math.max(0, iceMeterNum - pIce) : 0,
          cdUnits: foundPrev ? Math.max(0, cdMeterNum - pCd) : 0,
        })
        setMessage('📋 พบข้อมูลเดือนนี้แล้ว — แก้ไขแล้วกดบันทึกได้เลย')
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      } else {
        setBillsSum('')
        setTotalUnits('')
        setOakMeter('')
        setMixMeter('')
        setIceMeter('')
        setCdMeter('')
        if (foundPrev) {
          setMessage('🆕 ยังไม่มีข้อมูลเดือนนี้ — กรอกข้อมูลมิเตอร์ใหม่ได้เลย')
        } else {
          setMessage('🆕 ยังไม่มีข้อมูลเดือนก่อนหน้า — ระบบจะใช้เดือนนี้เป็นค่ามิเตอร์ตั้งต้น ( Baseline )')
        }
      }
    } catch (err) {
      console.error(err)
      setMessage(`❌ โหลดข้อมูลไม่สำเร็จ: ${err.message}`)
    }
  }

  const handleMonthChange = (monthValue) => {
    loadMonthData(monthValue, selectedYear)
  }

  const handleYearChange = (yearValue) => {
    setSelectedYear(yearValue)
    if (selectedMonth) {
      loadMonthData(selectedMonth, yearValue)
    }
  }

  const recalculateAllBills = async () => {
    try {
      const allData = await getAllBills()
      if (!allData || allData.length <= 1) return

      // Sort chronological ascending (oldest month to newest)
      const sorted = [...allData].sort((a, b) => (a.month > b.month ? 1 : -1))

      for (let i = 1; i < sorted.length; i++) {
        const curr = sorted[i]
        const prev = sorted[i - 1]

        const oakUnits = Math.max(0, (curr.oak_meter || 0) - (prev.oak_meter || 0))
        const mixUnits = Math.max(0, (curr.mix_meter || 0) - (prev.mix_meter || 0))
        const iceUnits = Math.max(0, (curr.ice_meter || 0) - (prev.ice_meter || 0))
        const cdUnits = Math.max(0, (curr.cd_meter || 0) - (prev.cd_meter || 0))

        const oakBase = oakUnits * 4.5
        const mixBase = mixUnits * 4.5
        const iceBase = iceUnits * 4.5
        const cdBase = cdUnits * 4.5

        const total = curr.bills_sum || 0
        const sumUnitsCost = oakBase + mixBase + iceBase + cdBase
        const commonShare = (total - sumUnitsCost) / 4

        const oakPay = Math.round(oakBase + commonShare)
        const mixPay = Math.round(mixBase + commonShare)
        const icePay = Math.round(iceBase + commonShare)
        const cdPay = total - oakPay - mixPay - icePay
        const totalU = curr.total_units || (oakUnits + mixUnits + iceUnits + cdUnits)

        if (
          curr.oak_pay !== oakPay ||
          curr.mix_pay !== mixPay ||
          curr.ice_pay !== icePay ||
          curr.cd_pay !== cdPay
        ) {
          await updateBill(curr.id, {
            oak_pay: oakPay,
            mix_pay: mixPay,
            ice_pay: icePay,
            cd_pay: cdPay,
            total_units: totalU,
          })
        }
      }
    } catch (err) {
      console.error('Cascade recalculation error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!selectedMonth) {
      setMessage('⚠️ กรุณาเลือกเดือน')
      return
    }

    const oak = Number(oakMeter) || 0
    const mix = Number(mixMeter) || 0
    const ice = Number(iceMeter) || 0
    const cd = Number(cdMeter) || 0
    const total = Number(billsSum) || 0

    const hasPrev = prevMonth !== null
    const prevOak = hasPrev ? (Number(prevMonth.oak_meter) || 0) : 0
    const prevMix = hasPrev ? (Number(prevMonth.mix_meter) || 0) : 0
    const prevIce = hasPrev ? (Number(prevMonth.ice_meter) || 0) : 0
    const prevCd = hasPrev ? (Number(prevMonth.cd_meter) || 0) : 0

    // Units used this month (0 if starting baseline month)
    const oakUnits = hasPrev ? Math.max(0, oak - prevOak) : 0
    const mixUnits = hasPrev ? Math.max(0, mix - prevMix) : 0
    const iceUnits = hasPrev ? Math.max(0, ice - prevIce) : 0
    const cdUnits = hasPrev ? Math.max(0, cd - prevCd) : 0

    const oakBase = oakUnits * 4.5
    const mixBase = mixUnits * 4.5
    const iceBase = iceUnits * 4.5
    const cdBase = cdUnits * 4.5

    const sumUnitsCost = oakBase + mixBase + iceBase + cdBase
    const commonShare = (total - sumUnitsCost) / 4

    const oakPay = Math.round(oakBase + commonShare)
    const mixPay = Math.round(mixBase + commonShare)
    const icePay = Math.round(iceBase + commonShare)
    const cdPay = total - oakPay - mixPay - icePay
    const totalU = Number(totalUnits) || (oakUnits + mixUnits + iceUnits + cdUnits)

    const monthDate = `${selectedYear}-${selectedMonth}-01`

    const billData = {
      month: monthDate,
      bills_sum: total,
      total_units: totalU,
      oak_meter: oak,
      mix_meter: mix,
      ice_meter: ice,
      cd_meter: cd,
      oak_pay: oakPay,
      mix_pay: mixPay,
      ice_pay: icePay,
      cd_pay: cdPay,
    }

    setLoading(true)
    try {
      let recordId = existingId

      // Safety check: if we don't have an existingId, re-check the database
      if (!recordId) {
        const yearMonth = `${selectedYear}-${selectedMonth}`
        const existing = await getBillByMonth(yearMonth)
        if (existing && existing.length > 0) {
          recordId = existing[0].id
          setExistingId(recordId)
        }
      }

      if (recordId) {
        await updateBill(recordId, billData)
      } else {
        const inserted = await insertBill(billData)
        setExistingId(inserted.id)
      }

      setMessage('🔄 กำลังคำนวณซ้ำและอัปเดตข้อมูลทุกเดือน...')
      await recalculateAllBills()
      setMessage('✅ บันทึกและคำนวณใหม่ทุกเดือนในระบบเรียบร้อยแล้ว!')
      setResult({
        month: MONTHS.find((m) => m.value === selectedMonth)?.label,
        billsSum: total,
        oakPay,
        mixPay,
        icePay,
        cdPay,
        oakUnits,
        mixUnits,
        iceUnits,
        cdUnits,
      })
      setRefreshChartTrigger((prev) => prev + 1)
    } catch (err) {
      console.error(err)
      setMessage(`❌ เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Show result container only when result exists (from calculation or loading old data)
  const showResult = result !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            ระบบคำนวณค่าไฟบ้าน MOCI
          </h1>
          <h3 className="text-lg text-gray-500 mt-1">
            ประจำปี {YEARS.find((y) => y.value === selectedYear)?.label || 'พ.ศ. 2569'}
          </h3>
        </div>

        {/* Selectors */}
        <div className="mb-6 flex flex-wrap justify-center items-center gap-4 w-full">
          {/* Year Selector */}
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       transition-all text-base cursor-pointer font-medium"
          >
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>

          {/* Month Selector */}
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full sm:w-auto max-w-xs px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       transition-all text-base cursor-pointer"
          >
            <option value="">-- กรุณาเลือกเดือน --</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        {message && (
          <p className="mb-6 px-4 py-3 rounded-xl bg-white/70 backdrop-blur text-gray-700 shadow-sm text-sm w-full max-w-lg text-center">
            {message}
          </p>
        )}

        {/* Calculator — flex layout centered */}
        <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 text-left">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* ค่าไฟรวม */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bills-sum" className="font-semibold text-gray-700">
                  ค่าไฟรวมทั้งบ้าน (บาท)
                </label>
                <input
                  type="number"
                  id="bills-sum"
                  name="bills_sum"
                  value={billsSum}
                  onChange={(e) => setBillsSum(e.target.value)}
                  placeholder="เช่น 3500"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/*จำนวนหน่วยทั้งหมด*/}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="total-units" className="font-semibold text-gray-700">
                  จำนวนหน่วยทั้งหมดที่ใช้
                </label>
                <input
                  type="number"
                  id="total-units"
                  name="total_units"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  placeholder="เช่น 230"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* โอ๊ค */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="oak-meter" className="font-semibold text-gray-700">
                  มิเตอร์ 1 (โอ๊ค)
                </label>
                <p className="text-xs text-gray-400">
                  ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.oak_meter?.toLocaleString()} หน่วย` : '-'}
                </p>
                <input
                  type="number"
                  id="oak-meter"
                  name="oak_meter"
                  value={oakMeter}
                  onChange={(e) => setOakMeter(e.target.value)}
                  placeholder="หน่วยไฟ"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* มิกซ์ */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mix-meter" className="font-semibold text-gray-700">
                  มิเตอร์ 2 (มิกซ์)
                </label>
                <p className="text-xs text-gray-400">
                  ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.mix_meter?.toLocaleString()} หน่วย` : '-'}
                </p>
                <input
                  type="number"
                  id="mix-meter"
                  name="mix_meter"
                  value={mixMeter}
                  onChange={(e) => setMixMeter(e.target.value)}
                  placeholder="หน่วยไฟ"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* ไอซ์ */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ice-meter" className="font-semibold text-gray-700">
                  มิเตอร์ 3 (ไอซ์)
                </label>
                <p className="text-xs text-gray-400">
                  ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.ice_meter?.toLocaleString()} หน่วย` : '-'}
                </p>
                <input
                  type="number"
                  id="ice-meter"
                  name="ice_meter"
                  value={iceMeter}
                  onChange={(e) => setIceMeter(e.target.value)}
                  placeholder="หน่วยไฟ"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* ซีดี */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cd-meter" className="font-semibold text-gray-700">
                  มิเตอร์ 4 (ซีดี)
                </label>
                <p className="text-xs text-gray-400">
                  ค่ามิเตอร์ในเดือนก่อน : {prevMonth ? `${prevMonth.cd_meter?.toLocaleString()} หน่วย` : '-'}
                </p>
                <input
                  type="number"
                  id="cd-meter"
                  name="cd_meter"
                  value={cdMeter}
                  onChange={(e) => setCdMeter(e.target.value)}
                  placeholder="หน่วยไฟ"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98]
                           text-white font-semibold shadow-md hover:shadow-lg
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 cursor-pointer text-center"
              >
                {loading ? 'กำลังบันทึก...' : existingId ? 'คำนวณ & อัปเดต' : 'คำนวณ & บันทึก'}
              </button>
            </form>
          </div>

          {/* Result — hidden until calculated or old month loaded */}
          {showResult && (
            <div ref={resultRef} className="bg-white rounded-2xl shadow-md p-6 text-center animate-[fadeIn_0.3s_ease-out]">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                สรุปยอดค่าไฟประจำเดือน{result ? ` ${result.month}` : ''}
              </h2>
              <h3 className="text-lg font-semibold text-blue-600 mb-1">
                ค่าไฟรวมทั้งบ้าน : {result ? `${result.billsSum.toLocaleString()} บาท` : '-'}
              </h3>
              <h3 className="text-base font-semibold text-gray-600 mt-4 mb-2">แยกตามมิเตอร์</h3>
              <div className="flex flex-col gap-2 text-gray-700 justify-center items-center">
                <p>ค่าไฟโอ๊ค : {result ? `${result.oakPay.toLocaleString()} บาท` : '-'}</p>
                <p>ค่าไฟมิกซ์ : {result ? `${result.mixPay.toLocaleString()} บาท` : '-'}</p>
                <p>ค่าไฟไอซ์ : {result ? `${result.icePay.toLocaleString()} บาท` : '-'}</p>
                <p>ค่าไฟซีดี : {result ? `${result.cdPay.toLocaleString()} บาท` : '-'}</p>
              </div>

              {/* Each unit user chart on the result */}
              <UserUnitsBreakdownChart resultData={result} />
            </div>
          )}
        </div>

        {/* Chart of total units every month */}
        <div className="w-full">
          <MonthlyTotalUnitsChart refreshTrigger={refreshChartTrigger} />
        </div>

        {/* Chart of unit amount for each user every month */}
        <div className="w-full">
          <UserMonthlyUnitsChart refreshTrigger={refreshChartTrigger} />
        </div>
      </div>
    </div>
  )
}

export default App
