import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword || newPassword.length < 4) {
      return NextResponse.json({ success: false, error: 'Valid token aur password (min 4 chars) chahiye.' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Ye link expire ho chuka hai ya invalid hai. Dobara try karo.' }, { status: 400 });
    }

    const resetRequest = rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, resetRequest.user_id]);
    await pool.query('DELETE FROM password_resets WHERE id = ?', [resetRequest.id]);

    return NextResponse.json({ success: true, message: 'Password successfully reset ho gaya.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}