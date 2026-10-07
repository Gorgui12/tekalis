import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const metadata = {
  title: 'Dimensionner son kit solaire au Sénégal',
  description:
    "Méthode de calcul d'un kit solaire : énergie journalière, tension 12/24/48V, batteries et panneaux, avec exemples chiffrés.",
  alternates: { canonical: '/blog/dimensionner-kit-solaire-senegal' },
  openGraph: {
    title: 'Comment dimensionner son kit solaire au Sénégal',
    description: 'La méthode de calcul complète, avec les formules et un exemple de foyer.',
    url: '/blog/dimensionner-kit-solaire-senegal',
    type: 'article',
    images: [{ url: '/api/og?title=Dimensionner%20son%20kit%20solaire%20au%20Senegal&subtitle=Methode%20de%20calcul%20et%20exemples', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const ARTICLE = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "Comment dimensionner son kit solaire au Sénégal",
  description:
    "Méthode de calcul d'un kit solaire : énergie journalière, tension, batteries, panneaux.",
  datePublished: '2026-10-07',
  dateModified: '2026-10-07',
  author: { '@type': 'Organization', name: 'Tekalis Sénégal' },
  publisher: { '@type': 'Organization', name: 'Tekalis Sénégal' },
  mainEntityOfPage: '/blog/dimensionner-kit-solaire-senegal',
};

const FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Quelle tension pour un kit solaire au Sénégal ?', acceptedAnswer: { '@type': 'Answer', text: "12 V jusqu'à 1000 VA, 24 V jusqu'à 3000 VA, 48 V au-delà : la règle évite des courants trop élevés dans les câbles." } },
    { '@type': 'Question', name: 'Combien de batteries pour une maison ?', acceptedAnswer: { '@type': 'Answer', text: "Capacité Wh = énergie journalière × jours d'autonomie ÷ (DoD × rendement). Pour 2000 Wh/jour et 1 jour : environ 4445 Wh en DoD 50 %." } },
    { '@type': 'Question', name: 'Combien de panneaux pour 2000 Wh par jour ?', acceptedAnswer: { '@type': 'Answer', text: "Environ 593 Wc, soit 2 panneaux de 450 Wc, avec un ensoleillement prudent de 5 h et un PR de 0,75." } },
  ],
};

export default function GuideDimensionnerPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <JsonLd data={ARTICLE} />
      <JsonLd data={FAQ} />
      <Breadcrumb
        items={[
          { name: 'Accueil', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: 'Dimensionner son kit solaire' },
        ]}
      />
      <article>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Comment dimensionner son kit solaire au Sénégal
        </h1>
        <p className="text-sm text-gray-500 mb-6">Publié le 7 octobre 2026 · Lecture 6 min · Tekalis Sénégal</p>

        <p className="mb-4">
          Un kit solaire mal dimensionné se paie deux fois : trop petit, il ne couvre pas vos
          appareils ; trop grand, vous payez du matériel inutile. Voici la méthode utilisée par le
          <Link href="/configurateur-solaire" className="text-blue-700 underline"> configurateur solaire Tekalis</Link>,
          avec les chiffres à préparer avant de vous lancer.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Étape 1 : additionner votre consommation journalière</h2>
        <p className="mb-3">
          Pour chaque appareil : <strong>quantité × puissance (W) × heures d usage par jour × duty</strong>.
          Le <em>duty</em> est le temps réel de fonctionnement : un réfrigérateur de 150 W tourne par
          intermittence (environ 40 % du temps), soit 1 440 Wh par jour et non 3 600 Wh.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4">
          <p className="font-semibold mb-2">Exemple d un foyer (à Dakar) :</p>
          <ul className="space-y-1">
            <li>6 ampoules LED 10 W × 5 h = 300 Wh</li>
            <li>TV LED 70 W × 4 h = 280 Wh</li>
            <li>Décodeur 20 W × 4 h = 80 Wh</li>
            <li>Routeur 15 W × 24 h = 360 Wh</li>
            <li>Réfrigérateur 150 W × 24 h × 0,4 = 1 440 Wh</li>
            <li className="font-bold border-t border-gray-300 pt-1">Total : 2 460 Wh/jour</li>
          </ul>
        </div>
        <p className="mb-4">
          Outil : le{' '}
          <Link href="/outils/calculateur-consommation-electrique" className="text-blue-700 underline">
            calculateur de consommation
          </Link>{' '}
          fait cette somme pour vous.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Étape 2 : choisir la tension du système</h2>
        <p className="mb-3">
          La règle simple : <strong>12 V jusqu à 1 000 VA, 24 V jusqu à 3 000 VA, 48 V au-delà</strong>.
          Une tension plus élevée divise le courant pour la même puissance : à 48 V, un câble de 500 W
          ne transporte que ~10 A au lieu de ~42 A en 12 V. Moins de courant = câbles plus fins,
          pertes plus faibles.
        </p>
        <p className="mb-4">
          Conséquence pratique : les batteries 12 V se mettent en série (2 en série = 24 V,
          4 en série = 48 V). Le nombre de batteries n est pas égal au nombre de chaînes.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Étape 3 : calculer la capacité batterie</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mb-4">
          <p className="font-mono">Capacité (Wh) = (Wh/jour × jours d autonomie) ÷ (DoD × rendement)</p>
        </div>
        <p className="mb-3">
          Le <strong>DoD</strong> (Depth of Charge, décharge autorisée) dépend de la chimie : 50 % pour
          le gel et l AGM, 80 % pour le lithium. Le rendement de l onduleur (0,90) prélève 10 %.
        </p>
        <p className="mb-4">
          Exemple : 2 460 Wh/jour, 1 jour d autonomie, DoD 50 % → 2 460 ÷ (0,5 × 0,9) ={' '}
          <strong>5 467 Wh</strong>, soit <strong>228 Ah en 24 V</strong> (3 batteries 12 V 100 Ah,
          ou 2 × 200 Ah avec marge).
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Étape 4 : dimensionner les panneaux</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mb-4">
          <p className="font-mono">Puissance (Wc) = (Wh/jour ÷ rendement onduleur) ÷ (PSH × PR)</p>
        </div>
        <p className="mb-3">
          Le <strong>PSH</strong> (heures de plein soleil) varie selon la ville : Dakar 6,16 h,
          Saint-Louis 6,47 h, Ziguinchor 5,98 h (source PVGIS, Commission européenne). Par prudence,
          on dimensionne à <strong>5,00 h</strong> : les jours de pluie ne sont pas couverts par la
          moyenne annuelle. Le <strong>PR</strong> (0,75) tient compte de la poussière, de la chaleur
          et des câbles.
        </p>
        <p className="mb-4">
          Exemple : (2 460 ÷ 0,90) ÷ (5,00 × 0,75) = <strong>729 Wc</strong>, soit{' '}
          <strong>2 panneaux de 450 Wc</strong> si l onseillement est bon,{' '}
          <strong>3 en saison des pluies</strong> pour conserver de la marge.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">Étape 5 : vérifier la pointe de puissance</h2>
        <p className="mb-3">
          L onduleur ne se dimensionne pas sur la puissance moyenne mais sur la{' '}
          <strong>pointe</strong> : la somme des appareils allumés en même temps × facteur de
          simultanéité (0,7), puis +25 % de marge. Un démarrage de pompe (3×) ou de compresseur
          climatiseur (2,5×) ajoute un pic transitoire à couvrir.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm my-6">
          Toutes ces valeurs (simultanéité 0,7, PR 0,75, DoD, PSH) sont indicatives et doivent être
          validées par un technicien avant achat ou installation.
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/configurateur-solaire" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold">
            Calculer mon kit en ligne
          </Link>
          <Link href="/outils/calculateur-batterie-solaire" className="px-5 py-3 rounded-lg border border-gray-300 font-semibold">
            Calculateur batterie
          </Link>
        </div>
      </article>

      <nav className="mt-8 pt-6 border-t border-gray-200 text-sm flex flex-wrap gap-4">
        <Link href="/blog/batterie-gel-ou-lithium" className="text-blue-700 underline">→ Batterie gel ou lithium ?</Link>
        <Link href="/blog/onduleur-hybride-ou-off-grid" className="text-blue-700 underline">→ Onduleur hybride ou off-grid ?</Link>
      </nav>
    </main>
  );
}
