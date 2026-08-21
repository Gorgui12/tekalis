import Link from "next/link";
import {
  FaFileContract,
  FaTags,
  FaShoppingCart,
  FaCreditCard,
  FaTruck,
  FaUndoAlt,
  FaShieldAlt,
  FaGavel,
} from "react-icons/fa";

const sections = [
  {
    id: "objet",
    title: "Objet et champ d'application",
    icon: <FaFileContract />,
    content: (
      <p>
        Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des
        relations contractuelles entre <strong>Tekalis</strong>, Fann Rue 14, Dakar,
        Sénégal, et tout client passant commande sur le site tekalis.com. Toute
        commande implique l'acceptation sans réserve des présentes CGV, qui
        prévalent sur tout autre document.
      </p>
    ),
  },
  {
    id: "prix",
    title: "Prix",
    icon: <FaTags />,
    content: (
      <>
        <p className="mb-3">
          Les prix sont indiqués en <strong>francs CFA (FCFA)</strong>, toutes taxes
          comprises, hors frais de livraison. Tekalis se réserve le droit de
          modifier ses prix à tout moment ; les produits sont facturés au tarif en
          vigueur au moment de la validation de la commande.
        </p>
        <p>
          La livraison est offerte pour toute commande d'un montant égal ou
          supérieur à 50 000 FCFA.
        </p>
      </>
    ),
  },
  {
    id: "commande",
    title: "Commande",
    icon: <FaShoppingCart />,
    content: (
      <p>
        Le client sélectionne ses produits, vérifie son panier puis renseigne ses
        informations de livraison. Un email de confirmation récapitulant la
        commande lui est adressé. Tekalis se réserve le droit d'annuler toute
        commande en cas de rupture de stock ou d'erreur manifeste sur le prix, avec
        remboursement intégral.
      </p>
    ),
  },
  {
    id: "paiement",
    title: "Paiement",
    icon: <FaCreditCard />,
    content: (
      <>
        <p className="mb-3">Les moyens de paiement acceptés sont :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Paiement à la livraison (espèces) — disponible à Dakar et banlieue</li>
          <li>Wave</li>
          <li>Orange Money</li>
          <li>Free Money</li>
        </ul>
      </>
    ),
  },
  {
    id: "livraison",
    title: "Livraison",
    icon: <FaTruck />,
    content: (
      <p>
        Les produits sont livrés à l'adresse indiquée par le client. Le délai moyen
        est de 24 à 48 heures à Dakar et environs. Consultez notre{" "}
        <Link href="/livraison" className="text-blue-600 hover:underline">
          page Livraison
        </Link>{" "}
        pour le détail des zones et délais.
      </p>
    ),
  },
  {
    id: "retours",
    title: "Droit de retour",
    icon: <FaUndoAlt />,
    content: (
      <p>
        Le client dispose d'un délai de 7 jours à compter de la réception pour
        retourner un produit dans son emballage d'origine, non utilisé. Les
        modalités détaillées sont décrites sur notre{" "}
        <Link href="/retours" className="text-blue-600 hover:underline">
          page Retours &amp; Remboursements
        </Link>
        .
      </p>
    ),
  },
  {
    id: "garanties",
    title: "Garanties",
    icon: <FaShieldAlt />,
    content: (
      <p>
        Tous les produits bénéficient de la garantie constructeur. Les conditions
        de mise en œuvre sont précisées sur notre{" "}
        <Link href="/garanties" className="text-blue-600 hover:underline">
          page Garanties &amp; SAV
        </Link>
        .
      </p>
    ),
  },
  {
    id: "litiges",
    title: "Litiges et droit applicable",
    icon: <FaGavel />,
    content: (
      <p>
        Les présentes CGV sont soumises au droit sénégalais. En cas de litige, une
        solution amiable sera recherchée en priorité auprès du service client. À
        défaut, compétence est attribuée aux tribunaux de Dakar.
      </p>
    ),
  },
];

export const metadata = {
  title: "Conditions Générales de Vente | Tekalis",
  description:
    "CGV de tekalis.com : prix en FCFA, paiement Wave / Orange Money / à la livraison, livraison Dakar 24-48h, retours sous 7 jours et garanties.",
  alternates: { canonical: "https://tekalis.com/cgv" },
};

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaFileContract className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour :{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Les présentes conditions encadrent vos achats sur{" "}
            <span className="font-bold text-blue-600">tekalis.com</span>. Nous vous
            recommandons de les lire attentivement avant toute commande. En
            validant votre panier, vous reconnaissez les avoir acceptées.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
                {section.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {index + 1}. {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed">{section.content}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Une question sur nos CGV ?</h2>
          <p className="opacity-90 mb-6">
            Notre service client vous répond du lundi au samedi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@tekalis.com"
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              contact@tekalis.com
            </a>
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
