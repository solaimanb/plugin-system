import { writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file: File | null = formData.get('file') as File;

  if (!file || !file.name.endsWith('.tsx')) {
    return new NextResponse('Only .tsx files are allowed.', { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(process.cwd(), 'plugins', file.name);

  try {
    await writeFile(filePath, buffer);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('File write error:', err);
    return new NextResponse('Failed to save file.', { status: 500 });
  }
}
