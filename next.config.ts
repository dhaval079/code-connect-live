import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  // Add these to show all errors  
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // ADD THIS LINE - prevents stopping on first error
    config.bail = false;
    
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader'],
    })
    return config
  }
}

export default nextConfig