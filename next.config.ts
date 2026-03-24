import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };

    // Transformers.js needs this to run on the browser side without choking Next.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      url: false,
      crypto: false,
      os: false,
      process: false,
      buffer: false,
    };

    if (process.env.NODE_ENV === 'development') {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: '@dyad-sh/nextjs-webpack-component-tagger',
      });
    }
    return config;
  },
};

export default nextConfig;
