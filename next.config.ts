import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
