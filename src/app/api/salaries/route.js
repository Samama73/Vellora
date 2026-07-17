import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query('SELECT * FROM salaries WHERE salon_id = ? ORDER BY date DESC', [user.salonId]);
    return NextResponse.json({ success: true, salaries: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { type, employeeId, title, amount, date, note } = await req.json();
    if (!amount || !date) return NextResponse.json({ success: false, error: 'Amount aur date zaroori hain.' }, { status: 400 });

    const id = randomUUID();
    await pool.query(
      'INSERT INTO salaries (id, salon_id, type, employee_id, title, amount, date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, user.salonId, type || 'Other', employeeId || null, title || null, amount, date, note || null]
    );

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}