import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET /api/reports/range?from=2026-10-01&to=2026-10-10
const isoRe = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (s) => isoRe.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
const bad = (msg) => NextResponse.json({ success: false, error: msg }, { status: 400 });

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    if (!validDate(from) || !validDate(to)) return bad('Valid from/to date (YYYY-MM-DD) do.');
    if (from > to) return bad('From date, To date se pehle honi chahiye.');

    const spanDays = Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000) + 1;
    if (spanDays > 1830) return bad('Range bahut bada hai (max 5 saal).');
    const monthly = spanDays > 31; // 31 din tak day-wise bars, usse bada to month-wise

    // Selected range ki saari paid appointments
    const [paidRows] = await pool.query(
      `SELECT id, client, service, DATE_FORMAT(date, '%Y-%m-%d') AS date_str,
              payment_mode, price, cash_amount, online_amount
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done' AND date BETWEEN ? AND ?
       ORDER BY date ASC`,
      [user.salonId, from, to]
    );

    // Chart ke buckets: 31 din tak -> har din, usse zyada -> har mahina
    const bucketKeys = [];
    const startD = new Date(from + 'T00:00:00Z');
    const endD = new Date(to + 'T00:00:00Z');
    if (!monthly) {
      for (let d = new Date(startD); d <= endD; d.setUTCDate(d.getUTCDate() + 1)) {
        bucketKeys.push(d.toISOString().slice(0, 10));
      }
    } else {
      for (let d = new Date(Date.UTC(startD.getUTCFullYear(), startD.getUTCMonth(), 1)); d <= endD; d.setUTCMonth(d.getUTCMonth() + 1)) {
        bucketKeys.push(d.toISOString().slice(0, 7));
      }
    }
    const buckets = new Map(bucketKeys.map((k) => [k, {
      period: k, revenue: 0, appointments: 0,
      cashRevenue: 0, onlineRevenue: 0, unknownRevenue: 0,
      cashCustomers: 0, onlineCustomers: 0, unknownCustomers: 0,
    }]));

    const paymentDetails = [];
    for (const r of paidRows) {
      const price = Number(r.price) || 0;
      const cashAmt = Number(r.cash_amount) || 0;
      const onlineAmt = Number(r.online_amount) || 0;
      let cash = 0, online = 0, unknown = 0, side = 'unknown';

      if (cashAmt > 0 && onlineAmt > 0) {
        cash = cashAmt; online = onlineAmt;
        side = onlineAmt >= cashAmt ? 'online' : 'cash'; // split: customer badi side me
      } else if (r.payment_mode === 'cash') { cash = price; side = 'cash'; }
      else if (r.payment_mode === 'online') { online = price; side = 'online'; }
      else { unknown = price; }

      const key = monthly ? r.date_str.slice(0, 7) : r.date_str;
      const b = buckets.get(key);
      if (b) {
        b.revenue += price; b.appointments += 1;
        b.cashRevenue += cash; b.onlineRevenue += online; b.unknownRevenue += unknown;
        if (side === 'cash') b.cashCustomers += 1;
        else if (side === 'online') b.onlineCustomers += 1;
        else b.unknownCustomers += 1;
      }
      paymentDetails.push({ id: r.id, date: r.date_str, client: r.client, service: r.service, cash, online, unknown });
    }
    paymentDetails.reverse(); // naya pehle

    const trend = [...buckets.values()];
    const totalRevenue = trend.reduce((s, b) => s + b.revenue, 0);
    const totalAppointments = trend.reduce((s, b) => s + b.appointments, 0);
    const paymentTotals = trend.reduce((acc, b) => ({
      cashCustomers: acc.cashCustomers + b.cashCustomers,
      cashRevenue: acc.cashRevenue + b.cashRevenue,
      onlineCustomers: acc.onlineCustomers + b.onlineCustomers,
      onlineRevenue: acc.onlineRevenue + b.onlineRevenue,
      unknownCustomers: acc.unknownCustomers + b.unknownCustomers,
      unknownRevenue: acc.unknownRevenue + b.unknownRevenue,
    }), { cashCustomers: 0, cashRevenue: 0, onlineCustomers: 0, onlineRevenue: 0, unknownCustomers: 0, unknownRevenue: 0 });

    // Employee performance: sirf selected range
    const [employeeRows] = await pool.query(
      `SELECT employee, SUM(price) AS revenue, COUNT(*) AS appointments
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done' AND employee IS NOT NULL AND employee != ''
         AND date BETWEEN ? AND ?
       GROUP BY employee
       ORDER BY revenue DESC`,
      [user.salonId, from, to]
    );

    // Baaki balance: selected range ki appointments ka (cancelled chhodkar)
    const [[balanceRow]] = await pool.query(
      `SELECT COALESCE(SUM(balance), 0) AS total,
              COUNT(DISTINCT COALESCE(NULLIF(phone, ''), CONCAT('name:', LOWER(TRIM(client))))) AS cnt
       FROM appointments
       WHERE salon_id = ? AND balance > 0 AND status <> 'cancelled'
         AND date BETWEEN ? AND ?`,
      [user.salonId, from, to]
    );

    // Selected range me purana balance kitna wapas mila
    const [[recv]] = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN payment_mode = 'cash' THEN amount END), 0) AS cash,
              COALESCE(SUM(CASE WHEN payment_mode = 'online' THEN amount END), 0) AS online,
              COUNT(*) AS cnt
       FROM balance_payments
       WHERE salon_id = ? AND DATE(paid_on) BETWEEN ? AND ?`,
      [user.salonId, from, to]
    );

    return NextResponse.json({
      success: true,
      from,
      to,
      monthly,
      totalRevenue,
      totalAppointments,
      totalBalance: Number(balanceRow.total) || 0,
      balanceCount: Number(balanceRow.cnt) || 0,
      balanceReceived: {
        cash: Number(recv.cash), online: Number(recv.online),
        total: Number(recv.cash) + Number(recv.online), count: Number(recv.cnt),
      },
      trend,
      employeePerformance: employeeRows,
      paymentTotals,
      paymentDetails,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}