import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file: File | null = formData.get('file') as File;

    if (!file || !file.name.endsWith('.tsx')) {
      return new NextResponse('Only .tsx files are allowed.', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // In development, save to local filesystem
    if (process.env.NODE_ENV === 'development') {
      const filePath = path.join(process.cwd(), 'plugins', file.name);
      await writeFile(filePath, buffer);
      return NextResponse.json({ success: true, path: filePath });
    }

    // In production, return error as we can't write to filesystem
    return new NextResponse(
      'File uploads are only available in development mode. Please use a cloud storage solution in production.',
      { status: 400 }
    );
  } catch (err) {
    console.error('Upload error:', err);
    return new NextResponse('Failed to upload file.', { status: 500 });
  }
}
