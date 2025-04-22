import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file: File | null = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Upload file to Vercel Blob
    const { url } = await put(file.name, file, {
      access: 'public',
    });

    // Store in database
    const plugin = await prisma.plugin.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        url: url
      }
    });

    return NextResponse.json({ 
      success: true,
      plugin
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Failed to upload file.', { status: 500 });
  }
}
