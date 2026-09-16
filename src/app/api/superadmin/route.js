import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'superadmin') {
    return NextResponse.json({ success: false, error: 'Sirf superadmin access kar sakta hai.' }, { status: 403 });
  }

  try {
    const [salons] = await pool.query(`
      SELECT 
        s.id, s.name, s.created_at,
        (SELECT COUNT(*) FROM appointments WHERE salon_id = s.id) AS total_appointments,
        (SELECT COUNT(*) FROM users WHERE salon_id = s.id AND role = 'employee') AS total_employees,
        (SELECT COALESCE(SUM(price), 0) FROM appointments WHERE salon_id = s.id AND status = 'payment done') AS total_revenue,
        (SELECT MAX(date) FROM appointments WHERE salon_id = s.id) AS last_activity_at,
        CASE 
          WHEN (SELECT MAX(date) FROM appointments WHERE salon_id = s.id) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          THEN 1 ELSE 0
        END AS is_active
      FROM salons s
      ORDER BY s.created_at DESC
    `);

    const totalSalons = salons.length;
    const activeSalons = salons.filter((s) => s.is_active === 1).length;
    const inactiveSalons = totalSalons - activeSalons;

    return NextResponse.json({
      success: true,
      salons,
      stats: { totalSalons, activeSalons, inactiveSalons }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}