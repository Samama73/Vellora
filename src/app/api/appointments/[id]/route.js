import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// PUT: status update karo (sirf apne salon ki appointment)
export async function PUT(req, { params }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await req.json();

    // salon_id = ? bhi WHERE mein hai — koi doosre salon ki appointment edit nahi kar sakta, chahe ID pata bhi ho
    const [result] = await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ? AND salon_id = ?',
      [status, id, user.salonId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Appointment nahi mili.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    const [result] = await pool.query(
      'DELETE FROM appointments WHERE id = ? AND salon_id = ?',
      [id, user.salonId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Appointment nahi mili.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}