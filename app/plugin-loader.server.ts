import fs from 'fs';
import path from 'path';

export function getPlugins() {
  const pluginsDir = path.join(process.cwd(), 'plugins');
  const files = fs.readdirSync(pluginsDir);
  return files.filter(file => file.endsWith('.tsx'));
} 