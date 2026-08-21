import Link from "next/link";
import { FaTruck, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaBoxOpen, FaPhoneAlt } from "react-icons/fa";

const zones = [
  { zone: "Dakar Centre, Plateau, Fann, Mermoz", delai: "24h", frais: "1 500 FCFA" },
  { zone: "SICAP, Liberté, Point E, Fass", delai: "24h", frais: "1 500 FCFA" },
  { zone: "Almadies, Yoff, Ngor, Ouakam", delai: "24 - 48h", frais: "2 000 FCFA" },
  { zone: "Parcelles Assainies, Grand Yoff", delai: "24 - 48h", frais: "2 000 FCFA" },
  { zone: "Banlieue (Pikine, Guédiawaye, Rufisque)", delai: "48h", frais: "2 500 FCFA" },
];

const steps = [
  {
    icon: <FaBoxOpen />,
    title: "1. Préparation",
    text: "Votre commande est préparée et vérifiée sous 2 à 4 heures après validation.",
  },
  {
    icon: <FaTruck />,
    title: "2. Expédition",
    text: "Un livreur prend en charge votre colis. Vous êtes notifié par email.",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "3. Réception & paiement",
    text: "Vérifiez le produit devant le livreur, puis payez en espèces ou via mobile money.",
  },
];

export const metadata = {
  title: "Livraison — Zones, délais et tarifs | Tekalis",
  description:
    "Livraison rapide à Dakar et au Sénégal : délais 24-48h, paiement à la livraison, livraison offerte dès 50 000 FCFA. Détail des zones et tarifs par quartier.",
  alternates: { canonical: "https://tekalis.com/livraison" },
};

export default function LivraisonPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaTruck className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Livraison</h1>
          <p className="text-lg text-gray-600">
            Rapide, suivie et disponible dans toute la région de Dakar
          </p>
        </div>

        {/* Points clés */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaClock className="text-3xl text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">24 - 48h</h3>
            <p className="text-sm text-gray-600">Délai moyen à Dakar et banlieue</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaMoneyBillWave className="text-3xl text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Offerte dès 50 000 FCFA</h3>
            <p className="text-sm text-gray-600">Livraison gratuite au-delà de ce montant</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaMapMarkerAlt className="text-3xl text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Tout Dakar</h3>
            <p className="text-sm text-gray-600">Centre, banlieue et environs</p>
          </div>
        </div>

        {/* Étapes */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment ça se passe ?</h2>
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {steps.map((step) => (
            <div key={step.title} className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl mb-4">
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Zones et tarifs */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Zones et tarifs</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <th className="text-left px-6 py-4 font-semibold">Zone</th>
                  <th className="text-left px-6 py-4 font-semibold">Délai</th>
                  <th className="text-left px-6 py-4 font-semibold">Frais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {zones.map((z) => (
                  <tr key={z.zone} className="hover:bg-blue-50/50 transition">
                    <td className="px-6 py-4 text-gray-800">{z.zone}</td>
                    <td className="px-6 py-4 text-gray-600">{z.delai}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{z.frais}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-6 py-4 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
            Tarifs indicatifs pour une commande standard. Le montant exact s'affiche
            au moment du checkout avant validation.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Prêt à commander ?</h2>
            <p className="opacity-90">
              Une question sur la livraison de votre zone ? Appelez-nous.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:+221786346946"
              className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition whitespace-nowrap"
            >
              <FaPhoneAlt /> +221 78 634 69 46
            </a>
            <Link
              href="/products"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition text-center"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
