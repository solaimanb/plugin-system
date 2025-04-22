import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const plugins = await prisma.plugin.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(plugins);
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return new NextResponse('Error fetching plugins', { status: 500 });
  }
} 