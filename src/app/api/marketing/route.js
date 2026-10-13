import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const MAX_POSTERS = 8;
const MAX_IMAGE_CHARS = 1_500_000; // ~1.1 MB

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query(
      'SELECT id, image_data, created_at FROM marketing_posters WHERE salon_id = ? ORDER BY created_at DESC',
      [user.salonId]
    );
    return NextResponse.json({ success: true, posters: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { image } = await req.json();
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return NextResponse.json({ success: false, error: 'Valid image zaroori hai.' }, { status: 400 });
    }
    if (image.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ success: false, error: 'Image bahut badi hai.' }, { status: 400 });
    }

    const [[{ cnt }]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM marketing_posters WHERE salon_id = ?',
      [user.salonId]
    );
    if (cnt >= MAX_POSTERS) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_POSTERS} posters save ho sakte hain. Pehle koi purana delete karo.` },
        { status: 400 }
      );
    }

    const id = randomUUID();
    await pool.query(
      'INSERT INTO marketing_posters (id, salon_id, image_data) VALUES (?, ?, ?)',
      [id, user.salonId, image]
    );
    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}