import { NextRequest, NextResponse } from 'next/server';
import { checkAdminToken } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!checkAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Get flags grouped with counts
  const { data: flags } = await supabase
    .from('article_flags')
    .select('*')
    .order('created_at', { ascending: false });

  // Get blocked articles
  const { data: blocked } = await supabase
    .from('blocked_articles')
    .select('*')
    .order('created_at', { ascending: false });

  // Group flags by article_link with counts
  const grouped = new Map<string, {
    article_link: string;
    article_title: string;
    article_source: string;
    flag_count: number;
    reasons: string[];
    latest: string;
    blocked: boolean;
  }>();

  for (const flag of flags ?? []) {
    if (!grouped.has(flag.article_link)) {
      grouped.set(flag.article_link, {
        article_link: flag.article_link,
        article_title: flag.article_title ?? '',
        article_source: flag.article_source ?? '',
        flag_count: 0,
        reasons: [],
        latest: flag.created_at,
        blocked: blocked?.some(b => b.article_link === flag.article_link) ?? false,
      });
    }
    const entry = grouped.get(flag.article_link)!;
    entry.flag_count++;
    entry.reasons.push(flag.reason);
  }

  return NextResponse.json(Array.from(grouped.values()));
}

// Admin manually blocks an article
export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!checkAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { article_link, article_title, unblock } = await request.json();
  const supabase = getSupabaseAdmin();

  if (unblock) {
    await supabase.from('blocked_articles').delete().eq('article_link', article_link);
    return NextResponse.json({ success: true, action: 'unblocked' });
  }

  await supabase.from('blocked_articles').upsert({
    article_link,
    article_title,
    blocked_by: 'admin',
    flag_count: 1,
  }, { onConflict: 'article_link' });

  return NextResponse.json({ success: true, action: 'blocked' });
}
