import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import CategoryClient from '@/components/product/CategoryClient';

const SITE_URL = 'https://tekalis.com';

const CATEGORY_SEO = {
  smartphones: {
    title: 'Smartphones Dakar — iPhone, Samsung, Xiaomi | Livraison Sénégal | Tekalis',
    description: 'Achetez votre smartphone à Dakar au meilleur prix. iPhone 15, Samsung Galaxy S24, Xiaomi Redmi disponible à Fann. Livraison rapide dans toute la région de Dakar. Garantie constructeur incluse.',
    h1: 'Smartphones & Téléphones à Dakar',
    keywords: ['smartphone Dakar Fann', 'acheter iPhone Dakar', 'Samsung Galaxy Sénégal', 'téléphone Dakar livraison', 'Xiaomi Tecno Dakar'],
    faqs: [
      { q: 'Quelle est la garantie sur les smartphones ?', a: 'Tous nos smartphones sont garantis 12 mois minimum par le constructeur.' },
      { q: 'Puis-je payer à la livraison ?', a: 'Oui, nous acceptons le paiement à la livraison, Wave, Orange Money et Free Money.' },
      { q: 'Livrez-vous en dehors de Dakar ?', a: 'Oui, nous livrons partout au Sénégal. Délai de 3-5 jours ouvrés pour les régions.' },
    ],
  },
  ordinateurs: {
    title: 'Ordinateurs Portables Dakar — HP, Dell, Lenovo | Tekalis Sénégal',
    description: 'Ordinateurs portables HP, Dell, Lenovo, Asus à prix compétitifs à Dakar. PC gaming, MacBook et ultrabooks disponibles à Fann. Livraison rapide au Sénégal. Garantie 12 mois.',
    h1: 'Laptops & Ordinateurs Portables',
    keywords: ['laptop Dakar Fann', 'ordinateur portable Sénégal', 'PC gaming Dakar', 'Dell HP Lenovo Sénégal', 'MacBook Dakar'],
    faqs: [
      { q: 'Les laptops sont-ils neufs ou reconditionnés ?', a: 'Tous nos laptops sont neufs, sous emballage d\'origine avec facture officielle.' },
      { q: 'Proposez-vous des PC gaming ?', a: 'Oui, nous avons une large sélection de laptops gaming MSI, Asus ROG, Lenovo Legion.' },
    ],
  },
  gaming: {
    title: 'Gaming Dakar — PlayStation 5, Xbox, PC Gaming | Tekalis',
    description: 'PlayStation 5, Xbox Series X, PC gaming et accessoires disponibles à Dakar. Consoles, manettes, casques gaming à Fann. Livraison rapide dans toute la région de Dakar.',
    h1: 'Gaming & Jeux Vidéo à Dakar',
    keywords: ['gaming Dakar Fann', 'PlayStation 5 Dakar', 'PC gaming Sénégal', 'console jeux Dakar', 'Xbox Series X Sénégal'],
    faqs: [
      { q: 'La PS5 est-elle disponible en stock ?', a: 'Consultez notre stock en temps réel. Nous réapprovisionnons régulièrement.' },
    ],
  },
  tv: {
    title: 'Téléviseurs Dakar — Samsung, LG, Sony 4K OLED | Tekalis',
    description: 'Achetez votre TV 4K, OLED ou QLED à Dakar. Samsung, LG, Sony, Hisense disponibles à Fann. Smart TV Android et WebOS. Livraison rapide et installation disponible.',
    h1: 'Téléviseurs & TV à Dakar',
    keywords: ['TV Dakar Fann', 'téléviseur 4K Sénégal', 'Samsung TV Dakar', 'smart TV Sénégal', 'LG OLED Dakar'],
    faqs: [
      { q: 'Livrez-vous les grandes TV ?', a: 'Oui, nous livrons tous les formats. Des équipes spécialisées s\'occupent des très grandes dalles.' },
    ],
  },
  electromenager: {
    title: 'Électroménager Dakar — Réfrigérateur, Machine à Laver | Tekalis',
    description: 'Réfrigérateurs, machines à laver, fours et petit électroménager à prix compétitifs à Dakar. Marques Samsung, LG, Bosch disponibles à Fann. Livraison rapide et installation.',
    h1: 'Électroménager à Dakar',
    keywords: ['électroménager Dakar Fann', 'réfrigérateur Sénégal', 'machine à laver Dakar', 'four micro-ondes Dakar', 'climatiseur Dakar'],
    faqs: [],
  },
  climatiseurs: {
    title: 'Climatiseurs Dakar — Split Inverter LG Samsung | Tekalis',
    description: 'Climatiseurs split inverter à Dakar. LG, Samsung, Midea disponibles à Fann. Économie d\'énergie garantie. Installation professionnelle dans toute la région de Dakar.',
    h1: 'Climatiseurs & Climatisation à Dakar',
    keywords: ['climatiseur Dakar Fann', 'climatisation Sénégal', 'inverter Dakar prix', 'climatiseur split Dakar', 'installation clim Dakar'],
    faqs: [
      { q: 'Proposez-vous l\'installation ?', a: 'Oui, nous avons des techniciens certifiés pour l\'installation à Dakar et banlieue.' },
    ],
  },
  'energie-solaire': {
    title: 'Panneaux Solaires Dakar — Kits Énergie Solaire | Tekalis',
    description: 'Kits solaires, panneaux photovoltaïques et batteries pour maison au Sénégal. Installation professionnelle disponible à Dakar. Énergie renouvelable et économie d\'électricité.',
    h1: 'Énergie Solaire à Dakar',
    keywords: ['panneau solaire Dakar Fann', 'kit solaire Sénégal', 'énergie solaire Dakar', 'onduleur solaire Dakar', 'batterie solaire Sénégal'],
    faqs: [
      { q: 'Quelle capacité solaire pour une maison moyenne ?', a: 'Un kit 3KW suffit pour une maison de 3-4 pièces avec climatiseur. Contactez-nous pour un devis personnalisé.' },
    ],
  },
  accessoires: {
    title: 'Accessoires Tech Dakar — Câbles, Chargeurs, Coques | Tekalis',
    description: 'Accessoires tech de qualité à Dakar : câbles USB-C, chargeurs rapides, coques téléphone disponibles à Fann. Livraison rapide dans toute la région de Dakar.',
    h1: 'Accessoires & Périphériques à Dakar',
    keywords: ['accessoires téléphone Dakar Fann', 'câble USB-C Sénégal', 'chargeur rapide Dakar', 'coque téléphone Sénégal', 'clavier souris Dakar'],
    faqs: [],
  },
  audio: {
    title: 'Casques Enceintes Dakar — JBL, Sony, Bose | Tekalis',
    description: 'Casques Bluetooth, enceintes portables et barres de son disponibles à Dakar. JBL, Sony, Bose, Samsung à Fann. Livraison rapide dans toute la région de Dakar.',
    h1: 'Audio — Casques & Enceintes à Dakar',
    keywords: ['casque Bluetooth Dakar Fann', 'enceinte JBL Sénégal', 'audio Dakar', 'haut-parleur Dakar', 'Sony Bose Sénégal'],
    faqs: [],
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const seo = CATEGORY_SEO[slug];
  if (!seo) return { title: `${slug} | Tekalis` };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${SITE_URL}/category/${slug}`,
      siteName: 'Tekalis Sénégal',
      locale: 'fr_SN',
    },
  };
}

export const revalidate = 3600;

async function getCategoryBySlug(slug) {
  try {
    const data = await serverFetch('/categories');
    const categories = data?.categories || [];
    const flat = categories.reduce((acc, cat) => {
      acc.push(cat);
      if (cat.children) acc.push(...cat.children);
      return acc;
    }, []);
    return flat.find((c) => c.slug === slug) || null;
  } catch {
    return null;
  }
}

async function getProductsByCategory(categoryId) {
  try {
    const data = await serverFetch(`/products?category=${categoryId}&limit=200`);
    return data?.data || data?.products || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const data = await serverFetch('/categories');
    const categories = data?.categories || [];
    const flat = categories.reduce((acc, cat) => {
      acc.push(cat);
      if (cat.children) acc.push(...cat.children);
      return acc;
    }, []);
    return flat.filter((c) => c.isActive !== false).map((c) => ({ slug: c.slug }));
  } catch {
    return Object.keys(CATEGORY_SEO).map((slug) => ({ slug }));
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const seo = CATEGORY_SEO[slug] || {
    title: slug.replace(/-/g, ' '),
    h1: slug.replace(/-/g, ' '),
    description: `Produits ${slug.replace(/-/g, ' ')} disponibles à Dakar au Sénégal.`,
    keywords: [`${slug} Dakar`],
    faqs: [],
  };

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category._id);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seo.h1,
    description: seo.description,
    url: `${SITE_URL}/category/${slug}`,
    numberOfItems: products.length,
    ...(products.length > 0 ? {
      hasPart: products.slice(0, 50).map((p) => ({
        '@type': 'ItemList',
        name: p.name,
        url: `${SITE_URL}/products/${p.slug || p._id}`,
      })),
    } : {}),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Produits', item: `${SITE_URL}/products` },
        { '@type': 'ListItem', position: 3, name: seo.h1, item: `${SITE_URL}/category/${slug}` },
      ],
    },
  };

  const faqSchema = seo.faqs && seo.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <CategoryClient products={products} seo={seo} slug={slug} />
    </>
  );
}
