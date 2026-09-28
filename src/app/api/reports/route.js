import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET: revenue + employee performance report (period: day/month/year)
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month'; // day | month | year

    // Date ko group karne ka format decide karo period ke hisaab se
    let dateFormat;
    if (period === 'day') dateFormat = '%Y-%m-%d';
    else if (period === 'year') dateFormat = '%Y';
    else dateFormat = '%Y-%m'; // month (default)

    // Revenue trend — date-wise grouped
    const [revenueRows] = await pool.query(
      `SELECT DATE_FORMAT(date, ?) AS period, SUM(price) AS revenue, COUNT(*) AS appointments
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done'
       GROUP BY period
       ORDER BY period ASC`,
      [dateFormat, user.salonId]
    );

    // Employee performance — employee-wise grouped, SIRF selected period (day/month/year) ka
    const [employeeRows] = await pool.query(
      `SELECT employee, SUM(price) AS revenue, COUNT(*) AS appointments
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done' AND employee IS NOT NULL AND employee != ''
         AND DATE_FORMAT(date, ?) = DATE_FORMAT(CURDATE(), ?)
       GROUP BY employee
       ORDER BY revenue DESC`,
      [user.salonId, dateFormat, dateFormat]
    );

    // Employee performance — SIRF current calendar month (incentive hamesha monthly hota hai, period selector se independent)
    const [employeeMonthRows] = await pool.query(
      `SELECT employee, SUM(price) AS revenue
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done' AND employee IS NOT NULL AND employee != ''
         AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
       GROUP BY employee`,
      [user.salonId]
    );

    // Payment mode breakdown — har paid appointment alag se aayegi, split ka cash/online amount alag-alag ginenge
    const [modeRows] = await pool.query(
      `SELECT DATE_FORMAT(date, ?) AS period,
              id,
              client,
              service,
              DATE_FORMAT(date, '%Y-%m-%d') AS date_str,
              payment_mode,
              price,
              cash_amount,
              online_amount
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done'
       ORDER BY date ASC`,
      [dateFormat, user.salonId]
    );

    const breakdownMap = new Map();
    for (const r of modeRows) {
      if (!breakdownMap.has(r.period)) {
        breakdownMap.set(r.period, {
          period: r.period,
          cashCustomers: 0, cashRevenue: 0,
          onlineCustomers: 0, onlineRevenue: 0,
          unknownCustomers: 0, unknownRevenue: 0,
        });
      }
      const row = breakdownMap.get(r.period);
      const price = Number(r.price) || 0;
      const cashAmt = Number(r.cash_amount) || 0;
      const onlineAmt = Number(r.online_amount) || 0;
      const mode = r.payment_mode;

      if (cashAmt > 0 && onlineAmt > 0) {
        // Split booking: amounts alag-alag, customer sirf badi wali side me
        row.cashRevenue += cashAmt;
        row.onlineRevenue += onlineAmt;
        if (onlineAmt >= cashAmt) row.onlineCustomers += 1;
        else row.cashCustomers += 1;
      } else if (mode === 'cash') {
        row.cashCustomers += 1; row.cashRevenue += price;
      } else if (mode === 'online') {
        row.onlineCustomers += 1; row.onlineRevenue += price;
      } else {
        row.unknownCustomers += 1; row.unknownRevenue += price;
      }
    }
    // Naam ke saath detail: har paid booking ka cash/online amount alag
    const paymentDetails = modeRows.map((r) => {
      const price = Number(r.price) || 0;
      const cashAmt = Number(r.cash_amount) || 0;
      const onlineAmt = Number(r.online_amount) || 0;
      let cash = 0, online = 0, unknown = 0;
      if (cashAmt > 0 && onlineAmt > 0) { cash = cashAmt; online = onlineAmt; }
      else if (r.payment_mode === 'cash') cash = price;
      else if (r.payment_mode === 'online') online = price;
      else unknown = price;
      return { id: r.id, period: r.period, date: r.date_str, client: r.client, service: r.service, cash, online, unknown };
    }).sort((a, b) => b.date.localeCompare(a.date));

    const paymentBreakdown = [...breakdownMap.values()].sort((a, b) => a.period.localeCompare(b.period));

    const paymentTotals = paymentBreakdown.reduce((acc, r) => ({
      cashCustomers: acc.cashCustomers + r.cashCustomers,
      cashRevenue: acc.cashRevenue + r.cashRevenue,
      onlineCustomers: acc.onlineCustomers + r.onlineCustomers,
      onlineRevenue: acc.onlineRevenue + r.onlineRevenue,
      unknownCustomers: acc.unknownCustomers + r.unknownCustomers,
      unknownRevenue: acc.unknownRevenue + r.unknownRevenue,
    }), { cashCustomers: 0, cashRevenue: 0, onlineCustomers: 0, onlineRevenue: 0, unknownCustomers: 0, unknownRevenue: 0 });

    // Total summary
    const totalRevenue = revenueRows.reduce((sum, r) => sum + Number(r.revenue), 0);
    const totalAppointments = revenueRows.reduce((sum, r) => sum + Number(r.appointments), 0);

    return NextResponse.json({
      success: true,
      period,
      totalRevenue,
      totalAppointments,
      revenueTrend: revenueRows,
      employeePerformance: employeeRows,
      employeePerformanceMonth: employeeMonthRows,
      paymentBreakdown,
      paymentTotals,
      paymentDetails,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}