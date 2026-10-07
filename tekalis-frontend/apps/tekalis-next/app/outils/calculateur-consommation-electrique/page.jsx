export const metadata = {
  title: 'Calculateur consommation électrique - Tekalis',
  description: 'Calculez votre consommation électrique journalière. Estimation indicative.',
  alternates: { canonical: '/outils/calculateur-consommation-electrique' },
};

export default function ConsoCalcPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Calculateur de consommation électrique</h1>
      <p className="text-gray-600 mb-6">Outil indicatif.</p>
      <a href="/configurateur-solaire" className="text-blue-600 underline">Voir le configurateur complet</a>
    </main>
  );
}