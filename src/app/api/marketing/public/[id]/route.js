import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT image_data FROM marketing_posters WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return new NextResponse('Not found', { status: 404 });

    const data = rows[0].image_data || '';
    const comma = data.indexOf(',');
    const semi = data.indexOf(';');
    if (!data.startsWith('data:image/') || comma === -1 || semi === -1) {
      return new NextResponse('Bad image', { status: 500 });
    }
    const mime = data.slice(5, semi);
    const buf = Buffer.from(data.slice(comma + 1), 'base64');

    return new NextResponse(buf, {
      headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (err) {
    return new NextResponse('Error', { status: 500 });
  }
}