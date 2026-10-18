# Changelog SEO â€” Tekalis (corriges appliques)

## Objectif
Passer des positions 5â€“8 au top 3 (objectif de gain de positions), en respectant strictement le cadrage CTR fourni, sans annoncer de gain de clics chiffre.

## Commits (branche `seo/gsc-ctr-boost`)

| Commit | Date | Description | Impact |
|---|---|---|---|
| 21ab594 | 2026-10-06 | `fix(seo): HTML rendu serveur vide (PersistGate bloquant + bailout Suspense)` | **Critique**. Corrige un `<body>` vide (155 caracteres) sur l'ensemble des pages. Le contenu SSR est reapparu : `/category/smartphones` passe de 155 a ~187 000 caracteres visibles, 1 H1 unique. |
| c126726 | 2026-10-06 | `fix(seo): statuts HTTP reels, robots.txt et sitemap` | **Critique**. Supprime `app/loading.jsx` qui gelait les statuts HTTP (soft 404). `/products/<ObjectId>` â†’ 308 vers le slug propre ; URLs inexistantes â†’ 404 reels. `robots.txt` ne bloque plus les pages `noindex`, sitemap corrige (slugs reels, repli sans URL 404). |
| ecc0a89 | 2026-10-06 | `fix(seo): titres raccourcis, h1 pages privees, script de controle HTTP` | Corrige la duplication du suffixe de marque dans les titres (titres deja complets passes en `absolute`). Ajoute `<h1 class="sr-only">` sur `/login`, `/register`, `/cart`. Cree `scripts/seo-check.mjs` et commandes `seo:check`, `seo:content`. |
| 57e2645 | 2026-10-06 | `fix(seo): omettre itemCondition pour les 15 produits 'Venant'` | Prudence structuree : 15 produits dont le nom contient Â« Venant Â» n'ont plus `itemCondition` dans JSON-LD (donnee non verifiee). |

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
- Fiche produit : `Product`, `Offer`, `AggregateRating`, `Review` (si disponibles), `BreadcrumbList`. `itemCondition` omis pour les 15 produits Â« Venant Â».
- Categories : `ItemList` + `BreadcrumbList`. Accueil : `Organization`, `WebSite` + `SearchAction`. Articles : `Article`, `BreadcrumbList`.

### Metadata
- Suppression des `meta keywords` sur toutes les pages (ignore par Google depuis 2009).
- Correction des titres pour eviter la duplication du suffixe de marque (`| Tekalis Senegal` ajoute par le template du layout). Titres produits/ articles coupes au mot pour preserver l'espace.
- Pages privees avec `<h1 class="sr-only">` pour une hierarchie de titres saine.

### Outillage
- `scripts/seo-check.mjs` : audit HTTP du HTML servi (statuts, H1, title, canonical, robots, keywords, JSON-LD, volume de texte, doublons). Sondes : produit inexistantâ†’404, ObjectIdâ†’308, categorie/article/guide inexistantâ†’404.
- `scripts/check-seo-content.mjs` : controle qualite du contenu editorial des 16 categories (coverage API, longueurs, FAQ, marques, absence de caracteres corrompus).
- `package.json` : scripts `seo:check`, `seo:content`.

## Baseline (reference)
GSC (reference fournie) : 43 clics, 2 453 impressions, CTR 1,75 %, position moyenne ~7,7. Smartphones ~67 % des impressions a position ~6,5.

## Cadrage CTR preserve
Cadrage CTR valide conserve (non modifie) : position 1 20 %, pos2 10,4 %, pos3 3,9 %, pos4 1,7 %, pos5 1,1 %, pos6â€“10 0,5â€“0,7 %. Le CTR ~1,0% a ~pos6,5 est juge normal. Les comparaisons porteront sur **position moyenne** et **part des impressions en top 3**.

## Etat post-corrections (HTML servi)
Verification sur serveur Next.js de production locale :

| Page | Statut | H1 | Visible (car.) | Robots | Canonical |
|---|---|---|---|---|---|
| `/` | 200 | 1 | ~75 780 | index,follow | self |
| `/products` | 200 | 1 | ~38 879 | index,follow | self |
| `/products/<slug>` | 200 | 1 | ~78 000 | index,follow | self |
| `/products/<ObjectId>` | 308 | â€” | â€” | â€” | â†’ slug |
| `/category/smartphones` | 200 | 1 | ~189 161 | index,follow | self |
| `/category/<inexistante>` | 404 | â€” | â€” | â€” | â€” |
| `/products/<inexistant>` | 404 | â€” | â€” | â€” | â€” |
| `/blog` | 200 | 1 | ~97 228 | index,follow | self |
| `/login` | 200 | 0 (sr-only) | ~36 790 | noindex,nofollow | self |
| `/register` | 200 | 0 (sr-only) | ~36 852 | noindex,nofollow | self |
| `/cart` | 200 | 0 (sr-only) | ~38 081 | noindex,nofollow | self |

16 categories pre-rendues : 1 H1 chacune, contenu serveur substantiel, aucune `meta keywords`. Sitemap : 239 URLs, 0 invalide. `seo:check` OK, `seo:content` OK.

## Merchant listing (image + prix dans Google Search)
Ajoute au JSON-LD `Product`/`Offer` des fiches produit les donnees qui rendent la fiche **eligible au "merchant listing"** â€” c'est ce qui affiche l'image, le prix et la promo directement dans la SERP (le site y apparaissait en position 5-8 mais sans image ni prix, d'ou un CTR bas).
- `tekalis-frontend/apps/tekalis-next/lib/seo/config.js` : `SHIPPING_POLICY` et `RETURN_POLICY`, derives des pages publiees `/livraison`, `/retours` et des constantes `SHIPPING` (offerte des 50 000 FCFA, sinon 2 500 FCFA ; delais 24-48h ; retour sous 7 jours). Rien d'invente.
- `tekalis-frontend/apps/tekalis-next/lib/seo/jsonld.js` :
  - `shippingDetails` (`OfferShippingDetails`) sur l'`Offer` : tarif reel (0 si >= 50 000 FCFA, sinon 2 500), destination SN, delais 0-1 j preparation / 1-2 j transit.
  - `hasMerchantReturnPolicy` (`MerchantReturnPolicy`) : `merchantReturnDays: 7`, lien `/retours`, `ReturnByMail`. `returnFees` volontairement omis (non precise sur le site).
  - Prix barre (`priceSpecification` `StrikethroughPrice` = `comparePrice`) quand `comparePrice > price` : Google affiche alors la promo, sans date de fin inventee.
  - Nettoyage `attachSpecs` : plus de `PropertyValue` vides (`value: ""`, `value: "false"`).

Verifie en local sur `next start` : `/products/iphone-15` (420 000 FCFA, compare 483 000) -> shipping offert + barrÃ© 483 000 ; `/products/verre-trempe-...` (4 500 FCFA) -> livraison 2 500 FCFA. Build OK.

Rappel post-deploy : revalider dans le test de resultats enrichis de Google (merchant listing) puis dans Search Console > "RÃ©sultats enrichis" / "Merchant listings".

## Politique retour GMC alignee (cause racine du blocage merchant listing)
Le merchant listing restait sans image/prix malgre le balisage : la "Return policy review" de Google Merchant Center pointait vers `www.tekalis.com/dashboard/rma`, page **privee** (`noindex,nofollow` via `buildPrivateMetadata`, protegee par `middleware.js` â€” Google ne peut pas la lire). Correction :
- **GMC (cote compte)** : Policy URL -> `https://tekalis.com/retours`, methode -> Â« Par courrier Â» (seul mode accepte), condition produit -> Â« Neuf Â» uniquement, fenetre 7 jours, sans frais. Statut passe a **Verified**. Shipping policy GMC a verifier de meme avec URL -> `https://tekalis.com/livraison`.
- `lib/seo/jsonld.js` : export `buildReturnPolicySchema()` / `buildShippingPolicySchema()` (nÅ“uds autonomes `MerchantReturnPolicy` / `OfferShippingDetails` reutilisant `RETURN_POLICY` / `SHIPPING_POLICY` existants) ; ajout `refundType: FullRefund` au `MerchantReturnPolicy` des fiches ("rembourse sous 7 jours ouvrables via le moyen de paiement initial", page `/retours`).
- `app/retours/page.jsx` : `<JsonLd id="return-policy-schema">`. `app/livraison/page.jsx` : `<JsonLd id="shipping-policy-schema">`. Les politiques publiees deviennent lisibles par les crawlers et les reviewers GMC.
- `returnFees` toujours omis (frais non precises sur le site) ; aucune donnee inventee (regle projet).

Verifie en local sur `next start` (port 3999, apres arret du precedent serveur stale) : `/retours` sert le `MerchantReturnPolicy` autonome, `/livraison` l'`OfferShippingDetails`, et `/products/iphone-15` son `hasMerchantReturnPolicy` avec `refundType`. Build OK. A noter : verifier qu'aucun ancien processus `next start` ne retient le port (PID 11048 retrouve a l'antenne avec un code perime au premier test).

## Garde-fou de domaine + source unique `SITE_URL` (GSC : domaines dupliques)
Contexte : `www.tekalis.com` et `*.vercel.app` servaient le site en 200 (contenu duplique indexable). La redirection 308 de la plateforme Vercel n'est pas une garantie controlee par le code.
- `middleware.js` : garde-fou de domaine ajoute, en logique separee de la protection des routes privees (inchangee : `/dashboard`, `/checkout`, `/wishlist` -> cookie `tekalis_token` sinon 307 vers `/login`).
  - Hote `www.tekalis.com` -> **308 Permanent Redirect** vers l'apex canonique, chemin + query conserves.
  - Tout autre hote non canonique (`*.vercel.app`, domaines de preview) -> 200 mais entete **`X-Robots-Tag: noindex, nofollow`**.
  - Hotes locaux (`localhost`, `127.0.0.1`, `0.0.0.0`, `*.local`) jamais touches.
  - L'hote est lu depuis l'entete `Host` (et non `request.nextUrl.hostname`, que Next reconstruit sur l'hote d'ecoute : sans effet pour une requete spoofee en test local).
  - `matcher` elargi a toutes les pages : `"/((?!api/|_next/static|_next/image|.*\\.[^/]+$).*)"` (exclut API, assets et fichiers a extension) ; le middleware doit pouvoir poser l'entete sur n'importe quelle route.
- Source unique `SITE_URL` (`lib/seo/config.js`) : les duplications en dur sont supprimees dans `app/sitemap.js`, `app/robots.js`, `app/blog/[slug]/page.jsx`, `lib/utils/prixGuides.js` (re-export) et le JSON-LD `Organization` inline de `components/layout/Footer.jsx`.

Verifie sur `next start -p 3117` (entetes `Host` spoofees via `curl.exe`) :
- `Host: tekalis.vercel.app` sur `/products` -> 200 + `x-robots-tag: noindex, nofollow` ;
- `Host: www.tekalis.com` sur `/products` -> **308** `location: https://tekalis.com/products` ;
- `Host: tekalis.com` et `localhost` -> 200, aucun entete de garde.
`seo:check` : **OK**. `seo:content` : 18 ecarts **pre-existants** (derive de donnees, hors perimetre de cette correction : categorie API `climatiseurs` absente de `categoryContent.js`, marques/modeles au-dela de la page API de 200 produits).

## Doublons de slug : fin du suffixe `Date.now()` (GSC : doublons / 404 sur anciennes URL)
`resolveUniqueSlug()` (`tekalis-backend/controllers/productController.js`) suffixait un conflit exotique (`> 200`) avec `Date.now()`, produisant des URL instables type `/<nom>-1790729696190` a chaque reimport.
- Repli remplace par un suffixe **incremental deterministe** `-2 â€¦ -9999`, et **erreur explicite** si aucun n'est libre (plus de doublon silencieux). Le comportement nominal (`-2, -3, â€¦`) est inchange.
- Script de diagnostic `tekalis-backend/scripts/diagnostic-slugs-doublons.mjs` (dry-run par defaut, aucune ecriture) : regroupe par slug, signale les suffixes `-\d{13}$`, signale les noms en double, compte les commandes.
- Frontend deja en place : `resolveProductRequest` absorbe les anciens slugs a suffixe (`permanentRedirect` 308).

Verifie : aucun slug a suffixe 13 chiffres en base, aucun doublon exact par slug. Build OK, `seo:check` OK.

## Merchant listings : offres completes + plus de `Product` sans image (GSC : Â« elements non valides Â»)
Deux causes de balisage marchand invalide : des `Offer` sans livraison/retour et des `Product` sans `image`.
- `lib/seo/jsonld.js` :
  - `buildProductSchema()` renvoie `null` si le produit n'a **aucune image** (un produit sans image n'est pas eligible au merchant listing) ; `attachSpecs` devient tolerant au `null`.
  - `buildShippingDetails` / `buildReturnPolicy` exportes (reutilisation sur les listes).
- `app/prix/[slug]/page.jsx` : chaque `Offer` de l'`ItemList` porte `url`, `shippingDetails` et `hasMerchantReturnPolicy` ; offre seulement si `price > 0`.
- `app/configurateur-solaire/page.jsx` : suppression de `offers` (`price: 0`) du `WebApplication` (outil gratuit, pas un produit).
- `tekalis-backend/routes/productFeed.js` : flux `merchant/products.xml` filtre sur une **URL d'image reelle** (`firstImage()`), plus sur `images.length` (`[{ url: "" }]` passait mais donnait un `<g:image_link>` vide).

Verifie sur `next start -p 3117` : `/products/airpods-pro-originale` (sans image) -> 0 bloc `Product`, page 200 ; `/products/iphone-15` -> 1 bloc avec `image` ; `/prix/iphone-12-prix-dakar` -> 12 offres avec `shippingDetails`+`hasMerchantReturnPolicy` ; `/configurateur-solaire` -> 0 `offers`. Build OK, `seo:check` OK.

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
Ces fichiers restent non suivis (untracked) et ne seront pas commits.## [2026-10-18] T4 : Titres/metas + guides prix (honnêteté + couverture)

- PrixGuide.jsx : détection des imports « Venant »/condition ? 'new' ; remplacement de l'affirmation « Tous nos articles sont neufs, scellés... » par un libellé conditionnel (neufs vs imports « Venant » avec état sur fiche).
- lib/utils/prixGuides.js : correction de l'intro/FAQs de iphone-12-prix-dakar (plus d'affirmation universelle « neufs, scellés ») ; ajout des guides :
  - iphone-xr-prix-dakar, iphone-11-pro-max-prix-dakar, samsung-galaxy-a14-prix-fcfa, samsung-galaxy-a15-prix-fcfa, samsung-galaxy-a24-prix-fcfa, samsung-galaxy-a54-prix-fcfa, samsung-galaxy-s20-fe-prix-fcfa, samsung-galaxy-s10-prix-fcfa (avec intros honnêtes : modèles « Venant » identifiés).
- Vérification : nouvelles pages prix générées ; titres/metas dans bornes raisonnables ; aucun faux avis/reviews ; seo-check OK. seo:content conserve 18 écarts pré-existants (hors périmètre).

## [2026-10-18] T5 : Noindex sur pages avec filtres/recherches et cohérence robots

- [T5b] Gérer searchParams pour pages listant/filtrant (produits/blog) : si paramètres non essentiels présents (page > 1, filtres, q, sort, etc.) ou tout paramètre générique ? obots: { index: false, follow: true } pour éviter duplication/cannibalisation (implémentation à prévoir si Next.js 15 App Router l'exige).
- Vérifier pages privées déjà en 
oindex,nofollow (login/register, dashboard/wishlist/checkout) ? OK via uildPrivateMetadata/middleware.
- Après implémentation : build OK, seo:check OK. Mettre à jour changelog et committer.

