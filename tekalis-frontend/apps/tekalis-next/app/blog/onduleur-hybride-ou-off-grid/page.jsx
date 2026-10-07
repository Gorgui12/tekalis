import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const metadata = {
  title: 'Onduleur hybride ou off-grid ? Comparatif au Sénégal',
  description:
    "Onduleur hybride solaire vs convertisseur off-grid : différences, MPPT intégré, tension batterie, quand choisir quoi. Guide Tekalis Sénégal.",
  alternates: { canonical: '/blog/onduleur-hybride-ou-off-grid' },
  openGraph: {
    title: 'Onduleur hybride ou off-grid ?',
    description: 'MPPT intégré, recharge batterie, tension : quel onduleur pour votre kit solaire.',
    url: '/blog/onduleur-hybride-ou-off-grid',
    type: 'article',
    images: [{ url: '/api/og?title=Onduleur%20hybride%20ou%20off-grid%20%3F&subtitle=MPPT%20integre%20et%20tension%20batterie', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const ARTICLE = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Onduleur hybride ou off-grid : quel choisir au Sénégal ?',
  description: "Comparatif onduleur hybride et convertisseur off-grid pour kit solaire.",
  datePublished: '2026-10-07',
  dateModified: '2026-10-07',
  author: { '@type': 'Organization', name: 'Tekalis Sénégal' },
  publisher: { '@type': 'Organization', name: 'Tekalis Sénégal' },
  mainEntityOfPage: '/blog/onduleur-hybride-ou-off-grid',
};

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Qu est-ce qu un onduleur hybride ?', acceptedAnswer: { '@type': 'Answer', text: 'Un onduleur hybride combine dans un seul appareil : conversion 48V/24V/12V vers 220V, recharge des batteries depuis les panneaux (regulateur MPPT integre) et priorisation des sources (solaire, batterie, reseau).' } },
    { '@type': 'Question', name: 'Peut-on utiliser un convertisseur simple avec des panneaux ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, mais il faut alors un regulateur de charge separe entre les panneaux et les batteries : le convertisseur ne fait que 12V vers 220V.' } },
    { '@type': 'Question', name: 'Quelle puissance d onduleur choisir ?', acceptedAnswer: { '@type': 'Answer', text: 'Somme des appareils allumes en meme temps x facteur de simultaneite (0,7) x 1,25 de marge, et le pic de demarrage des moteurs doit etre couvert.' } },
  ],
};

export default function GuideOnduleurPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <JsonLd data={ARTICLE} />
      <JsonLd data={FAQ} />
      <Breadcrumb
        items={[
          { name: 'Accueil', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: 'Onduleur hybride ou off-grid' },
        ]}
      />
      <article>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Onduleur hybride ou convertisseur off-grid : quel choisir ?
        </h1>
        <p className="text-sm text-gray-500 mb-6">Publié le 7 octobre 2026 · Lecture 5 min · Tekalis Sénégal</p>

        <p className="mb-4">
          L onduleur est le cerveau de votre installation solaire : il convertit le courant des
          batteries (12, 24 ou 48 V) en 220 V pour vos appareils. Deux familles coexistent au
          Sénégal : l <strong>onduleur hybride</strong> (tout-en-un) et le{' '}
          <strong>convertisseur off-grid</strong> (conversion seule). Le choix conditionne la
          simplicité du câblage et le prix de l installation.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Ce que fait chaque appareil</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Fonction</th>
                <th className="text-center p-2">Hybride</th>
                <th className="text-center p-2">Convertisseur</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100"><td className="p-2">Convertir batteries → 220 V</td><td className="text-center p-2">Oui</td><td className="text-center p-2">Oui</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Recharger les batteries depuis les panneaux</td><td className="text-center p-2">Oui (MPPT intégré)</td><td className="text-center p-2">Non</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Gérer la coupe secteur / secours</td><td className="text-center p-2">Oui</td><td className="text-center p-2">Non</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Nécessite un régulateur séparé</td><td className="text-center p-2">Non</td><td className="text-center p-2">Oui</td></tr>
              <tr className="border-t border-gray-100"><td className="p-2">Prix de l ensemble</td><td className="text-center p-2">Plus élevé (un seul appareil)</td><td className="text-center p-2">Plus bas (2 appareils)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-2">Le MPPT, l argument décisif</h2>
        <p className="mb-3">
          Le <strong>MPPT</strong> (Maximum Power Point Tracking) est le régulateur intelligent qui
          extrait le maximum des panneaux et charge les batteries. Un onduleur hybride en intègre un :
          un seul appareil, un seul câblage, une seule fiche technique à vérifier.
        </p>
        <p className="mb-3">
          Un convertisseur impose un régulateur externe. Attention à la compatibilité : le régulateur
          doit supporter la tension du système (notre modèle PWM 30 A couvre 12/24 V, pas 48 V) et le
          courant des panneaux (30 A au maximum). Au-delà, il faut un MPPT de puissance supérieure.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Tension batterie : la contrainte qui guide</h2>
        <p className="mb-3">
          Rappel de la règle : <strong>12 V ≤ 1 000 VA, 24 V ≤ 3 000 VA, 48 V au-delà</strong>. Un
          convertisseur 12 V simple ne convient qu aux petits besoins (éclairage, TV, chargeurs).
          Pour un foyer complet avec frigo et climatiseur, on passe à 24 V ou 48 V — et là, un
          hybride 48 V devient le choix naturel : il accepte des batteries en chaîne de 4 × 12 V et
          limite les pertes dans les câbles.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Quand choisir quoi ?</h2>
        <ul className="list-disc pl-5 space-y-2 mb-4 text-sm">
          <li>
            <strong>Convertisseur + régulateur</strong> : petit budget, besoin ponctuel (secours
            chambre ou boutique), déjà un parc de batteries à équiper.
          </li>
          <li>
            <strong>Onduleur hybride</strong> : installation complète, usage quotidien, gestion
            coupures Senelec, envie d un seul appareil à surveiller. La majorité des kits vendus au
            Sénégal suivent cette voie.
          </li>
        </ul>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm my-6">
          Le pic de démarrage (moteurs : pompe ×3, compresseur ×2,5) doit être couvert par
          l onduleur : vérifiez la puissance de pointe, pas seulement la puissance continue.
          Estimation indicative, à faire valider par un technicien.
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/configurateur-solaire" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold">
            Dimensionner mon onduleur
          </Link>
          <Link href="/kit-solaire/kit-solaire-3000w" className="px-5 py-3 rounded-lg border border-gray-300 font-semibold">
            Voir le kit 3000W
          </Link>
        </div>
      </article>

      <nav className="mt-8 pt-6 border-t border-gray-200 text-sm flex flex-wrap gap-4">
        <Link href="/blog/dimensionner-kit-solaire-senegal" className="text-blue-700 underline">← Dimensionner son kit</Link>
        <Link href="/blog/batterie-gel-ou-lithium" className="text-blue-700 underline">→ Batterie gel ou lithium ?</Link>
      </nav>
    </main>
  );
}
