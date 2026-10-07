import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const metadata = {
  title: 'Gel ou lithium : quelle batterie solaire ?',
  description:
    'Comparatif batterie gel AGM vs lithium pour kit solaire : DoD, durée de vie, prix, entretien au Sénégal.',
  alternates: { canonical: '/blog/batterie-gel-ou-lithium' },
  openGraph: {
    title: 'Batterie solaire gel ou lithium ?',
    description: 'DoD, durée de vie, prix : le comparatif pour choisir ses batteries de stockage.',
    url: '/blog/batterie-gel-ou-lithium',
    type: 'article',
    images: [{ url: '/api/og?title=Batterie%20solaire%20gel%20ou%20lithium%20%3F&subtitle=DoD%2C%20duree%20de%20vie%2C%20prix', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const ARTICLE = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Batterie solaire gel ou lithium au Sénégal : laquelle choisir ?',
  description: 'Comparatif DoD, durée de vie et prix entre batteries gel et lithium.',
  datePublished: '2026-10-07',
  dateModified: '2026-10-07',
  author: { '@type': 'Organization', name: 'Tekalis Sénégal' },
  publisher: { '@type': 'Organization', name: 'Tekalis Sénégal' },
  mainEntityOfPage: '/blog/batterie-gel-ou-lithium',
};

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "Quelle batterie solaire durerait le plus longtemps au Sénégal ?", acceptedAnswer: { '@type': 'Answer', text: 'Le lithium supporte plus de cycles (typiquement 3000 à 5000) contre quelques centaines à environ 1500 pour le gel, a condition de ne jamais la décharger au-delà de 80 % et de la garder au frais.' } },
    { '@type': 'Question', name: "Quelle batterie solaire choisir avec un petit budget ?", acceptedAnswer: { '@type': 'Answer', text: 'Le gel reste la solution la moins chère a l achat pour un premier kit, si l on accepte de ne puiser que 50 % de sa capacité et un entretien simple (aeration, pas de decharge profonde).' } },
    { '@type': 'Question', name: "Peut-on mixer gel et lithium dans un meme kit ?", acceptedAnswer: { '@type': 'Answer', text: 'Non : les chimies, les tensions de charge et les profils de decharge differents ; rester sur une seule chimie pour tout le parc batterie.' } },
  ],
};

export default function GuideBatteriePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <JsonLd data={ARTICLE} />
      <JsonLd data={FAQ} />
      <Breadcrumb
        items={[
          { name: 'Accueil', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: 'Batterie gel ou lithium' },
        ]}
      />
      <article>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Batterie solaire gel ou lithium : laquelle choisir au Sénégal ?
        </h1>
        <p className="text-sm text-gray-500 mb-6">Publié le 7 octobre 2026 · Lecture 5 min · Tekalis Sénégal</p>

        <p className="mb-4">
          La batterie concentre l essentiel du coût d un kit solaire et sa durée de vie. Deux chimies
          dominent le marché sénégalais : le <strong>gel</strong> (variante du plomb-acide) et le{' '}
          <strong>lithium (LiFePO4)</strong>. Le bon choix dépend de votre budget, de votre usage et
          de la place dont vous disposez.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">DoD : ce que vous pouvez vraiment utiliser</h2>
        <p className="mb-3">
          Le DoD (Depth of Discharge) est la part de capacité que vous pouvez puiser sans abîmer la
          batterie :
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Chimie</th>
                <th className="text-right p-2">DoD</th>
                <th className="text-right p-2">Capacité utile d une 200 Ah 12V (2 400 Wh)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="p-2">Gel / AGM / plomb</td>
                <td className="text-right p-2">50 %</td>
                <td className="text-right p-2">1 200 Wh</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-2">Lithium LiFePO4</td>
                <td className="text-right p-2">80 %</td>
                <td className="text-right p-2">1 920 Wh</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4">
          Concrètement : pour couvrir 2 400 Wh utiles, il faut installer{' '}
          <strong>4 800 Wh de batterie gel</strong> (2 × 12 V 200 Ah) mais seulement{' '}
          <strong>3 000 Wh de lithium</strong> (2 400 ÷ 0,8) — et en pratique, avec des batteries
          12 V 200 Ah en stock, la version lithium garde de la marge là où le gel est juste à 100 %
          de charge.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Durée de vie et entretien</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4 text-sm">
          <li>
            <strong>Gel</strong> : quelques centaines à ~1 500 cycles selon la profondeur de
            décharge et la chaleur. Ne supporte pas les décharges profondes répétées. Entretien :
            aération, éviter la chaleur excessive, charger tôt après une coupure.
          </li>
          <li>
            <strong>Lithium</strong> : typiquement 3 000 à 5 000 cycles à 80 % de DoD. Pas d entretien,
            poids et encombrement réduits de moitié, rendement de charge plus élevé. Attention :
            il exige un BMS et un chargeur au profil lithium (les onduleurs hybrides récents le
            gèrent).
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-6 mb-2">Comparatif résumé</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Critère</th>
                <th className="text-left p-2">Gel</th>
                <th className="text-left p-2">Lithium</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100"><td className="p-2">Prix d achat</td><td className="p-2">Faible</td><td className="p-2">Élevé</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Coût par Wh utile sur la durée</td><td className="p-2">Élevé (cycles courts)</td><td className="p-2">Plus faible</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">DoD</td><td className="p-2">50 %</td><td className="p-2">80 %</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Poids / volume</td><td className="p-2">Lourd, encombrant</td><td className="p-2">Léger, compact</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Entretien</td><td className="p-2">Surveiller la décharge</td><td className="p-2">Aucun</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Idéal pour</td><td className="p-2">Petit budget, usage occasionnel</td><td className="p-2">Usage quotidien, autonomie</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-2">Notre règle de dimensionnement</h2>
        <p className="mb-3">
          Dans le configurateur, la capacité demandée est calculée ainsi :{' '}
          <strong>Wh journaliers × jours d autonomie ÷ (DoD × 0,90)</strong>. Avec une batterie gel,
          il faut donc ~2× la capacité utile ; avec une batterie lithium, ~1,4×. Le calcul se fait
          par chimie, jamais avec un DoD unique pour tout le monde.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm my-6">
          Chiffres indicatifs à valider par un technicien : le prix, la disponibilité et les garanties
          évoluent selon les fournisseurs à Dakar.
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/outils/calculateur-batterie-solaire" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold">
            Calculer ma capacité batterie
          </Link>
          <Link href="/configurateur-solaire" className="px-5 py-3 rounded-lg border border-gray-300 font-semibold">
            Configurateur complet
          </Link>
        </div>
      </article>

      <nav className="mt-8 pt-6 border-t border-gray-200 text-sm flex flex-wrap gap-4">
        <Link href="/blog/dimensionner-kit-solaire-senegal" className="text-blue-700 underline">← Dimensionner son kit</Link>
        <Link href="/blog/onduleur-hybride-ou-off-grid" className="text-blue-700 underline">→ Onduleur hybride ou off-grid ?</Link>
      </nav>
    </main>
  );
}
