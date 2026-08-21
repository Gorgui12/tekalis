import Link from "next/link";
import { FaQuestionCircle, FaTruck, FaCreditCard, FaUndoAlt, FaShieldAlt, FaUser } from "react-icons/fa";

const faqCategories = [
  {
    id: "commandes",
    title: "Commandes & Paiement",
    icon: <FaCreditCard />,
    faqs: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons le paiement à la livraison en espèces (Dakar et banlieue), ainsi que Wave, Orange Money et Free Money.",
      },
      {
        q: "Le paiement à la livraison est-il sécurisé ?",
        a: "Oui. Vous inspectez votre produit devant le livreur avant de payer. Un reçu vous est remis à la livraison.",
      },
      {
        q: "Puis-je commander sans créer de compte ?",
        a: "La création d'un compte est recommandée : elle vous permet de suivre vos commandes, gérer vos garanties et bénéficier d'offres personnalisées.",
      },
      {
        q: "Y a-t-il des frais supplémentaires ?",
        a: "Non. Le prix affiché est le prix final en FCFA, hors frais de livraison éventuels. La livraison est offerte dès 50 000 FCFA d'achat.",
      },
    ],
  },
  {
    id: "livraison",
    title: "Livraison",
    icon: <FaTruck />,
    faqs: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "24 à 48 heures à Dakar et dans la région. Pour les autres régions du Sénégal, comptez 2 à 5 jours ouvrables selon la zone.",
      },
      {
        q: "Dans quelles zones livrez-vous ?",
        a: "Nous livrons dans tout Dakar (Centre, Plateau, Fann, Mermoz, SICAP, Liberté, Almadies, Yoff, Parcelles Assainies) et sa banlieue, puis progressivement dans les autres régions.",
      },
      {
        q: "Combien coûte la livraison ?",
        a: "Les frais dépendent de votre zone de livraison. La livraison est offerte pour toute commande supérieure ou égale à 50 000 FCFA.",
      },
      {
        q: "Comment suivre ma commande ?",
        a: "Depuis votre espace client, rubrique « Mes commandes ». Vous êtes également notifié par email à chaque étape.",
      },
    ],
  },
  {
    id: "retours",
    title: "Retours & Remboursements",
    icon: <FaUndoAlt />,
    faqs: [
      {
        q: "Quel est le délai pour retourner un produit ?",
        a: "Vous disposez de 7 jours après réception pour retourner un produit non utilisé, dans son emballage d'origine.",
      },
      {
        q: "Comment faire une demande de retour ?",
        a: "Depuis votre espace client, ouvrez une demande RMA dans la rubrique SAV. Notre équipe vous indique la procédure sous 48h.",
      },
      {
        q: "Sous quel délai suis-je remboursé ?",
        a: "Le remboursement est effectué sous 7 jours ouvrables après réception et validation du produit retourné, via le moyen de paiement utilisé.",
      },
    ],
  },
  {
    id: "garanties",
    title: "Garanties & SAV",
    icon: <FaShieldAlt />,
    faqs: [
      {
        q: "Vos produits sont-ils garantis ?",
        a: "Oui, tous nos produits sont neufs et couverts par la garantie constructeur (12 mois en moyenne, selon les produits).",
      },
      {
        q: "Que faire en cas de panne ?",
        a: "Ouvrez une demande SAV depuis votre espace client. Après diagnostic, le produit est réparé, remplacé ou remboursé conformément à la garantie.",
      },
      {
        q: "La garantie couvre-t-elle les dommages accidentels ?",
        a: "Non. La garantie constructeur exclut l'oxydation, la casse et les dommages causés par une mauvaise utilisation.",
      },
    ],
  },
  {
    id: "compte",
    title: "Compte & Données personnelles",
    icon: <FaUser />,
    faqs: [
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Cliquez sur « Mot de passe oublié ? » sur la page de connexion et suivez les instructions reçues par email.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Contactez-nous à contact@tekalis.com : votre compte et vos données seront supprimés conformément à notre politique de confidentialité.",
      },
    ],
  },
];

export const metadata = {
  title: "FAQ — Questions fréquentes | Tekalis",
  description:
    "Réponses aux questions fréquentes sur tekalis.com : paiement à la livraison, Wave et Orange Money, délais de livraison à Dakar, retours sous 7 jours et garanties.",
  alternates: { canonical: "https://tekalis.com/faq" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqCategories.flatMap((c) =>
    c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }))
  ),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <FaQuestionCircle className="text-4xl text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h1>
            <p className="text-lg text-gray-600">
              Tout ce qu'il faut savoir avant de commander chez Tekalis
            </p>
          </div>

          {/* Catégories */}
          {faqCategories.map((category) => (
            <section key={category.id} className="mb-10">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-5">
                <span className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">
                  {category.icon}
                </span>
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-white rounded-lg shadow-md open:shadow-lg transition-shadow"
                  >
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-4 font-semibold text-gray-900 hover:text-blue-600">
                      {faq.q}
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm group-open:bg-blue-600 group-open:text-white transition-colors">
                        ?
                      </span>
                    </summary>
                    <p className="px-6 pb-5 pt-1 text-gray-700 leading-relaxed border-t border-gray-100">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          {/* CTA support */}
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-lg shadow-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="opacity-90 mb-6">
              Notre équipe support vous répond du lundi au samedi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-green-700 font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition"
              >
                Contacter le support
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
    </>
  );
}
