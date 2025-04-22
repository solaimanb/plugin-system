/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Watch the plugins directory
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
      poll: 1000,
    };

    // Add support for importing plugins
    config.resolve.alias = {
      ...config.resolve.alias,
      '@plugins': require('path').resolve(__dirname, 'plugins'),
    };

    return config;
  },
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig; 