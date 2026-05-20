import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import ProductDetailClient from '@/components/product/ProductDetailClient';

const SITE_URL = 'https://tekalis.com';

// ── Métadonnées dynamiques — Google lit titre + description ──────────────────
export async function generateMetadata({ params }) {
  try {
    const data = await serverFetch(`/products/${params.id}`);
    const product = data?.product || data;
    if (!product) return {};

    const image = product.images?.find((i) => i.isPrimary)?.url
      || product.images?.[0]?.url
      || product.image;

    const catName = Array.isArray(product.category)
      ? product.category.map((c) => (typeof c === 'object' ? c.name : c)).join(', ')
      : product.category;

    return {
      title: `${product.name} — ${product.price?.toLocaleString('fr-FR')} FCFA à Dakar`,
      description: `Achetez ${product.name} à Dakar au prix de ${product.price?.toLocaleString('fr-FR')} FCFA. ${
        product.description?.slice(0, 120) || ''
      }... Livraison rapide au Sénégal. Garantie constructeur incluse.`,
      keywords: [
        `${product.name} Dakar`,
        `${product.name} Sénégal`,
        `acheter ${product.name} Dakar`,
        product.brand ? `${product.brand} Dakar` : null,
        product.brand ? `${product.brand} Sénégal prix` : null,
        catName,
      ].filter(Boolean),
      alternates: { canonical: `${SITE_URL}/products/${params.id}` },
      openGraph: {
        title: `${product.name} — ${product.price?.toLocaleString('fr-FR')} FCFA | Tekalis`,
        description: `Achetez ${product.name} à Dakar. Livraison rapide, garantie constructeur.`,
        images: image ? [{ url: image, width: 800, height: 600, alt: product.name }] : [],
        type: 'website',
      },
    };
  } catch {
    return { title: 'Produit | Tekalis' };
  }
}

// ── Données produit côté serveur ─────────────────────────────────────────────
async function getProduct(id) {
  try {
    const data = await serverFetch(`/products/${id}`, { revalidate: 1800 });
    return data?.product || data;
  } catch {
    return null;
  }
}

async function getRelated(product) {
  try {
    const cats = Array.isArray(product.category)
      ? product.category.map((c) => (typeof c === 'object' ? c.name : c))
      : [product.category];
    const data = await serverFetch(`/products?limit=8&category=${encodeURIComponent(cats[0])}`, { revalidate: 3600 });
    const all = data?.products || data?.data || data || [];
    return all.filter((p) => p._id !== product._id).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const related = await getRelated(product);

  // ── Schema.org Product — rich snippets Google (étoiles, prix) ─────────────
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: (product.images || []).map((i) => i.url || i).filter(Boolean),
    brand: { '@type': 'Brand', name: product.brand || 'Tekalis' },
    sku: product._id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'XOF',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product._id}`,
      seller: { '@type': 'Organization', name: 'Tekalis' },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'XOF' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'SN' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
        },
      },
    },
    ...(product.rating?.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.average,
        reviewCount: product.rating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Produits', item: `${SITE_URL}/products` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/products/${product._id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* ProductDetailClient contient toutes les interactions (panier, wishlist...) */}
      <ProductDetailClient product={product} related={related} />
    </>
  );
}