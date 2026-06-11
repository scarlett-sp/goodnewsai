import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const { article_link, article_title, article_source, article_tags } = await request.json();

  if (!article_link) {
    return NextResponse.json({ error: 'Missing article_link' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  await supabase.from('article_likes').insert({
    article_link,
    article_title,
    article_source,
    article_tags: article_tags ?? [],
  });

  return NextResponse.json({ success: true });
}
