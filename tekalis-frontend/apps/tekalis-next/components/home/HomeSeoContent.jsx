import Link from "next/link";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";

// FAQ courte — alimente le schéma FAQPage (extraits enrichis Google)
const FAQ_ITEMS = [
  {
    question: "Quels moyens de paiement acceptez-vous à Dakar ?",
    answer:
      "Nous acceptons le paiement à la livraison, Wave, Orange Money, Free Money et la carte bancaire (Visa, Mastercard).",
  },
  {
    question: "Combien de temps prend la livraison au Sénégal ?",
    answer:
      "La livraison est assurée en 2 à 3 jours ouvrés à Dakar et dans sa région, et en 4 à 7 jours dans les autres régions du Sénégal.",
  },
  {
    question: "Les produits sous garantie ?",
    answer:
      "Oui, chaque produit vendu par Tekalis bénéficie d'une garantie. Consultez notre page garanties pour les modalités d'échange et de réparation.",
  },
];

// FAQPage schema — rendu serveur, dans le HTML brut
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

const CATEGORY_LINKS = [
  { name: 'Smartphones, iPhone et Samsung à Dakar', path: '/category/smartphones' },
  { name: 'Ordinateurs portables et PC fixes', path: '/category/ordinateurs' },
  { name: 'Gaming, consoles et PC gamer', path: '/category/gaming' },
  { name: 'Téléviseurs TV et home cinéma', path: '/category/tv' },
  { name: 'Électroménager et petit électroménager', path: '/category/electromenager' },
  { name: 'Climatiseurs et refroidissement', path: '/category/climatiseurs' },
];

export default function HomeSeoContent() {
  return (
    <section
      className="bg-white dark:bg-surface-950 border-t border-surface-100 dark:border-surface-800"
      aria-label="En savoir plus sur Tekalis"
    >
      <div className="container mx-auto max-w-4xl px-4 py-14 md:py-20">
        {/* Intro SEO */}
        <h2 className="text-2xl md:text-3xl font-bold font-display text-surface-900 dark:text-white mb-4">
          Tekalis, votre boutique électronique à Dakar Fann
        </h2>
        <p className="text-surface-700 dark:text-surface-300 leading-relaxed mb-4">
          Tekalis est une boutique en ligne basée à <strong>Fann, Dakar</strong>, spécialisée dans
          l&apos;électronique, l&apos;informatique et le high-tech. Nous sélectionnons pour vous des
          smartphones, ordinateurs portables, téléviseurs, consoles de jeu et électroménager au
          meilleur rapport qualité-prix, avec une livraison rapide au Sénégal.
        </p>
        <p className="text-surface-700 dark:text-surface-300 leading-relaxed mb-6">
          Commandez en ligne et payez <strong>à la livraison</strong> ou par mobile money
          (Wave, Orange Money, Free Money) : chaque produit est livré avec sa garantie.
          Notre équipe vous accompagne par téléphone, WhatsApp ou email pour choisir le bon produit
          selon votre budget.
        </p>

        {/* Catégories — maillage interne */}
        <h3 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-3">
          Ce que vous trouverez chez Tekalis
        </h3>
        <ul className="grid sm:grid-cols-2 gap-2 mb-6 list-none">
          {CATEGORY_LINKS.map((cat) => (
            <li key={cat.path}>
              <Link
                href={cat.path}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition"
              >
                <span aria-hidden="true" className="text-brand-500">›</span>
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Confiance — paragraphes scannables */}
        <h3 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-3">
          Acheter en ligne en toute confiance
        </h3>
        <ul className="space-y-2 mb-6 text-surface-700 dark:text-surface-300 text-sm">
          <li><strong>Paiement à la livraison et mobile money :</strong> réglez quand vous recevez, en espèces, Wave, Orange Money ou Free Money.</li>
          <li><strong>Garantie incluse :</strong> chaque produit est couvert. Voir nos conditions de <Link href="/garanties" className="text-brand-600 dark:text-brand-400 hover:underline">garantie</Link>.</li>
          <li><strong>Livraison rapide :</strong> 2 à 3 jours à Dakar, 4 à 7 jours ailleurs au <Link href="/livraison" className="text-brand-600 dark:text-brand-400 hover:underline">Sénégal</Link>.</li>
          <li><strong>Avis vérifiés :</strong> note moyenne de 4,5/5 basée sur les avis de nos clients sur nos <Link href="/products" className="text-brand-600 dark:text-brand-400 hover:underline">produits</Link>.</li>
          <li><strong>Service client réactif :</strong> au <a href="tel:+221786346946" className="text-brand-600 dark:text-brand-400 hover:underline">+221 78 634 69 46</a> et sur WhatsApp, du lundi au samedi.</li>
        </ul>

        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-8">
          Avant d&apos;acheter, comparez les prix des smartphones, PC et TV sur nos{" "}
          <Link href="/prix" className="text-brand-600 dark:text-brand-400 hover:underline">guides de prix</Link>{" "}
          et découvrez les dernières tendances tech au Sénégal sur notre{" "}
          <Link href="/blog" className="text-brand-600 dark:text-brand-400 hover:underline">blog</Link>.
          Vous cherchez une boutique high-tech de confiance à Dakar ?{" "}
          <Link href="/apropos" className="text-brand-600 dark:text-brand-400 hover:underline">En savoir plus sur Tekalis</Link>.
        </p>

        {/* FAQ */}
        <h3 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-3">
          Questions fréquentes
        </h3>
        <div className="space-y-3 mb-8">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 px-4 py-3">
              <summary className="cursor-pointer font-semibold text-surface-900 dark:text-white text-sm list-none flex items-center justify-between gap-3">
                {item.question}
                <span aria-hidden="true" className="text-brand-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
        <p className="text-sm text-surface-600 dark:text-surface-400">
          Une autre question ? Consultez notre <Link href="/faq" className="text-brand-600 dark:text-brand-400 hover:underline">FAQ complète</Link> ou{" "}
          <Link href="/contact" className="text-brand-600 dark:text-brand-400 hover:underline">contactez-nous</Link>.
        </p>

        {/* NAP */}
        <div className="mt-10 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 p-5 md:p-6">
          <h3 className="text-lg font-bold font-display text-surface-900 dark:text-white mb-3">
            Boutique Tekalis — Adresse et horaires
          </h3>
          <ul className="space-y-2 text-sm text-surface-700 dark:text-surface-300">
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-rose-500 flex-shrink-0" aria-hidden="true" />
              <span>Fann, Rue 14, Dakar, Sénégal (BP 12345)</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
              <a href="tel:+221786346946" className="hover:text-brand-600 dark:hover:text-brand-400 transition">+221 78 634 69 46</a>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-brand-500 flex-shrink-0" aria-hidden="true" />
              <a href="mailto:contact@tekalis.com" className="hover:text-brand-600 dark:hover:text-brand-400 transition">contact@tekalis.com</a>
            </li>
            <li className="flex items-start gap-3">
              <FaClock className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>Lun - Ven : 8h - 19h · Sam : 9h - 17h · Dim : fermé</span>
            </li>
          </ul>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}