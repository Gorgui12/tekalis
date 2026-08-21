import Link from "next/link";
import { FaShieldAlt, FaTools, FaExchangeAlt, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const coverages = [
  { ok: true, text: "Vices de fabrication et défauts de composants" },
  { ok: true, text: "Pannes techniques non causées par l'utilisateur" },
  { ok: true, text: "Réparation ou remplacement à neuf du produit" },
  { ok: false, text: "Casse, chute ou choc" },
  { ok: false, text: "Oxydation, contact avec des liquides" },
  { ok: false, text: "Mauvaise utilisation ou modification non autorisée" },
];

const steps = [
  {
    icon: <FaFileInvoiceDollar />,
    title: "1. Rassemblez vos justificatifs",
    text: "Numéro de commande et description précise du problème rencontré.",
  },
  {
    icon: <FaTools />,
    title: "2. Ouvrez une demande SAV",
    text: "Depuis votre espace client, rubrique « Mes garanties », ouvrez une demande. Notre équipe vous répond sous 48h.",
  },
  {
    icon: <FaExchangeAlt />,
    title: "3. Diagnostic & solution",
    text: "Après diagnostic : réparation, échange standard ou remboursement au prorata, conformément à la garantie constructeur.",
  },
];

export const metadata = {
  title: "Garanties & SAV | Tekalis",
  description:
    "Garantie constructeur sur tous les produits tekalis.com : durée, couverture, procédure SAV simple depuis votre espace client. Réparation, échange ou remboursement.",
  alternates: { canonical: "https://tekalis.com/garanties" },
};

export default function GarantiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaShieldAlt className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Garanties &amp; SAV
          </h1>
          <p className="text-lg text-gray-600">
            Achetez serein : tous nos produits sont garantis
          </p>
        </div>

        {/* Durées */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-bold text-gray-900 mb-1">Smartphones</h3>
            <p className="text-3xl font-extrabold text-blue-600 mb-1">12 mois</p>
            <p className="text-sm text-gray-600">Garantie constructeur</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-bold text-gray-900 mb-1">Laptops &amp; TV</h3>
            <p className="text-3xl font-extrabold text-blue-600 mb-1">12 mois</p>
            <p className="text-sm text-gray-600">Garantie constructeur</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-bold text-gray-900 mb-1">Accessoires</h3>
            <p className="text-3xl font-extrabold text-blue-600 mb-1">3 - 6 mois</p>
            <p className="text-sm text-gray-600">Selon le produit</p>
          </div>
        </div>

        {/* Procédure */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment activer votre garantie ?</h2>
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

        {/* Couverture */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ce que couvre la garantie</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="flex items-center gap-2 font-bold text-green-700 mb-4">
              <FaCheckCircle /> Pris en charge
            </h3>
            <ul className="space-y-3">
              {coverages.filter((c) => c.ok).map((c) => (
                <li key={c.text} className="flex items-start gap-3 text-gray-700">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="flex items-center gap-2 font-bold text-red-600 mb-4">
              <FaTimesCircle /> Non pris en charge
            </h3>
            <ul className="space-y-3">
              {coverages.filter((c) => !c.ok).map((c) => (
                <li key={c.text} className="flex items-start gap-3 text-gray-500">
                  <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Un problème avec un produit ?</h2>
          <p className="opacity-90 mb-6">
            Ouvrez une demande depuis votre espace client — réponse garantie sous 48h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/warranties"
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Mes garanties
            </Link>
            <a
              href="tel:+221786346946"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition"
            >
              +221 78 634 69 46
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
