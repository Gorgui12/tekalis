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

export const revalidate = 3600;

const rawBase = process.env.NEXT_PUBLIC_API_BASE || 'https://tekalis.onrender.com/api/v1';
const API_BASE = rawBase.replace(/\/+$/, '').replace(/\/api\/v1$/, '') + '/api/v1';

const BLOCKED_STATUSES = new Set(['discontinued']);

async function fetchAllProducts() {
  const products = [];

  for (let page = 1; page <= 10; page += 1) {
    const url = `${API_BASE}/products?page=${page}&limit=200&fields=_id,slug,status,updatedAt`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
    const data = await res.json();
    const items = data?.data || data?.products || (Array.isArray(data) ? data : []);
    if (!Array.isArray(items) || items.length === 0) break;
    products.push(...items);

    const totalPages = data?.pagination?.totalPages;
    if (typeof totalPages === 'number' && page >= totalPages) break;
  }

  return products.filter((p) => p && !BLOCKED_STATUSES.has(p.status));
}

async function fetchAllCategories() {
  const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);
  const data = await res.json();
  const categories = data?.categories || [];
  return categories.reduce((acc, cat) => {
    acc.push(cat);
    if (cat.children) acc.push(...cat.children);
    return acc;
  }, []);
}

async function fetchAllArticles() {
  const res = await fetch(`${API_BASE}/articles?limit=200&fields=slug,updatedAt`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Articles fetch failed: ${res.status}`);
  const data = await res.json();
  return (data?.articles || data?.data || []).filter((a) => a.slug);
}

export default async function sitemap() {
  const staticEntries = STATIC_PAGES.map(({ url, ...rest }) => ({
    url: `${SITE_URL}${url}`,
    lastModified: new Date(),
    ...rest,
  }));

  let categoryEntries = [];
  try {
    const categories = await fetchAllCategories();
    categoryEntries = categories
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        url: `${SITE_URL}/category/${c.slug}`,
        lastModified: new Date(c.updatedAt || c.createdAt || Date.now()),
        changeFrequency: 'daily',
        priority: 0.9,
      }));
  } catch (err) {
    console.error('[sitemap] Categories fetch failed, using fallback:', err.message);
    const FALLBACK_SLUGS = [
      'smartphones', 'ordinateurs', 'gaming', 'tv',
      'electromenager', 'climatiseurs', 'energie-solaire', 'accessoires', 'audio',
    ];
    categoryEntries = FALLBACK_SLUGS.map((slug) => ({
      url: `${SITE_URL}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  }

  let productEntries = [];
  try {
    const products = await fetchAllProducts();
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug || p._id}`,
      lastModified: new Date(p.updatedAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('[sitemap] Products fetch failed:', err.message);
  }

  let articleEntries = [];
  try {
    const articles = await fetchAllArticles();
    articleEntries = articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.updatedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[sitemap] Articles fetch failed:', err.message);
  }

  return [...staticEntries, ...categoryEntries, ...productEntries, ...articleEntries];
}
