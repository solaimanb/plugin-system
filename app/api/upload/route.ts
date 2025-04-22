import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file: File | null = formData.get('file') as File;

    if (!file || !file.name.endsWith('.tsx')) {
      return new NextResponse('Only .tsx files are allowed.', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('plugins')
      .upload(file.name, buffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      return new NextResponse('Failed to upload file to storage.', { status: 500 });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('plugins')
      .getPublicUrl(file.name);

    // Store plugin metadata in the database
    const { error: dbError } = await supabase
      .from('plugins')
      .upsert({
        name: file.name,
        url: publicUrl,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if database update fails
      // The file is still uploaded to storage
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: storageData.path
    });
  } catch (err) {
    console.error('Upload error:', err);
    return new NextResponse('Failed to upload file.', { status: 500 });
  }
}
