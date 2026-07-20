import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    const { salonName, name, username, password, email, accessCode } = await req.json();

    if (!salonName || !name || !username || !password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Please fill all your details).' }, { status: 400 });
    }
    if (!accessCode) {
      return NextResponse.json({ success: false, error: 'Please ask Salon Chair Wala for the Access Code.' }, { status: 400 });
    }

    // Access code check karo
    const [codeRows] = await pool.query(
      'SELECT * FROM access_codes WHERE code = ? AND is_used = FALSE',
      [accessCode.trim().toUpperCase()]
    );
    if (codeRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or Already-Used Access Code.' }, { status: 400 });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Username already taken.' }, { status: 409 });
    }

    const salonId = randomUUID();
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // 1 saal ka free trial set karo
    const trialEndsAt = new Date();
    trialEndsAt.setFullYear(trialEndsAt.getFullYear() + 1);

    await pool.query(
      'INSERT INTO salons (id, name, trial_ends_at, is_paid) VALUES (?, ?, ?, FALSE)',
      [salonId, salonName, trialEndsAt]
    );

    await pool.query(
      'INSERT INTO users (id, salon_id, name, username, password_hash, role, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, salonId, name, username, passwordHash, 'admin', email || null]
    );

    // Code ko "used" mark karo taaki dobara use na ho sake
    await pool.query(
      'UPDATE access_codes SET is_used = TRUE, used_by_salon_id = ?, used_at = NOW() WHERE id = ?',
      [salonId, codeRows[0].id]
    );

    const token = signToken({ userId, salonId, role: 'admin' });

    return NextResponse.json({ success: true, token, user: { id: userId, name, role: 'admin', salonId, salonName } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}