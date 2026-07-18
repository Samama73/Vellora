import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

function generateReadableCode() {
  // "VELLORA-X7K9P2" jaisa readable code banata hai
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // confusing chars (0,O,1,I) hataye hain
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `VELLORA-${code}`;
}

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'superadmin') {
    return NextResponse.json({ success: false, error: 'Sirf superadmin code generate kar sakta hai.' }, { status: 403 });
  }

  try {
    const code = generateReadableCode();
    await pool.query(
      'INSERT INTO access_codes (id, code) VALUES (?, ?)',
      [randomUUID(), code]
    );
    return NextResponse.json({ success: true, code });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'superadmin') {
    return NextResponse.json({ success: false, error: 'Sirf superadmin dekh sakta hai.' }, { status: 403 });
  }

  try {
    const [codes] = await pool.query('SELECT * FROM access_codes ORDER BY created_at DESC');
    return NextResponse.json({ success: true, codes });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}