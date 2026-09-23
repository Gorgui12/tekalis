import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import ArticleDetailClient from '@/components/blog/ArticleDetailClient';
import { SOCIAL_LINKS } from '@/lib/utils/constants';

const SITE_URL = 'https://tekalis.com';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const data = await serverFetch(`/articles/${slug}`);
    const article = data?.article || data;
    if (!article) return {};

    const ogImage = article.coverImage?.url || article.image || '';

    return {
      title: `${article.title} | Blog Tekalis`,
      description: article.excerpt || article.title,
      keywords: [...(article.tags || []), 'blog tech Sénégal', 'guide achat Dakar'],
      alternates: { canonical: `${SITE_URL}/blog/${article.slug}` },
      openGraph: {
        type: 'article',
        title: article.title,
        description: article.excerpt,
        images: ogImage ? [{ url: ogImage }] : [],
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
        authors: [article.author?.name || 'Équipe Tekalis'],
      },
    };
  } catch {
    return { title: 'Article | Tekalis Blog' };
  }
}

export const revalidate = 3600;

async function getArticle(slug) {
  try {
    const data = await serverFetch(`/articles/${slug}`);
    return data;
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const data = await getArticle(slug);
  if (!data) notFound();

  const article = data?.article || data;
  const related = data?.relatedArticles || [];
  const ogImage = article?.coverImage?.url || article?.image || '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: ogImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: { '@type': 'Person', name: article.author?.name || 'Équipe Tekalis' },
    publisher: {
      '@type': 'Organization',
      name: 'Tekalis',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1'] },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${article.slug}` },
  };

  // Person — l'auteur en entité autonome (mieux compris par les moteurs/IA)
  const authorName = article.author?.name || 'Équipe Tekalis';
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    jobTitle: article.author?.role || 'Rédacteur Tekalis',
    description: article.author?.bio || `Rédacteur du blog Tekalis, spécialiste tech au Sénégal.`,
    url: `${SITE_URL}/blog`,
    worksFor: {
      '@type': 'Organization',
      name: 'Tekalis',
      url: SITE_URL,
    },
    sameAs: [
      SOCIAL_LINKS.linkedin,
      SOCIAL_LINKS.twitter,
    ].filter(Boolean),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/blog/${article.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {/* H1 server-rendered : la fiche article est un client component, cf. RSC / HW curl. */}
      <h1 className="sr-only">{article.title}</h1>
      <ArticleDetailClient article={article} related={related} />
    </>
  );
}