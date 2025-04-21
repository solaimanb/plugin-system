import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Watch the plugins directory
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
      poll: 1000,
    };

    return config;
  },
  reactStrictMode: true,
};

export default nextConfig;
