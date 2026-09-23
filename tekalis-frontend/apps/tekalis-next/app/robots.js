export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/api/v1/merchant/products.xml'],
        disallow: [
          '/admin',
          '/api/',
          '/cart',
          '/checkout',
          '/dashboard',
          '/login',
          '/register',
          '/profile',
          '/forgot-password',
          '/reset-password',
          '/wishlist',
        ],
      },
      {
        // Crawlers IA et LLM — autorisés explicitement pour la citabilité GEO
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'GoogleOther',
          'Bingbot',
          'Applebot',
          'anthropic-ai',
          'cohere-ai',
          'Bytespider',
          'CCBot',
          'Diffbot',
          'FacebookBot',
          'PetalBot',
        ],
        allow: ['/', '/llms.txt'],
      },
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'AhrefsSiteAudit'],
        disallow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://tekalis.com/sitemap.xml',
    host: 'https://tekalis.com',
  };
}