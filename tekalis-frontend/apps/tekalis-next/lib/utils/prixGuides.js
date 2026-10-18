// ─────────────────────────────────────────────────────────────────────────────
// lib/utils/prixGuides.js
// Guides des prix (pages statiques /prix/[slug]) ciblant les requêtes
// "prix ... fcfa" / "prix ... dakar" à fort volume dans Google Search Console.
// Le prix exact est récupéré en direct depuis le catalogue (API produits),
// pour que chaque guide affiche les prix du jour (fraîcheur + CTR).
// ─────────────────────────────────────────────────────────────────────────────

import { SITE_URL } from '@/lib/seo/config';

export { SITE_URL };

export const PRIX_GUIDES = [
  {
    slug: 'iphone-12-prix-dakar',
    title: 'Prix iPhone 12 à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 12 à Dakar et au Sénégal mis à jour. iPhone 12 neuf garanti 12 mois, livré en 24-48h. Paiement à la livraison, Wave, Orange Money.",
    h1: "Prix de l'iPhone 12 à Dakar et au Sénégal en FCFA",
    intro:
      "Vous cherchez le prix de l'iPhone 12 à Dakar ? Voici les modèles d'iPhone 12 disponibles en stock chez Tekalis avec leurs prix en FCFA. Certains modèles sont neufs, d'autres sont des imports « Venant » : l'état exact et le prix de chaque appareil sont indiqués sur sa fiche.",
    summary: "Le prix de l'iPhone 12 à Dakar, modèles en stock et livraison partout au Sénégal.",
    query: ['prix iphone 12 dakar', 'prix iphone 12 senegal', 'iphone 12 prix fcfa'],
    search: 'iPhone 12',
    categorySlug: 'smartphones',
    keywords: [
      'prix iphone 12 dakar', 'prix iphone 12 senegal', 'iphone 12 prix fcfa',
      'iphone 12 dakar', 'acheter iphone 12 senegal',
    ],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 12 à Dakar en 2026 ?",
        a: "Le prix de l'iPhone 12 chez Tekalis à Dakar varie selon la capacité (64 Go, 128 Go) et l'état (neuf ou import « Venant »). Consultez les modèles ci-dessous pour voir les prix du jour en FCFA.",
      },
      {
        q: "Où acheter un iPhone 12 à Dakar ?",
        a: "Chez Tekalis, à Dakar (Fann) et en ligne. Les modèles neufs et les imports « Venant » sont identifiés sur chaque fiche, avec le prix en FCFA. Livraison 24-48h à Dakar et partout au Sénégal.",
      },
      {
        q: "Où acheter un iPhone 12 neuf et garanti à Dakar ?",
        a: "Chez Tekalis, à Fann (Rue 14) ou en ligne sur tekalis.com. Tous nos iPhone 12 sont neufs, scellés et garantis 12 mois. Livraison 24-48h à Dakar et dans tout le Sénégal.",
      },
      {
        q: "Peut-on payer l'iPhone 12 à la livraison ?",
        a: "Oui. Nous acceptons le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 12 en dehors de Dakar ?",
        a: "Oui, nous livrons partout au Sénégal (Thiès, Mbour, Saint-Louis, Ziguinchor…) en 3-5 jours ouvrés.",
      },
    ],
  },
  {
    slug: 'iphone-13-prix-dakar',
    title: 'Prix iPhone 13 à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 13 à Dakar et au Sénégal mis à jour. iPhone 13 neuf garanti, livré en 24-48h partout au Sénégal. Paiement à la livraison, Wave, Orange Money.",
    h1: "Prix de l'iPhone 13 à Dakar et au Sénégal en FCFA",
    intro:
      "Besoin du prix de l'iPhone 13 à Dakar ? Retrouvez les modèles d'iPhone 13 en stock chez Tekalis avec leurs prix en FCFA. Appareils neufs, scellés, garantis 12 mois, livrés sous 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix de l'iPhone 13 à Dakar, modèles en stock et livraison au Sénégal.",
    query: ['prix iphone 13 dakar', 'prix iphone 13 senegal'],
    search: 'iPhone 13',
    categorySlug: 'smartphones',
    keywords: [
      'prix iphone 13 dakar', 'prix iphone 13 senegal', 'iphone 13 prix fcfa',
      'iphone 13 dakar', 'acheter iphone 13 senegal',
    ],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 13 à Dakar ?",
        a: "Le prix de l'iPhone 13 chez Tekalis dépend de la capacité (128 Go, 256 Go). Retrouvez ci-dessous les modèles en stock avec leurs prix du jour en FCFA.",
      },
      {
        q: "L'iPhone 13 est-il livré garanti ?",
        a: "Oui, chaque iPhone 13 est neuf, scellé, avec facture officielle et garantie constructeur de 12 mois. Livraison 24-48h à Dakar.",
      },
      {
        q: "Comment payer l'iPhone 13 en ligne ?",
        a: "Par carte bancaire, Wave, Orange Money, Free Money ou paiement à la livraison à Dakar.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-s24-ultra-prix-fcfa',
    title: 'Prix Samsung Galaxy S24 Ultra en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy S24 Ultra en FCFA au Sénégal. S24 Ultra neuf garanti 12 mois, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy S24 Ultra en FCFA au Sénégal',
    intro:
      "Vous cherchez le prix du Samsung Galaxy S24 Ultra en FCFA ? Voici les modèles Galaxy S24 Ultra disponibles en stock chez Tekalis avec leurs prix en FCFA : neufs, scellés, garantis 12 mois et livrés sous 24-48h à Dakar et dans tout le Sénégal.",
    summary: "Le prix du Samsung Galaxy S24 Ultra en FCFA au Sénégal, modèles en stock.",
    query: ['samsung s24 ultra prix en fcfa', 'samsung galaxy s24 ultra prix en fcfa', 'samsung s24 ultra prix dakar'],
    search: 'S24 Ultra',
    categorySlug: 'smartphones',
    keywords: [
      'samsung s24 ultra prix en fcfa', 'samsung galaxy s24 ultra prix en fcfa',
      'samsung s24 ultra prix senegal', 'samsung s24 ultra dakar', 'prix s24 ultra fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy S24 Ultra en FCFA ?",
        a: "Le prix du Galaxy S24 Ultra chez Tekalis varie selon la capacité (256 Go, 512 Go). Consultez les modèles ci-dessous pour voir le prix du jour en FCFA.",
      },
      {
        q: "Le Galaxy S24 Ultra est-il disponible à Dakar ?",
        a: "Oui, le Samsung Galaxy S24 Ultra est en stock chez Tekalis à Fann (Dakar) et livré en 24-48h partout au Sénégal.",
      },
      {
        q: "Le S24 Ultra vendu est-il reconditionné ?",
        a: "Non. Tous nos Galaxy S24 Ultra sont neufs, scellés, avec facture officielle et garantie constructeur de 12 mois.",
      },
      {
        q: "Peut-on payer le Samsung S24 Ultra à la livraison ?",
        a: "Oui, à Dakar. Nous acceptons aussi Wave, Orange Money, Free Money et le paiement par carte.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-a25-prix-fcfa',
    title: 'Prix Samsung Galaxy A25 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy A25 en FCFA au Sénégal. Galaxy A25 neuf garanti, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy A25 en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy A25 en FCFA vous intéresse ? Retrouvez les modèles Galaxy A25 en stock chez Tekalis avec leurs prix en FCFA : neufs, garantis 12 mois et livrés sous 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy A25 en FCFA au Sénégal, modèles en stock.",
    query: ['samsung a25 prix en fcfa', 'samsung a 25 prix en fcfa', 'samsung a25 prix senegal'],
    search: 'Galaxy A25',
    categorySlug: 'smartphones',
    keywords: [
      'samsung a25 prix en fcfa', 'samsung a 25 prix en fcfa', 'samsung a25 prix senegal',
      'samsung galaxy a25 prix dakar', 'samsung a25 fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy A25 en FCFA ?",
        a: "Le prix du Galaxy A25 chez Tekalis dépend de la capacité et de la couleur. Consultez les modèles ci-dessous pour le prix du jour en FCFA.",
      },
      {
        q: "Le Galaxy A25 est-il un bon téléphone pas cher ?",
        a: "Le Galaxy A25 offre un excellent rapport qualité/prix : grand écran AMOLED, bonne autonomie et garantie 12 mois chez Tekalis. Un choix très apprécié à Dakar.",
      },
      {
        q: "Comment acheter le Samsung A25 à Dakar ?",
        a: "En ligne sur tekalis.com avec livraison 24-48h, ou directement à notre boutique Fann (Rue 14) à Dakar.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-s23-fe-prix-senegal',
    title: 'Prix Samsung Galaxy S23 FE au Sénégal en FCFA',
    metaDescription:
      "Prix du Samsung Galaxy S23 FE au Sénégal en FCFA. S23 FE neuf garanti 12 mois, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy S23 FE au Sénégal en FCFA',
    intro:
      "Vous cherchez le prix du Samsung Galaxy S23 FE au Sénégal ? Retrouvez les modèles Galaxy S23 FE en stock chez Tekalis avec leurs prix en FCFA : neufs, scellés, garantis 12 mois et livrés sous 24-48h à Dakar.",
    summary: "Le prix du Samsung Galaxy S23 FE au Sénégal, modèles en stock à Dakar.",
    query: ['samsung s23 fe prix senegal', 'prix galaxy s23 fe dakar', 's23 fe prix fcfa'],
    search: 'S23 FE',
    categorySlug: 'smartphones',
    keywords: [
      'samsung s23 fe prix senegal', 'prix galaxy s23 fe dakar', 's23 fe prix fcfa',
      'samsung s23 fe fcfa', 'acheter galaxy s23 fe senegal',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy S23 FE au Sénégal ?",
        a: "Le prix du Galaxy S23 FE chez Tekalis varie selon la capacité (128 Go, 256 Go). Consultez les modèles ci-dessous pour le prix du jour en FCFA.",
      },
      {
        q: "Le Galaxy S23 FE est-il disponible à Dakar ?",
        a: "Oui, le Samsung Galaxy S23 FE est en stock chez Tekalis à Fann (Dakar) avec livraison 24-48h partout au Sénégal.",
      },
      {
        q: "Le S23 FE est-il garanti ?",
        a: "Oui, chaque Galaxy S23 FE est neuf, avec facture officielle et garantie constructeur de 12 mois.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-a55-prix-fcfa',
    title: 'Prix Samsung Galaxy A55 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy A55 en FCFA au Sénégal. Galaxy A55 neuf garanti 12 mois, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy A55 en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy A55 en FCFA vous intéresse ? Voici les modèles Galaxy A55 en stock chez Tekalis avec leurs prix en FCFA : neufs, garantis 12 mois et livrés sous 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy A55 en FCFA au Sénégal, modèles en stock.",
    query: ['samsung a55 prix en fcfa', 'samsung a55 prix senegal', 'samsung galaxy a55 prix dakar'],
    search: 'Galaxy A55',
    categorySlug: 'smartphones',
    keywords: [
      'samsung a55 prix en fcfa', 'samsung a55 prix senegal', 'samsung galaxy a55 prix dakar',
      'samsung a55 fcfa', 'acheter galaxy a55 senegal',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy A55 en FCFA ?",
        a: "Le prix du Galaxy A55 chez Tekalis varie selon la capacité (128 Go, 256 Go). Consultez les modèles ci-dessous pour le prix du jour en FCFA.",
      },
      {
        q: "Le Galaxy A55 est-il disponible à Dakar ?",
        a: "Oui, le Samsung Galaxy A55 est en stock chez Tekalis à Fann (Dakar) avec livraison 24-48h partout au Sénégal.",
      },
      {
        q: "Le Galaxy A55 a-t-il une garantie ?",
        a: "Oui, chaque Galaxy A55 vendu par Tekalis est neuf, avec facture officielle et garantie constructeur de 12 mois.",
      },
    ],
  },
  {
    slug: 'samsung-moins-de-30000-fcfa',
    title: 'Samsung pas cher à moins de 30 000 FCFA — Tekalis Sénégal',
    metaDescription:
      "Quel téléphone Samsung acheter avec 30 000 FCFA à Dakar ? Découvrez les Samsung à moins de 30 000 FCFA en stock chez Tekalis. Garantie, livraison 24-48h.",
    h1: 'Meilleur Samsung à moins de 30 000 FCFA au Sénégal',
    intro:
      "Vous disposez d'un budget de 30 000 FCFA et cherchez un téléphone Samsung ? Voici les modèles Samsung disponibles à moins de 30 000 FCFA chez Tekalis. Tous sont neufs, garantis et livrés rapidement à Dakar et partout au Sénégal.",
    summary: "Les téléphones Samsung à moins de 30 000 FCFA disponibles à Dakar.",
    query: ['samsung 30000 fcfa', 'samsung pas cher 30000', 'telephone samsung moins de 30000 fcfa'],
    brand: 'Samsung',
    maxPrice: 30000,
    categorySlug: 'smartphones',
    keywords: [
      'samsung 30000 fcfa', 'samsung pas cher 30000', 'telephone samsung moins de 30000 fcfa',
      'samsung pas cher dakar', 'telephone 30000 fcfa',
    ],
    faqs: [
      {
        q: "Quel Samsung peut-on acheter avec 30 000 FCFA ?",
        a: "Plusieurs téléphones Samsung (séries Galaxy A, J, M) sont disponibles à moins de 30 000 FCFA chez Tekalis. Consultez notre liste ci-dessous pour les modèles en stock.",
      },
      {
        q: "Les Samsung à moins de 30 000 FCFA sont-ils neufs ?",
        a: "Oui, tous les téléphones Samsung vendus par Tekalis sont neufs, scellés et garantis. Aucun produit reconditionné ou d'occasion.",
      },
      {
        q: "Peut-on payer à la livraison à Dakar ?",
        a: "Oui, le paiement à la livraison est disponible à Dakar. Vous pouvez aussi payer par Wave, Orange Money ou Free Money.",
      },
    ],
  },
  {
    slug: 'iphone-xr-prix-dakar',
    title: 'Prix iPhone XR à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone XR à Dakar et au Sénégal, mis à jour. Modèles importés « Venant » en stock, livrés en 24-48h. Paiement à la livraison, Wave, Orange Money.",
    h1: "Prix de l'iPhone XR à Dakar et au Sénégal en FCFA",
    intro:
      "Vous cherchez le prix de l'iPhone XR à Dakar ? Voici les modèles d'iPhone XR disponibles chez Tekalis avec leurs prix en FCFA. Il s'agit de modèles importés « Venant » : l'état exact de chaque appareil est indiqué sur sa fiche. Livraison 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix de l'iPhone XR à Dakar, modèles en stock et livraison au Sénégal.",
    query: ['prix iphone xr dakar', 'prix iphone xr senegal', 'iphone xr prix fcfa'],
    search: 'iPhone XR',
    categorySlug: 'smartphones',
    keywords: [
      'prix iphone xr dakar', 'prix iphone xr senegal', 'iphone xr prix fcfa',
      'iphone xr dakar', 'acheter iphone xr senegal',
    ],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone XR à Dakar ?",
        a: "Le prix de l'iPhone XR chez Tekalis dépend de la capacité (64 Go, 128 Go). Les modèles sont des imports « Venant » : consultez les fiches ci-dessous pour le prix du jour en FCFA et l'état exact.",
      },
      {
        q: "Les iPhone XR proposés sont-ils neufs ou d'occasion ?",
        a: "Les modèles listés portent la mention « Venant » (import). L'état réel de chaque appareil est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ces modèles.",
      },
      {
        q: "Où acheter un iPhone XR à Dakar ?",
        a: "Chez Tekalis, à Dakar (Fann) et en ligne sur tekalis.com, avec livraison 24-48h à Dakar et partout au Sénégal.",
      },
    ],
  },
  {
    slug: 'iphone-11-pro-max-prix-dakar',
    title: 'Prix iPhone 11 Pro Max à Dakar en FCFA — Tekalis',
    metaDescription:
      "Prix de l'iPhone 11 Pro Max à Dakar et au Sénégal mis à jour. Modèle en stock, livré en 24-48h. Paiement à la livraison, Wave, Orange Money.",
    h1: "Prix de l'iPhone 11 Pro Max à Dakar et au Sénégal en FCFA",
    intro:
      "Vous cherchez le prix de l'iPhone 11 Pro Max à Dakar ? Retrouvez le modèle disponible chez Tekalis avec son prix en FCFA, son état et sa disponibilité. Livraison 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix de l'iPhone 11 Pro Max à Dakar, modèle en stock et livraison au Sénégal.",
    query: ['prix iphone 11 pro max dakar', 'prix iphone 11 pro max senegal', 'iphone 11 pro max fcfa'],
    search: 'iPhone 11 Pro Max',
    categorySlug: 'smartphones',
    keywords: [
      'prix iphone 11 pro max dakar', 'prix iphone 11 pro max senegal',
      'iphone 11 pro max fcfa', 'iphone 11 pro max dakar',
    ],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 11 Pro Max à Dakar ?",
        a: "Le prix de l'iPhone 11 Pro Max chez Tekalis est affiché en FCFA sur sa fiche, avec sa disponibilité en stock. Consultez le modèle ci-dessous pour le prix du jour.",
      },
      {
        q: "L'iPhone 11 Pro Max est-il garanti ?",
        a: "Chaque appareil vendu par Tekalis bénéficie de la garantie indiquée sur sa fiche produit. Le détail figure sur la page du modèle et sur notre page Garanties.",
      },
      {
        q: "Livrez-vous l'iPhone 11 Pro Max à Dakar ?",
        a: "Oui, Tekalis est situé à Dakar (Fann) et livre en 24-48h à Dakar, ainsi que dans les régions du Sénégal.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-a14-prix-fcfa',
    title: 'Prix Samsung Galaxy A14 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy A14 en FCFA au Sénégal. Galaxy A14 neuf garanti, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy A14 en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy A14 en FCFA vous intéresse ? Retrouvez le modèle Galaxy A14 en stock chez Tekalis avec son prix en FCFA : neuf, garanti et livré sous 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy A14 en FCFA au Sénégal, modèle en stock.",
    query: ['samsung a14 prix en fcfa', 'samsung galaxy a14 prix senegal', 'galaxy a14 prix dakar'],
    search: 'Galaxy A14',
    categorySlug: 'smartphones',
    keywords: [
      'samsung a14 prix en fcfa', 'samsung galaxy a14 prix senegal',
      'galaxy a14 prix dakar', 'samsung a14 fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy A14 en FCFA ?",
        a: "Le prix du Galaxy A14 chez Tekalis est affiché en FCFA sur sa fiche, avec sa disponibilité. Consultez le modèle ci-dessous pour le prix du jour.",
      },
      {
        q: "Le Galaxy A14 est-il disponible à Dakar ?",
        a: "Oui, le Samsung Galaxy A14 est en stock chez Tekalis à Fann (Dakar) avec livraison 24-48h partout au Sénégal.",
      },
      {
        q: "Le Galaxy A14 a-t-il une garantie ?",
        a: "Oui, chaque Galaxy A14 vendu par Tekalis bénéficie de la garantie indiquée sur sa fiche produit.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-a15-prix-fcfa',
    title: 'Prix Samsung Galaxy A15 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy A15 en FCFA au Sénégal. Galaxy A15 neuf garanti, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy A15 en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy A15 en FCFA vous intéresse ? Retrouvez le modèle Galaxy A15 en stock chez Tekalis avec son prix en FCFA : neuf, garanti et livré sous 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy A15 en FCFA au Sénégal, modèle en stock.",
    query: ['samsung a15 prix en fcfa', 'samsung galaxy a15 prix senegal', 'galaxy a15 prix dakar'],
    search: 'Galaxy A15',
    categorySlug: 'smartphones',
    keywords: [
      'samsung a15 prix en fcfa', 'samsung galaxy a15 prix senegal',
      'galaxy a15 prix dakar', 'samsung a15 fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy A15 en FCFA ?",
        a: "Le prix du Galaxy A15 chez Tekalis est affiché en FCFA sur sa fiche, avec sa disponibilité. Consultez le modèle ci-dessous pour le prix du jour.",
      },
      {
        q: "Le Galaxy A15 est-il disponible à Dakar ?",
        a: "Oui, le Samsung Galaxy A15 est en stock chez Tekalis à Fann (Dakar) avec livraison 24-48h partout au Sénégal.",
      },
      {
        q: "Le Galaxy A15 a-t-il une garantie ?",
        a: "Oui, chaque Galaxy A15 vendu par Tekalis bénéficie de la garantie indiquée sur sa fiche produit.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-a24-prix-fcfa',
    title: 'Prix Samsung Galaxy A24 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy A24 en FCFA au Sénégal. Galaxy A24 neuf garanti, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy A24 en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy A24 en FCFA vous intéresse ? Retrouvez le modèle Galaxy A24 en stock chez Tekalis avec son prix en FCFA : neuf, garanti et livré sous 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy A24 en FCFA au Sénégal, modèle en stock.",
    query: ['samsung a24 prix en fcfa', 'samsung galaxy a24 prix senegal', 'galaxy a24 prix dakar'],
    search: 'Galaxy A24',
    categorySlug: 'smartphones',
    keywords: [
      'samsung a24 prix en fcfa', 'samsung galaxy a24 prix senegal',
      'galaxy a24 prix dakar', 'samsung a24 fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy A24 en FCFA ?",
        a: "Le prix du Galaxy A24 chez Tekalis est affiché en FCFA sur sa fiche, avec sa disponibilité. Consultez le modèle ci-dessous pour le prix du jour.",
      },
      {
        q: "Le Galaxy A24 est-il disponible à Dakar ?",
        a: "Oui, le Samsung Galaxy A24 est en stock chez Tekalis à Fann (Dakar) avec livraison 24-48h partout au Sénégal.",
      },
      {
        q: "Le Galaxy A24 a-t-il une garantie ?",
        a: "Oui, chaque Galaxy A24 vendu par Tekalis bénéficie de la garantie indiquée sur sa fiche produit.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-a54-prix-fcfa',
    title: 'Prix Samsung Galaxy A54 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy A54 5G en FCFA au Sénégal. Galaxy A54 neuf garanti, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy A54 en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy A54 en FCFA vous intéresse ? Retrouvez le modèle Galaxy A54 5G en stock chez Tekalis avec son prix en FCFA : neuf, garanti et livré sous 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy A54 en FCFA au Sénégal, modèle en stock.",
    query: ['samsung a54 prix en fcfa', 'samsung galaxy a54 prix senegal', 'galaxy a54 prix dakar'],
    search: 'Galaxy A54',
    categorySlug: 'smartphones',
    keywords: [
      'samsung a54 prix en fcfa', 'samsung galaxy a54 prix senegal',
      'galaxy a54 prix dakar', 'samsung a54 5g fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy A54 en FCFA ?",
        a: "Le prix du Galaxy A54 chez Tekalis est affiché en FCFA sur sa fiche, avec sa disponibilité. Consultez le modèle ci-dessous pour le prix du jour.",
      },
      {
        q: "Le Galaxy A54 est-il disponible à Dakar ?",
        a: "Oui, le Samsung Galaxy A54 est en stock chez Tekalis à Fann (Dakar) avec livraison 24-48h partout au Sénégal.",
      },
      {
        q: "Le Galaxy A54 a-t-il une garantie ?",
        a: "Oui, chaque Galaxy A54 vendu par Tekalis bénéficie de la garantie indiquée sur sa fiche produit.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-s20-fe-prix-fcfa',
    title: 'Prix Samsung Galaxy S20 FE en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy S20 FE 5G en FCFA au Sénégal. Modèle importé « Venant » en stock, livré en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy S20 FE en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy S20 FE en FCFA vous intéresse ? Retrouvez le modèle Galaxy S20 FE 5G disponible chez Tekalis avec son prix en FCFA. Il s'agit d'un import « Venant » : l'état exact est indiqué sur sa fiche. Livraison 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy S20 FE en FCFA au Sénégal, modèle en stock.",
    query: ['samsung s20 fe prix en fcfa', 'galaxy s20 fe prix senegal', 'samsung s20 fe prix dakar'],
    search: 'S20 FE',
    categorySlug: 'smartphones',
    keywords: [
      'samsung s20 fe prix en fcfa', 'galaxy s20 fe prix senegal',
      'samsung s20 fe prix dakar', 'samsung s20 fe fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy S20 FE en FCFA ?",
        a: "Le prix du Galaxy S20 FE 5G chez Tekalis est affiché en FCFA sur sa fiche. Il s'agit d'un import « Venant » : consultez la fiche pour le prix du jour et l'état exact.",
      },
      {
        q: "Le Galaxy S20 FE proposé est-il neuf ou d'occasion ?",
        a: "Le modèle listé porte la mention « Venant » (import). L'état réel est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ce modèle.",
      },
      {
        q: "Où acheter le Galaxy S20 FE à Dakar ?",
        a: "Chez Tekalis, à Dakar (Fann) et en ligne sur tekalis.com, avec livraison 24-48h à Dakar et partout au Sénégal.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-s10-prix-fcfa',
    title: 'Prix Samsung Galaxy S10 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy S10 et S10+ en FCFA au Sénégal. Modèles importés « Venant » en stock, livrés en 24-48h à Dakar. Paiement à la livraison, Wave, Orange Money.",
    h1: 'Prix du Samsung Galaxy S10 en FCFA au Sénégal',
    intro:
      "Le prix du Samsung Galaxy S10 en FCFA vous intéresse ? Voici les modèles Galaxy S10 disponibles chez Tekalis avec leurs prix en FCFA. Ce sont des imports « Venant » : l'état exact de chaque appareil est indiqué sur sa fiche. Livraison 24-48h à Dakar et partout au Sénégal.",
    summary: "Le prix du Samsung Galaxy S10 en FCFA au Sénégal, modèles en stock.",
    query: ['samsung s10 prix en fcfa', 'samsung galaxy s10 prix senegal', 'galaxy s10 prix dakar'],
    search: 'Galaxy S10',
    categorySlug: 'smartphones',
    keywords: [
      'samsung s10 prix en fcfa', 'samsung galaxy s10 prix senegal',
      'galaxy s10 prix dakar', 'samsung s10 fcfa',
    ],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy S10 en FCFA ?",
        a: "Le prix du Galaxy S10 et du Galaxy S10+ chez Tekalis est affiché en FCFA sur chaque fiche. Ces modèles sont des imports « Venant » : consultez les fiches ci-dessous pour le prix du jour et l'état exact.",
      },
      {
        q: "Les Galaxy S10 proposés sont-ils neufs ou d'occasion ?",
        a: "Les modèles listés portent la mention « Venant » (import). L'état réel de chaque appareil est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ces modèles.",
      },
      {
        q: "Où acheter un Galaxy S10 à Dakar ?",
        a: "Chez Tekalis, à Dakar (Fann) et en ligne sur tekalis.com, avec livraison 24-48h à Dakar et partout au Sénégal.",
      },
    ],
  },
];

export function getPrixGuide(slug) {
  return PRIX_GUIDES.find((guide) => guide.slug === slug) || null;
}