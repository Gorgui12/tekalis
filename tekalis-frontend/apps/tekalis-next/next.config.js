/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Images autorisées (Unsplash + votre API) ──────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'tekalis.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // ── Proxy API → évite CORS en dev ────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/:path*`,
      },
    ];
  },

  // ── Headers SEO + sécurité ────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ── Redirections ancienne URLs ─────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/products/:id',
        destination: '/products/:id',
        permanent: false,
      },
    ];
  },

  // ── Perf ─────────────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;