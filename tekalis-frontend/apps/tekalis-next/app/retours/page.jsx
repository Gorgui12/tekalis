import Link from "next/link";
import { FaUndoAlt, FaCheckCircle, FaTimesCircle, FaClipboardList, FaMoneyBillWave, FaHeadset } from "react-icons/fa";

const conditions = [
  { ok: true, text: "Produit retourné dans un délai de 7 jours après réception" },
  { ok: true, text: "Produit neuf, non utilisé, non endommagé" },
  { ok: true, text: "Emballage d'origine, accessoires et facture inclus" },
  { ok: false, text: "Produits déballés à usage personnel (écouteurs intra-auriculaires, etc.)" },
  { ok: false, text: "Oxydation, casse ou dommages causés après réception" },
];

const steps = [
  {
    icon: <FaClipboardList />,
    title: "1. Ouvrez une demande RMA",
    text: "Depuis votre espace client, rubrique SAV, sélectionnez la commande concernée et indiquez le motif du retour.",
  },
  {
    icon: <FaHeadset />,
    title: "2. Validation sous 48h",
    text: "Notre équipe SAV étudie votre demande et vous communique la procédure et l'adresse de retour.",
  },
  {
    icon: <FaUndoAlt />,
    title: "3. Expédiez le produit",
    text: "Renvoyez le produit complet dans son emballage d'origine, accompagné de la facture.",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "4. Remboursement",
    text: "Après contrôle, vous êtes remboursé sous 7 jours ouvrables via votre moyen de paiement initial.",
  },
];

export const metadata = {
  title: "Retours & Remboursements | Tekalis",
  description:
    "Politique de retour tekalis.com : retour sous 7 jours, procédure RMA simple depuis votre espace client, remboursement sous 7 jours ouvrables.",
  alternates: { canonical: "https://tekalis.com/retours" },
};

export default function RetoursPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaUndoAlt className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Retours &amp; Remboursements
          </h1>
          <p className="text-lg text-gray-600">
            Un souci avec votre commande ? Nous simplifions les retours.
          </p>
        </div>

        {/* Résumé */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 mb-12 text-white">
          <p className="text-lg leading-relaxed">
            Vous disposez de <strong>7 jours</strong> après réception pour demander
            un retour d'un produit non utilisé, dans son emballage d'origine. Le
            remboursement est effectué sous <strong>7 jours ouvrables</strong> après
            réception et validation du produit par notre équipe.
          </p>
        </div>

        {/* Procédure */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Procédure de retour</h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {steps.map((step) => (
            <div key={step.title} className="bg-white rounded-lg shadow-md p-6 flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
                {step.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Conditions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Conditions d'éligibilité</h2>
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <ul className="space-y-3">
            {conditions.map((c) => (
              <li key={c.text} className="flex items-start gap-3">
                {c.ok ? (
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                )}
                <span className={c.ok ? "text-gray-700" : "text-gray-500"}>{c.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Produit défectueux */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Produit défectueux ou non conforme ?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Si votre produit présente un défaut de fonctionnement, il relève de la{" "}
            <Link href="/garanties" className="text-blue-600 hover:underline font-semibold">
              garantie
            </Link>{" "}
            plutôt que du retour standard. Ouvrez une demande SAV depuis votre espace
            client : après diagnostic, le produit sera réparé, remplacé ou remboursé.
          </p>
          <p className="text-sm text-gray-500">
            Les frais de retour d'un produit défectueux sont pris en charge par Tekalis.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Besoin d'ouvrir un retour ?</h2>
          <p className="opacity-90 mb-6">
            Connectez-vous à votre espace client ou contactez notre service client.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/rma"
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Mon espace SAV
            </Link>
            <a
              href="mailto:contact@tekalis.com"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition"
            >
              contact@tekalis.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
