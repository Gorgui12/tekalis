import './globals.css';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import Providers from '@/components/shared/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const fontBody = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL('https://tekalis.com'),
  title: {
    default: 'Tekalis — Boutique Électronique & High-Tech au Sénégal | Dakar',
    template: '%s | Tekalis Sénégal',
  },
  description:
    'Tekalis, votre spécialiste en électronique et high-tech à Dakar. Ordinateurs, smartphones, TV, électroménager. Livraison rapide au Sénégal. Prix compétitifs, garantie incluse.',
  keywords: [
    'électronique Sénégal', 'high-tech Dakar', 'ordinateur portable', 'smartphone Dakar',
    'TV Dakar', 'électroménager Sénégal', 'boutique tech Dakar', 'Tekalis',
  ],
  authors: [{ name: 'Tekalis' }],
  creator: 'Tekalis',
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: 'https://tekalis.com',
    siteName: 'Tekalis',
    title: 'Tekalis — Électronique & High-Tech au Sénégal',
    description: 'Smartphones, laptops, TV, électroménager à Dakar. Livraison rapide, garantie incluse.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tekalis',
    title: 'Tekalis — Électronique & High-Tech Sénégal',
    description: 'Ordinateurs, smartphones, TV et accessoires tech à Dakar.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: 'google3f11c8471493d46b',
  },
};

// Schema.org LocalBusiness - Optimisé Géo-SEO Dakar/Fann
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Tekalis - Boutique Électronique Dakar',
  alternateName: 'Tekalis Sénégal',
  description: 'Boutique spécialisée en électronique et high-tech à Dakar, Sénégal. Ordinateurs, smartphones, TV, électroménager. Livraison rapide dans toute la région de Dakar.',
  url: 'https://tekalis.com',
  logo: 'https://tekalis.com/og-image.png',
  image: 'https://tekalis.com/og-image.png',
  telephone: '+221786346946',
  email: 'contact@tekalis.com',
  priceRange: '$$',
  currenciesAccepted: 'XOF',
  paymentAccepted: 'Cash, Mobile Money, Wave, Orange Money, Free Money, Carte bancaire',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Fann, Rue 14',
    addressLocality: 'Dakar',
    addressRegion: 'Dakar',
    postalCode: 'BP 12345',
    addressCountry: 'SN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '14.6928',
    longitude: '-17.4467',
  },
  areaServed: [
    {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: '14.6928',
        longitude: '-17.4467',
      },
      geoRadius: '50000',
    },
    {
      '@type': 'City',
      name: 'Dakar',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Région de Dakar',
    },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '17:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Catalogue Tekalis',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Smartphones' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Ordinateurs portables' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Téléviseurs' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Électroménager' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Accessoires tech' } },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: [
    'https://www.facebook.com/share/14MikMhjFhA/',
    'https://www.instagram.com/_tekalis_',
    'https://twitter.com/tekalis',
    'https://linkedin.com/company/tekalis',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="//tekalis.onrender.com" />
        <meta name="theme-color" content="#f59e0b" />
      </head>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <body className="bg-white dark:bg-surface-950 text-surface-900 dark:text-surface-50 font-body antialiased">
        <Providers>
          <div className="pt-[100px]">
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}