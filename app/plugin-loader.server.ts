import fs from 'fs';
import path from 'path';

export function getPlugins() {
  try {
    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) {
      console.warn('Plugins directory not found');
      return [];
    }
    const files = fs.readdirSync(pluginsDir);
    return files.filter(file => file.endsWith('.tsx')).map(file => file.replace('.tsx', ''));
  } catch (error) {
    console.error('Error loading plugins:', error);
    return [];
  }
} 