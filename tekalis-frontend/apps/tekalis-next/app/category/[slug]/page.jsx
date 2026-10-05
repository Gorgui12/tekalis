import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import CategoryClient from '@/components/product/CategoryClient';
import Breadcrumb from '@/components/seo/Breadcrumb';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl, categoryPath, productPath } from '@/lib/seo/config';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/seo/jsonld';
import { categoryBreadcrumb } from '@/lib/seo/breadcrumbs';
import {
  CATEGORY_CONTENT,
  buildFallbackCategoryContent,
} from '@/lib/seo/categoryContent';

export const revalidate = 3600;

/**
 * Metadata de categorie.
 *
 * Le contenu editorial vient de `lib/seo/categoryContent.js` (un titre et une
 * description par categorie, valides par `scripts/check-seo-content.mjs`).
 * L'objectif est la pertinence de la page sur les requetes de categorie a
 * Dakar, donc un prix en FCFA dans le titre et une description qui reprend le
 * lieu et la disponibilite locale.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category || category.apiError) {
    // API indisponible : on rend quand meme une page avec un repli, on ne
    // renvoie pas de noindex (une erreur de fetch ne doit pas deindexer).
    const fallback = buildFallbackCategoryContent({ name: slug.replace(/-/g, ' ') });
    return buildCategoryMetadata(fallback, slug);
  }

  const content = CATEGORY_CONTENT[slug] ?? buildFallbackCategoryContent(category);
  return buildCategoryMetadata(content, slug);
}

function buildCategoryMetadata(content, slug) {
  const canonical = absoluteUrl(categoryPath(slug));

  return {
    title: content.title,
    description: content.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title: content.title,
      description: content.description,
      url: canonical,
      locale: 'fr_SN',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
    },
  };
}

async function getCategoryBySlug(slug) {
  try {
    const data = await serverFetch('/categories');
    const categories = data?.categories || [];
    const flat = categories.reduce((acc, cat) => {
      acc.push(cat);
      if (cat.children) acc.push(...cat.children);
      return acc;
    }, []);
    return flat.find((c) => c.slug === slug) || null;
  } catch {
    // API indisponible (build Vercel, rate-limit 429, cold start Render) :
    // on ne doit PAS retourner 404 ici — la page se rend avec le repli SEO
    // et le composant client rafraîchit les produits.
    return { apiError: true };
  }
}

async function getProductsByCategory(categoryId) {
  try {
    const data = await serverFetch(`/products?category=${categoryId}&limit=200`);
    return data?.data || data?.products || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const data = await serverFetch('/categories');
    const categories = data?.categories || [];
    const flat = categories.reduce((acc, cat) => {
      acc.push(cat);
      if (cat.children) acc.push(...cat.children);
      return acc;
    }, []);
    return flat.filter((c) => c.isActive !== false).map((c) => ({ slug: c.slug }));
  } catch {
    return Object.keys(CATEGORY_CONTENT).map((slug) => ({ slug }));
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);

  // 404 UNIQUEMENT si l'API a répondu et qu'aucune catégorie ne correspond.
  // Si l'API est injoignable (build / rate-limit), on rend la page avec le
  // repli SEO et le client component charge les produits.
  const apiUnavailable = category?.apiError === true;
  if (!category && !apiUnavailable) {
    notFound();
  }

  const products = apiUnavailable
    ? []
    : await getProductsByCategory(category._id);

  const content =
    CATEGORY_CONTENT[slug] ?? buildFallbackCategoryContent(category ?? undefined);

  const canonical = absoluteUrl(categoryPath(slug));
  const breadcrumbItems = categoryBreadcrumb(content.h1, slug);

  // ItemList : la liste des produits reellement en base, pour que Google
  // puisse associer la page de categorie a ses produits.
  const itemList = buildItemListSchema(content.h1, products, {
    url: canonical,
    startPosition: 1,
  });

  return (
    <>
      <JsonLd id="category-itemlist" data={itemList} />
      <JsonLd id="category-breadcrumb" data={buildBreadcrumbSchema(breadcrumbItems)} />

      <div className="container mx-auto px-4 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* H1 et introduction rendus serveur : presents dans le HTML brut, donc
          exploitables par les crawlers sans execution de JavaScript. */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-4">
          {content.h1} à Dakar
        </h1>
        {content.intro && (
          <div className="max-w-3xl text-surface-600 dark:text-surface-300 leading-relaxed space-y-3">
            {content.intro.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>

      <CategoryClient products={products} slug={slug} />

      {/*
        FAQ rendered server-side : le texte des questions et des reponses est
        dans le HTML. Google n'affiche plus les FAQ enrichies dans ses
        resultats depuis 2023, mais le contenu reste utile au lecteur et
        coherent avec le JSON-LD.
      */}
      {content.faqs?.length > 0 && (
        <section className="container mx-auto px-4 py-12" aria-labelledby="faq-cat">
          <h2
            id="faq-cat"
            className="text-2xl font-bold font-display text-surface-900 dark:text-white mb-6"
          >
            Questions fréquentes — {content.h1}
          </h2>
          <div className="max-w-3xl space-y-4">
            {content.faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4"
              >
                <summary className="font-semibold text-surface-900 dark:text-white cursor-pointer">
                  {faq.q}
                </summary>
                <p className="mt-2 text-surface-600 dark:text-surface-300 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Maillage interne : renvoie vers les autres categories reelles. */}
      <RelatedCategories currentSlug={slug} />
    </>
  );
}

/**
 * Liens vers les autres categories. Sert au maillage entre pages de
 * catégories : chaque categorie point vers les autres sans passer par le
 * header, ce qui rend la hierarchie du site lisible par les crawlers.
 */
function RelatedCategories({ currentSlug }) {
  const others = Object.entries(CATEGORY_CONTENT)
    .filter(([slug]) => slug !== currentSlug)
    .map(([slug, content]) => ({ slug, h1: content.h1, description: content.description }));

  if (others.length === 0) return null;

  return (
    <section
      className="container mx-auto px-4 pb-16"
      aria-labelledby="nav-categories"
    >
      <h2
        id="nav-categories"
        className="text-2xl font-bold font-display text-surface-900 dark:text-white mb-6"
      >
        Nos autres rayons
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {others.map((other) => (
          <a
            key={other.slug}
            href={categoryPath(other.slug)}
            className="block p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition"
          >
            <span className="font-semibold text-surface-900 dark:text-white block mb-1">
              {other.h1}
            </span>
            <span className="text-sm text-surface-600 dark:text-surface-300 line-clamp-2">
              {other.description}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}