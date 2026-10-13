import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET /api/reports/incentive?month=2026-09 (default = pichla mahina)
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const [[def]] = await pool.query(
      `SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m') AS last_m,
              DATE_FORMAT(CURDATE(), '%Y-%m') AS cur`
    );
    const asked = searchParams.get('month') || '';
    const month = /^\d{4}-\d{2}$/.test(asked) ? asked : def.last_m;

    const [rows] = await pool.query(
      `SELECT employee, SUM(price) AS revenue, COUNT(*) AS appointments
       FROM appointments
       WHERE salon_id = ? AND status = 'payment done' AND employee IS NOT NULL AND employee != ''
         AND DATE_FORMAT(date, '%Y-%m') = ?
       GROUP BY employee
       ORDER BY revenue DESC`,
      [user.salonId, month]
    );

    const [monthRows] = await pool.query(
      `SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS m FROM appointments
       WHERE salon_id = ? AND status = 'payment done'`,
      [user.salonId]
    );
    const months = [...new Set([def.cur, def.last_m, month, ...monthRows.map((r) => r.m)])]
      .filter(Boolean).sort().reverse();

    return NextResponse.json({ success: true, month, months, rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}