// hooks/index.tsx
import React from 'react';

type ActionConfig = {
  hookName: string;
  position: number;
  componentName?: string;
};

type RouteConfig = {
  type: 'view' | 'admin';
  route: string;
  componentName: string;
  position: number;
};

type PluginModule = {
  actions?: ActionConfig[];
  routes?: RouteConfig[];
  [key: string]: unknown;
};

const actionRegistry: Record<
  string,
  Array<{
    component: React.ComponentType<any>;
    position: number;
    componentName?: string;
  }>
> = {};

const routeRegistry: Record<
  string,
  Array<{
    component: React.ComponentType<any>;
    route: string;
    position: number;
  }>
> = { view: [], admin: [] };

export function registerComponents(components: PluginModule) {
  const { actions = [], routes = [], ...comps } = components;

  // Register action components
  actions.forEach(({ hookName, position, componentName }) => {
    if (!componentName) return;

    const component = comps[componentName] as React.ComponentType<any> | undefined;
    if (!component || typeof component !== 'function') return;

    if (!actionRegistry[hookName]) {
      actionRegistry[hookName] = [];
    }

    actionRegistry[hookName].push({ component, position, componentName });
    actionRegistry[hookName].sort((a, b) => a.position - b.position);
  });

  // Register route components
  routes.forEach(({ type, route, componentName, position }) => {
    if (!componentName) return;

    const component = comps[componentName] as React.ComponentType<any> | undefined;
    if (!component || typeof component !== 'function') return;

    routeRegistry[type].push({ component, route, position });
    routeRegistry[type].sort((a, b) => a.position - b.position);
  });
}

export const Hooks = ({ name }: { name: string }) => {
  const components = actionRegistry[name] || [];

  return (
    <>
      {components.map(({ component: Component, componentName }, index) => (
        <Component key={`${componentName || 'default'}-${index}`} />
      ))}
    </>
  );
};

export function getRouteComponents(type: 'view' | 'admin') {
  return routeRegistry[type] || [];
}

// Webpack require.context type declaration
declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

export function registerPlugins() {
  const pluginContext = require.context('../plugins', true, /\.tsx$/);

  pluginContext.keys().forEach((key: string) => {
    const pluginModule = pluginContext(key) as PluginModule;
    registerComponents(pluginModule);
  });
}

registerPlugins();