import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query('SELECT * FROM inventory WHERE salon_id = ?', [user.salonId]);
    return NextResponse.json({ success: true, inventory: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, qty, reorder, unit } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: 'Product name zaroori hai.' }, { status: 400 });

    const id = randomUUID();
    await pool.query(
      'INSERT INTO inventory (id, salon_id, name, qty, reorder_level, unit) VALUES (?, ?, ?, ?, ?, ?)',
      [id, user.salonId, name, qty || 0, reorder || 0, unit || 'pcs']
    );

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}