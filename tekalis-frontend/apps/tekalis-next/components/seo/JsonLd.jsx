import { serializeJsonLd } from '@/lib/seo/jsonld';

/**
 * Composant JSON-LD rendu cote serveur.
 *
 * On n'utilise PAS `next/script` : un script injecte apres l'hydratation
 * n'apparait pas dans le HTML source et n'est donc pas lu par les crawlers.
 * Le `<script>` est ecrit directement dans le JSX, comme dans layout.jsx.
 */
export default function JsonLd({ data, id }) {
  if (!data) return null;

  return (
    <script
      {...(id ? { id } : {})}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
