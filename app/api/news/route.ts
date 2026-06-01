import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const dataFile = join(process.cwd(), 'public', 'data.json');
    const data = await readFile(dataFile, 'utf-8');
    const items = JSON.parse(data);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
