import { serverFetch } from "@/lib/serverFetch";
import Link from 'next/link';
import BlogClient from '@/components/blog/BlogClient';

export const metadata = {
  title: {
    absolute: 'Blog tech Sénégal — Tests, guides et actualités',
  },
  description:
    'Tests, guides d\'achat et actualités tech au Sénégal. Trouvez le meilleur smartphone, laptop ou TV adapté à votre budget à Dakar.',
  alternates: { canonical: 'https://tekalis.com/blog' },
  openGraph: {
    title: 'Blog Tech Sénégal — Tekalis',
    description: 'Tests, guides d\'achat et actualités tech au Sénégal.',
    url: 'https://tekalis.com/blog',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export const revalidate = 1800;

async function getArticles() {
  try {
    const data = await serverFetch('/articles?limit=50');
    return data?.articles || data?.data || [];
  } catch {
    // API injoignable / rate-limit au moment du build : rendu vide,
    // le client component rafraîchit les données.
    return [];
  }
}

export default async function BlogPage() {
  const articles = await getArticles();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Tekalis Blog — Tech Sénégal',
    description: 'Tests, guides d\'achat et actualités tech au Sénégal',
    url: 'https://tekalis.com/blog',
    publisher: { '@type': 'Organization', name: 'Tekalis', logo: 'https://tekalis.com/og-image.png' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* H1 server-rendered : les articles sont un client component, cf. RSC / HW curl. */}
      <h1 className="sr-only">
        Blog Tech Sénégal — tests, guides d&apos;achat et actualités tech
      </h1>

      {/* Guides solaires statiques — pas dans l&apos;API articles, donc listés ici. */}
      <nav aria-label="Guides solaires" className="max-w-6xl mx-auto px-4 pt-6">
        <h2 className="text-lg font-bold font-display mb-3">Guides solaires</h2>
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/blog/dimensionner-kit-solaire-senegal" className="inline-block border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition">
              Dimensionner son kit solaire
            </Link>
          </li>
          <li>
            <Link href="/blog/batterie-gel-ou-lithium" className="inline-block border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition">
              Batterie gel ou lithium ?
            </Link>
          </li>
          <li>
            <Link href="/blog/onduleur-hybride-ou-off-grid" className="inline-block border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-full px-4 py-1.5 hover:bg-emerald-100 transition">
              Onduleur hybride ou off-grid ?
            </Link>
          </li>
          <li>
            <Link href="/configurateur-solaire" className="inline-block border border-brand-200 bg-brand-50 text-brand-700 rounded-full px-4 py-1.5 hover:bg-brand-100 transition font-semibold">
              Configurateur solaire →
            </Link>
          </li>
        </ul>
      </nav>

      <BlogClient initialArticles={articles} />
    </>
  );
}