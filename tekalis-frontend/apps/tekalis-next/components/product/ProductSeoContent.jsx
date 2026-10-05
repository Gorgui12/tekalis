import Link from 'next/link';
import { FaTruck, FaShieldAlt, FaMoneyBillWave, FaUndo } from 'react-icons/fa';
import { availabilityLabel } from '@/lib/seo/jsonld';
import { formatFcfa, productAnchor } from '@/lib/seo/format';
import {
  PAYMENT_CLAIM,
  RETURNS_CLAIM,
  SHIPPING_CLAIM,
  WARRANTY_CLAIM,
} from '@/lib/seo/config';
import { buildProductIntro } from '@/lib/seo/productContent';

const SPEC_LABELS = {
  processor: 'Processeur',
  processorBrand: 'Marque du processeur',
  processorGeneration: 'Génération du processeur',
  ram: 'Mémoire RAM',
  ramType: 'Type de RAM',
  storage: 'Stockage',
  storageType: 'Type de stockage',
  display: 'Écran',
  screen: 'Taille d\'écran',
  screenTech: 'Technologie d\'écran',
  refreshRate: 'Taux de rafraîchissement',
  gpu: 'Carte graphique',
  graphics: 'Carte graphique',
  graphicsMemory: 'Mémoire graphique',
  connectivity: 'Connectivité',
  ports: 'Ports',
  os: 'Système d\'exploitation',
  battery: 'Batterie',
  batteryCapacity: 'Capacité de la batterie',
  weight: 'Poids',
  dimensions: 'Dimensions',
  color: 'Couleur',
  camera: 'Caméra arrière',
  frontCamera: 'Caméra avant',
  rgb: 'Éclairage RGB',
  coolingSystem: 'Système de refroidissement',
};

// Ordre d'affichage : on montre d'abord ce que l'internaute compare.
const SPEC_ORDER = [
  'storage',
  'ram',
  'display',
  'screen',
  'screenTech',
  'refreshRate',
  'processor',
  'processorBrand',
  'processorGeneration',
  'ramType',
  'storageType',
  'gpu',
  'graphics',
  'graphicsMemory',
  'battery',
  'batteryCapacity',
  'camera',
  'frontCamera',
  'os',
  'connectivity',
  'ports',
  'color',
  'weight',
  'dimensions',
  'rgb',
  'coolingSystem',
];

function formatSpecValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}

/** Toutes les caracteristiques reelles du produit, dans un ordre lisible. */
function collectSpecs(specs) {
  if (!specs || typeof specs !== 'object') return [];
  return SPEC_ORDER.filter((key) => {
    const value = specs[key];
    return value !== null && value !== undefined && value !== '' &&
      !(Array.isArray(value) && value.filter(Boolean).length === 0);
  }).map((key) => [SPEC_LABELS[key] || key, formatSpecValue(specs[key])]);
}

/**
 * Contenu editorial de la fiche produit, rendu côté serveur.
 *
 * Tout ce que Google voit sans executer de JavaScript : H1, prix, disponibilite,
 * tableau des caracteristiques, arguments d'achat et FAQ.
 *
 * Regle : les seules affirmations employee's sont celles de lib/seo/config.js,
 * qui ne reprend que des formules deja publiees sur /livraison, /retours et
 * /garanties. Aucun schema FAQPage ici : Google n'affiche plus ce type de
 * resultat enrichi pour un site marchand, et le balisage visible est deja
 * present dans le HTML.
 */
export default function ProductSeoContent({ product, related = [], category }) {
  if (!product) return null;

  const categoryRef = category || product.category?.[0];
  const price = formatFcfa(product.price);
  const comparePrice = formatFcfa(product.comparePrice);
  const hasDiscount = Number(product.comparePrice) > Number(product.price);
  const availability = availabilityLabel(product);
  const inStock = availability === 'En stock';
  const specs = collectSpecs(product.specs);
  const intro = buildProductIntro(product, { price, availability });

  const relatedItems = (Array.isArray(related) ? related : [])
    .filter((item) => item && (item.slug || item._id))
    .filter((item) => item._id !== product._id)
    .slice(0, 4);

  const productName = product.name;

  // FAQ : uniquement des faits deja publies sur le site.
  const faqItems = [
    {
      question: `Quel est le prix du ${productName} au Sénégal ?`,
      answer: price
        ? `Le ${productName} est affiché à ${price} FCFA sur tekalis.com. Le stock en ligne reflète la disponibilité réelle du produit.`
        : `Le prix du ${productName} est affiché en direct sur cette page, en FCFA.`,
    },
    {
      question: `Livrez-vous le ${productName} à Dakar ?`,
      answer: `Oui. Tekalis est situé ${'Fann, Rue 14 à Dakar'}. ${SHIPPING_CLAIM}.`,
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: `${PAYMENT_CLAIM}.`,
    },
    {
      question: 'Le produit est-il garanti et retourneable ?',
      answer: `${WARRANTY_CLAIM}. ${RETURNS_CLAIM}.`,
    },
  ];

  return (
    <div className="container mx-auto px-4 mt-10 mb-12">
      {/* H1 unique de la page + resume factuel. Rendus serveur : c'est ce que
          Googlebot indexe, la SPA/Vite ne le fournissait pas. */}
      <header className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-extrabold font-display text-surface-900 dark:text-white">
          {productName}
        </h1>
        <p className="mt-3 text-base text-surface-600 dark:text-surface-300 leading-relaxed">
          {intro}
        </p>
      </header>

      {/* Prix / disponibilite : le bloc que les researched DakarWant voir avant de cliquer. */}
      <div className="mt-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800 p-5">
        <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white">
          Prix du {productName} au Sénégal
        </h2>
        <p className="mt-2 text-2xl font-extrabold text-brand-600 dark:text-brand-400">
          {price ? `${price} FCFA` : 'Prix sur demande'}
          {hasDiscount && comparePrice && (
            <span className="ml-3 text-base font-medium text-surface-400 line-through">
              {comparePrice} FCFA
            </span>
          )}
        </p>
        <p
          className={`mt-1 text-sm font-semibold ${
            inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {availability}
          {inStock && Number(product.stock) > 1 ? ` (${product.stock} en stock)` : ''}
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-surface-700 dark:text-surface-300 sm:grid-cols-2">
          {product.brand && (
            <li>
              <strong className="font-semibold">Marque :</strong> {product.brand}
            </li>
          )}
          {categoryRef?.name && (
            <li>
              <strong className="font-semibold">Catégorie :</strong>{' '}
              <Link
                href={`/category/${categoryRef.slug}`}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                {categoryRef.name}
              </Link>
            </li>
          )}
          {SHIPPING_CLAIM && (
            <li>
              <strong className="font-semibold">Livraison :</strong> {SHIPPING_CLAIM}
            </li>
          )}
          {WARRANTY_CLAIM && (
            <li>
              <strong className="font-semibold">Garantie :</strong> {WARRANTY_CLAIM}
            </li>
          )}
        </ul>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Caracteristiques reelles du produit */}
        {specs.length > 0 && (
          <section className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Caractéristiques du {productName}
            </h2>
            <dl className="divide-y divide-surface-100 dark:divide-surface-700 text-sm">
              {specs.map(([label, value]) => (
                <div key={label} className="flex items-start gap-3 py-2">
                  <dt className="w-44 shrink-0 font-semibold text-surface-600 dark:text-surface-400">
                    {label}
                  </dt>
                  <dd className="text-surface-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Arguments d'achat : faits boutique, tous deja publies ailleurs sur le site */}
        <section className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
          <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
            Acheter le {productName} en ligne
          </h2>
          <ul className="space-y-3 text-sm text-surface-700 dark:text-surface-300">
            <li className="flex items-start gap-3">
              <FaTruck className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Livraison :</strong> 24 à 48h à Dakar, 2 à 5 jours dans les régions, offerte dès 50 000 FCFA.{' '}
                <Link href="/livraison" className="text-brand-600 dark:text-brand-400 hover:underline">
                  Zones et délais
                </Link>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaShieldAlt className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Garantie :</strong> garantie constructeur incluse.{' '}
                <Link href="/garanties" className="text-brand-600 dark:text-brand-400 hover:underline">
                  Modalités
                </Link>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaUndo className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Retours :</strong> 7 jours après réception.{' '}
                <Link href="/retours" className="text-brand-600 dark:text-brand-400 hover:underline">
                  Conditions
                </Link>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FaMoneyBillWave className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Paiement :</strong> à la livraison, Wave, Orange Money ou Free Money. Commandez en ligne,
                payez à réception.
              </span>
            </li>
          </ul>
        </section>
      </div>

      {/* Maillage interne : ancres descriptives, jamais « cliquez ici » */}
      {relatedItems.length > 0 && (
        <section className="mt-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
          <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
            {categoryRef?.name
              ? `Autres ${categoryRef.name.toLowerCase()} au même prix`
              : 'Produits similaires'}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedItems.map((item) => (
              <li key={item._id}>
                <Link
                  href={`/products/${item.slug || item._id}`}
                  className="group flex h-full flex-col rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/40 p-4 transition hover:shadow-card"
                >
                  <span className="mb-2 line-clamp-2 text-sm font-semibold text-surface-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {productAnchor(item.name, item.price)}
                  </span>
                  {item.price != null && (
                    <span className="mt-auto text-sm font-bold text-brand-600 dark:text-brand-400">
                      {formatFcfa(item.price)} FCFA
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-surface-600 dark:text-surface-400">
            Voir tout le catalogue sur la page{' '}
            <Link href="/products" className="text-brand-600 dark:text-brand-400 hover:underline">
              produits
            </Link>
            {categoryRef?.slug && (
              <>
                {' '}et la catégorie{' '}
                <Link
                  href={`/category/${categoryRef.slug}`}
                  className="text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {categoryRef.name}
                </Link>
              </>
            )}
            .
          </p>
        </section>
      )}

      {/* FAQ visible, SANS schema FAQPage (resultat enrichi non affiche pour
          un site marchand ; le contenu reste utile aux visiteurs). */}
      <section className="mt-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
        <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
          Questions fréquentes sur le {productName}
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/40 px-4 py-3"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-surface-900 dark:text-white">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-brand-500 transition-transform group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-surface-600 dark:text-surface-400">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
