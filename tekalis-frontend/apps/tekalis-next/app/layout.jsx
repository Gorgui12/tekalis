import './globals.css';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import Providers from '@/components/shared/Providers';
import AnalyticsProvider from '@/components/shared/AnalyticsProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import AuthPromptHost from '@/components/auth/AuthPromptHost';
import JsonLd from '@/components/seo/JsonLd';
import {
  SITE_URL,
  SITE_NAME,
  SITE_LOCALE,
  SITE_LANG,
  CONTACT,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
  LOGO_URL,
  SAME_AS,
  absoluteUrl,
} from '@/lib/seo/config';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/seo/jsonld';

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tekalis - Boutique Electronique & High-Tech au Senegal | Dakar',
    template: '%s | Tekalis Sénégal',
  },
  description:
    'Boutique électronique et high-tech à Dakar : smartphones, ordinateurs portables, TV, électroménager, énergie solaire. Livraison 24-48h au Sénégal.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false },
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    title: 'Tekalis - Électronique & High-Tech au Sénégal',
    description:
      'Smartphones, ordinateurs portables, TV, électroménager et énergie solaire à Dakar. Livraison 24-48h, paiement à la livraison.',
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: 'Tekalis - boutique électronique à Dakar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tekalis',
    title: 'Tekalis - Électronique & High-Tech Sénégal',
    description:
      'Ordinateurs, smartphones, TV et électroménager à Dakar. Livraison 24-48h au Sénégal.',
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google3f11c8471493d46b',
  },
};

// Organization : rattache le nom "Tekalis" (requete en position 3 dans la
// baseline) a l'entite locale, avec NAP et sameAs reels.
const organizationSchema = buildOrganizationSchema();

const webSiteSchema = buildWebSiteSchema();

// LocalBusiness conserve horaires, zone desservie et catalogue.
// TODO(owner): remplacer LOGO_URL par un vrai logo 60x60+ des que disponible
// (public/ ne contient a ce jour que og-image.png).
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#localbusiness`,
  name: 'Tekalis - Boutique Electronique Dakar',
  alternateName: 'Tekalis Sénégal',
  description: organizationSchema.description,
  url: `${SITE_URL}/`,
  logo: absoluteUrl(LOGO_URL),
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  telephone: CONTACT.telephone,
  email: CONTACT.email,
  priceRange: '$$',
  currenciesAccepted: 'XOF',
  paymentAccepted: 'Cash, Mobile Money, Wave, Orange Money, Free Money, Carte bancaire',
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT.streetAddress,
    addressLocality: CONTACT.addressLocality,
    addressRegion: CONTACT.addressRegion,
    postalCode: CONTACT.postalCode,
    addressCountry: CONTACT.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: String(CONTACT.latitude),
    longitude: String(CONTACT.longitude),
  },
  areaServed: [
    {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: String(CONTACT.latitude),
        longitude: String(CONTACT.longitude),
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
      { '@type': 'OfferCatalog', name: 'Smartphones' },
      { '@type': 'OfferCatalog', name: 'Ordinateurs portables' },
      { '@type': 'OfferCatalog', name: 'Téléviseurs' },
      { '@type': 'OfferCatalog', name: 'Électroménager' },
      { '@type': 'OfferCatalog', name: 'Énergie solaire' },
      { '@type': 'OfferCatalog', name: 'Accessoires tech' },
    ],
  },
  ...(SAME_AS.length > 0 ? { sameAs: SAME_AS } : {}),
};

export default function RootLayout({ children }) {
  return (
    <html lang={SITE_LANG} suppressHydrationWarning data-scroll-behavior="smooth" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="//tekalis.onrender.com" />
        <meta name="theme-color" content="#f59e0b" />

        {/*
          ── Google Consent Mode v2 ─────────────────────────────────────
          Bootstrap de la couche donnée AVANT le moindre script de tracking.
          Tout est "denied" par défaut : aucun pixel/GA4 n'est chargé
          tant que l'utilisateur n'a pas accepté (voir lib/analytics.js).
        */}
        <script
          id="consent-mode-bootstrap"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
              });
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-surface-950 text-surface-900 dark:text-surface-50 font-body antialiased">
        {/*
          Données structurées du site — rendues serveur, donc présentes dans le
          HTML brut. Un JSON-LD injecté en next/script (afterInteractive)
          n'apparaît pas dans le HTML source et n'est pas vu par les crawlers.

          - Organization : entité locale "Tekalis" + NAP (nom de marque en position 3).
          - WebSite : SearchAction, la recherche par URL existe (/products?search=).
          - LocalBusiness : horaires, zone desservie, catalogue.
        */}
        <JsonLd id="organization-schema" data={organizationSchema} />
        <JsonLd id="website-schema" data={webSiteSchema} />
        <JsonLd id="local-business-schema" data={localBusinessSchema} />
        <Providers>
          <div className="pt-[100px]">
            <AnalyticsProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <WhatsAppButton />
              {/*
                Invitations automatiques à créer un compte (bouton Google).
                Monté ici et non dans les pages : il doit pouvoir apparaître
                au-dessus de n'importe quel écran, y compris après une
                navigation côté client.
              */}
              <AuthPromptHost />
            </AnalyticsProvider>
          </div>
        </Providers>
      </body>
    </html>
  );
}