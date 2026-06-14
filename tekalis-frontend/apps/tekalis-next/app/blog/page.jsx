import { serverFetch } from "@/lib/serverFetch";
import BlogClient from '@/components/blog/BlogClient';

export const metadata = {
  title: 'Blog Tech Sénégal — Tests, Guides & Actualités | Tekalis',
  description:
    'Tests exclusifs, guides d\'achat et actualités tech au Sénégal. Trouvez le meilleur smartphone, laptop ou TV adapté à votre budget à Dakar.',
  alternates: { canonical: 'https://tekalis.com/blog' },
};

export const revalidate = 1800;

async function getArticles() {
  try {
    const data = await serverFetch('/articles?limit=50');
    return data?.articles || data?.data || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const articles = await getArticles();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Tekalis Blog — Tech Sénégal',
    description: 'Tests, guides d\'achat et actualités tech au Sénégal',
    url: 'https://tekalis.com/blog',
    publisher: { '@type': 'Organization', name: 'Tekalis', logo: 'https://tekalis.com/og-image.png' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <BlogClient initialArticles={articles} />
    </>
  );
}