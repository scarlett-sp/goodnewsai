import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ success: true, message: 'Scrape endpoint ready' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 });
  }
}
