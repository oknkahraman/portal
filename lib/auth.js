import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token) {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  const result = await query(
    'SELECT id, email, full_name, company_name, role FROM profiles WHERE id = $1',
    [decoded.id]
  );
  
  return result.rows[0] || null;
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }
  
  return null;
}
