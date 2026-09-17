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

    // Employee performance — employee-wise grouped
    const [employeeRows] = await pool.query(
      `SELECT employee, SUM(price) AS revenue, COUNT(*) AS appointments
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done' AND employee IS NOT NULL AND employee != ''
       GROUP BY employee
       ORDER BY revenue DESC`,
      [user.salonId]
    );

        // Payment mode breakdown — period-wise: kitne customers cash, kitne online
    const [modeRows] = await pool.query(
      `SELECT DATE_FORMAT(date, ?) AS period,
              COALESCE(NULLIF(payment_mode, ''), 'unknown') AS mode,
              COUNT(*) AS customers,
              SUM(price) AS revenue
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done'
       GROUP BY period, mode
       ORDER BY period ASC`,
      [dateFormat, user.salonId]
    );

    // Flat rows ko period-wise ek object mein badlo (frontend ke liye aasaan)
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
      const customers = Number(r.customers) || 0;
      const revenue = Number(r.revenue) || 0;
      if (r.mode === 'cash') { row.cashCustomers += customers; row.cashRevenue += revenue; }
      else if (r.mode === 'online') { row.onlineCustomers += customers; row.onlineRevenue += revenue; }
      else { row.unknownCustomers += customers; row.unknownRevenue += revenue; }
    }
    const paymentBreakdown = [...breakdownMap.values()];

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
      paymentBreakdown,
      paymentTotals,  
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}