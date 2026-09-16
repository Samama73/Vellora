import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// GET /api/attendance?date=YYYY-MM-DD  -> ek din ki attendance
// GET /api/attendance?month=YYYY-MM    -> monthly summary (per employee count)
export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const month = searchParams.get('month'); // format: '2025-06'

  try {
    if (month) {
      const [rows] = await pool.query(
        `SELECT employee_id, status, COUNT(*) as count
         FROM attendance
         WHERE salon_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
         GROUP BY employee_id, status`,
        [user.salonId, month]
      );
      return NextResponse.json({ success: true, summary: rows });
    }

    if (date) {
      const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE salon_id = ? AND date = ?',
        [user.salonId, date]
      );
      return NextResponse.json({ success: true, attendance: rows });
    }

    const [rows] = await pool.query(
      'SELECT * FROM attendance WHERE salon_id = ? ORDER BY date DESC LIMIT 500',
      [user.salonId]
    );
    return NextResponse.json({ success: true, attendance: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/attendance -> mark/update attendance (upsert)
export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return NextResponse.json({ success: false, error: 'Sirf admin attendance mark kar sakta hai.' }, { status: 403 });
  }

  try {
    const { employeeId, date, status, note } = await req.json();
    if (!employeeId || !date || !status) {
      return NextResponse.json({ success: false, error: 'Employee, date aur status zaroori hain.' }, { status: 400 });
    }

    // status value validate karo
    const VALID_STATUSES = ['present', 'absent', 'half_day', 'leave'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status value.' }, { status: 400 });
    }

    // employee isi salon ka hai ya nahi verify karo
    const [emp] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND salon_id = ?',
      [employeeId, user.salonId]
    );
    if (emp.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid employee.' }, { status: 400 });
    }

    const [existing] = await pool.query(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ? AND salon_id = ?',
      [employeeId, date, user.salonId]
    );

    let id;
    if (existing.length > 0) {
      id = existing[0].id;
      await pool.query(
        'UPDATE attendance SET status = ?, note = ? WHERE id = ?',
        [status, note || null, id]
      );
    } else {
      id = randomUUID();
      await pool.query(
        'INSERT INTO attendance (id, salon_id, employee_id, date, status, note) VALUES (?, ?, ?, ?, ?, ?)',
        [id, user.salonId, employeeId, date, status, note || null]
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}