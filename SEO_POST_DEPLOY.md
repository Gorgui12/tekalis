# Post-deploiement SEO — Tekalis

Objectif : suivre l'impact (positions) apres bascule vers l'app Next.js, sans annoncer de gain de clics chiffre.

## Pre-requis avant bascule
- [ ] Bascule DNS/proxy pour servir l'app Next.js (et non la SPA Vite historique). C'est la condition #1 pour que les corrections produisent un effet.
- [ ] Verifier en production (curl -I) les redirections 308 et les 404 reels.
- [ ] Verifier `robots.txt` et `sitemap.xml` accessibles a l'URL canonique `https://tekalis.com/`.
- [ ] Indexation : `site:tekalis.com` dans la console recherche Google (stabilisation 7–14 jours apres passage en Next.js).
- [ ] Valider dans Google Search Console (Couverture, Performances, Page Experience) — se concentrer sur **Clics, Impressions, Position moyenne, % impressions top 3**.

## URL a verifier immediatement (smoke test HTTP)
```bash
# HTTP a tester depuis un terminal (remplacer par domaine si besoin)
curl -I https://tekalis.com/products/<UN_ANCIEN_SLUG_A_SUFFIXE_NUMERIQUE>  # doit renvoyer 308 -> /products/<slug-propre>
curl -I https://tekalis.com/products/slug-inexistant-xyz                 # doit renvoyer 404
curl -I https://tekalis.com/category/categorie-inexistante               # doit renvoyer 404
curl -I https://tekalis.com/robots.txt                                   # 200
curl -I https://tekalis.com/sitemap.xml                                  # 200
```

## KPIs a comparer (GSC)
- **Position moyenne** (Filtre : Smartphones + periode de comparaison). Objectif : remontee vers top 3, focus sur les requetes en positions 5–8.
- **% impressions en top 3** : indicateur le plus fiable pour juger du gain de positions.
- **Clics / Impressions / CTR** : le CTR est juge **par rapport a la position** (benchmarks fournis). Ne **pas** annoncer de gain de clics chiffre. 
- **Couverture** : surveiller l'apparition/disparition des anciennes URLs a suffixe numerique apres que Google voit les 308. Attendu : diminution progressive des « Crawled – currently not indexed » liees aux anciens slugs 404 dans l'ancien flux.

## Echelles de comparaison
- **+4 semaines** vs baseline : position moyenne + % top 3.
- **+8 semaines** vs baseline : position moyenne + % top 3.
- Conservatoire strict : les benchmarks CTR de reference (pos1 20%, pos2 10,4%, pos3 3,9%, pos4 1,7%, pos5 1,1%, pos6–10 0,5–0,7%) servent uniquement de cadrage, non de promesse.

## Points techniques a surveiller
- **Canonicals** : pas de canonical pointant hors `tekalis.com`. Les pages privees ont bien `noindex,nofollow`.
- **JSON-LD** : sur les 15 produits « Venant », **aucun `itemCondition`** (controle dans Rich Results Test / Schema Markup Validator). Pas de `NewCondition` frauduleux.
- **Robots** : `robots.txt` laisse lire les pages `noindex` (pas de `Disallow` sur `/login`, `/register`, `/cart`, etc.). Google doit pouvoir lire le `noindex` dans l'HTML.
- **Sitemap** : ne contient aucune URL 404. 239 URLs, 16 categories uniquement (conforme a l'API).
- **Redirections** : 308 vers slug propre pour tout acces via ObjectId/slug historique a suffixe numerique. Vrai 404 pour routes inexistantes.
- **Contenu SSR** : 16 categories ont 1 H1, introduction, FAQ, JSON-LD `ItemList` + `BreadcrumbList` dans le HTML servi (controle via « View source » ou `seo-check`).

## Commandes de verification rapide (apres deploy)
```bash
# depuis l'app Next.js
cd tekalis-frontend/apps/tekalis-next
npm run seo:check -- http://localhost:PORT --products=20  # si verification locale
npm run seo:content                                        # contenu categories
```

## Notes
- Le `loading.jsx` global a ete supprime volontairement : ce compromis permet d'obtenir des **statuts HTTP exacts** (critique). Il n'y a pas d'alternative SEO acceptable aux soft 404.
- `permanentRedirect()` renvoie 308 ; equivalent a 301 pour Google.
- Ne jamais annoncer de gain de clics chiffre dans les rapports, meme si la position remonte. Communiquer uniquement position moyenne + % impressions top 3.