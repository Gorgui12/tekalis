import Link from "next/link";
import { FaCookieBite, FaChartBar, FaCog, FaShieldAlt } from "react-icons/fa";

const sections = [
  {
    id: "definition",
    title: "Qu'est-ce qu'un cookie ?",
    icon: <FaCookieBite />,
    content: (
      <p>
        Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur,
        smartphone, tablette) lors de la consultation d'un site web. Il permet
        notamment de mémoriser vos préférences et d'améliorer votre expérience de
        navigation.
      </p>
    ),
  },
  {
    id: "utilises",
    title: "Les cookies utilisés sur tekalis.com",
    icon: <FaChartBar />,
    content: (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tl-lg">Catégorie</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Finalité</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tr-lg">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3"><strong>Essentiels</strong></td>
                <td className="px-4 py-3">Panier, session de connexion, sécurité. Indispensables au fonctionnement du site.</td>
                <td className="px-4 py-3">Session à 12 mois</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><strong>Préférences</strong></td>
                <td className="px-4 py-3">Mémorisation du panier, de la wishlist et de vos choix d'affichage (mode sombre).</td>
                <td className="px-4 py-3">6 à 12 mois</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><strong>Mesure d'audience</strong></td>
                <td className="px-4 py-3">Statistiques anonymisées de fréquentation via Google Analytics 4 afin d'améliorer le site.</td>
                <td className="px-4 py-3">Jusqu'à 14 mois</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "gestion",
    title: "Comment gérer les cookies ?",
    icon: <FaCog />,
    content: (
      <>
        <p className="mb-3">
          Vous pouvez à tout moment configurer votre navigateur pour refuser les
          cookies ou être alerté de leur dépôt :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
          <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
          <li><strong>Safari :</strong> Préférences → Confidentialité</li>
          <li><strong>Edge :</strong> Paramètres → Autorisations du site → Cookies</li>
        </ul>
        <p className="mt-3">
          Le refus des cookies essentiels peut empêcher le bon fonctionnement du
          panier et de la connexion à votre compte.
        </p>
      </>
    ),
  },
];

export const metadata = {
  title: "Politique de gestion des cookies | Tekalis",
  description:
    "Découvrez les cookies utilisés sur tekalis.com : cookies essentiels, préférences et mesure d'audience — et comment les gérer dans votre navigateur.",
  alternates: { canonical: "https://tekalis.com/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaCookieBite className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de gestion des cookies
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
            Chez <span className="font-bold text-blue-600">Tekalis</span>, nous
            utilisons les cookies pour vous offrir une expérience d'achat fluide.
            Cette page vous explique quels cookies nous utilisons et comment
            exercer votre contrôle sur leur dépôt. Pour en savoir plus sur le
            traitement de vos données, consultez notre{" "}
            <Link href="/politique" className="text-blue-600 hover:underline">
              politique de confidentialité
            </Link>
            .
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
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white flex flex-col sm:flex-row items-center gap-6">
          <FaShieldAlt className="text-5xl flex-shrink-0 hidden sm:block" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Vos données, votre contrôle</h2>
            <p className="opacity-90">
              Une question sur les cookies ou vos données personnelles ? Écrivez-nous
              à{" "}
              <a href="mailto:contact@tekalis.com" className="underline hover:text-yellow-200">
                contact@tekalis.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
