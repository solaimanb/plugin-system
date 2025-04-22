import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import plugins from './plugins.json';
import { Plugin } from '@prisma/client';

export async function GET() {
  try {
    let dbPlugins: Plugin[] = [];
    
    try {
      // Get database plugins with full information
      dbPlugins = await prisma.plugin.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        distinct: ['name'] // Ensure no duplicate names in database results
      });
      console.log('Loaded database plugins:', dbPlugins); // Debug log
    } catch (dbError) {
      console.warn('Database connection failed, continuing with local plugins:', dbError);
    }

    // Convert local plugins to the same format as database plugins
    const localPlugins = (Array.isArray(plugins) ? plugins : []).map(plugin => {
      if (typeof plugin === 'string') {
        return {
          id: plugin,
          name: plugin,
          url: `/plugins/${plugin}.tsx`, // Local plugin path
          createdAt: new Date().toISOString()
        };
      }
      return plugin;
    });

    // Create a Set of plugin names to track what we've already included
    const includedPlugins = new Set(localPlugins.map(p => p.name));

    // Combine both sources, ensuring no duplicates and preserving remote URLs
    const allPlugins = [
      ...localPlugins,
      ...dbPlugins
        .filter(dbPlugin => !includedPlugins.has(dbPlugin.name))
        .map(dbPlugin => ({
          ...dbPlugin,
          createdAt: dbPlugin.createdAt.toISOString() // Convert Date to string
        }))
    ];

    console.log('Returning all plugins:', allPlugins); // Debug log
    return NextResponse.json(allPlugins);
  } catch (error) {
    console.error('Error in GET /api/plugins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 