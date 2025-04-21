import { NextResponse } from 'next/server';
import plugins from './plugins.json';

export async function GET() {
  try {
    return NextResponse.json(plugins);
  } catch (error) {
    console.error('Error getting plugins:', error);
    return NextResponse.json({ error: 'Failed to get plugins' }, { status: 500 });
  }
} 