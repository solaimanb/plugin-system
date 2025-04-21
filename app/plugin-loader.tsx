'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

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
        // Fetch list of available plugins
        const response = await fetch('/api/plugins');
        const pluginPaths = await response.json();

        // Load each plugin dynamically
        const loadedPlugins = await Promise.all(
          pluginPaths.map(async (pluginPath: string) => {
            try {
              const module = await import(`../plugins/${pluginPath}`);
              
              // Extract all exported components
              const components: Record<string, React.ComponentType> = {};
              Object.entries(module).forEach(([key, value]) => {
                if (typeof value === 'function' && value.prototype?.isReactComponent) {
                  components[key] = value as React.ComponentType;
                }
              });

              return {
                name: pluginPath.split('/').pop() || pluginPath,
                path: pluginPath,
                components,
                actions: module.actions || [],
                routes: module.routes || []
              };
            } catch (error) {
              console.error(`Error loading plugin ${pluginPath}:`, error);
              return null;
            }
          })
        );

        // Filter out failed plugin loads
        setPlugins(loadedPlugins.filter((plugin): plugin is Plugin => plugin !== null));
      } catch (error) {
        console.error('Error loading plugins:', error);
      }
    };

    loadPlugins();
  }, []);

  return plugins;
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