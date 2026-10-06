import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET /api/customers/history?phone=XXXXXXXXXX
// Ek customer ki saari visits (appointments) — naye se purane
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const phone = new URL(req.url).searchParams.get('phone');
    if (!phone) return NextResponse.json({ success: false, error: 'Phone zaroori hai.' }, { status: 400 });

    const [rows] = await pool.query(
      `SELECT id, client, phone, service, employee,
              DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME_FORMAT(time, '%H:%i') AS time,
              price, payment_mode, cash_amount, online_amount, status
       FROM appointments
       WHERE salon_id = ? AND phone = ?
       ORDER BY date DESC, time DESC`,
      [user.salonId, phone]
    );
    return NextResponse.json({ success: true, visits: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}