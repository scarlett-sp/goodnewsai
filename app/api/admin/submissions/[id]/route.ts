import { NextRequest, NextResponse } from 'next/server';
import { checkAdminToken } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('admin_token')?.value;
  if (!checkAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, title, description, admin_notes } = body;

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;
  if (status === 'approved') updates.approved_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('community_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
