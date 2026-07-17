import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return NextResponse.json({ success: false, error: 'Sirf admin employee remove kar sakta hai.' }, { status: 403 });
  }

  try {
    const { id } = await params;
    // salon_id check yahan bhi zaroori — warna Salon A ka admin Salon B ka employee delete kar sakta tha
    const [result] = await pool.query(
      "DELETE FROM users WHERE id = ? AND salon_id = ? AND role = 'employee'",
      [id, user.salonId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Employee nahi mila.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}