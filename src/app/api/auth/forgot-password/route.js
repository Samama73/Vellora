import pool from '@/lib/db';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { randomUUID, randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email zaroori hai.' }, { status: 400 });
    }

    const [rows] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);

    // Security: chahe email mile ya na mile, hamesha same success message do
    // (isse attacker ko pata nahi chalega konse emails registered hain)
    if (rows.length === 0) {
      return NextResponse.json({ success: true, message: 'Agar ye email registered hai, to reset link bhej diya gaya hai.' });
    }

    const user = rows[0];
    const token = randomBytes(32).toString('hex'); // ek lambi random secure string
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute se expire

    await pool.query(
      'INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [randomUUID(), user.id, token, expiresAt]
    );

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Vellora <onboarding@resend.dev>', // shuru mein Resend ka test domain, baad mein apna domain verify kar sakte ho
      to: email,
      subject: 'Vellora — Password Reset',
      html: `
        <p>Hi ${user.name},</p>
        <p>Aapne apna Vellora password reset karne ki request ki hai. Neeche diye link pe click karo:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Ye link 15 minute mein expire ho jayega. Agar aapne ye request nahi ki, to is email ko ignore kar do.</p>
      `,
    });

    return NextResponse.json({ success: true, message: 'Agar ye email registered hai, to reset link bhej diya gaya hai.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}