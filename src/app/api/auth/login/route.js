import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Please enter Username and Password.' }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT u.*, s.name AS salon_name FROM users u 
      LEFT JOIN salons s ON u.salon_id = s.id 
      WHERE u.username = ?`,
      [username]
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid Username or Password.' }, { status: 401 });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid Username or Password.' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, salonId: user.salon_id, role: user.role });

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, role: user.role, salonId: user.salon_id, salonName: user.salon_name },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}