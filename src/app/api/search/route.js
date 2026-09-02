import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// GET /api/search?q=...
// Is salon ke appointments, inventory, aur employees me se query se match karne wale
// top results dhoondh ke deta hai. Read-only, kisi existing feature ko touch nahi karta.
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json({ success: true, results: { appointments: [], inventory: [], employees: [] } });
  }

  const like = `%${q}%`;

  try {
    const [appointments] = await pool.query(
      `SELECT id, client, phone, service, DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME_FORMAT(time, '%H:%i') AS time, status
       FROM appointments
       WHERE salon_id = ? AND (client LIKE ? OR phone LIKE ? OR service LIKE ?)
       ORDER BY date DESC
       LIMIT 5`,
      [user.salonId, like, like, like]
    );

    const [inventory] = await pool.query(
      `SELECT id, name, qty, unit, reorder_level
       FROM inventory
       WHERE salon_id = ? AND name LIKE ?
       LIMIT 5`,
      [user.salonId, like]
    );

    const [employees] = await pool.query(
      `SELECT id, name, username, position, phone
       FROM users
       WHERE salon_id = ? AND role = 'employee' AND (name LIKE ? OR username LIKE ?)
       LIMIT 5`,
      [user.salonId, like, like]
    );

    return NextResponse.json({ success: true, results: { appointments, inventory, employees } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}