import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimizations
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week cache
    remotePatterns: [
      // Facebook CDN domains - specific ones we've seen
      {
        protocol: 'https',
        hostname: 'scontent.fbkk14-1.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fbkk10-1.fna.fbcdn.net',
      },
      // More general Facebook CDN patterns
      {
        protocol: 'https',
        hostname: 'scontent-bkk1-1.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-bkk1-2.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.xx.fbcdn.net',
      },
      // Facebook Graph API
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
      // Additional common Facebook CDN patterns
      {
        protocol: 'https',
        hostname: 'lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'external.xx.fbcdn.net',
      },
      // More generic patterns for Facebook content
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'z-m-scontent.xx.fbcdn.net',
      },
      // For mock/testing images
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
