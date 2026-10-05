# Changelog SEO — Tekalis (corriges appliques)

## Objectif
Passer des positions 5–8 au top 3 (objectif de gain de positions), en respectant strictement le cadrage CTR fourni, sans annoncer de gain de clics chiffre.

## Commits (branche `seo/gsc-ctr-boost`)

| Commit | Date | Description | Impact |
|---|---|---|---|
| 21ab594 | 2026-10-06 | `fix(seo): HTML rendu serveur vide (PersistGate bloquant + bailout Suspense)` | **Critique**. Corrige un `<body>` vide (155 caracteres) sur l'ensemble des pages. Le contenu SSR est reapparu : `/category/smartphones` passe de 155 a ~187 000 caracteres visibles, 1 H1 unique. |
| c126726 | 2026-10-06 | `fix(seo): statuts HTTP reels, robots.txt et sitemap` | **Critique**. Supprime `app/loading.jsx` qui gelait les statuts HTTP (soft 404). `/products/<ObjectId>` → 308 vers le slug propre ; URLs inexistantes → 404 reels. `robots.txt` ne bloque plus les pages `noindex`, sitemap corrige (slugs reels, repli sans URL 404). |
| ecc0a89 | 2026-10-06 | `fix(seo): titres raccourcis, h1 pages privees, script de controle HTTP` | Corrige la duplication du suffixe de marque dans les titres (titres deja complets passes en `absolute`). Ajoute `<h1 class="sr-only">` sur `/login`, `/register`, `/cart`. Cree `scripts/seo-check.mjs` et commandes `seo:check`, `seo:content`. |
| 57e2645 | 2026-10-06 | `fix(seo): omettre itemCondition pour les 15 produits 'Venant'` | Prudence structuree : 15 produits dont le nom contient « Venant » n'ont plus `itemCondition` dans JSON-LD (donnee non verifiee). |

## Changements techniques majeurs

### Rendu serveur
- `components/shared/Providers.jsx` : `PersistGate` ne bloque plus le SSR (enfants rendus directement tant que l'hydratation n'est pas initiee). Cree le persistor uniquement cote navigateur (conforme a `store/index.js`).
- `components/product/ProductsClient.jsx`, `app/register/page.jsx`, `app/verify-email/page.jsx` : `useSearchParams()` encapsule dans `<Suspense>` pour eviter le bailout vers CSR.
- `app/category/[slug]/page.jsx` : branchement de `lib/seo/categoryContent.js` (H1 + introduction serveur, FAQ, `ItemList` + `BreadcrumbList` JSON-LD), vrai 404 uniquement si l'API repond, maillage entre categories.
- `app/loading.jsx` (racine) : supprime (coupable du gel des statuts HTTP).

### Statuts HTTP & redirections
- URLs historiques (ObjectId) et anciens slugs a suffixe numerique : **308 Permanent Redirect** vers le slug propre (App Router). Les URLs inexistantes renvoyent un **vrai 404 HTTP**, sans soft 404.
- Pages privees (`/login`, `/register`, `/cart`, `/wishlist`, `/checkout`) : `noindex, nofollow` dans leur metadata, accessibles aux crawlers pour permettre la lecture du `noindex` (conformite aux bonnes pratiques).

### Robots, Sitemap, Canonicals
- `app/robots.js` : ne bloque plus que `/admin`, `/api/`, `/payment/`. Suppression du groupe `Googlebot` separe (neutralisait les `Disallow` du groupe `*`). Ne bloque pas `/_next` (necessaire au rendu).
- `app/sitemap.js` : repli de categories utilise `KNOWN_CATEGORY_SLUGS` (unique source de verite), chemins via `categoryPath/productPath/articlePath`. 239 URLs servies, 0 URL invalide.
- Canonicals : auto-referentiels, host `https://tekalis.com` (sans www), sur toutes les pages indexables. Pages privees portent aussi leur canonical.

### JSON-LD
- Fiche produit : `Product`, `Offer`, `AggregateRating`, `Review` (si disponibles), `BreadcrumbList`. `itemCondition` omis pour les 15 produits « Venant ».
- Categories : `ItemList` + `BreadcrumbList`. Accueil : `Organization`, `WebSite` + `SearchAction`. Articles : `Article`, `BreadcrumbList`.

### Metadata
- Suppression des `meta keywords` sur toutes les pages (ignore par Google depuis 2009).
- Correction des titres pour eviter la duplication du suffixe de marque (`| Tekalis Senegal` ajoute par le template du layout). Titres produits/ articles coupes au mot pour preserver l'espace.
- Pages privees avec `<h1 class="sr-only">` pour une hierarchie de titres saine.

### Outillage
- `scripts/seo-check.mjs` : audit HTTP du HTML servi (statuts, H1, title, canonical, robots, keywords, JSON-LD, volume de texte, doublons). Sondes : produit inexistant→404, ObjectId→308, categorie/article/guide inexistant→404.
- `scripts/check-seo-content.mjs` : controle qualite du contenu editorial des 16 categories (coverage API, longueurs, FAQ, marques, absence de caracteres corrompus).
- `package.json` : scripts `seo:check`, `seo:content`.

## Baseline (reference)
GSC (reference fournie) : 43 clics, 2 453 impressions, CTR 1,75 %, position moyenne ~7,7. Smartphones ~67 % des impressions a position ~6,5.

## Cadrage CTR preserve
Cadrage CTR valide conserve (non modifie) : position 1 20 %, pos2 10,4 %, pos3 3,9 %, pos4 1,7 %, pos5 1,1 %, pos6–10 0,5–0,7 %. Le CTR ~1,0% a ~pos6,5 est juge normal. Les comparaisons porteront sur **position moyenne** et **part des impressions en top 3**.

## Etat post-corrections (HTML servi)
Verification sur serveur Next.js de production locale :

| Page | Statut | H1 | Visible (car.) | Robots | Canonical |
|---|---|---|---|---|---|
| `/` | 200 | 1 | ~75 780 | index,follow | self |
| `/products` | 200 | 1 | ~38 879 | index,follow | self |
| `/products/<slug>` | 200 | 1 | ~78 000 | index,follow | self |
| `/products/<ObjectId>` | 308 | — | — | — | → slug |
| `/category/smartphones` | 200 | 1 | ~189 161 | index,follow | self |
| `/category/<inexistante>` | 404 | — | — | — | — |
| `/products/<inexistant>` | 404 | — | — | — | — |
| `/blog` | 200 | 1 | ~97 228 | index,follow | self |
| `/login` | 200 | 0 (sr-only) | ~36 790 | noindex,nofollow | self |
| `/register` | 200 | 0 (sr-only) | ~36 852 | noindex,nofollow | self |
| `/cart` | 200 | 0 (sr-only) | ~38 081 | noindex,nofollow | self |

16 categories pre-rendues : 1 H1 chacune, contenu serveur substantiel, aucune `meta keywords`. Sitemap : 239 URLs, 0 invalide. `seo:check` OK, `seo:content` OK.

## Points d'attention
- `permanentRedirect()` produit un **308** (App Router) au lieu d'un 301. Equivalent pour Google, aucun impact negatif.
- Suppression de `app/loading.jsx` globale : navigation vers pages attend l'API sans spinner global (compromis accepte pour avoir des statuts HTTP exacts).
- Pages privees restent crawlables (pas de Disallow) afin que leur `noindex` soit effectivement lu par les moteurs.

## Non commite (intentionnel, conforme instruction)
- `tekalis-backend/scripts/ameliorer-blog.js`
- `tekalis-backend/scripts/restaurer-articles.js`
- `blog/lot3/`
- `config/`
- `tekalis-backend/scripts/maj-prix-plus30.js`
- `tekalis-backend/scripts/verifier-blog.js`
- `seo-audit-report.txt`
Ces fichiers restent non suivis (untracked) et ne seront pas commits.