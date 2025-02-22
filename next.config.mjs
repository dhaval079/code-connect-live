import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true }
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