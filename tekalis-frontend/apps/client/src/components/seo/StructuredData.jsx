import { Helmet } from 'react-helmet-async';

/**
 * Composant Schema.org pour rich snippets Google
 * Usage: <StructuredData type="Product" data={productData} />
 */
export const StructuredData = ({ type, data }) => {
  let schema = {};

  switch (type) {
    case 'Product':
      schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.name,
        "image": data.image,
        "description": data.description,
        "brand": { "@type": "Brand", "name": data.brand || "Tekalis" },
        "offers": {
          "@type": "Offer",
          "price": data.price,
          "priceCurrency": "XOF",
          "availability": data.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": data.url
        },
        "aggregateRating": data.rating ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating.average,
          "reviewCount": data.rating.count
        } : undefined
      };
      break;

    case 'Organization':
      schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Tekalis",
        "url": "https://tekalis.com",
        "logo": "https://tekalis.com/logo.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+221-XX-XXX-XXXX",
          "contactType": "customer service",
          "areaServed": "SN",
          "availableLanguage": "French"
        },
        "sameAs": [
          "https://facebook.com/tekalis",
          "https://twitter.com/tekalis",
          "https://instagram.com/tekalis"
        ]
      };
      break;

    case 'BreadcrumbList':
      schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data.items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };
      break;

    case 'WebSite':
      schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Tekalis",
        "url": "https://tekalis.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://tekalis.com/products?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};