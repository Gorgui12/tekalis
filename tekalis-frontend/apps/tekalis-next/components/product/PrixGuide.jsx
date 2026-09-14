import Link from 'next/link';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import ProductCard from '@/components/product/ProductCard';
import { PRIX_GUIDES } from '@/lib/utils/prixGuides';
import { FaTruck, FaShieldAlt, FaWhatsapp } from 'react-icons/fa';

const formatFCFA = (value) => (value || 0).toLocaleString('fr-FR');

export default function PrixGuide({ guide, products }) {
  const prices = products.map((p) => Number(p.price)).filter((v) => v > 0);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const otherGuides = PRIX_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  const priceSummary = minPrice && maxPrice
    ? ` entre ${formatFCFA(minPrice)} et ${formatFCFA(maxPrice)} FCFA`
    : ' disponible en FCFA';

  return (
    <div className="min-h-screen bg-surface-50 mt-4 md:mt-8 pb-8">
      <div className="container mx-auto px-4">
        <Breadcrumb
          items={[
            { name: 'Guides de prix', path: '/prix' },
            { name: guide.h1, path: `/prix/${guide.slug}` },
          ]}
        />

        {/* ── Héro indexable ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-10 mb-8 border border-surface-100">
          <h1 className="text-2xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-4">
            {guide.h1}
            <span className="text-brand-600">{priceSummary}</span>
          </h1>
          <p className="text-surface-600 dark:text-surface-300 leading-relaxed max-w-3xl">
            {guide.intro}
          </p>

          {/* Badges de confiance */}
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-surface-100">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <FaTruck size={12} />
              <span>Livraison 24-48h Dakar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full">
              <FaShieldAlt size={12} />
              <span>Garantie constructeur 12 mois</span>
            </div>
            <a
              href="https://wa.me/221786346946?text=Prix%20t%C3%A9l%C3%A9phone"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition"
            >
              <FaWhatsapp size={12} />
              <span>Question sur le prix ? WhatsApp</span>
            </a>
          </div>
        </div>

        {/* ── Produits en stock ──────────────────────────────────────────── */}
        {products.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl md:text-2xl font-bold font-display text-surface-900 dark:text-white">
                Modèles en stock chez Tekalis
              </h2>
              <span className="text-sm text-surface-600 dark:text-surface-400 font-semibold bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-xl px-4 py-2">
                {products.length} modèle{products.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} showSpecs />
              ))}
            </div>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-4 px-1">
              Prix du moment, vérifiés chaque jour. Tous les articles de cette liste sont neufs,
              scellés et disponibles à Dakar avec expédition dans tout le Sénégal.
            </p>
          </>
        ) : (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-10 text-center border border-surface-100 mb-6">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-2">
              Ce modèle est actuellement en réapprovisionnement
            </h2>
            <p className="text-surface-600 dark:text-surface-400 mb-6 max-w-xl mx-auto">
              Demandez-nous le prix du jour et la disponibilité directement sur WhatsApp, ou
              consultez tous nos smartphones disponibles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/221786346946?text=Bonjour%2C%20je%20veux%20conna%C3%AEtre%20le%20prix%20de%20ce%20t%C3%A9l%C3%A9phone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                <FaWhatsapp size={16} />
                Demander le prix sur WhatsApp
              </a>
              <Link
                href="/category/smartphones"
                className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition"
              >
                Voir tous les smartphones
              </Link>
            </div>
          </div>
        )}

        {/* ── Autres guides ──────────────────────────────────────────────── */}
        {otherGuides.length > 0 && (
          <div className="mt-10 mb-6">
            <h2 className="text-xl md:text-2xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Autres prix de téléphones au Sénégal
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/prix/${g.slug}`}
                  className="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 border border-surface-100 dark:border-surface-700"
                >
                  <h3 className="text-sm font-bold font-display text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition leading-snug">
                    {g.h1}
                  </h3>
                  <span className="mt-2 inline-block text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Voir les prix →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        {guide.faqs.length > 0 && (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-8 border border-surface-100">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Questions fréquentes sur le prix
            </h2>
            <div className="space-y-4">
              {guide.faqs.map((faq, index) => (
                <div key={index} className="border-b border-surface-100 dark:border-surface-700 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-sm md:text-base font-semibold text-surface-900 dark:text-white mb-1">{faq.q}</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA final ──────────────────────────────────────────────────── */}
        <div className="mt-8 bg-brand-600 text-white rounded-2xl p-6 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold font-display mb-3">
            Commandez votre téléphone maintenant
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Paiement à la livraison à Dakar, Wave, Orange Money ou carte bancaire. Livraison
            24-48h à Dakar et 3-5 jours dans les régions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/category/smartphones"
              className="inline-flex items-center justify-center bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-surface-50 transition"
            >
              Acheter un smartphone
            </Link>
            <a
              href="https://wa.me/221786346946?text=Bonjour%2C%20je%20veux%20un%20prix%20et%20la%20disponibilit%C3%A9%20d%27un%20t%C3%A9l%C3%A9phone"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition"
            >
              <FaWhatsapp size={16} className="mr-2" />
              WhatsApp : +221 78 634 69 46
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}