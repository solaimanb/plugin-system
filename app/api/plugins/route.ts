import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const pluginsDir = path.join(process.cwd(), 'plugins');
    
    // Check if plugins directory exists
    if (!fs.existsSync(pluginsDir)) {
      return NextResponse.json({ error: 'Plugins directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(pluginsDir);
    
    // Filter for .tsx files and remove the extension
    const pluginFiles = files
      .filter(file => file.endsWith('.tsx'))
      .map(file => file.replace('.tsx', ''));

    if (pluginFiles.length === 0) {
      return NextResponse.json({ error: 'No plugins found' }, { status: 404 });
    }

    return NextResponse.json(pluginFiles);
  } catch (error) {
    console.error('Error reading plugins directory:', error);
    return NextResponse.json({ error: 'Failed to read plugins' }, { status: 500 });
  }
} 