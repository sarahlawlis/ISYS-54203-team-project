
import bcrypt from 'bcrypt';
import { User } from '@shared/schema';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAdmin(user: User | undefined): boolean {
  return user?.role === 'admin';
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitized } = user;
  return sanitized;
}
