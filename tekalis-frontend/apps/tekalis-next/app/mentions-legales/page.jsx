import Link from "next/link";
import {
  FaBuilding,
  FaServer,
  FaCopyright,
  FaBalanceScale,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const sections = [
  {
    id: "editeur",
    title: "Éditeur du site",
    icon: <FaBuilding />,
    content: (
      <>
        <p className="mb-3">
          Le site <strong>tekalis.com</strong> est édité par :
        </p>
        <ul className="space-y-1.5 text-gray-700">
          <li><strong>Nom commercial :</strong> Tekalis</li>
          <li><strong>Adresse :</strong> Fann, Rue 14, Dakar, Sénégal</li>
          <li><strong>Email :</strong> contact@tekalis.com</li>
          <li><strong>Téléphone :</strong> +221 78 634 69 46</li>
          <li><strong>Responsable de la publication :</strong> La direction de Tekalis</li>
        </ul>
      </>
    ),
  },
  {
    id: "hebergeur",
    title: "Hébergement",
    icon: <FaServer />,
    content: (
      <p>
        Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
        États-Unis — <span className="text-blue-600">vercel.com</span>. Les données
        transitent via une connexion chiffrée (HTTPS).
      </p>
    ),
  },
  {
    id: "propriete",
    title: "Propriété intellectuelle",
    icon: <FaCopyright />,
    content: (
      <p>
        L'ensemble des éléments constituant le site tekalis.com (textes, images,
        logos, vidéos, graphismes, structure) est la propriété exclusive de Tekalis
        ou fait l'objet d'une autorisation d'utilisation. Toute reproduction,
        représentation, modification ou exploitation, totale ou partielle, sans
        autorisation écrite préalable est interdite et constituerait une
        contrefaçon sanctionnée par la loi.
      </p>
    ),
  },
  {
    id: "responsabilite",
    title: "Limitation de responsabilité",
    icon: <FaBalanceScale />,
    content: (
      <p>
        Tekalis s'efforce d'assurer l'exactitude des informations diffusées sur ce
        site (prix, descriptions, disponibilités) mais ne saurait garantir leur
        exhaustivité. Les photographies des produits sont les plus fidèles
        possibles mais ne peuvent assurer une similitude parfaite avec le produit
        offert. Tekalis ne saurait être tenue responsable des dommages directs ou
        indirects résultant de l'utilisation du site ou de l'impossibilité d'y
        accéder.
      </p>
    ),
  },
];

export const metadata = {
  title: "Mentions légales | Tekalis",
  description:
    "Mentions légales du site tekalis.com — éditeur, hébergement, propriété intellectuelle et responsabilité. Tekalis, boutique high-tech à Fann, Dakar.",
  alternates: { canonical: "https://tekalis.com/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaBalanceScale className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentions légales</h1>
          <p className="text-lg text-gray-600">
            Informations légales relatives au site tekalis.com
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Bienvenue sur <span className="font-bold text-blue-600">tekalis.com</span>,
            boutique en ligne spécialisée dans la vente de produits high-tech
            (smartphones, ordinateurs, TV, électroménager et accessoires) à Dakar et
            partout au Sénégal. Les présentes mentions légales ont pour objet de
            définir les conditions d'accès et d'utilisation du site.
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
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Nous contacter</h2>
          <p className="opacity-90 mb-6">
            Pour toute question relative aux présentes mentions légales :
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <FaMapMarkerAlt className="text-yellow-300 flex-shrink-0" />
              <span className="text-sm">Fann, Rue 14, Dakar</span>
            </div>
            <a
              href="mailto:contact@tekalis.com"
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 hover:bg-white/20 transition"
            >
              <FaEnvelope className="text-yellow-300 flex-shrink-0" />
              <span className="text-sm">contact@tekalis.com</span>
            </a>
            <a
              href="tel:+221786346946"
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 hover:bg-white/20 transition"
            >
              <FaPhone className="text-yellow-300 flex-shrink-0" />
              <span className="text-sm">+221 78 634 69 46</span>
            </a>
          </div>
          <p className="mt-6 text-sm opacity-75">
            Voir aussi nos{" "}
            <Link href="/cgv" className="underline hover:text-yellow-200">
              Conditions Générales de Vente
            </Link>{" "}
            et notre{" "}
            <Link href="/politique" className="underline hover:text-yellow-200">
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
