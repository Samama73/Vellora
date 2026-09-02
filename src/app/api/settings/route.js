import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET: is salon ki payment settings lao
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query(
      'SELECT upi_id, qr_image_url FROM salons WHERE id = ?',
      [user.salonId]
    );
    return NextResponse.json({ success: true, settings: rows[0] || {} });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: payment settings update karo (UPI ID ya QR image URL)
export async function PUT(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { upi_id, qr_image_url } = await req.json();

    await pool.query(
      'UPDATE salons SET upi_id = ?, qr_image_url = ? WHERE id = ?',
      [upi_id || null, qr_image_url || null, user.salonId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}