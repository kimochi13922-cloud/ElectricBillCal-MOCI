import { useState, useRef } from 'react'
import { toJpeg } from 'html-to-image'
import { insertBill, getBillByMonth, updateBill, getAllBills } from './services/billsApi'
import { MonthlyTotalUnitsChart, UserUnitsBreakdownChart, UserMonthlyUnitsChart } from './components/ElectricityCharts'
import { MonthStatsComparison } from './components/MonthStatsComparison'
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

function isAdjacentMonth(previousMonth, currentMonth) {
  if (!previousMonth || !currentMonth) return false
  const previous = new Date(`${previousMonth}-01T00:00:00Z`)
  const current = new Date(`${currentMonth}-01T00:00:00Z`)
  const next = new Date(previous)
  next.setUTCMonth(next.getUTCMonth() + 1)
  return next.getTime() === current.getTime()
}

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
  const [exporting, setExporting] = useState(false)
  const resultRef = useRef(null)
  const loadRequestRef = useRef(0)

  const handleExportJpg = async () => {
    if (!resultRef.current) return
    try {
      setExporting(true)
      const dataUrl = await toJpeg(resultRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        filter: (node) => !node.classList?.contains('no-export'),
      })
      const link = document.createElement('a')
      link.download = `electricity-bill-${result?.month || 'summary'}.jpg`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export error:', err)
      alert('เกิดข้อผิดพลาดในการส่งออกภาพ: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const buildResultData = async (monthValue, yearValue, currentBill, directPrev) => {
    try {
      const allData = await getAllBills()
      const sorted = [...(allData || [])].sort((a, b) => String(a.month).localeCompare(String(b.month)))
      const targetPrefix = `${yearValue}-${monthValue}`
      const idx = sorted.findIndex((b) => b.month?.startsWith(targetPrefix))

      let prev = null
      let prevPrev = null

      if (idx !== -1) {
        const candidate = idx > 0 ? sorted[idx - 1] : null
        prev = candidate && isAdjacentMonth(candidate.month?.slice(0, 7), targetPrefix) ? candidate : null
        prevPrev = idx > 1 ? sorted[idx - 2] : null
      } else if (directPrev) {
        prev = directPrev
      }

      const parts = prev?.month?.split('-')
      const prevMonthLabel = parts && parts[1] ? MONTHS.find((m) => m.value === parts[1])?.label : ''

      const oakMeterNum = currentBill.oak_meter || 0
      const mixMeterNum = currentBill.mix_meter || 0
      const iceMeterNum = currentBill.ice_meter || 0
      const cdMeterNum = currentBill.cd_meter || 0

      const pOak = prev ? prev.oak_meter || 0 : 0
      const pMix = prev ? prev.mix_meter || 0 : 0
      const pIce = prev ? prev.ice_meter || 0 : 0
      const pCd = prev ? prev.cd_meter || 0 : 0

      const oakUnits = prev ? Math.max(0, oakMeterNum - pOak) : 0
      const mixUnits = prev ? Math.max(0, mixMeterNum - pMix) : 0
      const iceUnits = prev ? Math.max(0, iceMeterNum - pIce) : 0
      const cdUnits = prev ? Math.max(0, cdMeterNum - pCd) : 0
      const calculatedTotalUnits = oakUnits + mixUnits + iceUnits + cdUnits

      return {
        month: MONTHS.find((m) => m.value === monthValue)?.label,
        billsSum: currentBill.bills_sum || 0,
        totalUnits: currentBill.total_units || calculatedTotalUnits,
        oakPay: currentBill.oak_pay || 0,
        mixPay: currentBill.mix_pay || 0,
        icePay: currentBill.ice_pay || 0,
        cdPay: currentBill.cd_pay || 0,
        oakUnits,
        mixUnits,
        iceUnits,
        cdUnits,
        prevMonthLabel,
        prevBillsSum: prev ? prev.bills_sum : null,
        prevTotalUnits: prev ? prev.total_units : null,
        prevOakPay: prev ? prev.oak_pay : null,
        prevMixPay: prev ? prev.mix_pay : null,
        prevIcePay: prev ? prev.ice_pay : null,
        prevCdPay: prev ? prev.cd_pay : null,
        prevOakUnits: prev && prevPrev && isAdjacentMonth(prevPrev.month?.slice(0, 7), prev.month?.slice(0, 7)) ? Math.max(0, (prev.oak_meter || 0) - (prevPrev.oak_meter || 0)) : null,
        prevMixUnits: prev && prevPrev && isAdjacentMonth(prevPrev.month?.slice(0, 7), prev.month?.slice(0, 7)) ? Math.max(0, (prev.mix_meter || 0) - (prevPrev.mix_meter || 0)) : null,
        prevIceUnits: prev && prevPrev && isAdjacentMonth(prevPrev.month?.slice(0, 7), prev.month?.slice(0, 7)) ? Math.max(0, (prev.ice_meter || 0) - (prevPrev.ice_meter || 0)) : null,
        prevCdUnits: prev && prevPrev && isAdjacentMonth(prevPrev.month?.slice(0, 7), prev.month?.slice(0, 7)) ? Math.max(0, (prev.cd_meter || 0) - (prevPrev.cd_meter || 0)) : null,
      }
    } catch (err) {
      console.error('Error building result data:', err)
      return {
        month: MONTHS.find((m) => m.value === monthValue)?.label,
        billsSum: currentBill.bills_sum || 0,
        totalUnits: currentBill.total_units || 0,
        oakPay: currentBill.oak_pay || 0,
        mixPay: currentBill.mix_pay || 0,
        icePay: currentBill.ice_pay || 0,
        cdPay: currentBill.cd_pay || 0,
        oakUnits: 0,
        mixUnits: 0,
        iceUnits: 0,
        cdUnits: 0,
      }
    }
  }

  const loadMonthData = async (monthValue, yearValue) => {
    const requestId = ++loadRequestRef.current
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

    let foundPrev = false
    let directPrevRecord = null
    const monthNum = Number(monthValue)
    const prevMonthStr = monthNum > 1
      ? `${yearValue}-${String(monthNum - 1).padStart(2, '0')}`
      : `${Number(yearValue) - 1}-12`

    try {
      const prevRecords = await getBillByMonth(prevMonthStr)
      if (prevRecords && prevRecords.length > 0) {
        const p = prevRecords[0]
        directPrevRecord = p
        setPrevMonth(p)
        foundPrev = true
      } else {
        setPrevMonth(null)
      }
    } catch (err) {
      setPrevMonth(null)
      console.error(`❌ Error loading previous month (${prevMonthStr}):`, err)
    }

    const yearMonth = `${yearValue}-${monthValue}`
    try {
      const records = await getBillByMonth(yearMonth)
      if (requestId !== loadRequestRef.current) return
      if (records && records.length > 0) {
        const bill = records[0]

        setBillsSum(bill.bills_sum?.toString() || '')
        setTotalUnits(bill.total_units?.toString() || '')
        setOakMeter(bill.oak_meter?.toString() || '')
        setMixMeter(bill.mix_meter?.toString() || '')
        setIceMeter(bill.ice_meter?.toString() || '')
        setCdMeter(bill.cd_meter?.toString() || '')
        setExistingId(bill.id)

        const resultData = await buildResultData(monthValue, yearValue, bill, directPrevRecord)
        setResult(resultData)
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
      const sorted = [...allData].sort((a, b) => String(a.month).localeCompare(String(b.month)))

      for (let i = 1; i < sorted.length; i++) {
        const curr = sorted[i]
        const candidate = sorted[i - 1]
        const prev = isAdjacentMonth(candidate.month?.slice(0, 7), curr.month?.slice(0, 7)) ? candidate : null

        const oakUnits = prev ? Math.max(0, (curr.oak_meter || 0) - (prev.oak_meter || 0)) : 0
        const mixUnits = prev ? Math.max(0, (curr.mix_meter || 0) - (prev.mix_meter || 0)) : 0
        const iceUnits = prev ? Math.max(0, (curr.ice_meter || 0) - (prev.ice_meter || 0)) : 0
        const cdUnits = prev ? Math.max(0, (curr.cd_meter || 0) - (prev.cd_meter || 0)) : 0

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
    const enteredTotalUnits = totalUnits === '' ? null : Number(totalUnits)

    if ([oak, mix, ice, cd, total, enteredTotalUnits].some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
      setMessage('กรุณากรอกตัวเลขที่ไม่ติดลบ')
      return
    }

    const hasPrev = prevMonth !== null
    const prevOak = hasPrev ? (Number(prevMonth.oak_meter) || 0) : 0
    const prevMix = hasPrev ? (Number(prevMonth.mix_meter) || 0) : 0
    const prevIce = hasPrev ? (Number(prevMonth.ice_meter) || 0) : 0
    const prevCd = hasPrev ? (Number(prevMonth.cd_meter) || 0) : 0

    if (hasPrev && (oak < prevOak || mix < prevMix || ice < prevIce || cd < prevCd)) {
      setMessage('ค่ามิเตอร์ต้องไม่ต่ำกว่าเดือนก่อนหน้า')
      return
    }

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
    if (sumUnitsCost > total) {
      setMessage('ยอดค่าไฟรวมต้องไม่น้อยกว่าค่าหน่วยไฟที่คำนวณได้')
      return
    }
    const commonShare = (total - sumUnitsCost) / 4

    const oakPay = Math.round(oakBase + commonShare)
    const mixPay = Math.round(mixBase + commonShare)
    const icePay = Math.round(iceBase + commonShare)
    const cdPay = total - oakPay - mixPay - icePay
    const totalU = enteredTotalUnits ?? (oakUnits + mixUnits + iceUnits + cdUnits)

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
      const resultData = await buildResultData(selectedMonth, selectedYear, billData, prevMonth)
      setResult(resultData)
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
    <div className="cosmic-app min-h-screen p-4 sm:p-6 md:p-10 flex flex-col items-center">
      <div className="cosmic-container w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Header */}
        <div className="cosmic-header mb-8 text-center">
          <div className="cosmic-eyebrow">MOCI / ELECTRICITY ORBITAL</div>
          <h1 className="text-3xl md:text-4xl font-bold">
            ระบบคำนวณค่าไฟบ้าน MOCI
          </h1>
          <h3 className="text-lg mt-1">
            ประจำปี {YEARS.find((y) => y.value === selectedYear)?.label || 'พ.ศ. 2569'}
          </h3>
        </div>

        {/* Selectors */}
        <div className="cosmic-controls mb-6 flex flex-wrap justify-center items-center gap-4 w-full">
          {/* Year Selector */}
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="cosmic-select px-4 py-3 rounded-xl text-base cursor-pointer font-medium"
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
            className="cosmic-select w-full sm:w-auto max-w-xs px-4 py-3 rounded-xl text-base cursor-pointer"
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
          <p className="cosmic-message mb-6 px-4 py-3 rounded-xl text-sm w-full max-w-lg text-center">
            {message}
          </p>
        )}

        {/* Calculator — flex layout centered */}
        <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
          {/* Form */}
          <div className="cosmic-card rounded-2xl p-6 sm:p-8 text-left">
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
                className="cosmic-cta mt-2 w-full px-6 py-3 rounded-xl font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 cursor-pointer text-center"
              >
                {loading ? 'กำลังบันทึก...' : existingId ? 'คำนวณ & อัปเดต' : 'คำนวณ & บันทึก'}
              </button>
            </form>
          </div>

              {/* Result — hidden until calculated or old month loaded */}
              {showResult && (
                <div ref={resultRef} className="cosmic-card rounded-2xl p-6 text-center animate-[fadeIn_0.3s_ease-out] relative">
                  <div className="flex justify-end mb-2 no-export">
                    <button
                      type="button"
                      onClick={handleExportJpg}
                      disabled={exporting}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 border border-blue-200/60"
                    >
                      <span>📷</span> {exporting ? 'กำลังบันทึกภาพ...' : 'ส่งออกเป็นภาพ JPG'}
                    </button>
                  </div>
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

                  {/* Month-over-Month Stats Comparison */}
                  <MonthStatsComparison resultData={result} />

                  {/* Each unit user chart on the result */}
                  <UserUnitsBreakdownChart resultData={result} />
                </div>
              )}
        </div>

        {/* Chart of total units every month */}
        <div className="cosmic-chart w-full">
          <MonthlyTotalUnitsChart refreshTrigger={refreshChartTrigger} />
        </div>

        {/* Chart of unit amount for each user every month */}
        <div className="cosmic-chart w-full">
          <UserMonthlyUnitsChart refreshTrigger={refreshChartTrigger} />
        </div>
      </div>
    </div>
  )
}

export default App
