import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const excluded = request.nextUrl.searchParams.get('excluded')?.split(',').filter(Boolean) ?? [];

  const supabase = getSupabaseAdmin();

  // Get all blocked article links
  const { data: blocked } = await supabase
    .from('blocked_articles')
    .select('article_link');
  const blockedLinks = blocked?.map((b: { article_link: string }) => b.article_link) ?? [];

  const allExcluded = new Set([...excluded, ...blockedLinks]);

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return NextResponse.json(null);

  // Pick a random query for variety
  const queries = [
    'AI helping people positive impact',
    'artificial intelligence healthcare breakthrough',
    'AI education accessibility community',
    'machine learning environment sustainability',
    'AI disaster relief humanitarian',
  ];
  const query = queries[Math.floor(Math.random() * queries.length)];

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 10, type: 'news' }),
    });

    if (!response.ok) return NextResponse.json(null);

    const data = await response.json();
    const articles = data.news ?? [];

    const fresh = articles.find((a: { link: string }) => !allExcluded.has(a.link));
    if (!fresh) return NextResponse.json(null);

    return NextResponse.json({
      id: `serper::${fresh.link}`,
      title: fresh.title,
      description: fresh.snippet ?? '',
      link: fresh.link,
      source: new URL(fresh.link).hostname,
      pubDate: fresh.date ? new Date(fresh.date).toISOString() : new Date().toISOString(),
      timestamp: fresh.date ? new Date(fresh.date).getTime() : Date.now(),
      tags: [],
      imageUrl: fresh.imageUrl || fresh.image || undefined,
    });
  } catch {
    return NextResponse.json(null);
  }
}
