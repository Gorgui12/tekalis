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
    title: 'Prix iPhone 12 simple en FCFA à Dakar — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 12 simple à Dakar en FCFA : modèles 64 Go et 128 Go en stock chez Tekalis, neufs ou « Venant ». Livraison 24-48h au Sénégal.",
    h1: "Prix de l'iPhone 12 simple à Dakar et au Sénégal en FCFA",
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
    title: 'Prix iPhone 13 simple en FCFA à Dakar — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 13 simple à Dakar en FCFA : modèle 128 Go ou 256 Go en stock chez Tekalis. Livraison 24-48h au Sénégal, paiement à la livraison.",
    h1: "Prix de l'iPhone 13 simple à Dakar et au Sénégal en FCFA",
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
    title: 'Prix iPhone XR 128 Go — xr prix Sénégal | Tekalis',
    metaDescription:
      "Prix de l'iPhone XR 128 Go à Dakar en FCFA : xr prix Sénégal, modèle importé « Venant » en stock, état sur la fiche. Livraison 24-48h au Sénégal.",
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
    excludeTerms: ['S10+'],
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
  {
    slug: 'iphone-11-prix-dakar',
    title: 'Prix iPhone 11 à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 11 simple à Dakar en FCFA : modèles 64 et 128 Go en stock chez Tekalis, état indiqué sur chaque fiche, livraison 24-48h au Sénégal.",
    h1: "Prix de l'iPhone 11 à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide couvre l'iPhone 11 simple, en 64 Go et 128 Go, dans ses versions neuves et importées « Venant » disponibles chez Tekalis. Les iPhone 11 Pro et iPhone 11 Pro Max ne sont pas inclus ici : ils disposent de leur propre guide de prix. Pour chaque appareil, l'état exact est indiqué sur la fiche produit.",
    summary: "Le prix de l'iPhone 11 simple à Dakar, modèles 64 et 128 Go en stock.",
    query: ['iphone 11 simple prix en fcfa', 'prix iphone 11 sénégal', 'prix iphone 11 dakar'],
    search: 'iPhone 11',
    excludeTerms: ['Pro'],
    categorySlug: 'smartphones',
    keywords: [
      'iphone 11 simple prix en fcfa', 'prix iphone 11 sénégal', 'prix iphone 11 dakar',
      'iphone 11 64 go prix', 'iphone 11 128 go prix',
    ],
    seeAlso: [{ slug: 'iphone-11-pro-max-prix-dakar', label: "l'iPhone 11 Pro Max" }],
    related: ['iphone-12-prix-dakar', 'iphone-xr-prix-dakar', 'iphone-11-pro-max-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 11 simple à Dakar en FCFA ?",
        a: "Le prix de l'iPhone 11 simple dépend de la capacité (64 Go ou 128 Go) et de la version (neuve ou import « Venant »). Les modèles disponibles et leurs prix du jour sont affichés ci-dessous en FCFA.",
      },
      {
        q: "Quelles capacités d'iPhone 11 sont disponibles chez Tekalis ?",
        a: "Le catalogue propose des iPhone 11 en 64 Go et en 128 Go. Les capacités réellement en stock apparaissent sur chaque fiche produit, avec le prix correspondant en FCFA.",
      },
      {
        q: "Les iPhone 11 « Venant » sont-ils neufs ?",
        a: "Les modèles listés avec la mention « Venant » sont des imports. L'état réel de chaque appareil est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ces modèles.",
      },
      {
        q: "Peut-on payer l'iPhone 11 à la livraison à Dakar ?",
        a: "Oui. Tekalis accepte le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 11 en dehors de Dakar ?",
        a: "Oui, la livraison est assurée en 24-48h à Dakar et dans les régions du Sénégal. Les délais et frais exacts sont rappelés sur la page Livraison.",
      },
    ],
  },
  {
    slug: 'iphone-15-prix-dakar',
    title: 'Prix iPhone 15 à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 15 simple à Dakar en FCFA : modèles 128 et 256 Go en stock. Pour l'iPhone 15 Pro et Pro Max, voir le guide dédié au Sénégal.",
    h1: "Prix de l'iPhone 15 à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide présente l'iPhone 15 simple et l'iPhone 15 Plus disponibles chez Tekalis, avec leurs prix en FCFA et leurs capacités réelles. L'iPhone 15 Pro et l'iPhone 15 Pro Max sont traités séparément pour éviter de mélanger les modèles : consultez le guide des prix iPhone 15 Pro. L'état et la garantie de chaque appareil sont ceux indiqués sur sa fiche produit.",
    summary: "Le prix de l'iPhone 15 simple et du 15 Plus à Dakar, modèles en stock.",
    query: ['iphone 15 simple prix en fcfa', 'iphone 15 prix sénégal', 'prix iphone 15 dakar'],
    search: 'iPhone 15',
    excludeTerms: ['Pro'],
    categorySlug: 'smartphones',
    keywords: [
      'iphone 15 simple prix en fcfa', 'iphone 15 prix sénégal', 'prix iphone 15 dakar',
      'iphone 15 128 go prix', 'iphone 15 256 go prix',
    ],
    seeAlso: [{ slug: 'iphone-15-pro-prix-dakar', label: "l'iPhone 15 Pro et Pro Max" }],
    related: ['iphone-15-pro-prix-dakar', 'iphone-14-plus-prix-dakar', 'iphone-16-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 15 simple à Dakar en FCFA ?",
        a: "Le prix de l'iPhone 15 simple varie selon la capacité (128 Go ou 256 Go). Les modèles en stock et leurs prix du jour en FCFA sont listés ci-dessous.",
      },
      {
        q: "Quelles capacités d'iPhone 15 sont proposées ?",
        a: "Le catalogue contient des iPhone 15 en 128 Go et 256 Go, ainsi qu'un iPhone 15 Plus en 128 Go eSIM. Vérifiez la capacité exacte sur chaque fiche produit avant de commander.",
      },
      {
        q: "Quelle différence entre l'iPhone 15 et l'iPhone 15 Pro ?",
        a: "L'iPhone 15 simple et le 15 Plus figurent dans ce guide, tandis que l'iPhone 15 Pro et le 15 Pro Max ont leur propre guide de prix. Comparez les fiches produit pour les caractéristiques et le prix de chaque version.",
      },
      {
        q: "Peut-on payer l'iPhone 15 avec Wave ou Orange Money ?",
        a: "Oui. Le paiement à la livraison, Wave, Orange Money et Free Money sont acceptés. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "L'iPhone 15 est-il livré partout au Sénégal ?",
        a: "Oui, Tekalis livre à Dakar en 24-48h et dans les autres régions du Sénégal. Les modalités et frais sont détaillés sur la page Livraison.",
      },
    ],
  },
  {
    slug: 'iphone-15-pro-prix-dakar',
    title: 'Prix iPhone 15 Pro à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 15 Pro et Pro Max à Dakar en FCFA : modèles Pro et Pro Max en stock chez Tekalis, dont 256 Go. Livraison 24-48h au Sénégal.",
    h1: "Prix de l'iPhone 15 Pro à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide regroupe uniquement l'iPhone 15 Pro et l'iPhone 15 Pro Max disponibles chez Tekalis, avec leurs prix en FCFA. L'iPhone 15 simple et l'iPhone 15 Plus sont présentés dans le guide des prix iPhone 15, pour que chaque recherche trouve le bon modèle. Les capacités et l'état exact de chaque appareil sont indiqués sur sa fiche produit.",
    summary: "Le prix de l'iPhone 15 Pro et du 15 Pro Max à Dakar, modèles en stock.",
    query: ['iphone 15 pro prix sénégal', 'iphone 15 pro max prix', 'prix iphone 15 pro dakar'],
    search: 'iPhone 15 Pro',
    categorySlug: 'smartphones',
    keywords: [
      'iphone 15 pro prix sénégal', 'iphone 15 pro max prix', 'prix iphone 15 pro dakar',
      'iphone 15 pro 256 go prix', 'iphone 15 pro max 256 go prix',
    ],
    seeAlso: [{ slug: 'iphone-15-prix-dakar', label: "l'iPhone 15 simple et le 15 Plus" }],
    related: ['iphone-15-prix-dakar', 'iphone-16-prix-dakar', 'iphone-14-plus-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 15 Pro à Dakar en FCFA ?",
        a: "Le prix de l'iPhone 15 Pro dépend de la version et de la capacité. Les iPhone 15 Pro et Pro Max en stock sont affichés ci-dessous avec leur prix du jour en FCFA.",
      },
      {
        q: "Quelle différence entre l'iPhone 15 Pro et l'iPhone 15 Pro Max ?",
        a: "Les deux modèles sont listés séparément dans ce guide, avec leurs propres capacités et prix. Comparez les fiches produit pour choisir la version qui correspond à votre budget.",
      },
      {
        q: "Le guide couvre-t-il aussi l'iPhone 15 simple ?",
        a: "Non. L'iPhone 15 simple et l'iPhone 15 Plus sont couverts par le guide des prix iPhone 15. Ce guide se concentre sur les versions Pro et Pro Max.",
      },
      {
        q: "Peut-on payer l'iPhone 15 Pro à la livraison ?",
        a: "Oui, le paiement à la livraison est disponible à Dakar. Tekalis accepte aussi Wave, Orange Money et Free Money, avec livraison offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 15 Pro Max au Sénégal ?",
        a: "Oui, la livraison est assurée en 24-48h à Dakar et dans les autres régions du Sénégal. Consultez la page Livraison pour les délais et frais de votre zone.",
      },
    ],
  },
  {
    slug: 'iphone-16-prix-dakar',
    title: 'Prix iPhone 16 à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 16 à Dakar en FCFA : modèles 128 Go et 256 Go en stock chez Tekalis. Livraison 24-48h à Dakar et au Sénégal, paiement à la livraison.",
    h1: "Prix de l'iPhone 16 à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide rassemble les iPhone 16 en 128 Go et 256 Go actuellement proposés par Tekalis, avec leurs prix en FCFA. Pour comparer avec le modèle précédent, consultez le guide des prix iPhone 15. Les caractéristiques, l'état et la garantie de chaque appareil sont ceux de sa fiche produit.",
    summary: "Le prix de l'iPhone 16 à Dakar, modèles 128 Go et 256 Go en stock.",
    query: ['iphone 16 256 go prix sénégal', 'prix iphone 16 dakar', 'iphone 16 prix fcfa'],
    search: 'iPhone 16',
    categorySlug: 'smartphones',
    keywords: [
      'iphone 16 256 go prix sénégal', 'prix iphone 16 dakar', 'iphone 16 prix fcfa',
      'iphone 16 128 go prix', 'acheter iphone 16 sénégal',
    ],
    seeAlso: [{ slug: 'iphone-15-prix-dakar', label: "l'iPhone 15" }],
    related: ['iphone-15-prix-dakar', 'iphone-15-pro-prix-dakar', 'iphone-14-plus-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 16 à Dakar en FCFA ?",
        a: "Le prix de l'iPhone 16 dépend de la capacité choisie. Les modèles 128 Go et 256 Go en stock sont affichés ci-dessous avec leur prix du jour en FCFA.",
      },
      {
        q: "Combien coûte l'iPhone 16 256 Go au Sénégal ?",
        a: "L'iPhone 16 256 Go figure dans la liste ci-dessous avec son prix actualisé en FCFA. Le prix peut évoluer selon le stock : consultez la fiche produit pour le montant exact.",
      },
      {
        q: "Quelle différence entre l'iPhone 16 et l'iPhone 15 ?",
        a: "Les deux modèles ont des fiches produit distinctes. Pour comparer les capacités et les prix, ouvrez le guide des prix iPhone 15 puis les fiches de chaque modèle.",
      },
      {
        q: "Peut-on payer l'iPhone 16 à la livraison à Dakar ?",
        a: "Oui. Tekalis accepte le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 16 dans les régions du Sénégal ?",
        a: "Oui, la livraison est assurée à Dakar en 24-48h et dans les autres régions du Sénégal. Les délais et frais sont détaillés sur la page Livraison.",
      },
    ],
  },
  {
    slug: 'iphone-12-mini-prix-dakar',
    title: 'Prix iPhone 12 mini à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 12 Mini à Dakar en FCFA : modèle compact 64 Go en stock chez Tekalis, état indiqué sur la fiche. Livraison 24-48h au Sénégal.",
    h1: "Prix de l'iPhone 12 Mini à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide est consacré à l'iPhone 12 Mini, le format compact de la gamme iPhone 12, avec les modèles en stock chez Tekalis et leurs prix en FCFA. L'iPhone 12 standard est couvert par un autre guide de prix. Pour le Mini comme pour le standard, l'état exact de chaque appareil est indiqué sur sa fiche produit.",
    summary: "Le prix de l'iPhone 12 Mini à Dakar, modèle compact en stock.",
    query: ['iphone 12 mini prix en fcfa', 'iphone 12 mini prix sénégal', 'prix iphone 12 mini dakar'],
    search: 'iPhone 12 mini',
    categorySlug: 'smartphones',
    keywords: [
      'iphone 12 mini prix en fcfa', 'iphone 12 mini prix sénégal', 'prix iphone 12 mini dakar',
      'iphone 12 mini 64 go prix', 'acheter iphone 12 mini sénégal',
    ],
    seeAlso: [{ slug: 'iphone-12-prix-dakar', label: "l'iPhone 12 standard" }],
    related: ['iphone-12-prix-dakar', 'iphone-13-prix-dakar', 'iphone-11-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 12 Mini à Dakar en FCFA ?",
        a: "Le prix de l'iPhone 12 Mini dépend de la capacité et de la version disponible. Les modèles en stock et leurs prix du jour en FCFA sont affichés ci-dessous.",
      },
      {
        q: "Quelle différence entre l'iPhone 12 Mini et l'iPhone 12 standard ?",
        a: "L'iPhone 12 Mini est le format compact de la gamme ; l'iPhone 12 standard a son propre guide de prix. Comparez les fiches produit pour la taille, la capacité et le prix.",
      },
      {
        q: "L'iPhone 12 Mini « Venant » est-il neuf ?",
        a: "Le modèle listé avec la mention « Venant » est un import. L'état réel de l'appareil est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ce modèle.",
      },
      {
        q: "Peut-on payer l'iPhone 12 Mini à la livraison ?",
        a: "Oui. Le paiement à la livraison, Wave, Orange Money et Free Money sont acceptés. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 12 Mini partout au Sénégal ?",
        a: "Oui, Tekalis livre à Dakar en 24-48h et dans les autres régions du Sénégal. Les délais et frais sont rappelés sur la page Livraison.",
      },
    ],
  },
  {
    slug: 'iphone-8-plus-prix-dakar',
    title: 'Prix iPhone 8 et 8 Plus en FCFA à Dakar — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 8 et 8 Plus à Dakar en FCFA : modèles 64 Go importés « Venant » en stock chez Tekalis, état indiqué sur la fiche. Livraison 24-48h au Sénégal.",
    h1: "Prix de l'iPhone 8 et 8 Plus à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide réunit l'iPhone 8 et l'iPhone 8 Plus en 64 Go disponibles chez Tekalis, avec leurs prix en FCFA. Les modèles listés sont des imports « Venant » : l'état exact de chaque appareil est indiqué sur sa fiche. Pour un modèle plus récent, consultez le guide des prix iPhone XR.",
    summary: "Le prix de l'iPhone 8 et 8 Plus à Dakar, modèles 64 Go en stock.",
    query: ['iphone 8 plus prix en fcfa', 'iphone 8 prix dakar', 'iphone 8 plus prix sénégal'],
    search: 'iPhone 8',
    excludeTerms: ['Chargeur', 'Câble', 'Adaptateur'],
    categorySlug: 'smartphones',
    keywords: [
      'iphone 8 plus prix en fcfa', 'iphone 8 prix dakar', 'iphone 8 plus prix sénégal',
      'iphone 8 64 go prix', 'acheter iphone 8 plus dakar',
    ],
    seeAlso: [{ slug: 'iphone-xr-prix-dakar', label: "l'iPhone XR" }],
    related: ['iphone-xr-prix-dakar', 'iphone-11-prix-dakar', 'iphone-11-pro-max-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 8 et de l'iPhone 8 Plus à Dakar ?",
        a: "Les iPhone 8 et iPhone 8 Plus en 64 Go sont affichés ci-dessous avec leur prix du jour en FCFA. Le prix dépend du modèle et de l'état indiqué sur la fiche.",
      },
      {
        q: "Quelle différence entre l'iPhone 8 et l'iPhone 8 Plus ?",
        a: "Les deux modèles sont listés séparément dans ce guide, avec leurs propres fiches produit. Comparez-les pour la taille, le prix et l'état avant de choisir.",
      },
      {
        q: "Les iPhone 8 et 8 Plus proposés sont-ils neufs ?",
        a: "Les modèles listés portent la mention « Venant » (import). L'état réel de chaque appareil est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ces modèles.",
      },
      {
        q: "Peut-on payer un iPhone 8 à la livraison à Dakar ?",
        a: "Oui. Tekalis accepte le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 8 Plus en dehors de Dakar ?",
        a: "Oui, la livraison est assurée en 24-48h à Dakar et dans les régions du Sénégal. Les délais et frais sont détaillés sur la page Livraison.",
      },
    ],
  },
  {
    slug: 'iphone-17-pro-max-prix-dakar',
    title: 'Prix iPhone 17 Pro Max à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 17 Pro et Pro Max à Dakar en FCFA : modèle 256 Go eSIM en stock chez Tekalis. Livraison 24-48h au Sénégal, paiement à la livraison.",
    h1: "Prix de l'iPhone 17 Pro Max à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide suit l'iPhone 17 Pro et l'iPhone 17 Pro Max proposés par Tekalis, avec leur prix en FCFA et la capacité réellement disponible. Le modèle en stock est une version 256 Go eSIM. Pour comparer avec la génération précédente, consultez le guide des prix iPhone 16.",
    summary: "Le prix de l'iPhone 17 Pro Max à Dakar, modèle 256 Go eSIM en stock.",
    query: ['iphone 17 pro max prix en fcfa', 'iphone 17 prix sénégal', 'prix iphone 17 dakar'],
    search: 'iPhone 17',
    categorySlug: 'smartphones',
    keywords: [
      'iphone 17 pro max prix en fcfa', 'iphone 17 prix sénégal', 'prix iphone 17 dakar',
      'iphone 17 pro prix', 'iphone 17 pro max 256 go',
    ],
    seeAlso: [{ slug: 'iphone-16-prix-dakar', label: "l'iPhone 16" }],
    related: ['iphone-16-prix-dakar', 'iphone-15-pro-prix-dakar', 'iphone-15-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 17 Pro Max à Dakar en FCFA ?",
        a: "Le prix de l'iPhone 17 Pro Max est affiché ci-dessous en FCFA pour le modèle en stock. Consultez la fiche produit pour le montant exact et la disponibilité du jour.",
      },
      {
        q: "Quelle version de l'iPhone 17 est disponible chez Tekalis ?",
        a: "Le catalogue propose un iPhone 17 Pro / Pro Max en 256 Go eSIM. La fiche produit précise la version et la capacité exactes de l'appareil.",
      },
      {
        q: "Quelle différence entre l'iPhone 17 Pro et l'iPhone 17 Pro Max ?",
        a: "Les deux versions sont regroupées dans ce guide. Ouvrez la fiche produit correspondante pour comparer le format, la capacité et le prix avant de commander.",
      },
      {
        q: "Peut-on payer l'iPhone 17 Pro Max à la livraison ?",
        a: "Oui. Tekalis accepte le paiement à la livraison à Dakar, ainsi que Wave, Orange Money et Free Money. La livraison est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 17 Pro Max au Sénégal ?",
        a: "Oui, la livraison est assurée en 24-48h à Dakar et dans les autres régions du Sénégal. Consultez la page Livraison pour les délais et frais.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-s21-prix-fcfa',
    title: 'Prix Samsung Galaxy S21 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy S21 5G à Dakar en FCFA : modèle 128 Go importé « Venant » en stock, état indiqué sur la fiche. Livraison 24-48h au Sénégal.",
    h1: 'Prix du Samsung Galaxy S21 en FCFA au Sénégal',
    intro:
      "Ce guide présente le Samsung Galaxy S21 5G en 128 Go disponible chez Tekalis, avec son prix en FCFA. Il s'agit d'un import « Venant » : l'état exact est indiqué sur sa fiche produit. Pour les générations précédentes, consultez le guide des prix Galaxy S10 et S10+.",
    summary: "Le prix du Samsung Galaxy S21 5G en FCFA au Sénégal, modèle en stock.",
    query: ['samsung s21 prix en fcfa', 'galaxy s21 prix sénégal', 'samsung s21 prix dakar'],
    search: 'Galaxy S21',
    categorySlug: 'smartphones',
    keywords: [
      'samsung s21 prix en fcfa', 'galaxy s21 prix sénégal', 'samsung s21 prix dakar',
      'galaxy s21 128 go prix', 'samsung galaxy s21 5g prix',
    ],
    seeAlso: [{ slug: 'samsung-galaxy-s10-prix-fcfa', label: 'le Galaxy S10 et S10+' }],
    related: ['samsung-galaxy-s20-fe-prix-fcfa', 'samsung-galaxy-s10-prix-fcfa', 'samsung-galaxy-s10-plus-prix-fcfa'],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy S21 en FCFA ?",
        a: "Le prix du Galaxy S21 5G en stock est affiché ci-dessous en FCFA. Il s'agit d'un import « Venant » : consultez la fiche pour le prix du jour et l'état exact.",
      },
      {
        q: "Le Galaxy S21 proposé est-il neuf ou d'occasion ?",
        a: "Le modèle listé porte la mention « Venant » (import). L'état réel est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ce modèle.",
      },
      {
        q: "Quelle capacité de stockage pour le Galaxy S21 ?",
        a: "Le modèle disponible chez Tekalis est un Galaxy S21 5G en 128 Go. La capacité est rappelée sur la fiche produit avec le prix en FCFA.",
      },
      {
        q: "Le Galaxy S21 est-il compatible 5G au Sénégal ?",
        a: "Le modèle en stock est identifié comme Samsung Galaxy S21 5G. Vérifiez les caractéristiques réseau détaillées sur la fiche produit avant de commander.",
      },
      {
        q: "Peut-on payer le Galaxy S21 à la livraison à Dakar ?",
        a: "Oui. Tekalis accepte le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-s10-plus-prix-fcfa',
    title: 'Prix Samsung Galaxy S10+ en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy S10+ à Dakar en FCFA : modèle 128 Go importé « Venant » en stock, état indiqué sur la fiche. Livraison 24-48h au Sénégal.",
    h1: 'Prix du Samsung Galaxy S10+ en FCFA au Sénégal',
    intro:
      "Ce guide est dédié au Samsung Galaxy S10+ en 128 Go, avec son prix en FCFA chez Tekalis. Le modèle listé est un import « Venant » : l'état exact est indiqué sur sa fiche produit. Le Galaxy S10 standard est présenté dans le guide des prix Galaxy S10.",
    summary: "Le prix du Samsung Galaxy S10+ en FCFA au Sénégal, modèle en stock.",
    query: ['samsung s10 plus prix sénégal', 'samsung galaxy s10 plus prix fcfa', 'galaxy s10+ prix dakar'],
    search: 'S10+',
    categorySlug: 'smartphones',
    keywords: [
      'samsung s10 plus prix sénégal', 'samsung galaxy s10 plus prix fcfa',
      'galaxy s10+ prix dakar', 'galaxy s10 plus 128 go prix',
    ],
    seeAlso: [{ slug: 'samsung-galaxy-s10-prix-fcfa', label: 'le Galaxy S10 standard' }],
    related: ['samsung-galaxy-s10-prix-fcfa', 'samsung-galaxy-s21-prix-fcfa', 'samsung-galaxy-s20-fe-prix-fcfa'],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy S10+ en FCFA ?",
        a: "Le prix du Galaxy S10+ en 128 Go est affiché ci-dessous en FCFA. Il s'agit d'un import « Venant » : consultez la fiche pour le prix du jour et l'état exact.",
      },
      {
        q: "Quelle différence entre le Galaxy S10 et le Galaxy S10+ ?",
        a: "Le Galaxy S10+ a son propre guide et sa fiche produit ; le Galaxy S10 standard est présenté dans un guide séparé. Comparez les deux fiches pour le format, la capacité et le prix.",
      },
      {
        q: "Le Galaxy S10+ proposé est-il neuf ou d'occasion ?",
        a: "Le modèle listé porte la mention « Venant » (import). L'état réel est indiqué sur sa fiche produit ; Tekalis n'affiche aucune mention « neuf » pour ce modèle.",
      },
      {
        q: "Peut-on payer le Galaxy S10+ à la livraison à Dakar ?",
        a: "Oui. Tekalis accepte le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous le Galaxy S10+ partout au Sénégal ?",
        a: "Oui, la livraison est assurée en 24-48h à Dakar et dans les régions du Sénégal. Les délais et frais sont détaillés sur la page Livraison.",
      },
    ],
  },
  {
    slug: 'samsung-galaxy-a34-prix-fcfa',
    title: 'Prix Samsung Galaxy A34 en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix du Samsung Galaxy A34 5G à Dakar en FCFA : modèle 128 Go / 8 Go en stock chez Tekalis. Livraison 24-48h au Sénégal, paiement à la livraison.",
    h1: 'Prix du Samsung Galaxy A34 en FCFA au Sénégal',
    intro:
      "Ce guide présente le Samsung Galaxy A34 5G en 128 Go de stockage et 8 Go de RAM disponible chez Tekalis, avec son prix en FCFA. Pour comparer avec les autres Galaxy A, consultez les guides des prix Galaxy A24 et Galaxy A54. Les caractéristiques exactes sont rappelées sur la fiche produit.",
    summary: "Le prix du Samsung Galaxy A34 5G en FCFA au Sénégal, modèle en stock.",
    query: ['samsung a34 prix sénégal', 'galaxy a34 prix fcfa', 'samsung a34 prix dakar'],
    search: 'A34',
    categorySlug: 'smartphones',
    keywords: [
      'samsung a34 prix sénégal', 'galaxy a34 prix fcfa', 'samsung a34 prix dakar',
      'samsung galaxy a34 5g prix', 'galaxy a34 128 go prix',
    ],
    seeAlso: [
      { slug: 'samsung-galaxy-a24-prix-fcfa', label: 'le Galaxy A24' },
      { slug: 'samsung-galaxy-a54-prix-fcfa', label: 'le Galaxy A54' },
    ],
    related: ['samsung-galaxy-a24-prix-fcfa', 'samsung-galaxy-a54-prix-fcfa', 'samsung-galaxy-a14-prix-fcfa'],
    faqs: [
      {
        q: "Quel est le prix du Samsung Galaxy A34 en FCFA ?",
        a: "Le prix du Galaxy A34 5G en stock est affiché ci-dessous en FCFA. Consultez la fiche produit pour le montant exact et la disponibilité du jour.",
      },
      {
        q: "Quelle version du Galaxy A34 est disponible ?",
        a: "Le catalogue propose un Samsung Galaxy A34 5G avec 128 Go de stockage et 8 Go de RAM. La fiche produit rappelle la configuration exacte.",
      },
      {
        q: "Quelle différence entre le Galaxy A34, le A24 et le A54 ?",
        a: "Chaque modèle a sa propre fiche et son guide de prix. Comparez les caractéristiques et les prix sur les fiches produit pour choisir selon votre budget.",
      },
      {
        q: "Le Galaxy A34 est-il compatible 5G ?",
        a: "Le modèle en stock est identifié comme Samsung Galaxy A34 5G. Vérifiez les caractéristiques réseau détaillées sur la fiche produit avant de commander.",
      },
      {
        q: "Peut-on payer le Galaxy A34 à la livraison à Dakar ?",
        a: "Oui. Tekalis accepte le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
    ],
  },
  {
    slug: 'iphone-14-plus-prix-dakar',
    title: 'Prix iPhone 14 Plus à Dakar en FCFA — Tekalis Sénégal',
    metaDescription:
      "Prix de l'iPhone 14 et 14 Plus à Dakar en FCFA : modèles 128 Go et 256 Go en stock chez Tekalis. Livraison 24-48h au Sénégal, paiement à la livraison.",
    h1: "Prix de l'iPhone 14 Plus à Dakar et au Sénégal en FCFA",
    intro:
      "Ce guide couvre la famille iPhone 14 disponible chez Tekalis, avec un focus sur l'iPhone 14 Plus, et affiche les prix en FCFA de chaque modèle en stock. Pour situer le 14 Plus entre deux générations, consultez les guides des prix iPhone 13 et iPhone 15. L'état et la capacité exacts de chaque appareil sont indiqués sur sa fiche produit.",
    summary: "Le prix de l'iPhone 14 Plus à Dakar, modèles 14 et 14 Plus en stock.",
    query: ['iphone 14 plus prix', 'iphone 14 prix sénégal', 'prix iphone 14 dakar'],
    search: 'iPhone 14',
    excludeTerms: ['Pro'],
    categorySlug: 'smartphones',
    keywords: [
      'iphone 14 plus prix', 'iphone 14 prix sénégal', 'prix iphone 14 dakar',
      'iphone 14 plus 128 go prix', 'acheter iphone 14 plus sénégal',
    ],
    seeAlso: [
      { slug: 'iphone-13-prix-dakar', label: "l'iPhone 13" },
      { slug: 'iphone-15-prix-dakar', label: "l'iPhone 15" },
    ],
    related: ['iphone-13-prix-dakar', 'iphone-15-prix-dakar', 'iphone-15-pro-prix-dakar'],
    faqs: [
      {
        q: "Quel est le prix de l'iPhone 14 Plus à Dakar en FCFA ?",
        a: "Le prix de l'iPhone 14 Plus est affiché ci-dessous en FCFA, avec les autres modèles iPhone 14 en stock. Consultez la fiche produit pour le montant exact.",
      },
      {
        q: "Quelle différence entre l'iPhone 14 et l'iPhone 14 Plus ?",
        a: "Les deux modèles sont listés séparément dans ce guide, avec leurs propres fiches produit. Comparez le format, la capacité et le prix avant de choisir.",
      },
      {
        q: "Quelles capacités d'iPhone 14 sont disponibles ?",
        a: "Le catalogue inclut des versions 128 Go et 256 Go selon les modèles de la gamme iPhone 14. La capacité exacte de chaque appareil est indiquée sur sa fiche produit.",
      },
      {
        q: "Peut-on payer l'iPhone 14 Plus à la livraison à Dakar ?",
        a: "Oui. Tekalis accepte le paiement à la livraison, Wave, Orange Money et Free Money. La livraison à Dakar est offerte dès 50 000 FCFA d'achat.",
      },
      {
        q: "Livrez-vous l'iPhone 14 Plus dans les régions du Sénégal ?",
        a: "Oui, la livraison est assurée en 24-48h à Dakar et dans les autres régions du Sénégal. Les délais et frais sont détaillés sur la page Livraison.",
      },
    ],
  },
];

export function getPrixGuide(slug) {
  return PRIX_GUIDES.find((guide) => guide.slug === slug) || null;
}

/** Marque d'un guide, deduite du slug quand elle n'est pas explicite. */
export function guideBrand(guide) {
  if (!guide) return 'Autres';
  if (guide.brand) return guide.brand;
  const slug = String(guide.slug || '').toLowerCase();
  if (slug.startsWith('iphone')) return 'Apple';
  if (slug.startsWith('samsung')) return 'Samsung';
  return 'Autres';
}

/**
 * Guides regroupes par marque, dans l'ordre de PRIX_GUIDES.
 * Utilise par /prix pour afficher les liens groupes par marque.
 */
export function guidesByBrand() {
  const groups = new Map();
  for (const guide of PRIX_GUIDES) {
    const brand = guideBrand(guide);
    if (!groups.has(brand)) groups.set(brand, []);
    groups.get(brand).push(guide);
  }
  return [...groups.entries()].map(([brand, guides]) => ({
    brand,
    label: brand === 'Apple' ? 'iPhone (Apple)' : brand,
    guides,
  }));
}

/**
 * Guides voisins d'un guide : liens explicites (`related`) si presents,
 * sinon meme marque (modele precedent / suivant), sans jamais inventer de slug.
 */
export function getRelatedGuides(guide, limit = 3) {
  if (!guide) return [];

  const explicit = (guide.related || [])
    .map((slug) => getPrixGuide(slug))
    .filter(Boolean);
  if (explicit.length > 0) {
    return explicit.filter((g) => g.slug !== guide.slug).slice(0, limit);
  }

  const brand = guideBrand(guide);
  const brandGuides = PRIX_GUIDES.filter((g) => guideBrand(g) === brand);
  const position = brandGuides.findIndex((g) => g.slug === guide.slug);
  if (position === -1) return [];

  const neighbors = [];
  for (let offset = 1; offset < brandGuides.length && neighbors.length < limit; offset += 1) {
    const previous = brandGuides[position - offset];
    const next = brandGuides[position + offset];
    if (previous && previous.slug !== guide.slug) neighbors.push(previous);
    if (next && next.slug !== guide.slug && neighbors.length < limit) neighbors.push(next);
  }
  return neighbors.slice(0, limit);
}

/**
 * Guide de prix correspondant a un produit de l'API.
 * On retient la correspondance la plus specifique (search le plus long) et on
 * respecte les exclusions du guide (ex. iPhone 11 simple vs iPhone 11 Pro).
 */
export function findPrixGuideForProduct(product) {
  const name = String(product?.name || '').toLowerCase();
  if (!name) return null;

  return (
    PRIX_GUIDES
      .filter((guide) => guide.search)
      .filter((guide) => name.includes(guide.search.toLowerCase()))
      .filter((guide) =>
        (guide.excludeTerms || []).every(
          (term) => !name.includes(String(term).toLowerCase())
        )
      )
      .sort((a, b) => b.search.length - a.search.length)[0] || null
  );
}

/** Fil d'Ariane commun (visible + BreadcrumbList) : Accueil > Prix > modele. */
export function prixGuideBreadcrumb(guide) {
  if (!guide) return [];
  return [
    { name: 'Accueil', path: '/' },
    { name: 'Prix', path: '/prix' },
    { name: guide.h1, path: `/prix/${guide.slug}` },
  ];
}

/**
 * Les 8 guides a mettre en avant sur l'accueil.
 * Les trois premiers sont ceux qui totalisent le plus d'impressions dans GSC ;
 * les suivants correspondent aux modeles recherches sans guide avant ce lot.
 */
export const TOP_PRIX_GUIDE_SLUGS = [
  'iphone-13-prix-dakar',
  'iphone-xr-prix-dakar',
  'iphone-12-prix-dakar',
  'iphone-11-prix-dakar',
  'iphone-15-prix-dakar',
  'iphone-15-pro-prix-dakar',
  'iphone-16-prix-dakar',
  'iphone-12-mini-prix-dakar',
];