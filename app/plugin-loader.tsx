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
      // For local plugins, use dynamic import
      const module = await import(`@/plugins/${content}.tsx`);
      return module;
    }

    // For remote plugins, fetch the content if it's a URL
    if (content.startsWith('http')) {
      console.log('Fetching remote plugin from:', content);
      const response = await fetch(content);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin content: ${response.statusText}`);
      }
      content = await response.text();
      console.log('Fetched remote plugin content:', content.slice(0, 100) + '...');
    }

    // Create a unique ID for this plugin load
    const moduleId = `plugin_${Math.random().toString(36).slice(2)}`;
    
    // Create a new script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    
    // Wrap the content in an IIFE that creates exports
    script.textContent = `
      window['${moduleId}'] = (function() {
        const exports = {};
        const module = { exports };
        
        // Add React to window temporarily
        const React = window.React;
        
        // Execute the plugin code in a way that captures named exports
        (function() {
          ${content.replace('export const', 'const')}
          
          // Return all exports
          return {
            WelcomeMessage: typeof WelcomeMessage !== 'undefined' ? WelcomeMessage : undefined,
            actions: typeof actions !== 'undefined' ? actions : undefined,
            routes: typeof routes !== 'undefined' ? routes : undefined
          };
        })();
      })();
    `;

    // Create a promise to handle the loading
    return new Promise((resolve, reject) => {
      script.onerror = () => {
        reject(new Error('Failed to load plugin script'));
        cleanup();
      };

      script.onload = () => {
        // Small delay to ensure script execution
        setTimeout(() => {
          const moduleExports = window[moduleId];
          if (!moduleExports) {
            reject(new Error('Plugin failed to load: no exports found'));
            return;
          }
          resolve(moduleExports);
          cleanup();
        }, 0);
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

interface PluginData {
  name: string;
  url: string;
  id: string;
  createdAt: string;
}

export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlugins() {
      try {
        const response = await fetch('/api/plugins');
        const pluginsData: PluginData[] = await response.json();
        console.log('Loaded plugins data:', pluginsData);

        const loadedPlugins = await Promise.all(
          pluginsData.map(async (pluginData: PluginData) => {
            try {
              console.log(`Loading plugin: ${pluginData.name} from ${pluginData.url}`);
              let module;
              
              if (pluginData.url.startsWith('/plugins/')) {
                // Local plugin
                const pluginName = pluginData.url.replace('/plugins/', '').replace('.tsx', '');
                module = await loadPluginModule(pluginName, true);
              } else {
                // Remote plugin - pass the full URL
                module = await loadPluginModule(pluginData.url);
              }

              if (!module) {
                console.error(`Plugin ${pluginData.name} failed to load`);
                return null;
              }

              const plugin: Plugin = {
                name: pluginData.name,
                component: module.WelcomeMessage || module.default || module.Component,
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
