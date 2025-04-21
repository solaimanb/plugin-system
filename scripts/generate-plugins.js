const fs = require('fs');
const path = require('path');

function discoverPlugins(dir) {
  const plugins = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively search in subdirectories
      plugins.push(...discoverPlugins(fullPath));
    } else if (file.endsWith('.tsx')) {
      // Get relative path from plugins directory
      const relativePath = path.relative(path.join(process.cwd(), 'plugins'), fullPath);
      // Remove extension and convert to import path format
      const pluginPath = relativePath.replace(/\\/g, '/').replace('.tsx', '');
      plugins.push(pluginPath);
    }
  }

  return plugins;
}

const pluginsDir = path.join(process.cwd(), 'plugins');
const outputFile = path.join(process.cwd(), 'app', 'api', 'plugins', 'plugins.json');

// Ensure plugins directory exists
if (!fs.existsSync(pluginsDir)) {
  console.error('❌ Plugins directory not found!');
  process.exit(1);
}

// Discover all plugins recursively
const plugins = discoverPlugins(pluginsDir);

if (plugins.length === 0) {
  console.warn('⚠️ No plugins found in the plugins directory!');
}

// Write plugins to JSON file
fs.writeFileSync(outputFile, JSON.stringify(plugins, null, 2));

console.log('✅ Generated plugins list:', plugins); 