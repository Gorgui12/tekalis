import './globals.css';
import Providers from '@/components/shared/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

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

// Schema.org Organisation
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Tekalis',
  description: 'Boutique spécialisée en électronique et high-tech à Dakar, Sénégal',
  url: 'https://tekalis.com',
  logo: 'https://tekalis.com/og-image.png',
  telephone: '+221786346946',
  email: 'contact@tekalis.com',
  priceRange: '$$',
  currenciesAccepted: 'XOF',
  paymentAccepted: 'Cash, Mobile Money, Wave, Orange Money',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dakar',
    addressRegion: 'Dakar',
    addressCountry: 'SN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: '14.6928', longitude: '-17.4467' },
  openingHours: 'Mo-Fr 08:00-19:00 Sa 09:00-17:00',
  sameAs: [
    'https://www.facebook.com/share/14MikMhjFhA/',
    'https://www.instagram.com/_tekalis_',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="//tekalis.onrender.com" />
        <meta name="theme-color" content="#2563eb" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white antialiased">
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