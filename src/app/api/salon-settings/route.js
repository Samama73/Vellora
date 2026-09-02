import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET: salon ka profile + business + appointment settings lao
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query(
      `SELECT name AS salon_name, owner_name, phone, email, address, 
              currency, timezone, 
              TIME_FORMAT(opening_time, '%H:%i') AS opening_time, 
              TIME_FORMAT(closing_time, '%H:%i') AS closing_time,
              allow_online_bookings, appointment_reminders, 
              allow_cancellations, require_customer_phone
       FROM salons WHERE id = ?`,
      [user.salonId]
    );
    return NextResponse.json({ success: true, settings: rows[0] || {} });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: salon profile + business + appointment settings update karo
export async function PUT(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      salon_name, owner_name, phone, email, address,
      currency, timezone, opening_time, closing_time,
      allow_online_bookings, appointment_reminders,
      allow_cancellations, require_customer_phone
    } = await req.json();

    await pool.query(
      `UPDATE salons 
       SET name = ?, owner_name = ?, phone = ?, email = ?, address = ?, 
           currency = ?, timezone = ?, opening_time = ?, closing_time = ?,
           allow_online_bookings = ?, appointment_reminders = ?,
           allow_cancellations = ?, require_customer_phone = ?
       WHERE id = ?`,
      [salon_name || null, owner_name || null, phone || null, email || null, address || null,
       currency || 'INR', timezone || 'Asia/Kolkata', opening_time || '10:00', closing_time || '20:00',
       allow_online_bookings ?? true, appointment_reminders ?? true,
       allow_cancellations ?? true, require_customer_phone ?? true,
       user.salonId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}