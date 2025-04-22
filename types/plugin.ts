export interface Plugin {
  name: string;
  component: React.ComponentType<any>;
  type: 'local' | 'remote';
  actions?: PluginAction[];
  routes?: PluginRoute[];
}

export interface PluginAction {
  name: string;
  handler: (...args: any[]) => Promise<any>;
}

export interface PluginRoute {
  path: string;
  component: React.ComponentType<any>;
} 