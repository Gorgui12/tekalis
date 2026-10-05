export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/api/v1/merchant/products.xml'],
/*
         * On ne bloque QUE ce qui n'a aucune valeur pour un moteur de recherche.
         *
         * `/cart`, `/checkout`, `/dashboard`, `/login`, `/register`, `/profile`,
         * `/wishlist`, `/forgot-password`, `/reset-password` ne sont volontairement
         * PAS dans cette liste : ces pages portent un `noindex, nofollow` dans
         * leur HTML. Un `Disallow` empeche le crawler d'aller lire ce `noindex`,
         * et l'URL peut alors rester indexee sans description exploitable.
         *
         * On ne bloque pas `/_next` non plus : Googlebot a besoin de telecharger
         * les CSS et le JS pour rendre la page. Le bloquer reviendrait a revenir
         * au probleme de contenu absent qu'on vient de corriger.
         */
        disallow: ['/admin', '/api/', '/payment/'],
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
      /*
       * Pas de groupe separe `Googlebot`. Google n'applique qu'un seul groupe :
       * le plus specifique. Un groupe `Googlebot: allow: /` ici remplacerait
       * integralement le groupe `*`, donc les `disallow` ci-dessus
       * (/admin, /api/, /payment/) ne s'appliqueraient jamais a Googlebot.
       * Google est deja couvert par le groupe `*` (il respecte `*`).
       *
       * `crawlDelay` est de toute facon ignore par Google, et Googlebot est
       * envoye dans le groupe `*`.
       */
    ],
    sitemap: 'https://tekalis.com/sitemap.xml',
    host: 'https://tekalis.com',
  };
}