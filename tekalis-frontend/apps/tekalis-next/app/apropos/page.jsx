import Link from "next/link";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaShieldAlt, FaTruck, FaMoneyBillWave } from "react-icons/fa";

export const metadata = {
  title: "À propos de Tekalis | Boutique Électronique Dakar Fann",
  description: "Boutique en ligne fiable du Sénégal, Tekalis livre vos produits électroniques à Dakar Fann. Payez à la livraison ou par Wave : garantie et livraison rapide.",
  keywords: ['à propos tekalis', 'boutique en ligne fiable Sénégal', 'acheter en ligne payer à la livraison Sénégal', 'paiement Wave Dakar'],
  alternates: { canonical: 'https://tekalis.com/apropos' },
  openGraph: {
    title: 'À propos de Tekalis | Boutique Électronique Dakar',
    description: 'Boutique en ligne fiable : produits électroniques à Dakar Fann, paiement à la livraison ou par Wave, garantie incluse.',
    url: 'https://tekalis.com/apropos',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

const engagements = [
  { icon: <FaMoneyBillWave />, title: "Paiement à la livraison", text: "Payez en espèces ou par Wave / Orange Money / Free Money à la réception de votre produit." },
  { icon: <FaShieldAlt />, title: "Produits garantis", text: "Chaque commande bénéficie de la garantie constructeur et d'un SAV réactif depuis votre espace client." },
  { icon: <FaTruck />, title: "Livraison rapide", text: "2 à 3 jours ouvrés à Dakar et sa région, 4 à 7 jours au-delà, avec suivi et paiement à la réception." },
  { icon: <FaCheckCircle />, title: "Avis vérifiés", text: "Note moyenne de 4,5/5 basée sur les avis de nos clients sur nos produits, disponibles directement sur la boutique." },
];

export default function AProposPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">À propos de Tekalis</h1>
      <p className="text-sm text-gray-400 mb-6">Dernière mise à jour : 22 septembre 2026</p>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
        Tekalis est une <strong>boutique en ligne basée à Dakar Fann (Sénégal)</strong>, spécialisée
        dans l&apos;électronique, l&apos;informatique et le high-tech. Depuis notre lancement,
        nous aidons les clients à Dakar et dans tout le Sénégal à acheter smartphones, ordinateurs
        portables, téléviseurs, consoles de jeu et électroménager au meilleur prix, sans les
        risques habituels du commerce en ligne.
      </p>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
        Notre spécialité : l&apos;achat en ligne <strong>en toute confiance</strong>. Vous commandez
        depuis le catalogue, nous préparons votre colis en 2 à 4 heures, et vous réglez
        <strong> à la livraison</strong> en espèces ou par mobile money (Wave, Orange Money,
        Free Money) devant votre livreur, après vérification du produit. Nos conseillers
        vous accompagnent par téléphone et WhatsApp pour choisir le bon modèle selon votre budget.
      </p>

      <h2 className="text-2xl font-bold mb-3">Nos engagements</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {engagements.map((item) => (
          <div key={item.title} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl text-brand-500">{item.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-3">Ce que vous trouverez chez nous</h2>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
        Notre catalogue couvre les produits électroniques et high-tech les plus demandés :
        <Link href="/category/smartphones" className="text-brand-600 hover:underline"> smartphones</Link>,
        <Link href="/category/ordinateurs" className="text-brand-600 hover:underline"> ordinateurs portables</Link>,
        <Link href="/category/tv" className="text-brand-600 hover:underline"> téléviseurs</Link>,
        <Link href="/category/gaming" className="text-brand-600 hover:underline"> gaming et consoles</Link>,
        <Link href="/category/electromenager" className="text-brand-600 hover:underline"> électroménager</Link> et
        <Link href="/category/climatiseurs" className="text-brand-600 hover:underline"> climatiseurs</Link>.
        Avant d&apos;acheter, consultez nos{" "}
        <Link href="/prix" className="text-brand-600 hover:underline">guides de prix</Link>,
        notre <Link href="/blog" className="text-brand-600 hover:underline">blog tech</Link>
        et notre <Link href="/faq" className="text-brand-600 hover:underline">FAQ</Link>.
      </p>

      <h2 className="text-2xl font-bold mb-3">Contactez-nous</h2>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
        Vous avez une question sur un produit, une commande ou une garantie ? Notre équipe vous
        répond du lundi au samedi. Passez nous voir, appelez-nous ou écrivez-nous —{" "}
        <Link href="/contact" className="text-brand-600 hover:underline">voir toutes les options de contact</Link>.
      </p>

      <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Boutique Tekalis — Dakar Fann</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-rose-500 flex-shrink-0" aria-hidden="true" />
            Fann, Rue 14, Dakar, Sénégal (BP 12345)
          </li>
          <li className="flex items-center gap-3">
            <FaPhone className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
            <a href="tel:+221786346946" className="hover:text-brand-600 transition">+221 78 634 69 46</a>
          </li>
          <li className="flex items-center gap-3">
            <FaEnvelope className="text-brand-500 flex-shrink-0" aria-hidden="true" />
            <a href="mailto:contact@tekalis.com" className="hover:text-brand-600 transition">contact@tekalis.com</a>
          </li>
          <li className="flex items-start gap-3">
            <FaClock className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>Lun - Ven : 8h - 19h · Sam : 9h - 17h · Dim : fermé</span>
          </li>
        </ul>
      </div>
    </main>
  );
}