# SEO_AUDIT.md — Audit initial tekalis.com

Date de l'audit : 2026-10-05
Branche de travail : `seo/gsc-ctr-boost` (creee depuis `main` @ `dad927b`)
Perimetre : application publique Next.js uniquement — `tekalis-frontend/apps/tekalis-next`
Aucune modification de code n'a ete faite pendant cet audit (lecture seule).

---

## ⚠️ A LIRE EN PREMIER : LA PRODUCTION NE SERT PAS L'APP NEXT.JS

**La production sert (servait) l'ancienne application React/Vite, pas l'application Next.js du depot.**

Preuves convergentes :

1. **Le diagnostic Search Console correspond mot pour mot au `index.html` de l'ancienne app Vite.**
   - GSC : « Une fiche produit semble servir le titre generique de l'accueil : *Tekalis - Boutique Electronique & High-Tech au Senegal | Dakar* ».
   - Ancien `index.html` (`apps/client`, supprime par le commit `df70e63`) : `<title>Tekalis - Boutique Electronique & High-Tech au Sénégal | Dakar</title>`.
   - Le titre de l'app Next.js est different : `Tekalis — Boutique Électronique & High-Tech au Sénégal | Dakar` (tiret cadratin, accent).
   => C'est l'app Vite, avec `react-helmet-async`, qui repondait. Une SPA Vite sert le meme `<head>` pour toutes les routes : d'ou **toutes les fiches produits avec le meme titre**, aucune meta description par page, aucun JSON-LD par fiche, et un HTML initial vide (contenu rendu cote client).

2. **`apps/client` n'existe plus dans le depot.** Supprime par le commit `df70e63`. Recuperable via `git show df70e63^:tekalis-frontend/apps/client/...`.

3. **La config de deploiement ne peut pas cibler l'app Next.js en l'etat.**
   `tekalis-frontend/vercel.json` = `{ "framework": "nextjs", "outputDirectory": ".next" }`, place a la racine du monorepo alors que l'app Next.js est dans `apps/tekalis-next/`. Sans reglage de « Root Directory » dans le tableau de bord Vercel, le build echoue.

4. **Aucun dossier deployable de l'app Next.js n'est configure** : pas de `Dockerfile`, `render.yaml`, `Procfile`, `ecosystem.config.js`, ni CI (`.github/`, `.gitlab-ci.yml` absents).

**Consequence : tout le travail SEO de ce depot ne produira d'effet qu'a la bascule vers l'app Next.js.** Voir `SEO_POST_DEPLOY.md`.

---

## 1. Structure du depot, gestionnaire de paquets, scripts

### 1.1 Depot

```
tekalis-corrige/
  blog/                  lots 1-3 de brouillons d'articles (HTML)
  config/opencode/commands/seo-tekalis.md   <- la mission SEO
  tekalis-backend/       Express + Mongoose (API /api/v1)
  tekalis-frontend/
    apps/admin/          Vite (back-office) — conserve
    apps/tekalis-next/   *** APP SEO CIBLE *** Next.js 15 App Router
    packages/shared/     hooks/redux partiellement orphelins
    vercel.json
  back.txt / front.txt   notes de deploiement en prose
  CHANGELOG-AUDIT.md
```

### 1.2 Gestionnaires de paquets

- **npm workspaces** a la racine `tekalis-frontend/package.json` (`apps/*`, `packages/*`) + `package-lock.json` par application.
- L'app cible a **sa propre racine** : `tekalis-frontend/apps/tekalis-next/package.json` + `package-lock.json` + `node_modules/`. Les commandes de developpement/build se lancent **depuis `apps/tekalis-next`**.

### 1.3 Scripts de l'app cible

`tekalis-frontend/apps/tekalis-next/package.json` :

| Script | Commande |
|---|---|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `next lint` |
| `audit:geo` | `node scripts/audit-geo.mjs` |

Pas de script `test` dans l'app front.

> **Defaut a corriger hors perimetre** : `tekalis-frontend/package.json` (racine) reference encore `apps/client`, supprime : `dev:client`, `build:client`, `build` casses.

### 1.4 Versions

- **Next.js `^15.3.3`** (App Router), **React `^19`**, **Tailwind `^4`**, `@vercel/analytics`, `@reduxjs/toolkit`, `react-redux`, `redux-persist`, `axios`, `isomorphic-dompurify`, `react-icons`.
- **TypeScript : outille mais ecarte.** `tsconfig.json` present (`strict: true`, `allowJs: true`), **tous les fichiers applicatifs sont en `.js` / `.jsx`**. `next-env.d.ts` et le plugin `next` sont presents, mais aucun `.ts`/`.tsx` n'existe dans `app/`, `components/` ou `lib/`.
  => **Decision : les helpers SEO sont ecrits en `.js`/`.jsx`** pour rester coherents (regle « imiter le style existant »), pas en TypeScript.

### 1.5 Runner de tests

- **Backend** : `node --test` (`tekalis-backend/test/*.test.js`) — uniquement auth + emails. Aucun test produit/categorie/article.
- **App Next.js** : **aucun runner installe**. Pas de `test` script, pas de jest/vitest.
  => Phase 9 utilise **`node:test`** (natif Node 22, aucune dependance).

---

## 2. Quelle app est deployee en production

Voir le bandeau d'avertissement en tete de ce document. Resume :

| Cible | Etat |
|---|---|
| Ancien storefront Vite (`apps/client`) | **Supprime du depot**, correspond au profil observe en GSC. C'est ce que la production servait. |
| App Next.js (`apps/tekalis-next`) | Riche en SEO deja, **jamais publiee** (config de deploiement non alignee). |
| Back-office admin (`apps/admin`) | Separe, sur `admin.tekalis.com` (`NEXT_PUBLIC_ADMIN_URL`). |
| API (`tekalis-backend`) | `https://tekalis.onrender.com/api/v1` (Render). **Joignable et fonctionnel le 2026-10-05 : 180 produits, 16 categories.** |

---

## 3. Routes

Toutes en App Router, sous `tekalis-frontend/apps/tekalis-next/app/`.

### Existantes et indexables

| Route | Fichier | Type |
|---|---|---|
| `/` | `page.jsx` | Server (`revalidate = 300`) |
| `/products` | `products/page.jsx` | Server (`revalidate = 3600`) |
| `/products/[id]` | `products/[id]/page.jsx` | Server (`revalidate = 3600`) — accepte **slug OU ObjectId** |
| `/category/[slug]` | `category/[slug]/page.jsx` | Server (`revalidate = 3600`, `generateStaticParams`) |
| `/blog` | `blog/page.jsx` | Server (`revalidate = 1800`) |
| `/blog/[slug]` | `blog/[slug]/page.jsx` | Server (`revalidate = 3600`) |
| `/prix`, `/prix/[slug]` | `prix/page.jsx`, `prix/[slug]/page.jsx` | Server / statique + `generateStaticParams` |
| `/tendances` | `tendances/page.jsx` | Server |
| `/faq`, `/livraison`, `/garanties`, `/retours` | `faq/page.jsx`, ... | Statique |
| `/cgv`, `/mentions-legales`, `/politique`, `/cookies` | ... | Statique |
| `/apropos`, `/contact` | `apropos/page.jsx`, `contact/page.jsx` | Statique (Server) |
| `/payment/success/[orderId]`, `/payment/cancel/[orderId]` | ... | Server |
| `/verify-email`, `/reset-password/[token]`, `/forgot-password` | ... | Statique |

### Existantes, a ne pas indexer

`/cart`, `/checkout`, `/dashboard/*` (5 pages), `/profile`, `/wishlist`, `/login`, `/register`, `/admin`.

### Absente alors qu'elle existe en production

**`/configurator` : la route n'existe PAS dans l'app Next.js.** La production Vite la servait (21 impressions en GSC) et le composant `ConfigStep.jsx` + `BudgetSlider.jsx` existe toujours dans `components/home/`, mais aucune page ne l'expose plus. **La route renvoie 404.** Cf. Phase 5.

### Convention de routes

Segments kebab-case, dynamique = `[id]` / `[slug]`, pas de `route groups`, pas de `basePath`, pas de `trailingSlash`.

---

## 4. Recuperation des donnees produit

### 4.1 Le texte produit est-il dans le HTML serveur ?

**Oui, dans l'app Next.js — et c'est deja l'un des points forts du code actuel.**

`app/products/[id]/page.jsx` est un **Server Component**. Il appelle `serverFetch()` (`lib/serverFetch.js`, `fetch` natif avec `{ next: { revalidate } }`) et rend :
- un `<h1 className="sr-only">{product.name}</h1>` ligne 217 ;
- `<script type="application/ld+json">` Product + BreadcrumbList (lignes 214-215) ;
- `<ProductDetailClient product={product} />` (client, galleries/panier) ;
- `<ProductSeoContent product={product} related={related} />` (Server, ~246 lignes : « En bref », specs cles, 5 arguments de confiance, produits lies, FAQ visible).

Les commentaires du code confirment que ce choix est|delibere (« H1 server-rendered : la fiche produit est un client component, cf. RSC / HW curl », layout.jsx ligne 176-179).

**Mais tout cela est invisible en production tant que la Vite SPA est servie** (item 2 ci-dessus). C'est exactement le symptome « texte absent du HTML serveur » de la mission.

### 4.2 Composants `"use client"` sur le chemin de la page produit

| Fichier | Role |
|---|---|
| `components/product/ProductDetailClient.jsx` | Toute la zone d'achat (galerie, quantite, panier, favoris) |
| `components/product/ProductGallery.jsx` | Galerie d'images |
| `components/shared/Providers.jsx` | Redux (panier) |
| `components/shared/ThemeProvider.jsx`, `AnalyticsProvider.jsx` |/theme + analytics |
| `components/auth/AuthPromptHost.jsx` | Invitations a creer un compte |
| `components/shared/SearchBarLive.jsx`, `Navbar.jsx`, `Footer.jsx`, `MobileMenu.jsx` (vide, 0 octet) | Chrome global |
| `components/review/ReviewList.jsx`, `ReviewForm.jsx`, `ReviewCard.jsx`, `StarRating.jsx` | Avis |
| `components/cart/*`, `components/shared/ImageZoom.jsx`, `ToastProvider.jsx`, `ErrorBoundary.jsx`, `ConsentBanner.jsx` | Support |

**Le store Redux reste cote client** pour le panier : a conserver. Les donnees serveur doivent simplement etre passees en props (deja le cas).

---

## 5. Gestion actuelle du `<head>`

**App Router, `metadata` / `generateMetadata` uniquement.** Ni `next/head`, ni `react-helmet` dans l'app Next.js (`react-helmet-async` n'existait que dans l'app Vite supprimee).

| Element | Etat |
|---|---|
| `metadataBase` | `new URL('https://tekalis.com')` — layout ligne 26 |
| Titre par defaut + template | `Tekalis — Boutique Electronique & High-Tech au Senegal \| Dakar` + template `%s \| Tekalis Senegal` |
| `metadata` de `app/products/[id]/page.jsx` | **`generateMetadata`** (ligne 10), titre `Prix {nom} a Dakar — {prix} FCFA \| Tekalis Senegal` |
| `metadata` de `app/category/[slug]/page.jsx` | **`generateMetadata`** (ligne 96), carte `CATEGORY_SEO` |
| `metadata` de `app/blog/[slug]/page.jsx` | **`generateMetadata`**, titre `{article.title} \| Blog Tekalis` |
| `metadata` de `app/prix/[slug]/page.jsx` | **`generateMetadata`**, donne par `lib/utils/prixGuides.js` |

**Absences constatales :**

- **Pas de `<meta name="description">` ni de canonical** sur `/login`, `/register`, `/cart` (titre seul).
- **Pas de `robots` sur `/login`, `/register`, `/cart`** → ils heritent `index, follow` du layout. `/checkout`, `/profile`, `/wishlist`, `/dashboard` ont bien `robots: { index: false }`.
- **Pas de canonical** sur `/login`, `/register`, `/cart`, `/checkout`, `/profile`, `/wishlist`, `/dashboard`.
- `app/not-found.jsx` : **aucune `metadata`**, aucun appel a `notFound()` a l'interieur (c'est bien le composant 404, mais il ne porte ni `robots` ni titre propre).

---

## 6. Presence de robots / sitemap / canonical / JSON-LD / metadataBase / lang

| Element | Etat | Emplacement |
|---|---|---|
| `robots.txt` | ✅ present, **bloque `/login`, `/register`, `/cart`, `/checkout`, `/dashboard`, `/profile`, `/wishlist`, `/admin`, `/api/`** | `app/robots.js` |
| `sitemap.xml` | ✅ dynamique (produits, categories, articles, 7 guides de prix, 15 pages statiques) | `app/sitemap.js` |
| canonical | ✅ sur accueil, `/products`, categories, blog, prix, contact, apropos, faq, livraison, garanties, retours, cgv, mentions, politique, cookies, tendances, fiches produit. ❌ sur login/register/cart/checkout/profile/wishlist/dashboard |.pages |
| JSON-LD | ✅ `LocalBusiness` (layout), `WebSite`+`SearchAction` (accueil), `CollectionPage` (`/products`, categories, `/prix`), `Product`+`BreadcrumbList` (fiche), `Article`+`Person`+`BreadcrumbList` (blog), `Blog`, `ItemList` (`/tendances`, `/prix/[slug]`), `FAQPage` (accueil, categories, fiche, `/faq`) | voir section 5 |
| `metadataBase` | ✅ | `app/layout.jsx:26` |
| `<html lang>` | ✅ `lang="fr"` | `app/layout.jsx:147` |

### Problemes reels identifies dans ces blocs

1. **`FAQPage` est en tension avec les directives de Google.** Google n'affiche plus les resultats enrichis FAQ que pour quelques sites institutionnels de premier plan, et **une balise `FAQPage` sans contenu visible equivalent est une violation des directives**. Ici le cas est inverse (« visible mais pas de schema ») pour `ProductSeoContent`, mais `/faq`, l'accueil et les categories injectent du `FAQPage`. A arbitrer.
2. **`aggregateRating` / `review`** : `app/products/[id]/page.jsx:178-187` n'injecte `aggregateRating` que si `product.rating.count > 0` et `review` que si `/reviews/:id` repond. **Aucune donnee fabriquee** — conforme. A verifier que `rating.count` est bien alimente en base (les 180 produits affiches n'exposent pas `rating` dans le listing).
3. `app/robots.js` **interdit `/login` et `/register`** : Google ne peut alors pas lire la meta `noindex` que la mission veut poser. Conflit a resoudre (Phase 5).
4. **Hote canonique = `https://tekalis.com` (sans `www`)**, utilise a peu pres partout (layout, robots, sitemap, prixGuides, Footer, backend). `NEXT_PUBLIC_SITE_URL=https://tekalis.com` dans `.env.local`. **Aucune redirection www <-> non-www n'existe en code.**

---

## 7. Champs reellement disponibles par produit

Source : `tekalis-backend/models/Product.js` + reponse observee de l'API.

| Champ | Type | Present / exploitable |
|---|---|---|
| `name` | String required | ✅ |
| `slug` | String, unique, lowercase | ✅ (`samsung-galaxy-a14-128-go-4-go`) |
| `description` | String required | ✅ |
| `price` | Number required | ✅ (ex. `110500`) |
| `comparePrice` | Number | ✅ prix barre |
| `stock` | Number, default `0` | ✅ |
| `status` | enum `available` / `preorder` / `outofstock` / `discontinued` | ✅ |
| `condition` | enum `new` / `refurbished` / `used`, default `new` | ⚠️ **vaut `new` sur les 180 produits, y compris les `-venant`** |
| `brand` | String required | ✅ (`Samsung`, `Apple`, `Felicity Solar`, `Generique`…) |
| `category[]` | ObjectId[] populate `name slug isActive` | ✅ |
| `images[]` | `{ url, alt, isPrimary }` | ✅ |
| `specs.*` | 27 sous-champs (`processor`, `ram`, `storage`, `screen`, `battery`, `camera`, `os`, `connectivity[]`, `color[]`…) | ✅ a confirmer par produit |
| `rating` | `{ average, count }` | ✅ structure |
| `warranty` | `{ duration: 12, type: 'constructeur' }` | ✅ |
| `metaTitle` / `metaDescription` | String | ✅ (peu remplis) |
| `sku` | ❌ **n'existe pas** | le code utilise `product._id` comme `sku` |
| `mpn` / `gtin` | String optionnels | ✅ |
| `weight` | Number, default 0 (kg) | ✅ |
| `createdAt` / `updatedAt` | timestamps | ✅ (`lastModified` sitemap) |

**Signaux d'etat neuf / occasion :** le champ `condition` existe (avec `used` et `refurbished` geres dans l'admin : `apps/admin/src/pages/EditProduct.jsx:561-562`) mais **vaut `new` partout**. L'information « venant » n'existe que dans le **nom/slug** (`iphone-12-64-go-venant`, `samsung-galaxy-s20-fe-5g-venant`, 14 produits).

---

## 8. Pourquoi existe-t-il une URL produit par identifiant brut ?

`/products/<ObjectId>` (`/products/6a005ee25e0833fe9f2d6125`) est un **historique de l'ancienne app Vite** (`vite.config.js` definissait `__SITE_URL__`, et le backend a longtemps servi `/produit/:slug`).

**La route accepte les deux formes.** `tekalis-backend/controllers/productController.js:212` :

```js
const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
```

Et le cote Next.js redirige deja l'identifiant vers le slug — `app/products/[id]/page.jsx:85-87` :

```js
if (product.slug && product.slug !== id) {
  permanentRedirect(`/products/${product.slug}`);
}
```

### 🔴 DECOUVERTE CRITIQUE : les URL indexees par Google sont toutes mortes

Les slugs de production **n'ont plus de suffixe numerique**, alors que le brief donne des URL comme :

| URL dans le brief / dans Google | Etat reel (verifie le 2026-10-05) |
|---|---|
| `/products/samsung-galaxy-a14-128-go-4-go-1786915894592` | **404** (API : `404 Produit introuvable`) |
| `/products/micro-ondes-roch-20l-numerique-1789586038596` | **404** |
| `/products/ventilateur-rechargeable-solaire-16-pouces-avec-panneau-1789586038596` | **404** |
| `/products/samsung-galaxy-a14-128-go-4-go` | ✅ 200 |

Le suffixe `1786915894592` est un `Date.now()` ajoute par `resolveUniqueSlug` (`productController.js:54-67`) quand le slug de base etait deja pris. Les slugs ont ete regeneres proprement entre-temps — **sans redirection**. Consequence : **la page la plus vue de la baseline (A14, 312 impressions) et la plupart des pages smartphones renvoie 301 vers `/products`** (`fetchProduct` renvoie `"not-found"` → `permanentRedirect('/products')`, ligne 61-63).

**C'est la source #1 de perte de visibilite.** Ces 404 prevent le classement : sans URL servie, aucune optimisation de titre ou de contenu ne peut produire de gain de position. Correctif Phase 5.

---

## 9. Fonction de slugify et bug des accents

### Versions correctes (NFD + suppression des diacritiques)

| Fichier | Ligne |
|---|---|
| `tekalis-backend/utils/helpers.js` | ✅ `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")` |
| `tekalis-backend/controllers/productController.js` | ✅ idem (`slugify`, lignes 45-52) |
| `tekalis-backend/models/Category.js` | ✅ idem (lignes 48-58) |
| `apps/admin/src/pages/AddProduct.jsx` | ✅ `.normalize("NFD")` |
| `apps/tekalis-next/lib/utils/formatters.js` | ✅ idem (ligne 132) |

### Versions buguees (pas de NFD → l'accent devient un separateur)

| Fichier | Effet |
|---|---|
| **`tekalis-backend/models/Article.js:81-89`** | `title.toLowerCase().replace(/[^a-z0-9]+/g, "-")` — **c'est le bug du brief** : `Meilleur Smartphone 2026 au Sénégal` → `meilleur-smartphone-2026-au-s-n-gal` (le `é` est supprime au lieu d'etre normalise, laissant `s-n-gal`). |
| `tekalis-backend/controllers/productController.js:86` | Categories auto-creees : `name.toLowerCase().replace(/\s+/g, "-")`, pas de NFD. |

**Reparation Phase 5** : corriger `models/Article.js` pour les **nouveaux** slugs uniquement (le garde `if (this.isModified("title") && !this.slug)` garantit qu'un slug deja renseigne n'est jamais reecrit → **aucun slug existant n'est touche**).

---

## 10. Textes commerciaux deja presents (a reutiliser a l'identique)

### Livraison — `app/livraison/page.jsx`
- Dakar : `24h`, `24 - 48h`, `48h` selon la zone ; frais `1 500 FCFA`, `2 000 FCFA`, `2 500 FCFA`.
- « Votre commande est préparée et vérifiée sous 2 à 4 heures après validation. »
- « Délais 24-48h à Dakar, paiement à la livraison, zones desservies au Sénégal. »
- Port offert des `50 000 FCFA` (aussi `lib/utils/constants.js` `FREE_SHIPPING_THRESHOLD: 50000`).
- `constants.js` : `DELIVERY_TIME.DAKAR = "24-48h"`, `REGIONS = "2-5 jours"`.

### Paiement — `lib/utils/constants.js` + `tekalis-backend/utils/emailTemplates.js`
`cash` → « Paiement à la livraison », `wave` → « Wave », `om` → « Orange Money », `free` → « Free Money », `card` → « Carte bancaire ».
⚠️ `app/cgv/page.jsx:67-74` n'en liste que **4** (pas la carte). `models/Settings.js` a `stripe: false` par defaut.

### Garantie — `app/garanties/page.jsx` + `models/Product.js`
- « Garantie constructeur sur tous les produits tekalis.com »
- SAV : reponse sous `48h`
- `warranty.duration = 12` mois, `warranty.type = "constructeur"`
- Badge fiche produit : « Garantie incluse » (`ProductDetailClient.jsx:230`, code en dur, ne lit pas `warranty.duration`)

### Retours — `app/retours/page.jsx` + `app/cgv/page.jsx`
- « Produit retourné dans un délai de 7 jours après réception »
- « Après contrôle, vous êtes remboursé sous 7 jours ouvrables via votre moyen de paiement initial. »
- Validation sous `48h`
- ⚠️ `models/Settings.js` `returns.periodDays = 14` **contredit** les 7 jours publies.

### Contact / NAP — `app/layout.jsx:65-143` (schema `LocalBusiness`, deja en base)
- Adresse : `Fann, Rue 14`, Dakar, `BP 12345`, Senegal
- Tel : `+221786346946` · Email : `contact@tekalis.com`
- Horaires : Lun-Ven 08:00-19:00, Sam 09:00-17:00
- Geo : `14.6928, -17.4467`
- Devise : `XOF`

### Reseaux sociaux — `lib/utils/constants.js` (`SOCIAL_LINKS`, source unique)
```
facebook  https://www.facebook.com/share/14MikMhjFhA/
instagram https://www.instagram.com/_tekalis_
twitter   https://twitter.com/tekalis
linkedin  https://linkedin.com/company/tekalis
youtube   https://www.youtube.com/@Tekalis
whatsapp  https://wa.me/221786346946
```

---

## 11. Points de vigilance « donnees non inventees »

### 🔴 11.1 Contradiction sur l'etat des telephones

`lib/utils/prixGuides.js` affirme (lignes 19, 35, 54, 70, 85, 105, 120, 151, 171, 182, 202, 213, **230**) :
> « Tous nos iPhone 12 sont neufs, scellés et garantis 12 mois » / « **Aucun produit reconditionné ou d'occasion.** »

Mais le catalogue contient **14 produits `-venant`** dont `iPhone 12 64 Go - Venant`, `Samsung Galaxy S20 FE 5G - Venant`… avec `condition: "new"` en base.

Les deux affirmations ne peuvent pas etre vraies. **Les pages `/prix/*` doivent etre relues par le proprietaire** avant deavant de parier que ces guides ciblent bien la requete « telephones reconditionnes dakar » (13 impressions, position 42,9 — clairement non encore couvert).

### 🔴 11.2 Guides de prix perimes

`PRIX_GUIDES` vise **Samsung Galaxy S24 Ultra** et **Samsung Galaxy A55**, **absents du catalogue actuel** (verifie sur les 180 produits). Ces guides promettent des prix pour des produits qui n'existent plus.

### 11.3 Categoies : slugs de repli du sitemap perimes

`app/sitemap.js:91-99` liste en repli `climatiseurs`, qui **n'existe pas** (le vrai slug est `climatisation`), et **oublie** `ventilation`, `divertissement`, `mobilite`, `reseau`, `informatique`, `tablettes`, `laptops`.

Slugs reellement servis par l'API (16, tous actifs, **aucun sous-enfant**) :
`accessoires` · `audio` · `climatisation` · `divertissement` · `electromenager` · `energie-solaire` · `gaming` · `informatique` · `laptops` · `mobilite` · `ordinateurs` · `reseau` · `smartphones` · `tablettes` · `tv` · `ventilation`

### 11.4 Divergence contrat API / hooks front

- `lib/hooks/useProducts.js:44` envoie `sortBy=`, le backend lit `sort=` → **le tri est silencieusement ignore**.
- `useProducts.sortProducts` trie sur `b.sold`, le modele a `salesCount` → **la popularite vaut toujours 0**.
- `GET /categories/:slug` repond `{ category, products, pagination }` (cle `products`), `GET /products` repond `{ data, pagination }` (cle `data`).
- `app/products/page.jsx:28` telecharge 200 produits puis filtre/pagine **cote client** → 200 produits dans le HTML sur mobile.

---

## 12. Rapport de pages orphelines

Methode : liens internes **sortants** presents dans le code, croises avec les **entrees** du sitemap dynamique.

**Aucune page produit n'est orpheline au sens strict** : chaque fiche est liee depuis `/products` (toutes les 180), depuis sa categorie (`CategoryClient` + `CollectionPage.hasPart` + `ItemList`), depuis son sitemap, et depuis `ProductSeoContent` (produits lies, 4 max) et le fil d'Ariane. Le backend expose en plus `sitemap.xml` et `merchant/products.xml`.

Points faibles reels :
- `/prix` et `/prix/[slug]` : lies depuis l'accueil (`HomeSeoContent`), `/products` et `/tendances`, mais **aucune fiche produit ne pointe vers un guide de prix** (seulement du texte « guides de prix » sans lien dans la FAQ du `ProductSeoContent`). Cf. Phase 7.
- `/blog/meilleur-smartphone-2026-au-s-n-gal-le-guide-par-budget-tekalis` (71 impressions, position 4,75) : le brief demande de le relier aux fiches citees — **a verifier, ses liens internes ne sont pas garantis**.
- `/configurator` : **404** alors qu'elle etait indexee.

---

## 13. Baseline a conserver (Search Console, 28 j, 6 sept -> 3 oct 2026)

| Metrique | Valeur |
|---|---|
| Clics | 43 |
| Impressions | 2 453 |
| CTR | 1,75 % |
| Position moyenne | ~7,7 |
| Senegal | 92,5 % des impressions / 88 % des clics |
| Mobile | 86 % des impressions, CTR 1,6 % |
| Ordinateur | CTR 3,1 % |
| Extraits de produits | 3 impressions |

Diagnostic par type : fiches smartphones **~67 % des impressions, position moyenne ~6,5** ; hors produit 2,7 % de CTR ; autres produits 3,5 % ; solaire 3,7 % ; ordinateurs 2,8 %.

**Le CTR des fiches smartphones (~1,0 % a position ~6,5) est dans la norme.** Benchmarks recents (Advanced Web Ranking, juillet 2026) : position 1 = 20 %, position 2 = 10,4 %, position 3 = 3,9 %, position 4 = 1,7 %, position 5 = 1,1 %, positions 6 a 10 = 0,5 a 0,7 %. Un CTR de 1,0 % autour de la position 6,5 est donc attendu. **Le levier n'est pas le CTR mais le passage des positions 5-8 au top 3.**

**A re-exporter a +4 et +8 semaines pour comparer** (cf. `SEO_POST_DEPLOY.md`). La comparaison porte sur la **position moyenne** et la **part des impressions en top 3** ; le CTR se juge par rapport a la position, pas en valeur absolue.

---

## 14. Synthese des causes, classees par impact reel mesure

| # | Cause | Gravite | Phases |
|---|---|---|---|
| 0 | **`<body>` vide sur tout le site : `PersistGate` bloquait le rendu serveur (corrige)** | 🔴 Critique | 3 |
| 1 | **Les URL indexees (slugs a suffixe numerique) sont toutes 404 → 301 vers `/products`** | 🔴 Critique | 5 |
| 2 | **La production sert l'app Vite, pas l'app Next.js** | 🔴 Critique | 10 |
| 3 | Fiches smartphones a ~67 % des impressions bloquees en position 5-8 : titres sans prix, donc peu distinctifs a l'ecran | 🟠 Fort | 2, 3 |
| 4 | Aucun `aggregateRating` exploite (3 impressions « Extraits de produits ») ; `FAQPage` en surplus | 🟠 Fort | 4 |
| 5 | `/configurator` en 404 alors qu'elle a des impressions | 🟡 Moyen | 5 |
| 6 | `robots.txt` bloque `/login` + `/register` : la meta `noindex` est inatteignable | 🟡 Moyen | 5 |
| 7 | `/cart`, `/login`, `/register` sans `robots` ni canonical | 🟡 Moyen | 2 |
| 8 | Pas de redirection www <-> non-www en code | 🟡 Moyen | 5 |
| 9 | Contradiction « tout est neuf » vs 15 produits `-venant` | 🟠 Fort | 10 (arbitrage proprietaire) |
| 10 | Tri de listing casse (`sortBy` vs `sort`, `sold` vs `salesCount`) | 🟢 Bas | hors perimetre |
| 11 | Guides de prix S24 Ultra / A55 sans produit correspondant dans le catalogue | 🟡 Moyen | 10 |
| 12 | 200 produits envoyes dans le HTML du listing | 🟢 Bas | 8 |

---

## 15. Cause racine du rendu serveur vide (corrigee en phase 3)

Ce point a ete decouvert en executant la phase 6, et il est plus grave que les
autres : **avant correction, le HTML servi par le site ne contenait aucun contenu
sur aucune page.**

### Symptome

Sur `/category/smartphones`, le HTML brut faisait 72 436 octets mais seulement
**155 octets visibles** dans `<body>` :

```html
<body><div hidden=""><!--$--><!--/$--></div></body>
```

Aucun `<h1>`, aucun `<h2>`, aucun nom de produit, aucun texte. Le payload RSC
(contenu envoye au navigateur) etait complet : le serveur avait bien rendu les
donnees, mais **le DOM n'etait pas ecrit dans le HTML**.

### Cause 1 — `PersistGate` attend un persistor inexistant cote serveur

`store/index.js:37` ne cree le persistor que dans le navigateur :

```js
if (typeof window !== 'undefined') {
  store.__persistor = persistStore(store);
}
```

Or `components/shared/Providers.jsx` passait `persistor={store.__persistor}`
a `<PersistGate loading={null}>`. Cote serveur, `store.__persistor` vaut donc
`undefined` : la gate attend la rehydratation qui ne peut jamais avoir lieu et
rend `null`. **Comme `Providers` enveloppe toute l'application dans le layout
racine, le `<body>` etait vide sur les 58 pages du site.**

Correctif : rendre les enfants directement tant que la rehydratation n'a pas
commence, avec un indicateur `hydrated` pose au montage pour garantir que le
premier rendu client est identique a celui du serveur.

### Cause 2 — `useSearchParams()` hors `<Suspense>`

Sur `/products`, `useSearchParams()` etait appele sans frontiere `<Suspense>`,
ce qui produit un `BAILOUT_TO_CLIENT_SIDE_RENDERING` : React abandonnait le rendu
de la page entiere et ne renvoyait qu'un spinner. Correctif : encapsulation du
composant dans `<Suspense>`. Meme correction appliquee a `/register` et
`/verify-email`.

### Effet mesure apres correction

| Page | Avant (visible) | Apres (visible) | `<h1>` |
|---|---|---|---|
| `/` | 155 | 75 780 | 1 |
| `/products` | 155 | 36 686 | 1 |
| `/category/smartphones` | 155 | 187 091 | 1 |
| `/blog` | 155 | 92 414 | 1 |

Les 16 categories ont ete verifiees : un seul `<h1>` chacune, plus de
`meta keywords`, JSON-LD `ItemList` + `BreadcrumbList` presents.

**A retenir : tout controle SEO fait sur le HTML brut etait fausse avant cette
correction.** C'est la raison pour laquelle les phases suivantes doivent
verifier le HTML servi, et pas seulement le code.
