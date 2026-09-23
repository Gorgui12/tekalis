import Link from 'next/link';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import ProductCard from '@/components/product/ProductCard';
import { PRIX_GUIDES, SITE_URL } from '@/lib/utils/prixGuides';

const WhatsApp = ({ text }) => (
  <a
    href={`https://wa.me/221786346946?text=${encodeURIComponent(text)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
  >
    Demander le prix
  </a>
);

const guideBySlug = (slug) => PRIX_GUIDES.find((g) => g.slug === slug) || null;

export default function TrendsClient({ suggestions = [], products = [] }) {
  const grouped = suggestions.reduce((acc, s) => {
    const key = s.group || 'Téléphones';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const uncovered = suggestions.filter((s) => !s.hasCover);

  return (
    <div className="min-h-screen bg-surface-50 mt-4 md:mt-8 pb-8">
      <div className="container mx-auto px-4">
        <Breadcrumb items={[{ name: 'Tendances de recherche', path: '/tendances' }]} />

        {/* ── Héro indexable ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-10 mb-8 border border-surface-100">
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-2 font-semibold uppercase tracking-wide">
            Powered by Google Suggestions · Sénégal
          </p>
          <h2 className="text-2xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-4">
            Les recherches de téléphones les plus populaires au Sénégal en ce moment
          </h2>
          <p className="text-surface-600 dark:text-surface-300 leading-relaxed max-w-3xl">
            Voici les requêtes que les Sénégalais tapent sur Google au sujet des iPhone et Samsung.
            Cliquez sur une recherche pour voir les modèles correspondants au prix du jour chez
            Tekalis, avec livraison 24-48h à Dakar.
          </p>
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-surface-100">
            <span className="text-sm bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-4 py-1.5 rounded-full font-semibold">
              {suggestions.length} tendances détectées
            </span>
            <span className="text-sm bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-4 py-1.5 rounded-full font-semibold">
              Mise à jour toutes les 12h
            </span>
          </div>
        </div>

        {/* ── Suggestions groupées par marque ───────────────────────────── */}
        {Object.keys(grouped).length === 0 && (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-10 text-center border border-surface-100">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-2">
              Les tendances arrivent bientôt
            </h2>
            <p className="text-surface-600 dark:text-surface-400 max-w-xl mx-auto">
              Nous collectons actuellement les recherches Google au Sénégal. Revenez dans quelques
              minutes pour voir les requêtes les plus populaires.
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold font-display text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
              {group}
              <span className="text-sm font-semibold text-surface-500 dark:text-surface-400">
                ({items.length})
              </span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const guide = item.guideSlug ? guideBySlug(item.guideSlug) : null;
                return (
                  <div
                    key={item.query}
                    className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-5 border border-surface-100 dark:border-surface-700 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-surface-900 dark:text-white leading-snug">
                        “{item.query}”
                      </span>
                      {item.isNew && (
                        <span className="shrink-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 flex-grow">
                      Détectée le {new Date(item.firstSeen).toLocaleDateString('fr-FR')} ·{" "}
                      {item.hasCover ? 'disponible sur le site' : 'recherche à couvrir'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.hasGuide && guide && (
                        <Link
                          href={`/prix/${guide.slug}`}
                          className="text-xs font-bold text-brand-700 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-300 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition"
                        >
                          Voir le guide de prix
                        </Link>
                      )}
                      {item.hasProduct && item.productSlug && (
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="text-xs font-bold text-surface-700 bg-surface-100 dark:bg-surface-700 dark:text-surface-200 px-3 py-1.5 rounded-lg hover:bg-surface-200 transition"
                        >
                          Voir le produit
                        </Link>
                      )}
                      {!item.hasGuide && !item.hasProduct && (
                        <WhatsApp
                          text={`Bonjour, je cherche une recherche "prix ${item.query}". Quelle est la disponibilité ?`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Opportunités de contenu (recherches non couvertes) ─────────── */}
        {uncovered.length > 0 && (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-8 mb-8 border border-surface-100">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Recherches que vous cherchez et qu&apos;on ne trouve pas encore sur le site
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Ces requêtes sont tapées par les Sénégalais mais il n&apos;existe pas encore de page
              dédiée sur tekalis.com. Envoyez-nous un message si vous cherchez l&apos;un de ces modèles.
            </p>
            <div className="flex flex-wrap gap-2">
              {uncovered.slice(0, 12).map((item) => (
                <WhatsApp
                  key={item.query}
                  text={`Bonjour, je cherche le prix "${item.query}" au Sénégal`}
                />
              ))}
              {uncovered.length > 12 && (
                <a
                  href={`https://wa.me/221786346946?text=${encodeURIComponent('Bonjour, je cherche un téléphone précis')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 text-sm font-bold px-5 py-2.5 rounded-xl transition"
                >
                  +{uncovered.length - 12} autres · WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Liens produits correspondants (en stock) ──────────────────── */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Produits liés aux tendances — en stock à Dakar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* ── Guides de prix associés ───────────────────────────────────── */}
        {PRIX_GUIDES.length > 0 && (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-8 border border-surface-100">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-4">
              Consultez aussi nos guides de prix en FCFA
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIX_GUIDES.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/prix/${guide.slug}`}
                  className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {guide.title} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Schema ItemList généré par la page serveur ────────────────── */}
        <noscript>
          <p>{SITE_URL}/tendances — Recherches téléphones populaires au Sénégal</p>
        </noscript>
      </div>
    </div>
  );
}