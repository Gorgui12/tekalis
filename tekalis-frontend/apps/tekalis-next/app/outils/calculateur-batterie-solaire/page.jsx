export const metadata = {
  title: 'Calculateur batterie solaire - Tekalis',
  description: 'Calcul indicatif de capacité batterie solaire. Estimation à valider par technicien.',
  alternates: { canonical: '/outils/calculateur-batterie-solaire' },
};

export default function BatterieCalcPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Calculateur de batterie solaire</h1>
      <p className="text-gray-600 mb-6">Outil indicatif basé sur le moteur Tekalis.</p>
      <a href="/configurateur-solaire" className="text-blue-600 underline">Voir le configurateur complet</a>
    </main>
  );
}