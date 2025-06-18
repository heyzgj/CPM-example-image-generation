/** @type {import('next').NextConfig} */

import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // =====================================
  // 🚀 PERFORMANCE OPTIMIZATIONS
  // =====================================
  
  // Experimental features for better performance
  experimental: {
    // Enable optimizeCss for production builds
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
    // Enable turbopack for faster builds (dev only)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // =====================================
  // 📦 BUNDLE OPTIMIZATION
  // =====================================
  
  // Optimize bundle splitting
  webpack: (config, { dev, isServer }) => {
    // Optimize production builds
    if (!dev && !isServer) {
      // Split vendor chunks more aggressively
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework chunk (React, Next.js)
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Common libraries
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier())
              );
            },
            name(module) {
              const identifier = module.libIdent ? module.libIdent({ context: config.context }) : module.identifier();
              // Create a simple hash for the name
              let hash = 0;
              for (let i = 0; i < identifier.length; i++) {
                const char = identifier.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
              }
              return Math.abs(hash).toString(16).substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Icons and UI components
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
            name: 'icons',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Commons
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Optimize SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // =====================================
  // 🖼️ IMAGE OPTIMIZATION
  // =====================================
  
  images: {
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow external image domains (for future use)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // =====================================
  // 🗜️ COMPRESSION & CACHING
  // =====================================
  
  // Enable compression
  compress: true,
  
  // Optimize static file serving
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Custom headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // Cache API responses for 1 hour
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          // Cache static assets for 1 year
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // =====================================
  // 🚀 PRODUCTION OPTIMIZATIONS
  // =====================================
  
  // Minimize production builds
  swcMinify: true,
  
  // Enable React strict mode for better performance insights
  reactStrictMode: true,
  
  // Optimize output
  output: 'standalone',
  
  // Optimize static exports
  trailingSlash: false,
  
  // =====================================
  // 🔧 DEVELOPMENT OPTIMIZATIONS
  // =====================================
  
  // Faster rebuilds in development
  ...(process.env.NODE_ENV === 'development' && {
    typescript: {
      // Don't type-check in development for faster builds
      ignoreBuildErrors: false,
    },
    eslint: {
      // Don't lint during builds for faster iteration
      ignoreDuringBuilds: false,
    },
  }),

  // =====================================
  // 📊 MONITORING & ANALYTICS
  // =====================================
  
  // Enable build-time analytics
  generateBuildId: async () => {
    // Use git commit hash or timestamp for better cache busting
    try {
      const { execSync } = await import('child_process');
      return execSync('git rev-parse HEAD').toString().trim();
    } catch {
      return `build-${Date.now()}`;
    }
  },
};

export default bundleAnalyzer(nextConfig);
