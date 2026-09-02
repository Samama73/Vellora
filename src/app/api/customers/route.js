import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET: is salon ke saare customers, VIP pehle
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query(
      `SELECT id, name, phone, total_visits, total_spent, 
              DATE_FORMAT(last_visit_date, '%Y-%m-%d') AS last_visit_date, is_vip
       FROM customers 
       WHERE salon_id = ? 
       ORDER BY is_vip DESC, total_spent DESC`,
      [user.salonId]
    );
    return NextResponse.json({ success: true, customers: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}