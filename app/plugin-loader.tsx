"use client";

import React, { useEffect, useState, createContext } from "react";
import { Plugin, PluginAction, PluginRoute } from "@/types/plugin";
import { supabase } from "@/utils/supabase";
import type { Database } from '@/utils/supabase';

// Declare the window interface
declare global {
  interface Window {
    [key: string]: any;
    React: typeof React;
  }
}

export const PluginContext = createContext<Plugin[]>([]);

async function loadPluginModule(content: string, isLocal: boolean = false): Promise<any> {
  try {
    if (isLocal) {
      // For local plugins, we can use dynamic import directly
      const module = await import(`@/plugins/${content}.tsx`);
      return module;
    }

    // For remote plugins, use script tag and global variable
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      
      // Create a unique ID for this plugin load
      const moduleId = `plugin_${Math.random().toString(36).slice(2)}`;
      
      // Wrap the content in an IIFE that assigns to window
      script.textContent = `
        window['${moduleId}'] = (function() {
          const module = {};
          const React = window.React;
          (function(exports) {
            ${content}
          })(module);
          return module;
        })();
      `;

      script.onerror = () => {
        reject(new Error('Failed to load plugin script'));
        cleanup();
      };

      script.onload = () => {
        const moduleExports = window[moduleId];
        resolve(moduleExports);
        cleanup();
      };

      function cleanup() {
        delete window[moduleId];
        document.head.removeChild(script);
      }

      // Add React to window temporarily
      window.React = React;
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error("Error loading plugin module:", error);
    throw error;
  }
}

export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlugins() {
      try {
        const response = await fetch('/api/plugins');
        const pluginsData: Array<{
          name: string;
          url: string;
          id: string;
          createdAt: string;
        }> = await response.json();
        console.log('Loaded plugins data:', pluginsData);

        const loadedPlugins = await Promise.all(
          pluginsData.map(async (pluginData) => {
            try {
              console.log(`Loading plugin: ${pluginData.name} from ${pluginData.url}`);
              let module;
              
              if (pluginData.url.startsWith('/plugins/')) {
                // This is a local plugin
                const pluginName = pluginData.url.replace('/plugins/', '').replace('.tsx', '');
                console.log(`Loading local plugin: ${pluginName}`);
                module = await loadPluginModule(pluginName, true);
              } else {
                // This is a remote plugin
                console.log(`Fetching remote plugin content from: ${pluginData.url}`);
                const moduleResponse = await fetch(pluginData.url);
                if (!moduleResponse.ok) {
                  throw new Error(`Failed to fetch plugin content: ${moduleResponse.statusText}`);
                }
                const moduleContent = await moduleResponse.text();
                console.log(`Remote plugin content length: ${moduleContent.length}`);
                module = await loadPluginModule(moduleContent);
              }
              
              if (!module || (!module.default && !module.Component && !module.WelcomeMessage)) {
                console.error(`Plugin ${pluginData.name} does not export a valid component`);
                return null;
              }

              const plugin: Plugin = {
                name: pluginData.name,
                component: module.default || module.Component || module.WelcomeMessage,
                type: pluginData.url.startsWith('/plugins/') ? 'local' : 'remote',
                actions: module.actions || [],
                routes: module.routes || []
              };
              
              console.log(`Successfully loaded plugin: ${plugin.name} (${plugin.type})`);
              return plugin;
            } catch (err) {
              console.error(`Failed to load plugin ${pluginData.name}:`, err);
              return null;
            }
          })
        );

        const validPlugins = loadedPlugins.filter((plugin): plugin is Plugin => plugin !== null);
        console.log('Successfully loaded plugins:', validPlugins.map(p => p.name));
        setPlugins(validPlugins);
      } catch (err) {
        console.error('Error in loadPlugins:', err);
        setError('Failed to load plugins. Please try again later.');
      }
    }

    loadPlugins();
  }, []);

  return { plugins, error };
}

// Helper function to extract React components from a module
const extractComponents = (
  module: any
): Record<string, React.ComponentType> => {
  const components: Record<string, React.ComponentType> = {};
  Object.entries(module).forEach(([key, value]) => {
    if (typeof value === "function" && value.prototype?.isReactComponent) {
      components[key] = value as React.ComponentType;
    }
  });
  return components;
};

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { plugins } = usePlugins();

  return (
    <PluginContext.Provider value={plugins}>
      {children}
    </PluginContext.Provider>
  );
};
