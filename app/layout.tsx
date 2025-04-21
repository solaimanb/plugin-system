import './globals.css';
import type { Metadata } from 'next';
import { PluginProvider } from './plugin-loader';
import { getPlugins } from './plugin-loader.server';

export const metadata: Metadata = {
  title: 'My WP-style App',
  description: 'Plugin & hook system like WordPress',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plugins = getPlugins();
  
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PLUGINS__ = ${JSON.stringify(plugins)};`,
          }}
        />
      </head>
      <body>
        <PluginProvider>
          {children}
        </PluginProvider>
      </body>
    </html>
  );
}
