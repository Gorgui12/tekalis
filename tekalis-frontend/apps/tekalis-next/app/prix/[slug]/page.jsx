import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import PrixGuide from '@/components/product/PrixGuide';
import { PRIX_GUIDES, SITE_URL, getPrixGuide } from '@/lib/utils/prixGuides';

export async function generateStaticParams() {
  return PRIX_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getPrixGuide(slug);
  if (!guide) return { title: 'Guide des prix | Tekalis Sénégal' };

  return {
    title: guide.title,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: { canonical: `${SITE_URL}/prix/${guide.slug}` },
    openGraph: {
      type: 'website',
      title: guide.title,
      description: guide.metaDescription,
      url: `${SITE_URL}/prix/${guide.slug}`,
      siteName: 'Tekalis Sénégal',
      locale: 'fr_SN',
    },
  };
}

export const revalidate = 3600;

async function fetchGuideProducts(guide) {
  try {
    let url = '/products?limit=20&sort=price_asc';
    if (guide.search) url += `&search=${encodeURIComponent(guide.search)}`;
    if (guide.brand) url += `&brand=${encodeURIComponent(guide.brand)}`;
    if (guide.maxPrice) url += `&maxPrice=${guide.maxPrice}`;
    const res = await serverFetch(url);
    return res?.data || res?.products || (Array.isArray(res) ? res : []);
  } catch {
    return [];
  }
}

export default async function PrixGuidePage({ params }) {
  const { slug } = await params;
  const guide = getPrixGuide(slug);

  if (!guide) notFound();

  const products = await fetchGuideProducts(guide);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Prix des téléphones — ${guide.h1}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}/products/${p.slug || p._id}`,
      ...(p.price ? {
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'XOF',
          priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: 'XOF' },
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      } : {}),
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {guide.faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <PrixGuide guide={guide} products={products} />
    </>
  );
}