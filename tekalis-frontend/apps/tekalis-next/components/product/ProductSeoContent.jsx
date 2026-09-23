import Link from "next/link";
import { FaTruck, FaShieldAlt, FaMoneyBillWave, FaUndo, FaCheckCircle } from "react-icons/fa";

const SITE_URL = 'https://tekalis.com';

const SPEC_LABELS = {
  processor: "Processeur",
  ram: "Mémoire RAM",
  storage: "Stockage",
  storageType: "Type de stockage",
  display: "Écran",
  battery: "Batterie",
  weight: "Poids",
  dimensions: "Dimensions",
  color: "Couleur",
  os: "Système d'exploitation",
  gpu: "Carte graphique",
  camera: "Caméra",
  connectivity: "Connectivité",
};

const KEY_SPECS = [
  "processor",
  "ram",
  "storage",
  "storageType",
  "display",
  "gpu",
  "battery",
  "camera",
  "connectivity",
  "os",
];

export default function ProductSeoContent({ product, related = [] }) {
  if (!product) return null;

  const productPath = product.slug || product._id;
  const productUrl = `${SITE_URL}/products/${productPath}`;
  const category = product.category?.[0];

  const inStock = product.stock > 0;
  const price = (product.price || 0).toLocaleString('fr-FR');

  const specEntries = Object.entries(product.specs || {})
    .filter(([key, value]) => KEY_SPECS.includes(key) && value)
    .map(([key, value]) => [SPEC_LABELS[key] || key, value])
    .slice(0, 6);

  const relatedItems = (related || [])
    .filter((item) => (item._id || item.id) !== (product._id || product.id))
    .slice(0, 4);

  const productName = product.name;

  const faqItems = [
    {
      question: `Quel est le prix de ${productName} ?`,
      answer:
        `Le prix affiché de ${productName} est de ${price} FCFA (prix en vigueur au Sénégal). ` +
        `Avant d'acheter, consultez nos guides de prix pour comparer les modèles disponibles.`,
    },
    {
      question: `Où acheter ${productName} à Dakar ?`,
      answer:
        `Tekalis, boutique high-tech basée à Dakar Fann (Fann, Rue 14), vend ${productName}. ` +
        `Commandez en ligne sur tekalis.com : la livraison est assurée en 24 à 48 heures à Dakar et dans sa banlieue, ` +
        `et en 2 à 5 jours dans les autres régions du Sénégal.`,
    },
    {
      question: "Quels moyens de paiement acceptez-vous ?",
      answer:
        "Nous acceptons le paiement à la livraison (espèces), Wave, Orange Money, Free Money et la carte bancaire (Visa, Mastercard).",
    },
    {
      question: "Le produit est-il garanti ?",
      answer:
        "Chaque produit vendu par Tekalis bénéficie de la garantie du constructeur. La durée de garantie dépend du produit : consultez notre page garanties pour les modalités.",
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <div className="container mx-auto px-4 mb-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* En bref — faits clés (2/3) */}
          <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
              {productName} en bref
            </h2>
            <dl className="space-y-2 text-sm">
              {product.brand && (
                <div className="flex items-center gap-2">
                  <dt className="w-40 font-semibold text-surface-700 dark:text-surface-300">Marque</dt>
                  <dd className="text-surface-900 dark:text-white">{product.brand}</dd>
                </div>
              )}
              {category?.name && (
                <div className="flex items-center gap-2">
                  <dt className="w-40 font-semibold text-surface-700 dark:text-surface-300">Catégorie</dt>
                  <dd className="text-surface-900 dark:text-white">
                    <Link
                      href={`/category/${category.slug || ''}`}
                      className="text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      {category.name}
                    </Link>
                  </dd>
                </div>
              )}
              <div className="flex items-center gap-2">
                <dt className="w-40 font-semibold text-surface-700 dark:text-surface-300">Prix</dt>
                <dd className="text-surface-900 dark:text-white">{price} FCFA</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="w-40 font-semibold text-surface-700 dark:text-surface-300">Disponibilité</dt>
                <dd className={inStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                  {inStock ? "En stock" : "Rupture de stock"}
                </dd>
              </div>
              {specEntries.map(([label, value]) => (
                <div key={label} className="flex items-center gap-2">
                  <dt className="w-40 font-semibold text-surface-700 dark:text-surface-300">{label}</dt>
                  <dd className="text-surface-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Acheter en ligne en confiance — faits boutique */}
          <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Commandez {productName} en ligne — Tekalis Dakar
            </h2>
            <ul className="space-y-3 text-sm text-surface-700 dark:text-surface-300">
              <li className="flex items-start gap-3">
                <FaTruck className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Livraison :</strong> 24 à 48h à Dakar et sa banlieue, 2 à 5 jours dans le reste du Sénégal, offerte dès 50 000 FCFA.{" "}
                  <Link href="/livraison" className="text-brand-600 dark:text-brand-400 hover:underline">Voir les zones et délais</Link>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FaShieldAlt className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Garantie :</strong> couverture assurée selon le produit, avec SAV réactif.{" "}
                  <Link href="/garanties" className="text-brand-600 dark:text-brand-400 hover:underline">Consulter la page garanties</Link>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FaUndo className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Retours :</strong> 7 jours pour retourner un produit non utilisé.{" "}
                  <Link href="/retours" className="text-brand-600 dark:text-brand-400 hover:underline">Lire les conditions</Link>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FaMoneyBillWave className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Paiement :</strong> à la livraison (espèces), Wave, Orange Money, Free Money ou carte bancaire.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Avis clients :</strong> note et avis vérifiés visibles sur cette fiche, déposés après achat.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Produits de la même catégorie — liens internes server-rendered */}
        {relatedItems.length > 0 && (
          <div className="mt-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
              {category?.name ? `Autres produits de la catégorie ${category.name}` : "Produits similaires"}
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedItems.map((item) => (
                <li key={item._id || item.id}>
                  <Link
                    href={`/products/${item.slug || item._id || item.id}`}
                    className="group flex flex-col h-full rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/40 p-4 hover:shadow-card transition"
                  >
                    <span className="text-sm font-semibold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 mb-2 line-clamp-2">
                      {item.name}
                    </span>
                    {item.price != null && (
                      <span className="mt-auto text-sm font-bold text-brand-600 dark:text-brand-400">
                        {(item.price || 0).toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-surface-600 dark:text-surface-400">
              Retrouvez tout notre catalogue sur la page{" "}
              <Link href="/products" className="text-brand-600 dark:text-brand-400 hover:underline">produits</Link>
              {category?.slug ? (
                <> et la catégorie{" "}
                <Link href={`/category/${category.slug}`} className="text-brand-600 dark:text-brand-400 hover:underline">{category.name}</Link></>
              ) : null}.
            </p>
          </div>
        )}

        {/* FAQ produit — contenu visible + schéma */}
        <div className="mt-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800 p-6">
          <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
            Questions fréquentes sur {productName}
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/40 px-4 py-3">
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
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}