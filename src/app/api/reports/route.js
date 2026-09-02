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
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}