import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import PrixGuide from '@/components/product/PrixGuide';
import { buildBreadcrumbSchema, buildShippingDetails, buildReturnPolicy } from '@/lib/seo/jsonld';
import {
  PRIX_GUIDES,
  SITE_URL,
  getPrixGuide,
  prixGuideBreadcrumb,
} from '@/lib/utils/prixGuides';

export async function generateStaticParams() {
  return PRIX_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getPrixGuide(slug);
  if (!guide) return { title: 'Guide des prix | Tekalis Sénégal' };

  return {
    title: { absolute: guide.title },
    description: guide.metaDescription,
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
    const items = res?.data || res?.products || (Array.isArray(res) ? res : []);
    if (!Array.isArray(items)) return [];
    // Ex. guide « iPhone 11 » : on retire les 11 Pro / Pro Max, qui ont leur
    // propre guide, sans changer la source des prix (toujours l'API produits).
    const excluded = (guide.excludeTerms || []).map((term) => String(term).toLowerCase());
    if (excluded.length === 0) return items;
    return items.filter((product) => {
      const name = String(product?.name || '').toLowerCase();
      return excluded.every((term) => !name.includes(term));
    });
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
      ...(Number(p.price) > 0 ? {
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'XOF',
          priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: 'XOF' },
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: `${SITE_URL}/products/${p.slug || p._id}`,
          // Livraison + retour reels : requis pour que l'offre soit valide
          // cote merchant listing (meme politique que les fiches produit).
          shippingDetails: buildShippingDetails(Number(p.price)),
          hasMerchantReturnPolicy: buildReturnPolicy(),
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

  // Meme source que le fil d'Ariane visible (components/product/PrixGuide.jsx).
  const breadcrumbSchema = buildBreadcrumbSchema(prixGuideBreadcrumb(guide));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}
      {guide.faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <PrixGuide guide={guide} products={products} />
    </>
  );
}