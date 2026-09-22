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
    const isDev = process.env.NODE_ENV === 'development';
    // NEXT_PUBLIC_API_BASE peut contenir "/api/v1" (env local) ou pas
    // (dashboard Vercel). On normalise pour TOUJOURS terminer par "/api/v1"
    // avant de construire le rewrite → aucune requête 404 quel que soit le format.
    const raw = isDev
      ? 'http://localhost:5000/api/v1'
      : (process.env.NEXT_PUBLIC_API_BASE || 'https://tekalis.onrender.com/api/v1');
    const apiBase = raw.replace(/\/+$/, '').replace(/\/api\/v1$/, '') + '/api/v1';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/:path*`,
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // CSP pragmatique : les scripts/analytics tiers (Google, Meta, Vercel)
          // et les scripts inline Next nécessitent 'unsafe-inline' + https:.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https: wss:",
              "media-src 'self' https:",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https:",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
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
      // Ancien schéma /produit/:slug (sitemap backend) → /products/:slug
      {
        source: '/produit/:slug',
        destination: '/products/:slug',
        permanent: true,
      },
      {
        source: '/produit/:slug/',
        destination: '/products/:slug',
        permanent: true,
      },
      // Anciennes URLs produits avec query params → version canonique
      {
        source: '/products/:id/slug',
        destination: '/products/:id',
        permanent: true,
      },
    ];
  },

  // ── Perf ─────────────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;