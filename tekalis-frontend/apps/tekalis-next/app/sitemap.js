const SITE_URL = 'https://tekalis.com';

const STATIC_PAGES = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' },
  { url: '/products', priority: 0.9, changeFrequency: 'daily' },
  { url: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/apropos', priority: 0.6, changeFrequency: 'monthly' },
  { url: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { url: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { url: '/livraison', priority: 0.6, changeFrequency: 'monthly' },
  { url: '/retours', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/garanties', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' },
  { url: '/cgv', priority: 0.3, changeFrequency: 'yearly' },
  { url: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
];

const CATEGORY_SLUGS = [
  'smartphones', 'ordinateurs', 'gaming', 'tv',
  'electromenager', 'climatiseurs', 'energie-solaire', 'accessoires', 'audio',
];

export const revalidate = 3600;

// NEXT_PUBLIC_API_BASE peut contenir "/api/v1" (env local) ou pas (Vercel).
// Normalisation : l'API est servie sous https://tekalis.onrender.com/api/v1 et
// ne doit JAMAIS doubler le préfixe (bug historique /api/v1/api/v1 → 404).
const rawBase = process.env.NEXT_PUBLIC_API_BASE || 'https://tekalis.onrender.com/api/v1';
const API_BASE = rawBase.replace(/\/+$/, '').replace(/\/api\/v1$/, '') + '/api/v1';

const BLOCKED_STATUSES = new Set(['discontinued']);

/**
 * Récupère TOUS les produits en paginant (le backend plafonne limit à 100).
 * Ne garde que les produits indexables (statut publiable).
 */
async function fetchAllProducts() {
  const products = [];
  const { revalidate: rev } = { revalidate: 3600 };

  for (let page = 1; page <= 25; page += 1) {
    const url = `${API_BASE}/products?page=${page}&limit=100&fields=_id,slug,status,updatedAt`;
    const res = await fetch(url, { next: { revalidate: rev } });
    if (!res.ok) break;
    const data = await res.json();
    const items = data?.products || data?.data || (Array.isArray(data) ? data : []);
    if (!Array.isArray(items) || items.length === 0) break;
    products.push(...items);

    const totalPages = data?.pagination?.totalPages;
    if (typeof totalPages === 'number' && page >= totalPages) break;
  }

  return products.filter((p) => p && !BLOCKED_STATUSES.has(p.status));
}

async function fetchAllArticles() {
  try {
    const res = await fetch(`${API_BASE}/articles?limit=200&fields=slug,updatedAt`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return (data?.articles || data?.data || [])
      .filter((a) => a.slug);
  } catch {
    return [];
  }
}

export default async function sitemap() {
  // Pages statiques
  const staticEntries = STATIC_PAGES.map(({ url, ...rest }) => ({
    url: `${SITE_URL}${url}`,
    lastModified: new Date(),
    ...rest,
  }));

  // Catégories
  const categoryEntries = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Produits dynamiques (URLs SEO par slug, sinon _id)
  let productEntries = [];
  try {
    const products = await fetchAllProducts();
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug || p._id}`,
      lastModified: new Date(p.updatedAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    // silencieux si API indisponible au build
  }

  // Articles dynamiques
  let articleEntries = [];
  try {
    const articles = await fetchAllArticles();
    articleEntries = articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.updatedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // silencieux
  }

  return [...staticEntries, ...categoryEntries, ...productEntries, ...articleEntries];
}