import Link from 'next/link';
import ToolCalculator from '@/components/solar/ToolCalculator';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumb from '@/components/seo/Breadcrumb';

export const metadata = {
  title: 'Calculateur panneaux solaires - Tekalis',
  description:
    'Calculez la puissance en watts crête de panneaux solaires nécessaire et le nombre de panneaux 450Wc. Outil gratuit Tekalis Sénégal.',
  alternates: { canonical: '/outils/calculateur-panneaux-solaires' },
  openGraph: {
    title: 'Calculateur panneaux solaires - Tekalis',
    description: 'Wc, nombre de panneaux et influence de l ensoleillement (PSH) : le calcul expliqué.',
    url: '/outils/calculateur-panneaux-solaires',
    type: 'website',
    images: [{ url: '/api/og?title=Calculateur%20panneaux%20solaires&subtitle=Wc%20et%20nombre%20de%20panneaux', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const HOW_TO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Calculer la puissance de panneaux solaires nécessaire',
  step: [
    { '@type': 'HowToStep', name: 'Saisir linténergie journalière', text: 'Entrez votre consommation quotidienne en Wh.' },
    { '@type': 'HowToStep', name: 'Choisir lensoleillement', text: 'Puisage prudent à 5 h ou valeur PVGIS de votre ville (Dakar 6,16 h, Saint-Louis 6,47 h...).' },
    { '@type': 'HowToStep', name: 'Lire les Wc et le nombre de panneaux', text: 'Wc = (Wh/j ÷ 0,90) ÷ (PSH × 0,75) ; le nombre de panneaux = Wc ÷ 450 Wc arrondi au supérieur.' },
  ],
};

export default function PanneauxCalcPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={HOW_TO} />
      <Breadcrumb
        items={[
          { name: 'Accueil', path: '/' },
          { name: 'Outils', path: '/outils/calculateur-panneaux-solaires' },
          { name: 'Calculateur panneaux' },
        ]}
      />
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Calculateur de panneaux solaires</h1>
      <p className="text-gray-700 mb-5">
        La puissance des panneaux (en watts crête, Wc) doit recharger les batteries et alimenter vos
        appareils chaque jour. Elle dépend de votre consommation, mais aussi de l ensoleillement de
        votre ville : c est la donnée qui change le plus d une région à l autre au Sénégal.
      </p>

      <ToolCalculator tool="panneaux" />

      <section className="mt-8 text-sm text-gray-700 space-y-3">
        <h2 className="font-bold text-base">D où viennent ces chiffres ?</h2>
        <p>
          <strong>PSH</strong> (Peak Sun Hours, heures de plein soleil équivalent) : somme du
          rayonnement rapportée à 1 000 W/m². Nos valeurs viennent de{' '}
          <strong>PVGIS</strong> (Commission européenne, année 2020) : Dakar 6,16 h, Thiès 6,30 h,
          Saint-Louis 6,47 h, Kaolack 6,40 h, Ziguinchor 5,98 h. Par prudence, le dimensionnement
          utilise 5,00 h : le rayonnement moyen n est pas une garantie contre les jours de pluie.
        </p>
        <p>
          <strong>PR 0,75</strong> (Performance Ratio) : pertes liées à la poussière, la chaleur des
          câbles et les angles. En saison sèche, un nettoyage régulier des panneaux améliore ce
          rendement.
        </p>
        <p>
          Pour un foyer à Dakar qui consomme 2 000 Wh/jour : (2 000 ÷ 0,90) ÷ (5,00 × 0,75) ≈{' '}
          <strong>593 Wc</strong>, soit <strong>2 panneaux 450 Wc</strong>.
        </p>
        <p>
          Voir aussi le{' '}
          <Link href="/outils/calculateur-batterie-solaire" className="text-blue-700 underline">
            calculateur de batterie
          </Link>{' '}
          et le{' '}
          <Link href="/kit-solaire/kit-solaire-5000w" className="text-blue-700 underline">
            kit solaire 5000W
          </Link>
          .
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/configurateur-solaire" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold">
          Dimensionner mon kit solaire
        </Link>
        <Link href="/outils/calculateur-batterie-solaire" className="px-5 py-3 rounded-lg border border-gray-300 font-semibold">
          ← Calculateur batterie
        </Link>
      </div>
    </main>
  );
}
