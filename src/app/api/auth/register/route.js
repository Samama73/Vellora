import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    const { salonName, name, username, password } = await req.json();

    if (!salonName || !name || !username || !password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Sab fields sahi bharo (password min 4 chars).' }, { status: 400 });
    }

    // Username already kisi salon mein use to nahi ho raha (global check simplicity ke liye)
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Username pehle se liya gaya hai.' }, { status: 409 });
    }

    const salonId = randomUUID();
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10); // 10 = salt rounds, standard aur fast

    // Naya salon banao
    await pool.query('INSERT INTO salons (id, name) VALUES (?, ?)', [salonId, salonName]);

    // Uska pehla admin user banao
    await pool.query(
      'INSERT INTO users (id, salon_id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, salonId, name, username, passwordHash, 'admin']
    );

    const token = signToken({ userId, salonId, role: 'admin' });

    return NextResponse.json({ success: true, token, user: { id: userId, name, role: 'admin', salonId } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}