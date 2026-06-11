import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const { article_link, article_title, article_source, reason } = await request.json();

  if (!article_link || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Save the flag
  await supabase.from('article_flags').insert({
    article_link,
    article_title,
    article_source,
    reason,
  });

  // Count total flags for this article
  const { count } = await supabase
    .from('article_flags')
    .select('*', { count: 'exact', head: true })
    .eq('article_link', article_link);

  const flagCount = count ?? 1;

  // Auto-block after 5 flags
  if (flagCount >= 5) {
    await supabase.from('blocked_articles').upsert({
      article_link,
      article_title,
      blocked_by: 'auto',
      flag_count: flagCount,
    }, { onConflict: 'article_link' });
  }

  return NextResponse.json({ success: true, flag_count: flagCount });
}
