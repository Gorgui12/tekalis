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
  },
  laptops: {
    title: 'Ordinateurs Portables Dakar — HP, Dell, Lenovo | Tekalis Sénégal',
    description: 'Ordinateurs portables HP, Dell, Lenovo, Asus à prix compétitifs à Dakar. PC gaming, MacBook et ultrabooks disponibles à Fann. Livraison rapide au Sénégal. Garantie 12 mois.',
    h1: 'Laptops & Ordinateurs Portables',
    keywords: ['laptop Dakar Fann', 'ordinateur portable Sénégal', 'PC gaming Dakar', 'Dell HP Lenovo Sénégal', 'MacBook Dakar'],
  },
  gaming: {
    title: 'Gaming Dakar — PlayStation 5, Xbox, PC Gaming | Tekalis',
    description: 'PlayStation 5, Xbox Series X, PC gaming et accessoires disponibles à Dakar. Consoles, manettes, casques gaming à Fann. Livraison rapide dans toute la région de Dakar.',
    h1: 'Gaming & Jeux Vidéo à Dakar',
    keywords: ['gaming Dakar Fann', 'PlayStation 5 Dakar', 'PC gaming Sénégal', 'console jeux Dakar', 'Xbox Series X Sénégal'],
  },
  tv: {
    title: 'Téléviseurs Dakar — Samsung, LG, Sony 4K OLED | Tekalis',
    description: 'Achetez votre TV 4K, OLED ou QLED à Dakar. Samsung, LG, Sony, Hisense disponibles à Fann. Smart TV Android et WebOS. Livraison rapide et installation disponible.',
    h1: 'Téléviseurs & TV à Dakar',
    keywords: ['TV Dakar Fann', 'téléviseur 4K Sénégal', 'Samsung TV Dakar', 'smart TV Sénégal', 'LG OLED Dakar'],
  },
  electromenager: {
    title: 'Électroménager Dakar — Réfrigérateur, Machine à Laver | Tekalis',
    description: 'Réfrigérateurs, machines à laver, fours et petit électroménager à prix compétitifs à Dakar. Marques Samsung, LG, Bosch disponibles à Fann. Livraison rapide et installation.',
    h1: 'Électroménager à Dakar',
    keywords: ['électroménager Dakar Fann', 'réfrigérateur Sénégal', 'machine à laver Dakar', 'four micro-ondes Dakar', 'climatiseur Dakar'],
  },
  climatiseurs: {
    title: 'Climatiseurs Dakar — Split Inverter LG Samsung | Tekalis',
    description: 'Climatiseurs split inverter à Dakar. LG, Samsung, Midea disponibles à Fann. Économie d\'énergie garantie. Installation professionnelle dans toute la région de Dakar.',
    h1: 'Climatiseurs & Climatisation à Dakar',
    keywords: ['climatiseur Dakar Fann', 'climatisation Sénégal', 'inverter Dakar prix', 'climatiseur split Dakar', 'installation clim Dakar'],
  },
  'energie-solaire': {
    title: 'Panneaux Solaires Dakar — Kits Énergie Solaire | Tekalis',
    description: 'Kits solaires, panneaux photovoltaïques et batteries pour maison au Sénégal. Installation professionnelle disponible à Dakar. Énergie renouvelable et économie d\'électricité.',
    h1: 'Énergie Solaire à Dakar',
    keywords: ['panneau solaire Dakar Fann', 'kit solaire Sénégal', 'énergie solaire Dakar', 'onduleur solaire Dakar', 'batterie solaire Sénégal'],
  },
  accessoires: {
    title: 'Accessoires Tech Dakar — Câbles, Chargeurs, Coques | Tekalis',
    description: 'Accessoires tech de qualité à Dakar : câbles USB-C, chargeurs rapides, coques téléphone disponibles à Fann. Livraison rapide dans toute la région de Dakar.',
    h1: 'Accessoires & Périphériques à Dakar',
    keywords: ['accessoires téléphone Dakar Fann', 'câble USB-C Sénégal', 'chargeur rapide Dakar', 'coque téléphone Sénégal', 'clavier souris Dakar'],
  },
  audio: {
    title: 'Casques Enceintes Dakar — JBL, Sony, Bose | Tekalis',
    description: 'Casques Bluetooth, enceintes portables et barres de son disponibles à Dakar. JBL, Sony, Bose, Samsung à Fann. Livraison rapide dans toute la région de Dakar.',
    h1: 'Audio — Casques & Enceintes à Dakar',
    keywords: ['casque Bluetooth Dakar Fann', 'enceinte JBL Sénégal', 'audio Dakar', 'haut-parleur Dakar', 'Sony Bose Sénégal'],
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