import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// PUT: status update karo (sirf apne salon ki appointment)
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

    // Naya: payment done hone pe customer table sync karo (purana flow bilkul same rahega, ye sirf extra step hai)
    if (status === 'payment done') {
      try {
        const [rows] = await pool.query(
          'SELECT client, phone, price FROM appointments WHERE id = ? AND salon_id = ?',
          [id, user.salonId]
        );
        const appt = rows[0];

        if (appt && appt.phone) {
          const [existing] = await pool.query(
            'SELECT id FROM customers WHERE salon_id = ? AND phone = ?',
            [user.salonId, appt.phone]
          );

          if (existing.length > 0) {
            await pool.query(
              `UPDATE customers 
               SET total_visits = total_visits + 1, 
                   total_spent = total_spent + ?, 
                   last_visit_date = CURDATE(),
                   name = ?,
                   is_vip = (total_visits + 1 >= 5 AND total_spent + ? >= 3000)
               WHERE id = ?`,
              [appt.price || 0, appt.client, appt.price || 0, existing[0].id]
            );
          } else {
            await pool.query(
              `INSERT INTO customers (salon_id, name, phone, total_visits, total_spent, last_visit_date, is_vip)
               VALUES (?, ?, ?, 1, ?, CURDATE(), (1 >= 5 AND ? >= 3000))`,
              [user.salonId, appt.client, appt.phone, appt.price || 0, appt.price || 0]
            );
          }
        }
      } catch (syncErr) {
        // Customer sync fail ho bhi jaye, appointment status update to ho hi chuka hai — isliye sirf log karo, error mat throw karo
        console.error('Customer sync error:', syncErr.message);
      }
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