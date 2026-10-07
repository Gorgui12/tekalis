# SOLAR AUDIT — Configurateur de kit solaire Tekalis

Date : 2026-10-07 — Branche : `feat/solar-configurator`
Methode : lecture de code + requetes API en lecture seule (`GET` uniquement). Rien n'a ete modifie.

---

## 1. API et environnement

- Base reelle utilisee par le front : `NEXT_PUBLIC_API_BASE=https://tekalis.onrender.com/api/v1` (`tekalis-frontend/apps/tekalis-next/.env.local`).
- `lib/serverFetch.js:8` a le meme fallback. En dev, `next.config.js:28` reecrit `/api/v1/:path*` vers `http://localhost:5000/api/v1`.
- Backend Express/Mongoose sur Render : **joignable** (toutes les requetes ci-dessous ont repondu 200).
- Le front utilise un proxy Next (`/api/v1/*`) en client, `serverFetch` en server.
- Point critique API : `GET /products?category=<slug>` renvoie **500** (Cast to ObjectId). Le seul filtre
  serveur fiable pour le solaire est `GET /categories/energie-solaire` (slug) et `GET /products?search=<kw>`.
  Les filtres de specs du point de terminaison categorie sont orientes PC (`processor`, `ram`, `storage`, `screen`).

## 2. Catalogue solaire (categorie `energie-solaire` : 14 produits) + 2 produits solaires mal ranges

`GET /products?limit=200` (page 1+2, total 298 produits) puis tri par nom/categorie.

| # | name | slug | prix (FCFA) | compare | stock | status | brand | categorie | specs utiles |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Projecteur solaire 450 watt en promo | projecteur-solaire-450-watt-en-promo | 72 000 | – | 25 | available | Générique | energie-solaire | `{}` |
| 2 | Caméra solaire classique 4G VC 21 | camera-solaire-classique-4g-camera-solaire-vc-21 | 48 000 | – | 25 | available | Générique | energie-solaire | `{}` |
| 3 | Caméra triple objectif WiFi solaire | camera-triple-objectif-wifi-camera-solaire-wi-fi | 36 000 | – | 25 | available | Générique | energie-solaire | `{}` |
| 4 | Lampe solaire IP67 | lampe-solaire-ip67 | 30 000 | – | 25 | available | Générique | energie-solaire | `{}` |
| 5 | Onduleur Hybride Solaire 5KW 48V MPPT | onduleur-hybride-solaire-5kw-48v-mppt | 377 000 | 429 000 | 10 | available | Must | energie-solaire | `{color}` |
| 6 | Batterie Solaire Gel 12V 200Ah C10 | batterie-solaire-gel-12v-200ah-c10 | 201 500 | 227 500 | 10 | available | Ritar | energie-solaire | `{color}` |
| 7 | Onduleur Hybride Solaire 3KW 24V MPPT | onduleur-hybride-solaire-3kw-24v-mppt | 240 500 | 273 000 | 10 | available | Must | energie-solaire | `{color}` |
| 8 | Panneau Solaire Monocristallin 450W PERC | panneau-solaire-monocristallin-450w-perc | 101 400 | 117 000 | 10 | available | Jinko Solar | energie-solaire | `{dimensions:"2094 x 1038 x 35 mm",color}` |
| 9 | Batterie Solaire Gel 12V 100Ah | batterie-solaire-gel-12v-100ah | 110 500 | 127 400 | 10 | available | Felicity Solar | energie-solaire | `{color}` |
| 10 | Panneau Solaire Monocristallin 100W 18V | panneau-solaire-monocristallin-100w-18v | 41 600 | 49 400 | 10 | available | Felicity Solar | energie-solaire | `{dimensions:"1000 x 670 x 30 mm",color}` |
| 11 | Convertisseur Onduleur 1000W 12V vers 220V | convertisseur-onduleur-1000w-12v-vers-220v | 32 500 | 39 000 | 10 | available | Suer | energie-solaire | `{color}` |
| 12 | Kit Éclairage Solaire Familial 3 Ampoules USB | kit-eclairage-solaire-familial-3-ampoules-avec-port-usb | 28 600 | 36 400 | 10 | available | Felicity | energie-solaire | `{ports:["USB"],battery:"Batterie intégrée"}` |
| 13 | Projecteur Solaire LED 100W IP67 | projecteur-solaire-led-100w-ip67-avec-telecommande | 23 400 | 29 900 | 10 | available | Générique | energie-solaire | `{battery:"Batterie intégrée + panneau"}` |
| 14 | Régulateur de Charge Solaire PWM 30A 12V/24V | regulateur-de-charge-solaire-pwm-30a-12v-24v | 15 600 | 19 500 | 10 | available | Suer | energie-solaire | `{color}` |
| 15 | Caméra solaire IP PTZ 8MP 4G | camera-solaire-ip-double-objectif-exterieure-ptz-8mp-4g | 132 000 | – | 25 | available | Générique | accessoires | `{}` |
| 16 | Ventilateur Rechargeable Solaire 16" | ventilateur-rechargeable-solaire-16-pouces-avec-panneau | 41 600 | 49 400 | 10 | available | Sayona | ventilation | `{battery:"Batterie rechargeable + panneau"}` |

Les 2 premiers de la colonne 4 (`onduleur-hybride-solaire-5kw-48v-mppt` featured, `panneau-solaire-monocristallin-450w-perc` featured)
et `onduleur-hybride-solaire-3kw-24v-mppt` sont les candidats "kit" realistes du catalogue.

### 2.1 Completude des specs solaires — chiffres

Champ exploitable par le moteur | produits concernes | renseigne | taux
--- | --- | --- | ---
`powerW` (panneau/onduleur) | 4 (2 panneaux, 2 onduleurs, 1 convertisseur) | 0 | 0/5
`voltageV` (panneau/batterie) | 6 (2 panneaux, 3 batteries, 2 onduleurs) | 0 | 0/6
`capacityAh` (batterie) | 3 batteries | 0 | 0/3
`chemistry` (gel/AGM/lithium) | 3 batteries | 0 (connu seulement par le nom "Gel" de 2) | 0/3
`inverterContinuousW` | 3 onduleurs/convertisseur | 0 (lisible dans le nom : 1000W, 3KW, 5KW) | 0/3
`inverterPeakW` | 3 | 0 | 0/3
`systemVoltageV` / `mpptMaxVocV` / `mpptMaxA` | 2 onduleurs MPPT + 1 regulateur PWM | 0 (onduleurs "48V"/"24V" dans le nom) | 0/3
`panelVocV` / `panelVmpV` | 2 panneaux | 0 | 0/2
`cycles` | 3 batteries | 0 | 0/3
`role` | tous | 0 | 0/16

**Taux global : ~0 % des specs exploitables.** Seules les infos portees par le NOM du produit sont utilisables
(dure a parser, incertaine) : 450W, 100W, 18V, 12V, 200Ah, 100Ah, 5KW 48V, 3KW 24V, 1000W 12V, PWM 30A 12V/24V.

=> Deduction PHASE 1 : sans annotation, le configurateur ne peut recommander AUCUN produit reel fiable.
Il faut de toute facon implementer le mode degrade ("Demander un devis sur WhatsApp") et la couche `data/solar-overrides.json`.
NB : `stock > 0` et `status === 'available'` pour les 16 produits listes (aucun en rupture).

## 3. Modele produit backend

- `tekalis-backend/models/Product.js` : schema `productSchemaEnhanced` (champs detailles en 2.2 de l'audit).
- **Aucun sous-objet `solar`** aujourd'hui. `specs` est un objet FIXE oriente PC (21 cles :
  processor, ram, storage, screen, graphics, connectivity, ports, color, os, battery, weight, dimensions, rgb, coolingSystem,
  camera, frontCamera, batteryCapacity, …). Aucune convention solaire.
- `controllers/productController.js:11-16` : liste blanche `PRODUCT_FIELDS` (specs inclus) — un sous-objet `solar`
  cote back necessite de l'ajouter a la liste blanche pour etre ecrivable via l'admin (additif).

## 4. Composants reutilisables

| Composant | Fichier | Verdict |
|---|---|---|
| `ConfigStep` (stepper 3 etapes, variantes h/v) | `components/home/ConfigStep.jsx` | **Reutilisable** (props `steps`, `currentStep`, `variant`; pas de logique metier). Adapter a 4 etapes. |
| `BudgetSlider` (double slider FCFA, paliers, presets) | `components/home/BudgetSlider.jsx` | **Reutilisable en partie** : double slider + presets OK, mais tiers/exemples orientes PC (gaming). A parametrer (min/max/step) avec labels solaires, ou copier le pattern range en un slider simple. `"use client"` deja. |
| `Modal` + `ConfirmModal` | `components/ui/Modal.jsx` | Reutilisable (notifications/confirmations). |
| `WhatsAppButton` | `components/layout/WhatsAppButton.jsx` | Pattern de bouton fixe; le numéro est réutilisé tel quel. |
| `JsonLd` | `components/seo/JsonLd.jsx` | Reutilisable (JSON-LD server-rendered, crawlers). |
| `Breadcrumb` + `breadcrumbItems` | `components/seo/Breadcrumb.jsx`, `lib/seo/breadcrumbs.js` | Reutilisable. |
| `buildMetadata`, `buildProductTitle`, `buildProductDescription` | `lib/seo/metadata.js` | Reutilisables (titres <= 65, desc <= 155, canonical auto). |
| `absoluteUrl`, `productPath`, `categoryPath` | `lib/seo/config.js` | Reutilisables (host canonique sans www, decision en cours). |
| `formatFcfa`, `formatPrice` | `lib/seo/format.js`, `lib/utils/formatters.js` | Reutilisables. |
| `slugify` | `lib/seo/format.js:90`, `lib/utils/formatters.js:127` | Reutilisables (NFD, accents). |
| `trackEvent`, `trackPageView` | `lib/analytics.js` | Reutilisables (consentement avant envoi, `dataLayer`/gtag, Meta, CAPI — tout est garde-fou derriere le consentement). |

## 5. Routes, maillage, sitemap

- `app/sitemap.js` : statique (15 pages) + categories (16 slugs connus) + produits + prix-guides + articles.
  `revalidate = 3600`. A etendre aux nouvelles URLs (section 4.5 de la mission).
- `app/robots.js` : disallow `/admin /api/ /payment/`. Pas de Disallow pour noindex : le noindex est porte en HTML
  (strategie existante `buildPrivateMetadata`).
- Maillage : `components/layout/Navbar.jsx` (liens hardcodes), `Footer.jsx`, `HomeClient.jsx`, `HomeSeoContent.jsx`.
  Le breadcrumb est genere par segment (`lib/seo/breadcrumbs.js`) → a completer pour les nouvelles routes.
- `<AnalyticsProvider>` monté dans `app/layout.jsx` (init + pageview SPA + ConsentBanner).
- `middleware.js` : protege `/dashboard`, `/checkout`, `/wishlist` (cookie `tekalis_token`). Pas de confit avec `/configurateur-solaire`.
- `next.config.js` redirects : `/produit/:slug`, `/products/:id/slug`. **Aucun conflit** avec `/configurateur-solaire`
  ni avec `/configurator` → la redirection `/configurator` -> `/configurateur-solaire` (308) peut etre ajoutee sans risque.

## 6. Analytics existant

- `lib/analytics.js` : `trackEvent(eventName, params, options)` (gate consentement), `trackPageView`, `trackPageVisit`
  (+ wrappers ecommerce). GA4 via gtag, Meta via fbq, relay CAPI vers `POST /api/v1/tracking/event`. Consent Mode v2.
- Les eventements solaires (phase 5) s'appuieront sur `trackEvent` — aucune donnee d'identite.

## 7. Ensoleillement / PSH (donnee nouvelle, source citee)

Question : PSH (heures de plein soleil equivalent) par region. **Source : PVGIS (Commission europeenne) ok depuis le poste.**
Methode : `GET https://re.jrc.ec.europa.eu/api/v5_3/seriescalc` avec `startyear=2020&endyear=2020`, sommation horaire de `G(i)` (W/m²)
→ kWh/m²/jour moyen. Resultats (moyenne journaliere annuelle) :

| Ville | Lat / Lon | PSH moyen (h/j) | min journalier | max journalier |
|---|---|---|---|---|
| Dakar | 14.6928 / -17.4467 | **6.16** | 1.73 | 7.96 |
| Thies | 14.7917 / -16.9167 | **6.30** | 1.17 | 7.87 |
| Saint-Louis | 16.0179 / -16.4896 | **6.47** | 2.62 | 7.97 |
| Kaolack | 14.1520 / -16.0726 | **6.40** | 1.95 | 8.06 |
| Diourbel / Touba | 14.7380 / -15.9766 | **6.44** | 2.57 | 8.01 |
| Tambacounda | 13.7707 / -13.6673 | **6.29** | 1.52 | 7.87 |
| Ziguinchor | 12.5833 / -16.2719 | **5.98** | 1.41 | 7.91 |

Date de collecte : 2026-10-07 (donnees horaires PVGIS annee 2020, base SARAH3 par defaut de `seriescalc`).
Ces valeurs (plutot generueuses vs la valeur prudente 5.0 h) seront a **faire valider par un technicien** :
voir `SOLAR_DECISIONS.md`. Par prudence de dimensionnement, on pourra utiliser la borne raisonnable ~5.0 h en valeur
de conception (le rayonnement journalier moyen n'est pas une garantie de jours de pluie/orage).

## 8. Pages SEO existantes pouvant servir de reference

- Page prix-guide : `app/prix/[slug]/page.jsx` + `lib/utils/prixGuides.js` (ISR, prix vivants, schema FAQ/ItemList).
- Page categorie : `app/category/[slug]/page.jsx` + `lib/seo/categoryContent.js`.
- Page produit : `app/products/[id]/page.jsx` + `lib/seo/metadata.js` (`buildProductMetadata`).
- Blog : `app/blog/page.jsx` + `app/blog/[slug]/page.jsx` (articles backend, schema Article/Person/Breadcrumb).

## 9. Conclusion

Le catalogue solaire est **presque vide de specs exploitables** (estimation 0 %) mais contient les roles de base
(2 panneaux, 3 batteries gel, 2 onduleurs hybrides MPPT, 1 convertisseur, 1 regulateur PWM, 1 kit eclairage).
La voie est claire : (1) annoter via le CSV + overrides front (phase 1), (2) moteur de calcul pur + selection produits
avec regles compatibilite (phase 2), (3) UI 4 etapes mobile-first (phase 3), (4) pages SEO + maillage + OG (phase 4).

Fichiers a surplus (- 0) : aucun. Composants a ne PAS reutiliser : le `BudgetSlider` tel quel (tiers PC).