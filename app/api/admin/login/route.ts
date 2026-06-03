import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const inputHash = hashPassword(password);
  const correctHash = hashPassword(process.env.ADMIN_PASSWORD);

  if (inputHash !== correctHash) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', correctHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return response;
}
