import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import ArticleDetailClient from '@/components/blog/ArticleDetailClient';

const SITE_URL = 'https://tekalis.com';

export async function generateMetadata({ params }) {
  try {
    const data = await serverFetch(`/articles/${params.slug}`);
    const article = data?.article || data;
    if (!article) return {};

    return {
      title: `${article.title} | Blog Tekalis`,
      description: article.excerpt || article.title,
      keywords: [...(article.tags || []), 'blog tech Sénégal', 'guide achat Dakar'],
      alternates: { canonical: `${SITE_URL}/blog/${article.slug}` },
      openGraph: {
        type: 'article',
        title: article.title,
        description: article.excerpt,
        images: article.image ? [{ url: article.image }] : [],
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
  const data = await getArticle(params.slug);
  if (!data) notFound();

  const article = data?.article || data;
  const related = data?.relatedArticles || [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: { '@type': 'Person', name: article.author?.name || 'Équipe Tekalis' },
    publisher: {
      '@type': 'Organization',
      name: 'Tekalis',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${article.slug}` },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <ArticleDetailClient article={article} related={related} />
    </>
  );
}