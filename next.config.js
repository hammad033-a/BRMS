/**
 * Next.js configuration to allow external images/styles used in the app
 * and relax CSP for development convenience.
 */

const securityHeaders = [
  // Allow scripts and styles from self and https CDNs; allow inline styles used by Semantic UI and styled-jsx
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'", // base
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:", // allow dev eval, inline for Next/styled-jsx in dev
      "style-src 'self' 'unsafe-inline' https:", // external styles and inline styles
      "img-src 'self' data: blob: https://*",
      "connect-src 'self' https://* ws://localhost:* wss://localhost:*",
      "font-src 'self' data: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'"
    ].join('; ')
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'cloudflare-ipfs.com' },
      { protocol: 'https', hostname: 'dweb.link' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: '*.w3s.link' }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;

