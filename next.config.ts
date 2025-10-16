import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Removida a regra de webpack que referenciava o pacote @dyad-sh/nextjs-webpack-component-tagger
    return config;
  },
};

export default nextConfig;