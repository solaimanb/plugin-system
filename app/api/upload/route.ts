import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file: File | null = formData.get('file') as File;

  if (!file || !file.name.endsWith('.tsx')) {
    return new NextResponse('Only .tsx files are allowed.', { status: 400 });
  }

  try {
    // Upload to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Store the blob URL in your database or return it
    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      pathname: blob.pathname
    });
  } catch (err) {
    console.error('Upload error:', err);
    return new NextResponse('Failed to upload file.', { status: 500 });
  }
}
