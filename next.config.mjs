import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
          filename: 'static/[name].worker.js',
        })
      );
    }
    return config;
  },
};

export default nextConfig;