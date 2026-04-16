# Guide d'intégration — Tekalis Optimisations
## Résumé des changements à appliquer

---

## 1. BACKEND — Route Hero Slides

### server.js / app.js — Ajouter la route :
```js
const heroRoutes = require('./routes/heroRoutes');
app.use('/api/hero', heroRoutes);
```

### Mongoose — Enregistrer le modèle :
```js
// Copier models/HeroSlide.js dans votre dossier models/
```

---

## 2. ADMIN — Ajouter la page HeroSlides

### Copier le fichier :
```
HeroSlides.jsx → apps/admin/src/pages/HeroSlides.jsx
```

### App.jsx admin — Ajouter la route :
```jsx
import HeroSlides from './pages/HeroSlides';

// Dans les routes protégées :
<Route path="/hero-slides" element={<HeroSlides />} />
```

### Sidebar.jsx admin — Ajouter l'item nav :
```js
// Dans NAV_ITEMS, après Dashboard :
{ label: 'Hero Slides', icon: Image, to: '/hero-slides' },
```

---

## 3. CLIENT — Hero dynamique

### Copier :
```
DynamicHero.jsx → apps/client/src/components/DynamicHero.jsx
```

### Home.jsx — Remplacer le Hero statique :
```jsx
// AVANT — supprimer l'ancien hero slider statique (lignes ~95-145)

// APRÈS — importer et utiliser :
import DynamicHero from '../components/DynamicHero';

// Dans le return, remplacer la section hero statique par :
<DynamicHero isHomePage={true} />
```

**IMPORTANT SEO** : Supprimer le `<h1>` ou tout autre heading dupliqué
dans la page Home. DynamicHero génère le seul H1 (sur slide index 0).

---

## 4. CLIENT — SearchBar avec résultats live

### Copier :
```
SearchBarLive.jsx → apps/client/src/components/SearchBarLive.jsx
```

### Navbar.jsx — Remplacer l'input de recherche :
```jsx
import SearchBarLive from '../SearchBarLive';

// Remplacer le bloc <form onSubmit={handleSearch}> par :
<SearchBarLive
  placeholder="Rechercher un produit, une marque…"
  className="max-w-2xl w-full"
  maxResults={6}
/>
```

---

## 5. SEO — PageMeta (H1 unique par page)

### Copier :
```
PageMeta.jsx → apps/client/src/components/seo/PageMeta.jsx
```

### Règles H1 à respecter dans chaque page :

| Page         | Source du H1                              |
|--------------|-------------------------------------------|
| Home         | `<DynamicHero isHomePage={true} />`       |
| Products     | `<h1>Tous les Produits</h1>` dans le JSX  |
| CategoryPage | `<h1>{seo.h1} à Dakar</h1>` (déjà bon)   |
| ProductDetails| `<h1>{product.name}</h1>` (déjà bon)     |
| Blog         | `<h1>Le Labo Tech</h1>` (déjà bon)        |
| Contact      | `<h1>Contactez-nous</h1>` dans le JSX     |
| Dashboard    | `<h2>` et non `<h1>` (page privée)        |

### Remplacer SEOHead/useSEO par PageMeta :
```jsx
// AVANT :
import { SEOHead } from '../hooks/useSEO';
<SEOHead title="..." description="..." />

// APRÈS :
import PageMeta from '../components/seo/PageMeta';
<PageMeta title="..." description="..." />
```

---

## 6. PERFORMANCE — CSS et Vite

### index.css :
Remplacer `apps/client/src/index.css` par le contenu de `index-optimized.css`

### vite.config.js :
Remplacer `apps/client/vite.config.js` par le contenu de `vite.config.optimized.js`

---

## 7. OPTIMISATIONS IMAGES SUPPLÉMENTAIRES

### Dans ProductCard.jsx — ajouter loading lazy + dimensions :
```jsx
<img
  src={imageUrl}
  alt={product.name}
  loading="lazy"
  decoding="async"
  width="400"
  height="400"
  className="..."
/>
```

### Dans DynamicHero.jsx — image hero avec fetchpriority high :
Déjà implémenté dans le composant fourni.

---

## 8. CHECKLIST LIGHTHOUSE MOBILE

### Core Web Vitals à cibler :
- **LCP** < 2.5s → Hero image avec `fetchpriority="high"` + preload
- **CLS** < 0.1 → Dimensions fixes sur toutes les images (width/height)
- **FID/INP** < 200ms → Pas de JS lourd au premier chargement
- **FCP** < 1.8s → Code splitting + lazy loading pages admin

### Dans index.html — Ajouter preload hero :
```html
<!-- Dans <head>, avant les autres scripts -->
<link rel="preload" as="image" fetchpriority="high"
  href="/hero-fallback.webp"
  type="image/webp" />

<!-- Preconnect CDN images -->
<link rel="preconnect" href="https://images.unsplash.com" />
```

### Dans main.jsx — Lazy load des pages :
```jsx
// Remplacer les imports directs par :
const Analytics = lazy(() => import('./pages/Analytics'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
// etc. pour toutes les pages admin

// Wrapper avec Suspense :
<Suspense fallback={<LoadingSpinner fullScreen />}>
  <Routes>...</Routes>
</Suspense>
```

---

## 9. STRUCTURE SEO CORRECTE PAR PAGE

Chaque page doit suivre cette hiérarchie :
```
H1 (1 seul, unique, avec mots-clés)
  H2 (sections principales)
    H3 (sous-sections)
```

### Erreurs courantes à corriger :
- Dashboard.jsx : `<h1>📊 Dashboard Admin</h1>` → `<h2>` (page privée, pas de SEO)
- Analytics.jsx : `<h1>📊 Analytics & Rapports</h1>` → `<h2>`
- Articles.jsx : `<h1>📰 Gestion des articles</h1>` → `<h2>` (admin)
- Toutes les pages admin : utiliser `<h2>` au lieu de `<h1>`

---

## 10. DONNÉES DE SEED — Slides Hero initiaux

Ajouter dans votre seed.js ou via l'interface admin :

```js
const slides = [
  {
    title: "Électronique & High-Tech à Dakar",
    subtitle: "Livraison rapide partout au Sénégal — Wave, Orange Money acceptés",
    badge: "🚀 Meilleurs prix garantis",
    image: "URL_VOTRE_IMAGE_HERO_1",  // 1920×800px
    mobileImage: "URL_VOTRE_IMAGE_MOBILE_1",  // 800×600px
    overlay: "rgba(10,10,30,0.60)",
    primaryCta: { text: "Voir les produits", link: "/products", style: "white" },
    secondaryCta: { text: "Configurer mon PC", link: "/configurator", style: "outline" },
    textPosition: "left",
    order: 0,
    isActive: true,
    stats: [
      { value: "10K+", label: "Clients" },
      { value: "98%", label: "Satisfaits" },
      { value: "48h", label: "Livraison" }
    ]
  },
  {
    title: "Smartphones Dernière Génération",
    subtitle: "iPhone 15, Samsung S24, Xiaomi — Stock disponible à Dakar",
    badge: "📱 Nouveautés 2025",
    image: "URL_VOTRE_IMAGE_HERO_2",
    overlay: "rgba(0,0,20,0.55)",
    primaryCta: { text: "Explorer", link: "/category/smartphones", style: "white" },
    textPosition: "left",
    order: 1,
    isActive: true,
    stats: []
  }
];
```
