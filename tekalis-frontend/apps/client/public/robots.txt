# ═══════════════════════════════════════════════════════════════════
# Tekalis - robots.txt (Configuration optimale SEO)
# ═══════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────
# RÈGLES POUR TOUS LES ROBOTS
# ───────────────────────────────────────────────────────────────────
User-agent: *

# Pages publiques autorisées
Allow: /
Allow: /products
Allow: /products/*
Allow: /blog
Allow: /blog/*
Allow: /configurator
Allow: /apropos
Allow: /contact

# Assets autorisés (CSS, JS, Images)
Allow: /assets/
Allow: /*.css
Allow: /*.js
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.png
Allow: /*.webp
Allow: /*.svg

# Pages privées interdites
Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /login
Disallow: /register
Disallow: /profile
Disallow: /orders
Disallow: /orders/*
Disallow: /addresses
Disallow: /wishlist

# Paramètres de recherche à ne pas indexer (évite duplicate content)
Disallow: /*?search=
Disallow: /*?sort=
Disallow: /*?page=
Disallow: /*?utm_

# ───────────────────────────────────────────────────────────────────
# RÈGLES SPÉCIFIQUES GOOGLE
# ───────────────────────────────────────────────────────────────────
User-agent: Googlebot
Allow: /

# Googlebot Images (autorise toutes les images)
User-agent: Googlebot-Image
Allow: /

# ───────────────────────────────────────────────────────────────────
# RÈGLES SPÉCIFIQUES BING
# ───────────────────────────────────────────────────────────────────
User-agent: Bingbot
Allow: /

# ───────────────────────────────────────────────────────────────────
# BLOQUER LES MAUVAIS BOTS (scraping, spam, etc.)
# ───────────────────────────────────────────────────────────────────
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

# ───────────────────────────────────────────────────────────────────
# SITEMAP
# ───────────────────────────────────────────────────────────────────
Sitemap: https://tekalis.com/sitemap.xml

# ───────────────────────────────────────────────────────────────────
# CRAWL RATE (délai entre requêtes - optionnel)
# Évite surcharge serveur mais peut ralentir l'indexation
# ───────────────────────────────────────────────────────────────────
Crawl-delay: 1

# ───────────────────────────────────────────────────────────────────
# NOTES
# ───────────────────────────────────────────────────────────────────
# 1. Tester ce fichier : https://www.google.com/webmasters/tools/robots-testing-tool
# 2. Vérifier l'indexation : Google Search Console
# 3. Mettre à jour lastmod dans sitemap.xml à chaque modification
# ═══════════════════════════════════════════════════════════════════