import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const link = formData.get('link') as string;
    const description = formData.get('description') as string;
    const submitterName = formData.get('submitter_name') as string | null;
    const photo = formData.get('photo') as File | null;

    if (!title?.trim() || !link?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title, link, and description are required.' }, { status: 400 });
    }

    let photoUrl: string | null = null;

    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = photo.name.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('community-images')
        .upload(fileName, buffer, { contentType: photo.type });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        // Proceed without image rather than failing the whole submission
      } else {
        const { data: urlData } = supabaseAdmin.storage
          .from('community-images')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabaseAdmin.from('community_submissions').insert({
      title: title.trim(),
      link: link.trim(),
      description: description.trim(),
      submitter_name: submitterName?.trim() || null,
      photo_url: photoUrl,
      status: 'pending',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Submission failed.' }, { status: 500 });
  }
}
