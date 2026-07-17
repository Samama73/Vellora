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
        (SELECT COALESCE(SUM(price), 0) FROM appointments WHERE salon_id = s.id AND status = 'payment done') AS total_revenue
      FROM salons s
      ORDER BY s.created_at DESC
    `);
    return NextResponse.json({ success: true, salons });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}