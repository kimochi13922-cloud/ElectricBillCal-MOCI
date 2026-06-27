import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { getAllBills } from '../services/billsApi'

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const MONTH_NAMES = {
  '01': 'ม.ค.',
  '02': 'ก.พ.',
  '03': 'มี.ค.',
  '04': 'เม.ย.',
  '05': 'พ.ค.',
  '06': 'มิ.ย.',
  '07': 'ก.ค.',
  '08': 'ส.ค.',
  '09': 'ก.ย.',
  '10': 'ต.ค.',
  '11': 'พ.ย.',
  '12': 'ธ.ค.',
}

const CHART_YEARS = [
  { value: '2026', label: 'พ.ศ. 2569' },
  { value: '2025', label: 'พ.ศ. 2568' },
  { value: '2024', label: 'พ.ศ. 2567' },
  { value: '2027', label: 'พ.ศ. 2570' },
  { value: 'ALL', label: 'ทุกปี' },
]

/**
 * Chart showing total units every month across historical bills (Straight line)
 */
export function MonthlyTotalUnitsChart({ refreshTrigger }) {
  const [billsData, setBillsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('2026')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllBills()
        const sorted = [...(data || [])].sort((a, b) => (a.month > b.month ? 1 : -1))
        setBillsData(sorted)
      } catch (err) {
        console.error('Failed to load chart data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshTrigger])

  if (loading) {
    return <div className="text-gray-400 text-sm py-4 text-center">กำลังโหลดกราฟ...</div>
  }

  const filteredBills = selectedYear === 'ALL' 
    ? billsData 
    : billsData.filter((b) => b.month?.startsWith(selectedYear))

  const labels = filteredBills.map((b) => {
    const parts = b.month?.split('-')
    const m = parts && parts[1] ? MONTH_NAMES[parts[1]] || parts[1] : b.month
    return selectedYear === 'ALL' && parts ? `${m} ${parts[0]}` : m
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: 'จำนวนหน่วยรวม (Units)',
        data: filteredBills.map((b) => b.total_units || 0),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 3,
        tension: 0,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'sans-serif', size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} หน่วย`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span></span> 📈สรุปจำนวนหน่วยไฟฟ้ารวมทุกเดือน
        </h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium
                     shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
        >
          {CHART_YEARS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>

      {filteredBills.length === 0 ? (
        <div className="text-gray-400 text-sm py-8 text-center">
          ยังไม่มีข้อมูลประวัติสำหรับปีที่เลือก
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  )
}

/**
 * Chart showing unit consumption for EACH user every month across historical bills
 */
export function UserMonthlyUnitsChart({ refreshTrigger }) {
  const [billsData, setBillsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('2026')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllBills()
        const sorted = [...(data || [])].sort((a, b) => (a.month > b.month ? 1 : -1))
        setBillsData(sorted)
      } catch (err) {
        console.error('Failed to load user monthly chart data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshTrigger])

  if (loading) {
    return <div className="text-gray-400 text-sm py-4 text-center">กำลังโหลดกราฟ...</div>
  }

  // Build month labels and unit datasets for each user across all sorted bills first
  const allLabels = []
  const allOak = []
  const allMix = []
  const allIce = []
  const allCd = []
  const allYears = []

  billsData.forEach((bill, idx) => {
    const parts = bill.month?.split('-')
    const monthLabel = parts && parts[1] ? MONTH_NAMES[parts[1]] || parts[1] : bill.month
    const year = parts ? parts[0] : ''
    
    allLabels.push(selectedYear === 'ALL' && parts ? `${monthLabel} ${year}` : monthLabel)
    allYears.push(year)

    if (idx === 0) {
      allOak.push(0)
      allMix.push(0)
      allIce.push(0)
      allCd.push(0)
    } else {
      const prev = billsData[idx - 1]
      allOak.push(Math.max(0, (bill.oak_meter || 0) - (prev.oak_meter || 0)))
      allMix.push(Math.max(0, (bill.mix_meter || 0) - (prev.mix_meter || 0)))
      allIce.push(Math.max(0, (bill.ice_meter || 0) - (prev.ice_meter || 0)))
      allCd.push(Math.max(0, (bill.cd_meter || 0) - (prev.cd_meter || 0)))
    }
  })

  // Filter indices based on selectedYear
  const indicesToKeep = []
  allYears.forEach((yr, idx) => {
    if (selectedYear === 'ALL' || yr === selectedYear) {
      indicesToKeep.push(idx)
    }
  })

  const labels = indicesToKeep.map((i) => allLabels[i])
  const oakSeries = indicesToKeep.map((i) => allOak[i])
  const mixSeries = indicesToKeep.map((i) => allMix[i])
  const iceSeries = indicesToKeep.map((i) => allIce[i])
  const cdSeries = indicesToKeep.map((i) => allCd[i])

  const chartData = {
    labels,
    datasets: [
      {
        label: 'โอ๊ค',
        data: oakSeries,
        borderColor: '#2563eb', // Blue
        backgroundColor: '#2563eb',
        borderWidth: 2.5,
        tension: 0,
        pointRadius: 4,
      },
      {
        label: 'มิกซ์',
        data: mixSeries,
        borderColor: '#059669', // Emerald
        backgroundColor: '#059669',
        borderWidth: 2.5,
        tension: 0,
        pointRadius: 4,
      },
      {
        label: 'ไอซ์',
        data: iceSeries,
        borderColor: '#d97706', // Amber
        backgroundColor: '#d97706',
        borderWidth: 2.5,
        tension: 0,
        pointRadius: 4,
      },
      {
        label: 'ซีดี',
        data: cdSeries,
        borderColor: '#7c3aed', // Purple
        backgroundColor: '#7c3aed',
        borderWidth: 2.5,
        tension: 0,
        pointRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'sans-serif', size: 12 }, boxWidth: 12, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} หน่วย`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span></span> 📉จำนวนหน่วยไฟฟ้าของแต่ละคนในแต่ละเดือน
        </h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium
                     shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
        >
          {CHART_YEARS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>

      {labels.length === 0 ? (
        <div className="text-gray-400 text-sm py-8 text-center">
          ยังไม่มีข้อมูลประวัติสำหรับปีที่เลือก
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  )
}

/**
 * Chart showing unit amount and cost breakdown for each user on the result card
 */
export function UserUnitsBreakdownChart({ resultData }) {
  const [activeTab, setActiveTab] = useState('units') // 'units' | 'pay'

  if (!resultData) return null

  const { oakUnits = 0, mixUnits = 0, iceUnits = 0, cdUnits = 0, oakPay = 0, mixPay = 0, icePay = 0, cdPay = 0 } = resultData

  const unitsData = {
    labels: ['โอ๊ค', 'มิกซ์', 'ไอซ์', 'ซีดี'],
    datasets: [
      {
        label: 'จำนวนหน่วยที่ใช้',
        data: [oakUnits, mixUnits, iceUnits, cdUnits],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(139, 92, 246, 0.85)',
        ],
        borderRadius: 6,
      },
    ],
  }

  const payData = {
    labels: ['โอ๊ค', 'มิกซ์', 'ไอซ์', 'ซีดี'],
    datasets: [
      {
        label: 'ค่าไฟ (บาท)',
        data: [oakPay, mixPay, icePay, cdPay],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(139, 92, 246, 0.85)',
        ],
        borderColor: ['#2563eb', '#059669', '#d97706', '#7c3aed'],
        borderWidth: 2,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} หน่วย`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'sans-serif', size: 12 }, boxWidth: 12, padding: 15 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw?.toLocaleString()} บาท`,
        },
      },
    },
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <span>📊</span> กราฟวิเคราะห์รายบุคคล
        </h4>
        <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-medium text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'units' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            หน่วยไฟฟ้า (Units)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pay')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'pay' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-gray-900'
            }`}
          >
            ยอดชำระ (บาท)
          </button>
        </div>
      </div>

      <div className="h-56 w-full flex justify-center items-center">
        {activeTab === 'units' ? (
          <Bar data={unitsData} options={barOptions} />
        ) : (
          <Doughnut data={payData} options={doughnutOptions} />
        )}
      </div>
    </div>
  )
}
