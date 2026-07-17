import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// Login safal hone pe token banane ke liye
export function signToken(payload) {
  // payload mein userId, salonId, role dalenge — 7 din valid rahega
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Protected API routes mein token verify karne ke liye (Step 5 mein use hoga)
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null; // invalid/expired token
  }
}