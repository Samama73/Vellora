import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// POST: client ka baaki balance receive karo. Sabse purani visit ka balance pehle kat'ta hai.
export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { phone, client, amount, paymentMode, date } = await req.json();
  const amt = Number(amount) || 0;
  if (!phone || amt <= 0) {
    return NextResponse.json({ success: false, error: 'Phone aur amount zaroori hain.' }, { status: 400 });
  }
  if (paymentMode !== 'cash' && paymentMode !== 'online') {
    return NextResponse.json({ success: false, error: 'Cash ya Online chuno.' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT id, balance FROM appointments
       WHERE salon_id = ? AND phone = ? AND balance > 0 AND status <> 'cancelled'
       ORDER BY date ASC, time ASC FOR UPDATE`,
      [user.salonId, phone]
    );
    const total = rows.reduce((s, r) => s + Number(r.balance), 0);
    if (amt > total + 0.01) {
      await conn.rollback();
      return NextResponse.json({ success: false, error: 'Amount baaki balance se zyada hai.' }, { status: 400 });
    }

    let left = amt;
    for (const r of rows) {
      if (left <= 0) break;
      const use = Math.min(left, Number(r.balance));
      await conn.query(
        'UPDATE appointments SET balance = balance - ? WHERE id = ? AND salon_id = ?',
        [use, r.id, user.salonId]
      );
      left -= use;
    }

    await conn.query(
      `INSERT INTO balance_payments (id, salon_id, phone, client, amount, payment_mode, paid_on, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), user.salonId, phone, client || '', amt, paymentMode, date, user.userId]
    );

    await conn.commit();
    return NextResponse.json({ success: true, remaining: Math.max(total - amt, 0) });
  } catch (err) {
    await conn.rollback();
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}