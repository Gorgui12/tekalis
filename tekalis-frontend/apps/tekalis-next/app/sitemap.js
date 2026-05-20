const SITE_URL = 'https://tekalis.com';

const STATIC_PAGES = [
  { url: '/', priority: 1.0, changeFrequency: 'daily' },
  { url: '/products', priority: 0.9, changeFrequency: 'daily' },
  { url: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/configurator', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/apropos', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/contact', priority: 0.5, changeFrequency: 'monthly' },
];

const CATEGORY_SLUGS = [
  'smartphones', 'laptops', 'gaming', 'tv',
  'electromenager', 'climatiseurs', 'energie-solaire', 'accessoires', 'audio',
];

export const revalidate = 3600;

export default async function sitemap() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://tekalis.onrender.com';

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

  // Produits dynamiques
  let productEntries = [];
  try {
    const res = await fetch(
      `${BASE}/api/v1/products?limit=9999&fields=_id,slug,updatedAt`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const products = data?.products || data?.data || (Array.isArray(data) ? data : []);
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/products/${p._id}`,
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
    const res = await fetch(
      `${BASE}/api/v1/articles?limit=9999&fields=slug,updatedAt`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const articles = data?.articles || data?.data || [];
    articleEntries = articles
      .filter((a) => a.slug)
      .map((a) => ({
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