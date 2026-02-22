import { Link } from "react-router-dom";
import { 
  FaShieldAlt, 
  FaLock, 
  FaUserShield, 
  FaCookie,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";

const Politique = () => {
  const sections = [
    {
      id: "collecte",
      title: "Collecte des informations",
      icon: <FaUserShield />,
      content: `Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte, de vos commandes ou de vos interactions avec notre service client. Ces informations incluent : nom, prénom, adresse email, numéro de téléphone, adresse de livraison et informations de paiement.`
    },
    {
      id: "utilisation",
      title: "Utilisation des données",
      icon: <FaLock />,
      content: `Vos données personnelles sont utilisées pour traiter vos commandes, améliorer votre expérience d'achat, vous envoyer des notifications importantes concernant vos commandes, et vous proposer des offres personnalisées si vous avez accepté de recevoir nos communications marketing.`
    },
    {
      id: "protection",
      title: "Protection des données",
      icon: <FaShieldAlt />,
      content: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Vos informations de paiement sont cryptées et traitées de manière sécurisée.`
    },
    {
      id: "cookies",
      title: "Cookies et technologies similaires",
      icon: <FaCookie />,
      content: `Notre site utilise des cookies pour améliorer votre expérience de navigation, mémoriser vos préférences et analyser le trafic du site. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.`
    }
  ];

  const droits = [
    "Droit d'accès à vos données personnelles",
    "Droit de rectification des données inexactes",
    "Droit à l'effacement de vos données",
    "Droit à la limitation du traitement",
    "Droit à la portabilité de vos données",
    "Droit d'opposition au traitement de vos données",
    "Droit de retirer votre consentement à tout moment"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaShieldAlt className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            Chez <span className="font-bold text-blue-600">Tekalis</span>, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité vous explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site web et nos services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            En utilisant notre site, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
          </p>
        </div>

        {/* Sections principales */}
        {sections.map((section, index) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
                {section.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {index + 1}. {section.title}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Vos droits */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-6">Vos droits</h2>
          <p className="mb-6 opacity-90">
            Conformément à la législation en vigueur, vous disposez des droits suivants concernant vos données personnelles :
          </p>
          <ul className="space-y-3">
            {droits.map((droit, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  ✓
                </span>
                <span className="opacity-90">{droit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Partage des données */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. Partage de vos données
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Nous ne vendons jamais vos données personnelles à des tiers. Nous pouvons partager vos informations uniquement dans les cas suivants :
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Avec nos prestataires de services (livraison, paiement) nécessaires à l'exécution de votre commande</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>En cas d'obligation légale ou de demande des autorités compétentes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Pour protéger nos droits, notre propriété ou la sécurité de nos utilisateurs</span>
            </li>
          </ul>
        </div>

        {/* Conservation des données */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. Conservation des données
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. En général, vos données sont conservées pendant la durée de votre compte actif et pendant une période raisonnable après sa fermeture pour des raisons légales, comptables ou de résolution de litiges.
          </p>
        </div>

        {/* Modifications */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Modifications de cette politique
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une date de mise à jour actualisée. Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques en matière de protection des données.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Nous contacter</h2>
          <p className="mb-6 opacity-90">
            Si vous avez des questions concernant cette politique de confidentialité ou si vous souhaitez exercer vos droits, n'hésitez pas à nous contacter :
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <p className="font-semibold mb-1">Email</p>
                <a 
                  href="mailto:privacy@tekalis.com" 
                  className="text-blue-300 hover:text-blue-200 transition"
                >
                  privacy@tekalis.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaPhone />
              </div>
              <div>
                <p className="font-semibold mb-1">Téléphone</p>
                <a 
                  href="tel:+221331234567" 
                  className="text-blue-300 hover:text-blue-200 transition"
                >
                  +221 33 123 45 67
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Politique;