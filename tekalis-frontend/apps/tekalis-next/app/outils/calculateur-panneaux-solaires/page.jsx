export const metadata = {
  title: 'Calculateur panneaux solaires - Tekalis',
  description: 'Calcul indicatif de puissance panneaux solaires. Estimation à valider par technicien.',
  alternates: { canonical: '/outils/calculateur-panneaux-solaires' },
};

export default function PanneauxCalcPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Calculateur de panneaux solaires</h1>
      <p className="text-gray-600 mb-6">Outil indicatif.</p>
      <a href="/configurateur-solaire" className="text-blue-600 underline">Voir le configurateur complet</a>
    </main>
  );
}