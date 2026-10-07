import { buildKitPresets } from '@/lib/solar/presets';
import JsonLd from '@/components/seo/JsonLd';

export async function generateStaticParams() {
  const presets = buildKitPresets();
  return presets.slice(0, 10).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const slug = params?.slug;
  const presets = buildKitPresets();
  const p = presets.find(x => x.slug === slug);
  const title = p ? `${p.label} au Sénégal - Tekalis` : 'Kit solaire - Tekalis';
  const desc = 'Kit solaire avec estimation indicative. À faire valider par un technicien avant achat.';
  return {
    title,
    description: desc,
    alternates: { canonical: `/kit-solaire/${slug}` },
    openGraph: { title, description: desc, url: `/kit-solaire/${slug}`, type: 'website' },
    robots: { index: true, follow: true },
  };
}

export default async function KitSolarPage({ params }) {
  const slug = params?.slug;
  const presets = buildKitPresets();
  const p = presets.find(x => x.slug === slug);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Configurateur', url: '/configurateur-solaire' },
    ],
  };
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={itemList} />
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{p?.label || 'Kit solaire'}</h1>
      <p className="text-gray-600 mb-6">Estimation indicative - à faire valider par un technicien avant achat ou installation.</p>
      <a href="/configurateur-solaire" className="bg-blue-600 text-white px-4 py-2 rounded">Personnaliser dans le configurateur</a>
    </main>
  );
}