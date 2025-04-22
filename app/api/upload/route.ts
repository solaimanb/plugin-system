import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    const formData = await req.formData();
    const file: File | null = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
    const ext = file.name.split('.').pop();
    const uniqueFileName = `${baseName}-${timestamp}.${ext}`;

    try {
      // Upload file to Vercel Blob
      const { url } = await put(uniqueFileName, file, {
        access: 'public',
        addRandomSuffix: false
      });

      // Store in database
      const plugin = await prisma.plugin.create({
        data: {
          name: baseName,
          url: url
        }
      });

      return NextResponse.json({ 
        success: true,
        plugin
      });
    } catch (uploadError: any) {
      console.error('Specific upload error:', uploadError.message || uploadError);
      return new NextResponse(
        `Upload failed: ${uploadError.message || 'Unknown error'}`, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('General error:', error.message || error);
    return new NextResponse(
      `Failed to process upload: ${error.message || 'Unknown error'}`, 
      { status: 500 }
    );
  }
}
