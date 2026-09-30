import { useState, useRef } from 'react'
import { toJpeg } from 'html-to-image'
import { insertBill, getBillByMonth, updateBill, getAllBills } from '../services/billsApi'

export const MONTHS = [
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

export const YEARS = [
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

export function useCalculator() {
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
        backgroundColor: '#1a0b2e',
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

      const sorted = [...allData].sort((a, b) => String(a.month).localeCompare(String(b.month)))

      for (let i = 1; i < sorted.length; i++) {
        const curr = sorted[i]
        const candidate = sorted[i - 1]
        const prev = isAdjacentMonth(candidate.month?.slice(0, 7), curr.month?.slice(0, 7)) ? candidate : null

        const oakUnits = prev ? Math.max(0, (curr.oak_meter || 0) - (prev.oak_meter || 0)) : 0
        const mixUnits = prev ? Math.max(0, (curr.mix_meter || 0) - (prev.mix_meter || 0)) : 0
        const iceUnits = prev ? Math.max(0, (curr.ice_meter || 0) - (prev.ice_meter || 0)) : 0
        const cdUnits = prev ? Math.max(0, (curr.cd_meter || 0) - (prev.cd_meter || 0)) : 0

        const total = curr.bills_sum || 0
        
        let oakPay = 0, mixPay = 0, icePay = 0, cdPay = 0
        
        if (total > 0) {
          const oakBase = oakUnits * 4.5
          const mixBase = mixUnits * 4.5
          const iceBase = iceUnits * 4.5
          const cdBase = cdUnits * 4.5
  
          const sumUnitsCost = oakBase + mixBase + iceBase + cdBase
          const commonShare = (total - sumUnitsCost) / 4
  
          oakPay = Math.round(oakBase + commonShare)
          mixPay = Math.round(mixBase + commonShare)
          icePay = Math.round(iceBase + commonShare)
          cdPay = total - oakPay - mixPay - icePay
        }

        const totalU = curr.total_units || (oakUnits + mixUnits + iceUnits + cdUnits)

        if (
          curr.oak_pay !== oakPay ||
          curr.mix_pay !== mixPay ||
          curr.ice_pay !== icePay ||
          curr.cd_pay !== cdPay ||
          curr.total_units !== totalU
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
    
    // Allow partial saves without total bill! (User request logic)
    const total = billsSum ? Number(billsSum) : null
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

    // Only strictly validate if they entered a non-zero value, otherwise they might just be saving for 1 person
    if (hasPrev) {
      if (oak > 0 && oak < prevOak) { setMessage('ค่ามิเตอร์โอ๊คต้องไม่ต่ำกว่าเดือนก่อนหน้า'); return; }
      if (mix > 0 && mix < prevMix) { setMessage('ค่ามิเตอร์มิกซ์ต้องไม่ต่ำกว่าเดือนก่อนหน้า'); return; }
      if (ice > 0 && ice < prevIce) { setMessage('ค่ามิเตอร์ไอซ์ต้องไม่ต่ำกว่าเดือนก่อนหน้า'); return; }
      if (cd > 0 && cd < prevCd) { setMessage('ค่ามิเตอร์ซีดีต้องไม่ต่ำกว่าเดือนก่อนหน้า'); return; }
    }

    // Default to previous month if left blank, so logic passes when partially saving
    const safeOak = oak || prevOak
    const safeMix = mix || prevMix
    const safeIce = ice || prevIce
    const safeCd = cd || prevCd

    const oakUnits = hasPrev ? Math.max(0, safeOak - prevOak) : 0
    const mixUnits = hasPrev ? Math.max(0, safeMix - prevMix) : 0
    const iceUnits = hasPrev ? Math.max(0, safeIce - prevIce) : 0
    const cdUnits = hasPrev ? Math.max(0, safeCd - prevCd) : 0

    let oakPay = 0, mixPay = 0, icePay = 0, cdPay = 0

    if (total !== null) {
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

      oakPay = Math.round(oakBase + commonShare)
      mixPay = Math.round(mixBase + commonShare)
      icePay = Math.round(iceBase + commonShare)
      cdPay = total - oakPay - mixPay - icePay
    }

    const totalU = enteredTotalUnits ?? (oakUnits + mixUnits + iceUnits + cdUnits)
    const monthDate = `${selectedYear}-${selectedMonth}-01`

    const billData = {
      month: monthDate,
      bills_sum: total || 0,
      total_units: totalU,
      oak_meter: safeOak,
      mix_meter: safeMix,
      ice_meter: safeIce,
      cd_meter: safeCd,
      oak_pay: oakPay,
      mix_pay: mixPay,
      ice_pay: icePay,
      cd_pay: cdPay,
    }

    setLoading(true)
    try {
      let recordId = existingId

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
      setMessage('✅ บันทึกข้อมูลในระบบเรียบร้อยแล้ว!')
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

  return {
    state: {
      selectedYear,
      selectedMonth,
      billsSum,
      oakMeter,
      mixMeter,
      iceMeter,
      cdMeter,
      totalUnits,
      result,
      loading,
      message,
      existingId,
      prevMonth,
      refreshChartTrigger,
      exporting,
      resultRef
    },
    actions: {
      setSelectedYear,
      setSelectedMonth,
      setBillsSum,
      setOakMeter,
      setMixMeter,
      setIceMeter,
      setCdMeter,
      setTotalUnits,
      handleMonthChange,
      handleYearChange,
      handleSubmit,
      handleExportJpg
    }
  }
}
