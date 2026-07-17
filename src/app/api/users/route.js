import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query(
      "SELECT id, name, username, role, position, phone FROM users WHERE salon_id = ? AND role = 'employee'",
      [user.salonId]
    );
    return NextResponse.json({ success: true, employees: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return NextResponse.json({ success: false, error: 'Sirf admin employee add kar sakta hai.' }, { status: 403 });
  }

  try {
    const { name, username, position, phone, password } = await req.json();
    if (!name || !username) {
      return NextResponse.json({ success: false, error: 'Name aur username zaroori hain.' }, { status: 400 });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Username pehle se liya gaya hai.' }, { status: 409 });
    }

    const id = randomUUID();
    // Agar admin ne khud password diya hai (min 4 chars) to wahi use karo, warna auto-generate karo
    const finalPassword = password && password.length >= 4 ? password : Math.random().toString(36).slice(2, 10);
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    await pool.query(
      'INSERT INTO users (id, salon_id, name, username, password_hash, role, position, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, user.salonId, name, username, passwordHash, 'employee', position || null, phone || null]
    );

    return NextResponse.json({ success: true, id, password: finalPassword }); // "password" naam frontend expect karta hai
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}