'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import type { Database } from '@/utils/supabase';

type PluginFile = Database['public']['Tables']['plugins']['Row'];

interface PluginAction {
  hookName: string;
  position: number;
  componentName: string;
}

interface PluginRoute {
  type: string;
  route: string;
  componentName: string;
  position: number;
}

interface Plugin {
  name: string;
  path: string;
  components: Record<string, React.ComponentType>;
  actions: PluginAction[];
  routes: PluginRoute[];
}

export const usePlugins = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        // Fetch list of available plugins from database
        const { data: pluginFiles, error: dbError } = await supabase
          .from('plugins')
          .select('*');

        if (dbError) {
          console.error('Error fetching plugins from database:', dbError);
          return;
        }

        if (!pluginFiles) {
          console.warn('No plugins found in database');
          return;
        }

        // Load each plugin's content
        const loadedPlugins = (await Promise.all(
          pluginFiles.map(async (file: PluginFile) => {
            try {
              const response = await fetch(file.url);
              if (!response.ok) {
                throw new Error(`Failed to load plugin: ${response.statusText}`);
              }
              const content = await response.text();
              const module = await import(`/plugins/${file.name}.js`);
              
              return {
                name: file.name,
                path: file.url,
                components: extractComponents(module),
                actions: module.actions || [],
                routes: module.routes || []
              };
            } catch (error) {
              console.error(`Error loading plugin ${file.name}:`, error);
              return null;
            }
          })
        )).filter((plugin): plugin is Plugin => plugin !== null);

        setPlugins(loadedPlugins);
      } catch (error) {
        console.error('Error in plugin loading process:', error);
      }
    };

    loadPlugins();
  }, []);

  return plugins;
};

// Helper function to extract React components from a module
const extractComponents = (module: any): Record<string, React.ComponentType> => {
  const components: Record<string, React.ComponentType> = {};
  Object.entries(module).forEach(([key, value]) => {
    if (typeof value === 'function' && value.prototype?.isReactComponent) {
      components[key] = value as React.ComponentType;
    }
  });
  return components;
};

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const plugins = usePlugins();

  return (
    <>
      {children}
      {plugins.map((plugin) => (
        <React.Fragment key={plugin.path}>
          {Object.entries(plugin.components).map(([name, Component]) => (
            <React.Fragment key={`${plugin.path}-${name}`}>
              {React.createElement(Component)}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}; 