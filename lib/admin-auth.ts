import { createHash } from 'crypto';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function checkAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = hashPassword(process.env.ADMIN_PASSWORD ?? '');
  return token === expected;
}
