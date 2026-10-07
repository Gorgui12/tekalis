import { notFound } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { buildKitPresets } from '@/lib/solar/presets';
import { fetchSolarProducts } from '@/lib/solar/serverData';
import { buildNeed, tierNeed, findMatchingKits } from '@/lib/solar/matching';
import { WARNINGS } from '@/lib/solar/constants';
import APPLIANCES from '@/lib/solar/appliances';
import { formatFcfa } from '@/lib/seo/format';
import { absoluteUrl } from '@/lib/seo/config';

const APPLIANCE_BY_ID = Object.fromEntries(APPLIANCES.map((a) => [a.id, a]));

export const revalidate = 3600;

export async function generateStaticParams() {
  return buildKitPresets().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const preset = buildKitPresets().find((x) => x.slug === slug);
  if (!preset) return { title: 'Kit solaire - Tekalis' };

  const title = preset.title.length > 60 ? `${preset.title.slice(0, 57)}...` : preset.title;
  const description = `${preset.intro} Prix indicatifs en FCFA, à faire valider par un technicien.`;
  const canonical = `/kit-solaire/${preset.slug}`;
  const ogImage = `/api/og?title=${encodeURIComponent(preset.title.slice(0, 60))}&subtitle=${encodeURIComponent('Estimation indicative, à faire valider par un technicien')}`;

  // Garde noindex : moins de 2 produits solaires en stock => page non auto-suffisante
  const products = await fetchSolarProducts();
  const eligible = products.filter((p) => ['inverter', 'battery', 'panel'].includes(p.solar?.role));

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article', images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description },
    // Les URLs d'etat (?a=...&mode=...) ne sont pas indexables :
    // la canonical pointe toujours vers l'URL nue.
    robots: eligible.length < 2 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

function computePresetKits(preset, products) {
  const baseItems = preset.items
    .map((i) => {
      const ap = APPLIANCE_BY_ID[i.id];
      if (!ap) return null;
      return { qty: i.qty, w: ap.watts, hours: i.hours, duty: ap.duty, surgeFactor: ap.surgeFactor, essential: ap.essential };
    })
    .filter(Boolean);

  const opts = { mode: preset.mode, outageHours: preset.outage || 4, autonomyDays: preset.autonomy || 1 };
  const need = buildNeed(baseItems, opts);
  const needs = {
    essentiel: buildNeed(baseItems.filter((it) => it.essential), { ...opts, autonomyDays: 0.5 }),
    recommande: need,
    confort: tierNeed(need, 'confort'),
  };
  const kits = {};
  for (const t of Object.keys(needs)) kits[t] = findMatchingKits({ products, need: needs[t] });
  return { needs, kits };
}

export default async function KitSolarPage({ params }) {
  const { slug } = await params;
  const preset = buildKitPresets().find((x) => x.slug === slug);
  if (!preset) notFound();

  const products = await fetchSolarProducts();
  const { needs, kits } = computePresetKits(preset, products);

  const active = kits.recommande;
  const profile = active?.profiles?.find((p) => p.id === 'equilibre') || active?.profiles?.[1];

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: preset.title,
    url: absoluteUrl(`/kit-solaire/${preset.slug}`),
    itemListElement: (profile?.lines || []).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${l.units} × ${l.product.name}`,
      url: absoluteUrl(`/products/${l.product.slug}`),
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Kit solaire', item: absoluteUrl('/configurateur-solaire') },
      { '@type': 'ListItem', position: 3, name: preset.label, item: absoluteUrl(`/kit-solaire/${preset.slug}`) },
    ],
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preset.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const presetLink = `/configurateur-solaire?a=${preset.items.map((i) => `${i.id}.${i.qty}.${i.hours}`).join(',')}&mode=${preset.mode}${preset.outage ? `&cut=${preset.outage}` : ''}&aut=${preset.autonomy || 1}`;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={itemList} id="kit-itemlist" />
      <JsonLd data={breadcrumb} id="kit-breadcrumb" />
      <JsonLd data={faq} id="kit-faq" />

      <Breadcrumb
        items={[
          { name: 'Accueil', path: '/' },
          { name: 'Kit solaire', path: '/configurateur-solaire' },
          { name: preset.label },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-bold mb-3">{preset.title}</h1>
      <p className="text-gray-700 mb-2">{preset.intro}</p>
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg mb-6">
        {WARNINGS.indicative}
      </p>

      {/* Dimensionnement */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Ce que couvre ce kit</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Appareil</th>
                <th className="text-right p-2">Quantité</th>
                <th className="text-right p-2">Puissance</th>
                <th className="text-right p-2">Heures / jour</th>
              </tr>
            </thead>
            <tbody>
              {preset.items.map((i) => {
                const ap = APPLIANCE_BY_ID[i.id];
                if (!ap) return null;
                return (
                  <tr key={i.id} className="border-t border-gray-100">
                    <td className="p-2">{ap.label}</td>
                    <td className="text-right p-2">{i.qty}</td>
                    <td className="text-right p-2">{ap.watts} W</td>
                    <td className="text-right p-2">{i.hours} h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="border border-gray-200 rounded-lg p-3">
            <dt className="text-gray-500 text-xs">Énergie / jour</dt>
            <dd className="font-bold">{formatFcfa(needs.recommande?.Eday)} Wh</dd>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <dt className="text-gray-500 text-xs">Tension système</dt>
            <dd className="font-bold">{needs.recommande?.Vsys} V</dd>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <dt className="text-gray-500 text-xs">Panneaux nécessaires</dt>
            <dd className="font-bold">{formatFcfa(needs.recommande?.pvNeededW)} Wc</dd>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <dt className="text-gray-500 text-xs">Autonomie</dt>
            <dd className="font-bold">{needs.recommande?.daysAutonomy} jour(s)</dd>
          </div>
        </dl>
      </section>

      {/* Niveaux */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Les trois niveaux</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['essentiel', 'Essentiel', 'Appareils essentiels, 0,5 jour'],
            ['recommande', 'Recommandé', 'Liste complète, autonomie demandée'],
            ['confort', 'Confort', '+30 % de marge, +0,5 jour'],
          ].map(([id, label, blurb]) => {
            const kit = kits[id];
            const p = kit?.profiles?.find((x) => x.id === 'equilibre') || kit?.profiles?.[1];
            return (
              <div key={id} className="border border-gray-200 rounded-lg p-3">
                <span className="font-bold block">{label}</span>
                <span className="text-xs text-gray-500 block mb-1">{blurb}</span>
                <span className="text-xs block text-gray-700 mb-1">
                  {formatFcfa(needs[id]?.Eday)} Wh/j · {formatFcfa(needs[id]?.pvNeededW)} Wc
                </span>
                <span className="font-semibold block">
                  {p?.complete ? `${formatFcfa(p.total)} FCFA` : 'Sur devis'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Produits du kit recommande */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Produits du niveau Recommandé (profil Équilibré)</h2>
        {profile?.lines?.length ? (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
            {profile.lines.map((l) => (
              <li key={l.product.slug} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <Link href={`/products/${l.product.slug}`} className="font-semibold text-blue-700 hover:underline">
                    {l.product.name}
                  </Link>
                  <span className="block text-xs text-gray-500">{l.units} unité(s) · stock {l.product.stock}</span>
                </div>
                <span className="font-semibold whitespace-nowrap">{formatFcfa(l.product.price * l.units)} F</span>
              </li>
            ))}
            <li className="flex items-center justify-between p-3 bg-gray-50 rounded-b-lg">
              <span className="font-bold text-sm">Total indicatif</span>
              <span className="font-bold">{formatFcfa(profile.total)} FCFA</span>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg">
            {WARNINGS.noExactMatch} Un technicien établira votre devis.
          </p>
        )}
        <p className="text-xs text-gray-600 mt-2">{active?.warnings?.slice(1).join(' ')}</p>
      </section>

      {/* CTA */}
      <section className="flex flex-wrap gap-3 mb-8">
        <Link href={presetLink} className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold">
          Personnaliser ce kit dans le configurateur
        </Link>
        <Link href="/configurateur-solaire" className="px-5 py-3 rounded-lg border border-gray-300 font-semibold">
          Configurateur complet
        </Link>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Questions fréquentes</h2>
        {preset.faq.map((f) => (
          <div key={f.q} className="mb-4">
            <h3 className="font-semibold mb-1">{f.q}</h3>
            <p className="text-sm text-gray-700">{f.a}</p>
          </div>
        ))}
      </section>

      {/* Liens : autres kits */}
      <section>
        <h2 className="text-lg font-bold mb-3">Autres configurations</h2>
        <ul className="flex flex-wrap gap-2">
          {buildKitPresets()
            .filter((x) => x.slug !== preset.slug)
            .slice(0, 8)
            .map((x) => (
              <li key={x.slug}>
                <Link href={`/kit-solaire/${x.slug}`} className="text-sm text-blue-700 hover:underline">
                  {x.label}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
