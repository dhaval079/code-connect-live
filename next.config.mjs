import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  // Add these to show all errors
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true }
    
    // ADD THIS LINE - prevents stopping on first error
    config.bail = false;
    
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
          filename: 'static/[name].worker.js',
          experimental: {
            optimizeCss: true
          }
        })
      );
    }
    return config;
  },
};

export default nextConfig;