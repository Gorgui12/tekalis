import Link from 'next/link';
import ToolCalculator from '@/components/solar/ToolCalculator';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const metadata = {
  title: 'Calculateur batterie solaire - Tekalis',
  description:
    'Calculez la capacité de batterie solaire nécessaire en Wh et Ah selon votre autonomie. Outil gratuit Tekalis Sénégal.',
  alternates: { canonical: '/outils/calculateur-batterie-solaire' },
  openGraph: {
    title: 'Calculateur batterie solaire - Tekalis',
    description: 'Wh, ampères-heures et nombre de batteries 12V : le calcul expliqué.',
    url: '/outils/calculateur-batterie-solaire',
    type: 'website',
    images: [{ url: '/api/og?title=Calculateur%20batterie%20solaire&subtitle=Capacite%20Wh%2C%20Ah%20et%20autonomie', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const HOW_TO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Calculer sa capacité de batterie solaire',
  step: [
    { '@type': 'HowToStep', name: 'Saisir linténergie journalière', text: 'Entrez votre consommation quotidienne en Wh (voir le calculateur de consommation).' },
    { '@type': 'HowToStep', name: 'Choisir lautonomie', text: 'Nombre de jours sans soleil que les batteries doivent couvrir (1 jour dans la majorité des cas).' },
    { '@type': 'HowToStep', name: 'Lire Wh et Ah', text: 'La capacité Wh = (Wh/j × jours) ÷ (DoD × rendement) ; les Ah = Wh ÷ tension système.' },
  ],
};

export default function BatterieCalcPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={HOW_TO} />
      <Breadcrumb
        items={[
          { name: 'Accueil', path: '/' },
          { name: 'Outils', path: '/outils/calculateur-batterie-solaire' },
          { name: 'Calculateur batterie' },
        ]}
      />
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Calculateur de batterie solaire</h1>
      <p className="text-gray-700 mb-5">
        La batterie est le cœur du stockage : elle doit couvrir vos appareils pendant les jours sans
        soleil, sans être déchargée au-delà de sa limite (DoD). Ce calculateur donne la capacité en
        Wh et en Ah, puis un exemple de nombre de batteries 12 V.
      </p>

      <ToolCalculator tool="batterie" />

      <section className="mt-8 text-sm text-gray-700 space-y-3">
        <h2 className="font-bold text-base">Gel ou lithium : quel DoD ?</h2>
        <p>
          Une batterie <strong>gel ou AGM</strong> ne doit pas descendre sous 50 % de sa capacité
          (DoD 0,5) pour durer. Une batterie <strong>lithium</strong> supporte 80 % (DoD 0,8) :
          pour la même énergie utile, il faut donc moins de capacité en lithium — mais son prix
          unitaire est plus élevé.
        </p>
        <p>
          Le rendement de l onduleur (0,90 dans nos calculs) prélève aussi 10 % : une batterie de
          5 000 Wh ne restitue que 4 500 Wh en 220 V.
        </p>
        <p>
          Exemple : 2 000 Wh/jour, 1 jour d autonomie, DoD 50 % → 4 445 Wh, soit{' '}
          <strong>186 Ah en 24 V</strong> (2 batteries 12 V 200 Ah en série, avec de la marge).
        </p>
        <p>
          Voir aussi le{' '}
          <Link href="/outils/calculateur-panneaux-solaires" className="text-blue-700 underline">
            calculateur de panneaux
          </Link>{' '}
          et{' '}
          <Link href="/kit-solaire/kit-solaire-foyer" className="text-blue-700 underline">
            kit solaire pour foyer
          </Link>
          .
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/configurateur-solaire" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold">
          Dimensionner mon kit solaire
        </Link>
        <Link href="/outils/calculateur-consommation-electrique" className="px-5 py-3 rounded-lg border border-gray-300 font-semibold">
          ← Calculateur consommation
        </Link>
      </div>
    </main>
  );
}
