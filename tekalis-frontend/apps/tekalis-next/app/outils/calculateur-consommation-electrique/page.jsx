import Link from 'next/link';
import ToolCalculator from '@/components/solar/ToolCalculator';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { absoluteUrl } from '@/lib/seo/config';

export const metadata = {
  title: 'Calculateur consommation électrique - Tekalis',
  description:
    'Calculez la consommation journalière de vos appareils en Wh. Outil gratuit basé sur les règles de dimensionnement Tekalis Sénégal.',
  alternates: { canonical: '/outils/calculateur-consommation-electrique' },
  openGraph: {
    title: 'Calculateur consommation électrique - Tekalis',
    description: 'Additionnez vos appareils et obtenez vos Wh par jour, en FCFA.',
    url: '/outils/calculateur-consommation-electrique',
    type: 'website',
    images: [{ url: '/api/og?title=Calculateur%20consommation%20electrique&subtitle=Wh%2Fjour%20et%20puissance%20a%20installer', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const HOW_TO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Calculer sa consommation électrique journalière',
  step: [
    { '@type': 'HowToStep', name: 'Saisir les quantités', text: 'Indiquez le nombre d appareils de chaque type utilisés par jour.' },
    { '@type': 'HowToStep', name: 'Lire le total en Wh', text: 'La somme (quantité × watts × heures × duty) donne votre consommation journalière en Wh.' },
    { '@type': 'HowToStep', name: 'Passer au configurateur', text: 'Utilisez ce total dans le configurateur solaire pour dimensionner panneaux et batteries.' },
  ],
};

export default function ConsoCalcPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={HOW_TO} />
      <Breadcrumb
        items={[
          { name: 'Accueil', path: '/' },
          { name: 'Outils', path: '/outils/calculateur-consommation-electrique' },
          { name: 'Calculateur consommation' },
        ]}
      />
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Calculateur de consommation électrique</h1>
      <p className="text-gray-700 mb-5">
        Additionnez les appareils que vous utilisez chaque jour pour obtenir votre consommation en
        watt-heures (Wh). C est la première étape avant de choisir un kit solaire : elle détermine
        la taille des batteries et la puissance des panneaux.
      </p>

      <ToolCalculator tool="consommation" />

      <section className="mt-8 text-sm text-gray-700 space-y-3">
        <h2 className="font-bold text-base">Comment lire le résultat ?</h2>
        <p>
          <strong>Wh/jour</strong> : énergie consommée en une journée. Un foyer sénégalais typique
          (éclairage LED, TV, décodeur, routeur, réfrigérateur) se situe entre 1 500 et 3 000 Wh.
        </p>
        <p>
          Le <strong>duty</strong> (facteur de fonctionnement) explique pourquoi un réfrigérateur de
          150 W ne consomme pas 3 600 Wh par jour : son compresseur tourne par intermittence
          (environ 40 % du temps, soit 1 440 Wh).
        </p>
        <p>
          Pour la puissance des panneaux, le duty ne s applique pas de la même façon : passez au{' '}
          <Link href="/outils/calculateur-panneaux-solaires" className="text-blue-700 underline">
            calculateur de panneaux
          </Link>{' '}
          ou au{' '}
          <Link href="/configurateur-solaire" className="text-blue-700 underline">
            configurateur complet
          </Link>
          .
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/configurateur-solaire" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold">
          Dimensionner mon kit solaire
        </Link>
        <Link href="/outils/calculateur-batterie-solaire" className="px-5 py-3 rounded-lg border border-gray-300 font-semibold">
          Calculateur batterie →
        </Link>
      </div>
    </main>
  );
}
