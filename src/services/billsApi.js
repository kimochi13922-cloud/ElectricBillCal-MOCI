import { supabase } from '../lib/supabaseClient'

const TABLE_NAME = 'electricMoci'

// ──────────────────────────────────────────────
//  GET — Pull data
// ──────────────────────────────────────────────

/**
 * Fetch all bills, newest first.
 */
export async function getAllBills() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('month', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Fetch a single bill by ID.
 */
export async function getBillById(id) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch bills for a specific month.
 * @param {string} yearMonth — format 'YYYY-MM' (e.g. '2026-05')
 */
export async function getBillByMonth(yearMonth) {
  // Build first and last day of the month range
  const startDate = `${yearMonth}-01`
  const [year, month] = yearMonth.split('-').map(Number)
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .gte('month', startDate)
    .lt('month', nextMonth)
    .order('month', { ascending: true })

  if (error) throw error
  return data
}

// ──────────────────────────────────────────────
//  POST — Insert new data
// ──────────────────────────────────────────────

/**
 * Insert a new bill record.
 * @param {Object} bill
 * @param {string}  bill.month      — date string 'YYYY-MM-DD'
 * @param {number}  bill.bills_sum  — total electricity bill
 * @param {number}  bill.oak_meter  — meter reading for โอ๊ค
 * @param {number}  bill.mix_meter  — meter reading for มิกซ์
 * @param {number}  bill.ice_meter  — meter reading for ไอซ์
 * @param {number}  bill.cd_meter   — meter reading for ซีดี
 * @param {number}  bill.oak_pay    — calculated cost for โอ๊ค
 * @param {number}  bill.mix_pay    — calculated cost for มิกซ์
 * @param {number}  bill.ice_pay    — calculated cost for ไอซ์
 * @param {number}  bill.cd_pay     — calculated cost for ซีดี
 */
export async function insertBill(bill) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([bill])
    .select()

  if (error) throw error
  return data[0]
}

// ──────────────────────────────────────────────
//  PUT / PATCH — Update existing data
// ──────────────────────────────────────────────

/**
 * Update an existing bill by ID.
 * Only the fields you pass will be updated (partial update).
 */
export async function updateBill(id, updates) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

// ──────────────────────────────────────────────
//  DELETE — Remove data
// ──────────────────────────────────────────────

/**
 * Delete a bill by ID.
 */
export async function deleteBill(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
