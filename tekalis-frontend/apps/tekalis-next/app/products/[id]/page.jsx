import { permanentRedirect } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import ProductDetailClient from '@/components/product/ProductDetailClient';
import ProductSeoContent from '@/components/product/ProductSeoContent';

const SITE_URL = 'https://tekalis.com';

const BLOCKED_STATUSES = new Set(['discontinued']);

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product || product === "not-found") return {};

    const path = product.slug || id;
    const productUrl = `${SITE_URL}/products/${path}`;
    const primaryImage = product.images?.[0]?.url || product.image || '';
    const priceStr = product.price?.toLocaleString('fr-FR');

    return {
      title: `Prix ${product.name} à Dakar — ${priceStr} FCFA | Tekalis Sénégal`,
      description:
        product.metaDescription ||
        `En stock à Dakar : ${product.name} au prix de ${priceStr} FCFA. ` +
        `Livraison rapide au Sénégal, garantie incluse. ` +
        `Paiement à la livraison, Wave, Orange Money. Commandez en ligne.`,
      keywords: [
        `${product.name} Dakar`,
        `${product.name} Sénégal`,
        `prix ${product.name} fcfa`,
        `${product.name} prix`,
        `acheter ${product.name} Dakar`,
        product.brand ? `${product.brand} Dakar` : null,
        product.brand ? `${product.brand} Sénégal` : null,
      ].filter(Boolean),
      alternates: { canonical: productUrl },
      openGraph: {
        type: 'website',
        title: `Prix ${product.name} à Dakar — ${priceStr} FCFA | Tekalis`,
        description: product.metaDescription || product.description?.substring(0, 160) || '',
        url: productUrl,
        siteName: 'Tekalis Sénégal',
        locale: 'fr_SN',
        images: primaryImage ? [{ url: primaryImage, width: 800, height: 800, alt: product.name }] : [],
      },
    };
  } catch {
    return {};
  }
}

export const revalidate = 3600;

export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await fetchProduct(id);

  if (product === "not-found") {
    permanentRedirect('/products');
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-6">
            Une erreur est survenue lors du chargement du produit. Veuillez réessayer.
          </p>
          <a href="/products" className="text-blue-600 hover:underline">
            Voir tous les produits
          </a>
        </div>
      </div>
    );
  }

  if (BLOCKED_STATUSES.has(product.status)) {
    permanentRedirect('/products');
  }

  if (product.slug && product.slug !== id) {
    permanentRedirect(`/products/${product.slug}`);
  }

  const productPath = product.slug || product._id;
  const productUrl = `${SITE_URL}/products/${productPath}`;
  const primaryImage = product.images?.[0]?.url || product.image || '';
  const allImages = (product.images || []).map((img) => img.url || img).filter(Boolean);

  // Avis approuvés (utilisés pour les champs review + aggregateRating requis par Google)
  const reviewsData = await fetchReviews(product._id);
  const reviewItems = (reviewsData?.reviews || [])
    .slice(0, 5)
    .map((rev) => ({
      '@type': 'Review',
      ...(rev.title ? { name: rev.title } : {}),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        '@type': 'Person',
        name: rev.user?.name || (rev.isVerified ? 'Acheteur vérifié' : 'Client Tekalis'),
      },
      ...(rev.createdAt
        ? { datePublished: new Date(rev.createdAt).toISOString().split('T')[0] }
        : {}),
      ...(rev.comment ? { reviewBody: rev.comment } : {}),
    }));

  // Produits de la même catégorie — rendus côté serveur pour le maillage interne
  const related = await fetchRelated(product.category?.[0]?._id);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: allImages.length > 0 ? allImages : primaryImage ? [primaryImage] : undefined,
    description: product.description || product.metaDescription || '',
    sku: product._id,
    mpn: product.mpn || product._id,
    ...(product.gtin ? { gtin: product.gtin } : {}),
    ...(product.specs && Object.keys(product.specs).length > 0 ? {
      additionalProperty: Object.entries(product.specs)
        .map(([key, value]) => ({
          '@type': 'PropertyValue',
          name: key,
          value: String(value),
        })),
    } : {}),
    brand: { '@type': 'Brand', name: product.brand || 'Tekalis' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'XOF',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Tekalis',
        url: SITE_URL,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'SN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price >= 50000 ? 0 : 2500,
          currency: 'XOF',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'SN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
        },
      },
    },
    ...(product.rating && product.rating.count > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.average,
        bestRating: 5,
        worstRating: 1,
        reviewCount: product.rating.count,
      },
    } : {}),
    ...(reviewItems.length > 0 ? { review: reviewItems } : {}),
    category: product.category?.[0]?.name || product.category?.[0] || '',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Produits', item: `${SITE_URL}/products` },
      ...(product.category?.[0] ? [{
        '@type': 'ListItem',
        position: 3,
        name: product.category[0].name || product.category[0],
        item: `${SITE_URL}/category/${product.category[0].slug || ''}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: product.category?.[0] ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* H1 server-rendered : la fiche produit est un client component, cf. RSC / HW curl. */}
      <h1 className="sr-only">{product.name}</h1>
      <ProductDetailClient product={product} />
      <ProductSeoContent product={product} related={related} />
    </>
  );
}

async function fetchRelated(categoryId) {
  if (!categoryId) return [];
  try {
    const res = await serverFetch(`/products?category=${categoryId}&limit=8`);
    const list = res?.data || res?.products || res || [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function fetchProduct(id) {
  try {
    const res = await serverFetch(`/products/${id}`);
    return res?.data || res || null;
  } catch (err) {
    const msg = err?.message || "";
    const m = msg.match(/^API (\d+):/);
    if (m && Number(m[1]) === 404) return "not-found";
    return null;
  }
}

async function fetchReviews(productId) {
  try {
    const res = await serverFetch(`/reviews/${productId}?limit=5`);
    return res || null;
  } catch {
    return null;
  }
}