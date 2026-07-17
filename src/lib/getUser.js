import { verifyToken } from './auth';

// Request ke Authorization header se token nikaal ke verify karta hai.
// Return: { userId, salonId, role } agar valid, warna null.
export function getUserFromRequest(req) {
  const authHeader = req.headers.get('authorization'); // "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  return verifyToken(token); // auth.js wala function, invalid ho to null dega
}