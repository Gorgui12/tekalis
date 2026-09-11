import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import CategoryClient from '@/components/product/CategoryClient';

const SITE_URL = 'https://tekalis.com';

const CATEGORY_SEO = {
  smartphones: {
    title: 'Acheter un Smartphone Pas Cher à Dakar | Livraison Sénégal',
    description: 'Achetez votre smartphone en ligne à Dakar, livré au Sénégal. Téléphones Android neufs sous garantie pour trouver le meilleur smartphone 2026 au bon prix.',
    descriptionLong: 'Des téléphones Android aux modèles les plus récents, notre catalogue couvre tous les budgets avec des appareils neufs et garantis. Commandez en ligne, payez à la livraison ou via Wave, et recevez votre smartphone sous 24 à 48h à Dakar.',
    h1: 'Smartphones & Téléphones',
    keywords: ['smartphone Dakar', 'acheter smartphone en ligne Sénégal', 'téléphone pas cher Dakar', 'smartphone pas cher Sénégal', 'téléphone Android Dakar', 'meilleur smartphone 2026 Sénégal'],
    faqs: [
      { q: 'Quelle est la garantie sur les smartphones ?', a: 'Tous nos smartphones sont garantis 12 mois minimum par le constructeur.' },
      { q: 'Puis-je payer à la livraison ?', a: 'Oui, nous acceptons le paiement à la livraison, Wave, Orange Money et Free Money.' },
      { q: 'Livrez-vous en dehors de Dakar ?', a: 'Oui, nous livrons partout au Sénégal. Délai de 3-5 jours ouvrés pour les régions.' },
    ],
  },
  ordinateurs: {
    title: 'Ordinateurs Portables Dakar — PC Portable Pas Cher | Sénégal',
    description: 'Achetez un ordinateur portable au meilleur prix à Dakar, en ligne avec livraison au Sénégal. PC gamer, bureautique ou ultrabook au bon prix.',
    descriptionLong: 'Du PC portable pas cher pour les études aux laptops plus puissants pour le travail, nous avons un ordinateur pour chaque usage et chaque budget. Chaque machine est neuve, sous garantie, avec facture officielle et livraison rapide à Dakar.',
    h1: 'Laptops & Ordinateurs Portables',
    keywords: ['ordinateur portable Dakar', 'PC portable pas cher Sénégal', 'ordinateur portable prix Sénégal', 'PC gamer Dakar', 'ordinateur bureautique Sénégal', 'acheter ordinateur en ligne Dakar'],
    faqs: [
      { q: 'Les laptops sont-ils neufs ou reconditionnés ?', a: 'Tous nos laptops sont neufs, sous emballage d\'origine avec facture officielle.' },
      { q: 'Proposez-vous des PC gaming ?', a: 'Oui, nous avons une large sélection de laptops gaming MSI, Asus ROG, Lenovo Legion.' },
    ],
  },
  gaming: {
    title: 'Gaming à Dakar — PC, Manettes & Accessoires | Tekalis',
    description: 'PC gaming, manettes de jeux vidéo et accessoires gaming à Dakar : consoles et setup complet pour gamers, livrés rapidement au Sénégal.',
    descriptionLong: 'Le setup de vos rêves démarre ici : PC gaming performant, manettes pour tous les styles de jeu et accessoires gaming de qualité. Nos conseillers vous aident à composer votre configuration, avec livraison rapide dans toute la région de Dakar.',
    h1: 'Gaming & Jeux Vidéo',
    keywords: ['PC gaming Dakar', 'manette jeux vidéo Dakar', 'accessoires gaming Dakar'],
    faqs: [
      { q: 'La PS5 est-elle disponible en stock ?', a: 'Consultez notre stock en temps réel. Nous réapprovisionnons régulièrement.' },
    ],
  },
  tv: {
    title: 'Smart TV Dakar — Téléviseurs 4K Pas Chers | Sénégal',
    description: 'Télévisions pas chères et Smart TV 4K à Dakar, avec livraison rapide et installation au Sénégal. Le home cinéma maison devient simple.',
    descriptionLong: 'De la petite Smart TV de chambre au grand écran du salon, chaque téléviseur est neuf, vérifié et livré avec soin à Dakar. Un large choix de tailles, du 32 au 85 pouces, au prix le plus juste du marché sénégalais.',
    h1: 'Téléviseurs & TV',
    keywords: ['Smart TV Dakar', 'TV 4K prix Sénégal', 'télévision pas cher Dakar', 'home cinéma Dakar'],
    faqs: [
      { q: 'Livrez-vous les grandes TV ?', a: 'Oui, nous livrons tous les formats. Des équipes spécialisées s\'occupent des très grandes dalles.' },
    ],
  },
  electromenager: {
    title: 'Électroménager Dakar — Réfrigérateurs & Machines à Laver',
    description: 'Réfrigérateurs pas chers, machines à laver et électroménager de cuisine à Dakar. Gros et petit électroménager livrés et installés au Sénégal.',
    descriptionLong: 'Équipez toute la maison sans vous déplacer : réfrigérateurs, machines à laver, fours et petit électroménager au meilleur prix à Dakar. Nous livrons et installons vos appareils dans toute la région, garantie incluse.',
    h1: 'Électroménager',
    keywords: ['électroménager Dakar', 'réfrigérateur pas cher Dakar', 'machine à laver Dakar'],
    faqs: [],
  },
  climatiseurs: {
    title: 'Climatiseur Dakar — Inverter au Meilleur Prix | Sénégal',
    description: 'Climatiseur split ou inverter au bon prix à Dakar, livré et installé par nos techniciens au Sénégal. Rafraîchissez votre maison avec un climatiseur adapté.',
    descriptionLong: 'Le climatiseur idéal existe pour chaque pièce : split inverter économe pour la chambre, gainable pour le salon. Nous livrons, installons et entretenons votre climatisation à Dakar, avec un prix transparent et une garantie de 12 mois.',
    h1: 'Climatiseurs & Climatisation',
    keywords: ['climatiseur Dakar', 'climatiseur prix Sénégal'],
    faqs: [
      { q: 'Proposez-vous l\'installation ?', a: 'Oui, nous avons des techniciens certifiés pour l\'installation à Dakar et banlieue.' },
    ],
  },
  'energie-solaire': {
    title: 'Panneaux Solaires Dakar — Kits Énergie Solaire | Tekalis',
    description: 'Kits solaires, panneaux photovoltaïques et batteries pour maison au Sénégal. Installation professionnelle à Dakar. Énergie renouvelable, économies d\'électricité.',
    h1: 'Énergie Solaire',
    keywords: ['panneau solaire Dakar Fann', 'kit solaire Sénégal', 'énergie solaire Dakar', 'onduleur solaire Dakar', 'batterie solaire Sénégal'],
    faqs: [
      { q: 'Quelle capacité solaire pour une maison moyenne ?', a: 'Un kit 3KW suffit pour une maison de 3-4 pièces avec climatiseur. Contactez-nous pour un devis personnalisé.' },
    ],
  },
  accessoires: {
    title: 'Accessoires Téléphone Dakar — Chargeurs, Power Banks',
    description: 'Coques, chargeurs rapides, power banks et montres connectées pour votre téléphone à Dakar. Tous les accessoires tech, livrés rapidement au Sénégal.',
    descriptionLong: 'De la power bank de secours au chargeur rapide pour recharger en plein trajet, en passant par la montre connectée et les coques de protection, tout est disponible dans notre boutique en ligne. Livraison sous 24-48h à Dakar et paiement à la livraison.',
    h1: 'Accessoires & Périphériques',
    keywords: ['accessoires téléphone Dakar', 'chargeur rapide Dakar', 'power bank Dakar', 'montre connectée Dakar'],
    faqs: [],
  },
  audio: {
    title: 'Casques & Écouteurs Audio Dakar — Bluetooth | Tekalis',
    description: 'Écouteurs sans fil, casques Bluetooth et enceintes Bluetooth à Dakar pour un son de qualité au meilleur prix. Essai avant achat, garantie incluse.',
    descriptionLong: 'Des écouteurs sans fil discrets aux casques confortables, en passant par les enceintes portables, nous avons le son qu\'il vous faut. Équipements neufs, garantis et livrés rapidement à Dakar.',
    h1: 'Audio — Casques & Enceintes',
    keywords: ['écouteurs sans fil Dakar', 'casque Bluetooth Dakar', 'enceinte Bluetooth Dakar'],
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
