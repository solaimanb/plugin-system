require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

function discoverLocalPlugins(dir) {
  const plugins = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively search in subdirectories
      plugins.push(...discoverLocalPlugins(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.tsx')) {
      // Get just the filename without extension
      const pluginName = path.basename(file, path.extname(file));
      plugins.push({
        id: pluginName,
        name: pluginName,
        url: `/plugins/${file}`,
        createdAt: stat.birthtime.toISOString()
      });
    }
  }

  return plugins;
}

async function generatePluginsList() {
  try {
    const pluginsDir = path.join(process.cwd(), 'plugins');
    const outputFile = path.join(process.cwd(), 'app', 'api', 'plugins', 'plugins.json');

    // Ensure plugins directory exists
    if (!fs.existsSync(pluginsDir)) {
      console.error('❌ Plugins directory not found!');
      process.exit(1);
    }

    // Get local plugins
    const localPlugins = discoverLocalPlugins(pluginsDir);
    console.log('📁 Found local plugins:', localPlugins.map(p => p.name));

    // Get database plugins
    let dbPlugins = [];
    try {
      // Test database connection first
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      dbPlugins = await prisma.plugin.findMany();
      console.log('💾 Found database plugins:', dbPlugins.map(p => p.name));
    } catch (dbError) {
      console.warn('⚠️ Database connection failed:', dbError.message);
      console.warn('⚠️ Continuing with local plugins only');
    }

    // Create a Set of plugin names to track what we've already included
    const includedPlugins = new Set(localPlugins.map(p => p.name));

    // Combine both sources, ensuring no duplicates
    const allPlugins = [
      ...localPlugins,
      ...dbPlugins.filter(dbPlugin => !includedPlugins.has(dbPlugin.name))
    ];

    if (allPlugins.length === 0) {
      console.warn('⚠️ No plugins found!');
    } else {
      console.log('✅ Total plugins found:', allPlugins.length);
    }

    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write plugins to JSON file
    fs.writeFileSync(outputFile, JSON.stringify(allPlugins, null, 2));

    console.log('✅ Generated plugins list:', allPlugins);
  } catch (error) {
    console.error('❌ Error generating plugins list:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit();
});

generatePluginsList(); 