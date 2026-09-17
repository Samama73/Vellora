import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// POST: logged-in user apna password badal sakta hai (current password verify karke)
export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Current aur new password dono zaroori hain.' }, { status: 400 });
    }
    if (newPassword.length < 4) {
      return NextResponse.json({ success: false, error: 'New password kam se kam 4 characters ka hona chahiye.' }, { status: 400 });
    }

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [user.userId]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User nahi mila.' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Current password galat hai.' }, { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.userId]);

    return NextResponse.json({ success: true, message: 'Password successfully change ho gaya.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}