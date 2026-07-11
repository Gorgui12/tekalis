import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import CategoryClient from '@/components/product/CategoryClient';

const SITE_URL = 'https://tekalis.com';

const CATEGORY_SEO = {
  smartphones: {
    title: 'Smartphones & Téléphones à Dakar — Livraison Rapide Sénégal | Tekalis',
    description: 'Achetez votre smartphone en ligne à Dakar. iPhone, Samsung, Xiaomi, Tecno — garantie constructeur incluse. Paiement Wave, Orange Money ou à la livraison.',
    h1: 'Smartphones & Téléphones à Dakar',
    keywords: ['smartphone Dakar', 'acheter iPhone Dakar', 'Samsung Galaxy Sénégal', 'téléphone Dakar livraison'],
  },
  laptops: {
    title: 'Laptops & Ordinateurs Portables à Dakar | Tekalis Sénégal',
    description: 'Ordinateurs portables HP, Dell, Lenovo, Asus à prix compétitifs à Dakar. Livraison rapide au Sénégal. Garantie 12 mois.',
    h1: 'Laptops & Ordinateurs Portables',
    keywords: ['laptop Dakar', 'ordinateur portable Sénégal', 'PC gaming Dakar', 'Dell HP Lenovo Sénégal'],
  },
  gaming: {
    title: 'Gaming — Consoles, PC Gaming & Accessoires à Dakar | Tekalis',
    description: 'PlayStation 5, Xbox, PC gaming, manettes et accessoires gaming disponibles à Dakar. Livraison rapide au Sénégal.',
    h1: 'Gaming & Jeux Vidéo',
    keywords: ['gaming Dakar', 'PlayStation 5 Dakar', 'PC gaming Sénégal', 'console jeux Dakar'],
  },
  tv: {
    title: 'TV & Téléviseurs à Dakar — Samsung, LG, Sony | Tekalis',
    description: 'Achetez votre TV 4K, OLED ou QLED à Dakar. Samsung, LG, Sony, Hisense — garantie constructeur. Livraison rapide.',
    h1: 'Téléviseurs & TV',
    keywords: ['TV Dakar', 'téléviseur 4K Sénégal', 'Samsung TV Dakar', 'smart TV Sénégal'],
  },
  electromenager: {
    title: 'Électroménager à Dakar — Livraison Rapide Sénégal | Tekalis',
    description: 'Réfrigérateurs, machines à laver, fours et petit électroménager à prix compétitifs à Dakar. Garantie constructeur 12 mois.',
    h1: 'Électroménager',
    keywords: ['électroménager Dakar', 'réfrigérateur Sénégal', 'machine à laver Dakar'],
  },
  climatiseurs: {
    title: 'Climatiseurs & Climatisation à Dakar — Inverter | Tekalis',
    description: 'Climatiseurs split inverter à Dakar. LG, Samsung, Midea — économie énergie garantie. Installation professionnelle disponible.',
    h1: 'Climatiseurs & Climatisation',
    keywords: ['climatiseur Dakar', 'climatisation Sénégal', 'inverter Dakar prix'],
  },
  'energie-solaire': {
    title: 'Énergie Solaire & Panneaux Solaires à Dakar | Tekalis',
    description: 'Kits solaires, panneaux photovoltaïques et batteries pour maison au Sénégal. Installation professionnelle disponible.',
    h1: 'Énergie Solaire',
    keywords: ['panneau solaire Dakar', 'kit solaire Sénégal', 'énergie solaire Dakar'],
  },
  accessoires: {
    title: 'Accessoires Tech à Dakar — Câbles, Chargeurs, Coques | Tekalis',
    description: 'Accessoires tech de qualité à Dakar : câbles USB-C, chargeurs rapides, coques téléphone. Livraison rapide au Sénégal.',
    h1: 'Accessoires & Périphériques',
    keywords: ['accessoires téléphone Dakar', 'câble USB-C Sénégal', 'chargeur rapide Dakar'],
  },
  audio: {
    title: 'Casques & Enceintes Audio à Dakar — JBL, Sony | Tekalis',
    description: 'Casques Bluetooth, enceintes portables et barres de son disponibles à Dakar. JBL, Sony, Samsung — livraison rapide.',
    h1: 'Audio — Casques & Enceintes',
    keywords: ['casque Bluetooth Dakar', 'enceinte JBL Sénégal', 'audio Dakar'],
  },
};

export async function generateMetadata({ params }) {
  const seo = CATEGORY_SEO[params.slug];
  if (!seo) return { title: `${params.slug} | Tekalis` };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: `${SITE_URL}/category/${params.slug}` },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${SITE_URL}/category/${params.slug}`,
    },
  };
}

export const revalidate = 3600;

async function getProducts() {
  try {
    const data = await serverFetch('/products?limit=200');
    return data?.products || data?.data || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

// Génère les slugs connus statiquement pour le SEO
export async function generateStaticParams() {
  return Object.keys(CATEGORY_SEO).map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }) {
  const { slug } = params;
  const seo = CATEGORY_SEO[slug] || {
    title: slug,
    h1: slug.replace(/-/g, ' '),
    description: `Produits ${slug} disponibles à Dakar au Sénégal.`,
    keywords: [`${slug} Dakar`],
  };

  const allProducts = await getProducts();

  // Filtrage côté serveur par slug de catégorie
  const products = allProducts.filter((p) => {
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    return cats.some((c) => {
      const name = typeof c === 'object' ? c.name : c;
      return name?.toLowerCase().includes(slug.toLowerCase());
    });
  });

  // Schema.org CollectionPage
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seo.h1,
    description: seo.description,
    url: `${SITE_URL}/category/${slug}`,
    numberOfItems: products.length,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Produits', item: `${SITE_URL}/products` },
        { '@type': 'ListItem', position: 3, name: seo.h1, item: `${SITE_URL}/category/${slug}` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CategoryClient products={products} seo={seo} slug={slug} />
    </>
  );
}