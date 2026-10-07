/**
 * lib/solar/presets.js
 * Pages besoin /kit-solaire/[slug] (Phase 4).
 * Chaque preset = cas d'usage reel (appareils de lib/solar/appliances.js),
 * pas un prix : les prix/stocks viennent uniquement du catalogue API via
 * lib/solar/matching.js. Aucune donnee technique inventee ici.
 */

export function buildKitPresets() {
  return [
    {
      slug: 'kit-solaire-1000w',
      label: 'Kit solaire 1000W',
      title: 'Kit solaire 1000W au Sénégal',
      intro: "Eclairage, TV, décodeur et routeur : le kit 1000W couvre l'essentiel d'un foyer ou d'une chambre, avec ou sans coupure d'électricité.",
      mode: 'secours',
      outage: 4,
      autonomy: 1,
      items: [
        { id: 'led', qty: 5, hours: 5 },
        { id: 'tv_led', qty: 1, hours: 4 },
        { id: 'decoder', qty: 1, hours: 4 },
        { id: 'router', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Que peut-alimenter un kit solaire 1000W ?', a: 'Des ampoules LED, une TV, un décodeur et un routeur WiFi. Les appareils de forte puissance (climatiseur, machine à laver) nécessitent un kit supérieur.' },
        { q: 'Autonomie d une batterie 100Ah pour ce kit ?', a: 'Le dimensionnement exact dépend du nombre d appareils et des heures d utilisation : le configurateur calcule la capacité en Wh nécessaire pour votre liste.' },
      ],
    },
    {
      slug: 'kit-solaire-2000w',
      label: 'Kit solaire 2000W',
      title: 'Kit solaire 2000W au Sénégal',
      intro: "Le kit 2000W ajoute le réfrigérateur au foyer complet : éclairage, ventilation, TV et conservation des aliments.",
      mode: 'secours',
      outage: 4,
      autonomy: 1,
      items: [
        { id: 'led', qty: 8, hours: 5 },
        { id: 'fan', qty: 2, hours: 6 },
        { id: 'tv_led', qty: 1, hours: 4 },
        { id: 'decoder', qty: 1, hours: 4 },
        { id: 'fridge', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Un kit solaire 2000W fait-il tourner un frigo ?', a: 'Oui, dans la majorité des cas : le réfrigérateur tourne par intermittence (duty 40 %), ce qui est pris en compte dans le calcul d énergie journalière.' },
        { q: 'Faut-il des panneaux supplémentaires en saison des pluies ?', a: 'Le dimensionnement prudent utilise 5 h de plein soleil (valeur pluie/orage). Avec la valeur été (6 h et plus), la production est supérieure à l estimation.' },
      ],
    },
    {
      slug: 'kit-solaire-3000w',
      label: 'Kit solaire 3000W',
      title: 'Kit solaire 3000W au Sénégal',
      intro: "Foyer complet avec congélateur : le kit 3000W couvre l'éclairage, la ventilation, la TV, le froid et les prises de courant.",
      mode: 'autonome',
      autonomy: 1,
      items: [
        { id: 'led', qty: 10, hours: 5 },
        { id: 'fan', qty: 3, hours: 6 },
        { id: 'tv_led', qty: 2, hours: 4 },
        { id: 'decoder', qty: 1, hours: 4 },
        { id: 'router', qty: 1, hours: 24 },
        { id: 'fridge', qty: 1, hours: 24 },
        { id: 'freezer', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Peut-on vivre hors réseau avec 3000W ?', a: 'Pour un foyer de quelques personnes qui respecte les heures d usage de chaque appareil, oui : le configurateur vérifie la couverture jour après jour.' },
        { q: 'Quelle différence entre onduleur hybride et convertisseur ?', a: "L'onduleur hybride gère la recharge des batteries et l'entrée panneaux (MPPT intégré) ; le convertisseur ne fait que 12V vers 220V et impose un régulateur séparé." },
      ],
    },
    {
      slug: 'kit-solaire-5000w',
      label: 'Kit solaire 5000W',
      title: 'Kit solaire 5000W au Sénégal',
      intro: "Le kit 5000W ajoute la pompe à eau au foyer complet : idéal maison individuelle ou petite boutique avec équipements multiples.",
      mode: 'autonome',
      autonomy: 1,
      items: [
        { id: 'led', qty: 12, hours: 5 },
        { id: 'fan', qty: 4, hours: 6 },
        { id: 'tv_led', qty: 2, hours: 4 },
        { id: 'decoder', qty: 1, hours: 4 },
        { id: 'router', qty: 1, hours: 24 },
        { id: 'fridge', qty: 1, hours: 24 },
        { id: 'water_pump', qty: 1, hours: 2 },
      ],
      faq: [
        { q: 'Une pompe à eau fonctionne-t-elle au solaire 5000W ?', a: 'Oui si le démarrage (pic 3× la puissance nominale) est couvert : le configurateur dimensionne l onduleur sur la puissance de pointe, pas seulement sur la puissance moyenne.' },
        { q: 'Combien de batteries pour 5000W ?', a: 'Le nombre dépend de l autonomie demandée : la capacité en Wh = énergie journalière × jours d autonomie ÷ (DoD × rendement onduleur).' },
      ],
    },
    {
      slug: 'kit-solaire-foyer',
      label: 'Kit solaire pour foyer',
      title: 'Kit solaire pour foyer au Sénégal',
      intro: "Éclairage, ventilation, TV, routeur et réfrigérateur : la configuration de base d'un foyer sénégalais, en secours comme en autonomie.",
      mode: 'secours',
      outage: 4,
      autonomy: 1,
      items: [
        { id: 'led', qty: 6, hours: 6 },
        { id: 'ceiling_fan', qty: 2, hours: 8 },
        { id: 'tv_led', qty: 1, hours: 5 },
        { id: 'decoder', qty: 1, hours: 5 },
        { id: 'router', qty: 1, hours: 24 },
        { id: 'fridge', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Quel kit solaire pour une maison à Dakar ?', a: 'Pour les coupures Senelec, le mode secours dimensionne sur les appareils essentiels et les heures de coupure (4 h par défaut).' },
        { q: 'Le solaire suffit-il pour la TV et le décodeur ?', a: 'Oui : une TV LED (70 W) et un décodeur (20 W) représentent environ 460 Wh par jour à eux deux.' },
      ],
    },
    {
      slug: 'kit-solaire-boutique',
      label: 'Kit solaire pour boutique',
      title: 'Kit solaire pour boutique au Sénégal',
      intro: "Éclairage, TV de vitrine, ventilation et routeur : l'autonomie d'une boutique ouverte 8 heures par jour.",
      mode: 'autonome',
      autonomy: 1,
      items: [
        { id: 'led', qty: 8, hours: 10 },
        { id: 'tv_led', qty: 1, hours: 8 },
        { id: 'decoder', qty: 1, hours: 8 },
        { id: 'fan', qty: 2, hours: 8 },
        { id: 'router', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Un kit solaire peut-il remplacer le groupe électrogène en boutique ?', a: 'Pour l éclairage, la TV et la ventilation, oui : le dimensionnement couvre la journée complète avec une autonomie d un jour.' },
        { q: 'Faut-il installer les panneaux sur le toit de la boutique ?', a: 'L orientation et l inclinaison influencent la production : le calcul utilise une valeur prudente de 5 h de plein soleil, à confirmer sur site.' },
      ],
    },
    {
      slug: 'kit-solaire-atelier',
      label: 'Kit solaire pour atelier',
      title: 'Kit solaire pour atelier au Sénégal',
      intro: "Machine à coudre, éclairage, ventilation et machines de bureau : l'alimentation d'un atelier de couture ou de réparation.",
      mode: 'autonome',
      autonomy: 1,
      items: [
        { id: 'led', qty: 6, hours: 8 },
        { id: 'sewing_machine', qty: 2, hours: 6 },
        { id: 'fan', qty: 2, hours: 8 },
        { id: 'printer', qty: 1, hours: 1 },
        { id: 'router', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'La machine à coudre fonctionne-t-elle au solaire ?', a: 'Oui : 100 W en fonctionnement, avec un facteur de démarrage de 1,5 pris en compte dans le calcul de pointe.' },
        { q: 'Quelle puissance pour un atelier ?', a: 'Entre 1000W et 3000W selon le nombre de machines : le configurateur chiffre votre liste exacte.' },
      ],
    },
    {
      slug: 'kit-solaire-climatisation',
      label: 'Kit solaire avec climatisation',
      title: 'Kit solaire avec climatisation au Sénégal',
      intro: "Climatiseur 1 CV, éclairage et ventilation : dimensionnement du pic de démarrage du compresseur inclus.",
      mode: 'autonome',
      autonomy: 1,
      items: [
        { id: 'ac_1cv', qty: 1, hours: 6 },
        { id: 'led', qty: 6, hours: 5 },
        { id: 'fan', qty: 1, hours: 4 },
        { id: 'tv_led', qty: 1, hours: 4 },
        { id: 'router', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Combien de watts pour climatiser au solaire ?', a: 'Un climatiseur 1 CV consomme environ 900 W, mais démarre à 2,5× sa puissance : l onduleur doit absorber ce pic (environ 2 250 W).' },
        { q: 'Le solaire couvre-t-il la climatisation la nuit ?', a: 'C est le cas le plus exigeant : batteries dimensionnées sur 6 h d usage et 1 jour d autonomie par défaut, ajustables dans le configurateur.' },
      ],
    },
    {
      slug: 'kit-solaire-securite',
      label: 'Kit solaire pour sécurité',
      title: 'Kit solaire pour caméras et sécurité au Sénégal',
      intro: "Caméras de surveillance, routeur 4G et éclairage : une installation qui tourne 24 h/24, même en coupure.",
      mode: 'secours',
      outage: 8,
      autonomy: 1,
      items: [
        { id: 'camera', qty: 4, hours: 24 },
        { id: 'router', qty: 1, hours: 24 },
        { id: 'led', qty: 4, hours: 4 },
        { id: 'phone_charger', qty: 2, hours: 3 },
      ],
      faq: [
        { q: 'Une caméra de surveillance fonctionne-t-elle 24h/24 au solaire ?', a: 'Oui : 15 W par caméra, soit 360 Wh/jour et par caméra, à intégrer dans la capacité batterie.' },
        { q: 'Quelle autonomie pour les caméras pendant une coupure ?', a: 'Le mode secours est réglé sur 8 h de coupure par jour par défaut, modifiable à l étape Contraintes.' },
      ],
    },
    {
      slug: 'kit-solaire-bureau',
      label: 'Kit solaire pour bureau',
      title: 'Kit solaire pour bureau au Sénégal',
      intro: "Ordinateur, imprimante, éclairage et internet : le bureau à télétrouver ou l agence de proximité, alimimenté en continu.",
      mode: 'autonome',
      autonomy: 1,
      items: [
        { id: 'pc', qty: 1, hours: 8 },
        { id: 'laptop', qty: 1, hours: 6 },
        { id: 'printer', qty: 1, hours: 1 },
        { id: 'led', qty: 4, hours: 8 },
        { id: 'router', qty: 1, hours: 24 },
        { id: 'camera', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Un ordinateur fixe fonctionne-t-il au solaire ?', a: 'Oui : 150 W en fonctionnement, soit environ 1 200 Wh pour 8 h d usage, à couvrir par les panneaux et les batteries.' },
        { q: 'Quel kit pour un bureau avec imprimante ?', a: 'La pointe de l imprimante (facteur 1,5) est intégrée au dimensionnement de l onduleur : entre 1000W et 3000W selon les autres équipements.' },
      ],
    },
    {
      slug: 'kit-solaire-pompe-eau',
      label: 'Kit solaire pour pompe à eau',
      title: 'Kit solaire pour pompe à eau au Sénégal',
      intro: "Pompe 750 W avec pic de démarrage 3×, éclairage et prises : l alimentation d une concession ou d une exploitation.",
      mode: 'autonome',
      autonomy: 1,
      items: [
        { id: 'water_pump', qty: 1, hours: 2 },
        { id: 'led', qty: 8, hours: 5 },
        { id: 'fan', qty: 2, hours: 6 },
        { id: 'fridge', qty: 1, hours: 24 },
        { id: 'router', qty: 1, hours: 24 },
      ],
      faq: [
        { q: 'Quel onduleur pour une pompe à eau de 750W ?', a: 'Le pic de démarrage atteint 2 250 W : l onduleur est dimensionné sur la pointe, pas sur les 750 W nominaux.' },
        { q: 'Le solaire suffit-il pour remplir une citerne ?', a: 'Oui pour 2 h de pompage par jour : l énergie journalière de la pompe reste faible comparée à un usage continu.' },
      ],
    },
    {
      slug: 'kit-solaire-coupures',
      label: 'Kit solaire anti-coupure',
      title: "Kit solaire anti-coupure Senelec au Sénégal",
      intro: "Le mode secours par défaut : 4 heures de coupure couvertes pour les appareils essentiels (éclairage, TV, froid, routeur).",
      mode: 'secours',
      outage: 4,
      autonomy: 1,
      items: [
        { id: 'led', qty: 6, hours: 4 },
        { id: 'tv_led', qty: 1, hours: 4 },
        { id: 'decoder', qty: 1, hours: 4 },
        { id: 'router', qty: 1, hours: 24 },
        { id: 'fridge', qty: 1, hours: 4 },
        { id: 'phone_charger', qty: 2, hours: 3 },
      ],
      faq: [
        { q: 'Combien coûte un kit anti-coupure ?', a: 'Le total dépend de votre liste d appareils : le configurateur affiche le prix des produits en stock, à confirmer par un technicien.' },
        { q: 'Que se passe-t-il si la coupure dure plus de 4 heures ?', a: 'La batterie se vide progressivement : augmentez les heures de coupure à l étape Contraintes pour voir l impact sur la capacité.' },
      ],
    },
  ];
}

/** Slugs des presets (generateStaticParams / sitemap). */
export function kitPresetSlugs() {
  return buildKitPresets().map((p) => p.slug);
}
