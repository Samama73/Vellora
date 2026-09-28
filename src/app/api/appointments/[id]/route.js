import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/getUser';
import { NextResponse } from 'next/server';

// PUT: status update karo, YA poori appointment edit karo (sirf apne salon ki appointment)
export async function PUT(req, { params }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentMode, cashAmount, onlineAmount, client, phone, service, employee, date, time, price } = body;

    // Edit mode — jab client/service/date/time bheja gaya ho (full appointment edit form se)
    const isEditMode = client !== undefined || service !== undefined || date !== undefined || time !== undefined;

    if (isEditMode) {
      if (!client || !service || !date || !time) {
        return NextResponse.json({ success: false, error: 'Client, service, date, time zaroori hain.' }, { status: 400 });
      }
      let mode = paymentMode === 'cash' || paymentMode === 'online' ? paymentMode : null;
      let cash = 0;
      let online = 0;
      const priceNum = Number(price) || 0;

      if (paymentMode === 'split') {
        cash = Number(cashAmount) || 0;
        online = Number(onlineAmount) || 0;
        if (cash <= 0 || online <= 0) {
          return NextResponse.json({ success: false, error: 'Split me cash aur online dono amount daalo.' }, { status: 400 });
        }
        if (Math.abs(cash + online - priceNum) > 0.01) {
          return NextResponse.json({ success: false, error: 'Cash + Online ka total price ke barabar hona chahiye.' }, { status: 400 });
        }
        // purani reports payment_mode padhti hain, isliye jo side badi hai wahi likh do
        mode = online >= cash ? 'online' : 'cash';
      } else if (mode === 'cash') {
        cash = priceNum;
      } else if (mode === 'online') {
        online = priceNum;
      }

      const [result] = await pool.query(
        `UPDATE appointments
         SET client = ?, phone = ?, service = ?, employee = ?, date = ?, time = ?, price = ?, payment_mode = ?, cash_amount = ?, online_amount = ?
         WHERE id = ? AND salon_id = ?`,
        [client, phone || null, service, employee || null, date, time, price || 0, mode, cash, online, id, user.salonId]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ success: false, error: 'Appointment nahi mili.' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    // Sirf 'cash' ya 'online' allow karo. Agar bheja hi nahi to column ko touch mat karo (purana value rahega)
    const mode = paymentMode === 'cash' || paymentMode === 'online' ? paymentMode : undefined;

    // salon_id = ? bhi WHERE mein hai — koi doosre salon ki appointment edit nahi kar sakta, chahe ID pata bhi ho jayega
    const [result] = mode === undefined
      ? await pool.query(
          'UPDATE appointments SET status = ? WHERE id = ? AND salon_id = ?',
          [status, id,  user.salonId]
        )
      : await pool.query(
          'UPDATE appointments SET status = ?, payment_mode = ? WHERE id = ? AND salon_id = ?',
          [status, mode, id, user.salonId]
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