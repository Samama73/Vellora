import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// GET: is salon ki saari appointments lao
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query(
  "SELECT id, salon_id, client, phone, service, employee, DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME_FORMAT(time, '%H:%i') AS time, price, status, created_by, created_at FROM appointments WHERE salon_id = ? ORDER BY date DESC",
  [user.salonId]
);
    return NextResponse.json({ success: true, appointments: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: nayi appointment banao (isi salon ke liye, salonId token se aayega, body se nahi — security ke liye)
export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { client, phone, service, employee, date, time, price } = await req.json();
    if (!client || !service || !date || !time) {
      return NextResponse.json({ success: false, error: 'Client, service, date, time zaroori hain.' }, { status: 400 });
    }

    const id = randomUUID();
    await pool.query(
      `INSERT INTO appointments (id, salon_id, client, phone, service, employee, date, time, price, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'not visited', ?)`,
      [id, user.salonId, client, phone || null, service, employee || null, date, time, price || 0, user.userId]
    );

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}