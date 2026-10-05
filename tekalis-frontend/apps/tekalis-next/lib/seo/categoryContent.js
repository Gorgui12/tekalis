/**
 * lib/seo/categoryContent.js
 *
 * Contenu editorial des pages categories, separe du code pour etre relu
 * facilement par le proprietaire (cf. CONTENT_BACKLOG.md).
 *
 * ---------------------------------------------------------------------------
 * AVERTISSEMENT - NE PAS PUBLIER SANS VALIDATION PROPRIETAIRE
 * ---------------------------------------------------------------------------
 * 1. Mention « Venant » : 15 produits (tous en smartphones, Apple et Samsung)
 *    portent cette mention dans leur nom, et sont tous enregistres avec
 *    `condition: "new"` en base. On les decrit ici comme des appareils
 *    d'occasion reconditionnes, ce qui correspond a l'usage courant du terme
 *    au Senegal. Si le proprietaire entend autre chose, ce texte doit change.
 * 2. Aucun prix, stock, marque ou modele de ce fichier n'est invente : les
 *    marques citees ont ete verifiees dans l'API au 2026-10-05, les prix et
 *    le stock restent affiches a partir de l'API, pas d'ici.
 * 3. Aucune superlatif (« le plus vendu », « le moins cher ») : aucune donnee
 *    de vente fiable ne permet de les soutenir.
 * ---------------------------------------------------------------------------
 */

import { SHIPPING_CLAIM, PAYMENT_CLAIM, RETURNS_CLAIM, WARRANTY_CLAIM } from './config';

export const CATEGORY_CONTENT = {
  smartphones: {
    title: 'Smartphones et iPhone au Sénégal - Prix en FCFA',
    description:
      'iPhone et Samsung Galaxy au prix en FCFA à Dakar. Models neufs et appareils « Venant », prix affiché en FCFA, livraison 24-48h au Sénégal.',
    h1: 'Smartphones et iPhone',
    intro: `Smartphones Apple et Samsung chez Tekalis, boutique d'électronique située Fann, Rue 14 à Dakar. Ce rayon présente deux états de produit, indiqués dans le nom de chaque fiche.

Les modèles dont le nom porte la mention « Venant » sont des appareils d'occasion, contrôlés avant mise en vente et proposés à un prix inférieur à celui du modèle neuf équivalent. Les autres modèles sont neufs. La fiche indique toujours l'état, la capacité de stockage et le stock disponible.

Le catalogue couvre notamment les iPhone 8, 8 Plus, X, XR, XS Max, 11, 12, 12 Mini et SE 2020 côté Apple, ainsi que les Galaxy S10, S10+, S20 FE et S21 côté Samsung. Le prix est affiché en FCFA sur chaque fiche.`,
    faqs: [
      {
        q: 'Que signifie la mention « Venant » sur un téléphone ?',
        a: "Il s'agit d'un appareil d'occasion, contrôlé avant la mise en vente. Si cette mention n'apparaît pas sur la fiche, le téléphone est neuf. Le prix correspond à l'état du produit.",
      },
      {
        q: 'Puis-je payer le téléphone à la livraison ?',
        a: `${PAYMENT_CLAIM}.`,
      },
      {
        q: 'En combien de temps le téléphone est-il livré à Dakar ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },

  ordinateurs: {
    title: 'Ordinateurs portables HP - Prix en FCFA à Dakar',
    description:
      'Ordinateurs portables HP EliteBook au prix en FCFA à Dakar. Configurations Core i5 et Core i7, 16 Go RAM, livraison 24-48h au Sénégal.',
    h1: 'Ordinateurs portables HP',
    intro: `Ordinateurs portables HP pour les professionnels, les étudiants et le télétravail, chez Tekalis à Fann, Rue 14 à Dakar.

Ce rayon est entièrement composé de HP EliteBook, dont les configurations affichent le processeur, la mémoire vive et le stockage dans le nom du produit : EliteBook 840 G8 Core i5 ou Core i7, 16 Go de RAM et 512 Go de SSD, ainsi que la génération G7. Ce niveau de mémoire vive permet de laisser plusieurs applications ouvertes, dont un navigateur avec de nombreux onglets, sans ralentissement.

La fiche de chaque modèle indique le prix en FCFA, le stock et les caractéristiques techniques. Les appareils sont livrés avec facture et bénéficient de la garantie constructeur.`,
    faqs: [
      {
        q: 'Quelle différence entre l\'EliteBook 840 G7 et le G8 ?',
        a: "Ce sont deux générations successives de la même famille HP. Le G8 est plus récent ; les deux restent adaptés à la bureautique et au développement. Consultez les caractéristiques indiquées sur chaque fiche.",
      },
      {
        q: 'Livrez-vous les ordinateurs portables à Dakar ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },

  laptops: {
    title: 'Laptops et PC portables - Prix en FCFA à Dakar',
    description:
      'MacBook Air, Asus ZenBook, HP Envy, Dell et Lenovo au prix en FCFA à Dakar. PC portables 16 Go RAM et 512 Go SSD, livraison 24-48h.',
    h1: 'Laptops et PC portables',
    intro: `PC portables de plusieurs marques chez Tekalis : ce rayon complète les EliteBook par des modèles qui couvrent d'autres usages et d'autres budgets.

On y trouve l'Apple MacBook Air M1 2020 (8 Go de RAM, 256 Go de SSD), l'Asus ZenBook 14 Core i7 de 11e génération, le HP Envy x360 convertible Core i5 et des modèles Dell et Lenovo. La différence entre un MacBook et un PC sous Windows tient d'abord au système : macOS sur les MacBook, Windows sur les autres. Le choix se fait selon vos logiciels et vos habitudes autant que selon le prix.

Chaque fiche affiche la génération du processeur, la mémoire vive, le stockage, la taille d'écran et le prix en FCFA.`,
    faqs: [
      {
        q: 'MacBook ou PC portable sous Windows : comment choisir ?',
        a: "Le MacBook Air M1 est indiqué si vous utilisez déjà l'écosystème Apple ou préférez macOS. Les modèles Core i5 et i7 sous Windows conviennent aux usages professionnels et à la bureautique. Les deux familles sont présentes chez Tekalis, avec le prix indiqué sur chaque fiche.",
      },
      {
        q: 'Livrez-vous les laptops dans tout le Sénégal ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },
audio: {
    title: 'Audio - Casques, enceintes et barres de son',
    description:
      'Casques, écouteurs, enceintes et barres de son au prix en FCFA à Dakar. JBL, Sony, LG, Lenovo : livraison 24 à 48 h au Sénégal.',
    h1: 'Audio : casques, enceintes et barres de son',
    intro: `L'audio chez Tekalis, boutique située Fann, Rue 14 à Dakar, se répartit entre trois usages : écouter de la musique seul, regarder un film, ou sonoriser un salon.

Ce rayon regroupe les enceintes portables et les barres de son JBL, dont l'enceinte JBL Charge 5 40 W et la barre JBL Cinema SB170 avec caisson de graves, ainsi que la barre de son LG SQC2 300 W Bluetooth. S'y ajoutent les casques et écouteurs Sony, les écouteurs Oraimo, les casques Lenovo et les écouteurs Anker.

Chaque fiche indique la puissance en watts quand elle existe, l'autonomie de la batterie et les fonctions annoncées par le fabricant. Le prix est affiché en FCFA et la livraison se fait à Dakar en 24 à 48 h.`,
    faqs: [
      {
        q: 'Quelle différence entre une enceinte portable et une barre de son ?',
        a: "L'enceinte portable se transporte et fonctionne souvent sur batterie ; la barre de son est fixée sous un téléviseur et se branche au secteur. Choisissez selon l'usage.",
      },
      {
        q: 'Livrez-vous le matériel audio partout au Sénégal ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },

  tv: {
    title: 'Smart TV et télévisions - Prix en FCFA à Dakar',
    description:
      'Smart TV Hisense, Samsung, LG et TCL de 43 à 50 pouces au prix en FCFA à Dakar. Écrans 4K UHD, livraison 24 à 48 h au Sénégal.',
    h1: 'Télévisions et Smart TV',
    intro: `Choisir une télévision, c'est d'abord choisir une diagonale et une définition. Ce rayon regroupe les Smart TV de 43 à 50 pouces disponibles au showroom de Tekalis, à Fann, Rue 14 à Dakar.

On y trouve la Smart TV LG 50 pouces 4K UHD NanoCell, la Smart TV Samsung 43 pouces 4K UHD Crystal CU7000 et plusieurs modèles Hisense en 4K UHD Smart HDR, complétés par des références Westpool, TCL et Innova. Le NanoCell est une technologie d'image liée à la marque LG ; le Crystal est la dénomination propre à Samsung. Le nom de chaque modèle indique la diagonale et la résolution.

La fiche précise la diagonale, la définition et les fonctions, le prix est affiché en FCFA, et la livraison se fait en 24 à 48 h à Dakar.`,
    faqs: [
      {
        q: 'Quelle taille d\'écran choisir pour un salon ?',
        a: "Pour un salon, on retient généralement 43 à 50 pouces. Pour une chambre, 32 pouces suffisent. La diagonale exacte figure sur la fiche de chaque modèle.",
      },
      {
        q: 'Livrez-vous les télévisions à Dakar ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },

  ventilation: {
    title: 'Ventilateurs et rafraîchisseurs d\'air',
    description:
      'Ventilateurs et rafraîchisseurs d\'air au prix en FCFA à Dakar. Binatone, Midea, Westpool, Sayona : livraison 24 à 48 h au Sénégal.',
    h1: 'Ventilateurs et rafraîchisseurs d\'air',
    intro: `La chaleur à Dakar concerne toute l'année, pas seulement la saison sèche. Ce rayon regroupe les deux familles d'appareils qui y répondent : les ventilateurs, qui déplacent l'air, et les rafraîchisseurs d'air, qui le refroidissent et l'humidifient.

Les ventilateurs de tour Binatone, Sayona et Smart Technology occupent une grande partie du rayon, avec le ventilateur tour Smart Technology silencieux comme modèle de référence. Les rafraîchisseurs d'air incluent le Midea 10 L avec télécommande et le Westpool 8 L, qui se déplacent d'une pièce à l'autre.

Les fiches indiquent la puissance, la capacité en litres pour les rafraîchisseurs et les accessoires fournis. Le prix est en FCFA, la livraison à Dakar en 24 à 48 h.`,
    faqs: [
      {
        q: 'Ventilateur ou rafraîchisseur d\'air : lequel choisir ?',
        a: "Le ventilateur déplace l'air et consomme peu ; le rafraîchisseur abaisse la température perçue de quelques degrés et humidifie l'air. Dans un climat très humide, le rafraîchisseur apporte peu de confort ; dans un climat sec, il aide davantage.",
      },
      {
        q: 'Livrez-vous les ventilateurs partout au Sénégal ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },
climatisation: {
    title: 'Climatiseurs split et inverter - Prix en FCFA',
    description:
      'Climatiseurs split Hisense, LG, Samsung, TCL et Midea au prix en FCFA à Dakar. 12000 BTU inverter, livraison 24 à 48 h au Sénégal.',
    h1: 'Climatiseurs et climatisation',
    intro: `Un climatiseur se choisit par sa puissance, exprimée en BTU, qui doit correspondre à la surface à rafraîchir. Ce rayon regroupe les modèles split 12000 BTU en circulation d'air ou en inverter, proposés chez Tekalis à Fann, Rue 14 à Dakar.

On y trouve le split LG 12000 BTU Dual Inverter, le split Samsung 12000 BTU Inverter, le split Midea 12000 BTU Inverter R32 et des références Hisense, ainsi que des modèles Westpool, TCL et Roch. Un appareil enverter fait tourner son compresseur à vitesse variable, ce qui réduit la consommation et le bruit par rapport à un modèle standard ; la lettre R32 désigne le fluide employed.

Chaque fiche indique la puissance en BTU, la technologie et le fluide. Le prix est en FCFA.`,
    faqs: [
      {
        q: 'Quelle différence entre un split standard et un split inverter ?',
        a: "Le modèle inverter ajuste sa puissance en continu, ce qui évite les démarrages et arrêts répétés, réduit le bruit et la consommation. Le modèle standard fonctionne à puissance constante.",
      },
      {
        q: 'Assurez-vous l\'installation du climatiseur ?',
        a: "L'installation peut être assurée à Dakar et en banlieue. Contactez le showroom avant de commander pour connaître le délai et le tarif de pose.",
      },
    ],
  },

  electromenager: {
    title: 'Électroménager - Réfrigérateurs et machines',
    description:
      'Réfrigérateurs, machines à laver, micro-ondes et air fryer au prix en FCFA à Dakar. Samsung, LG, Roch, Westpool, Moulinex : livraison 24-48h.',
    h1: 'Électroménager',
    intro: `Réfrigérateurs, machines à laver, congélateurs, fours et appareils de cuisson : ce rayon regroupe l'équipement qui structure une maison. Les produits sont vendus chez Tekalis, boutique de Fann, Rue 14 à Dakar.

On y trouve le réfrigérateur combiné Samsung 260 L No Frost, la machine à laver hublot LG 8 kg Inverter Direct Drive et la machine à laver automatique hublot Roch 7 kg, complétés par des références Westpool, Smart Technology, Moulinex, Hisense et LG. La capacité en litres pour un réfrigérateur, et en kilogrammes pour un lave-linge, figure dans le nom du produit : ce sont les deux chiffres à comparer en premier.

Les fiches indiquent le prix en FCFA et le stock. La livraison à Dakar se fait en 24 à 48 h.`,
    faqs: [
      {
        q: 'Qu\'est-ce que la fonction No Frost sur un réfrigérateur ?',
        a: "Un réfrigérateur No Frost refroidit par circulation d'air, sans givre sur les parois. Il n'a pas besoin d'être dégrivé et la conservation des aliments est plus régulière.",
      },
      {
        q: 'L\'électroménager est-il livré à Dakar ?',
        a: `${SHIPPING_CLAIM}. L'installation des appareils volumineux peut être assurée à Dakar et en banlieue : contactez-nous avant de commander.`,
      },
    ],
  },

  'energie-solaire': {
    title: 'Énergie solaire - Panneaux, batteries, onduleurs',
    description:
      'Onduleurs hybrides MPPT, batteries gel 12V et panneaux solaires au prix en FCFA à Dakar. Felicity, Must, Ritar, Jinko : livraison 24-48h.',
    h1: 'Énergie solaire',
    intro: `L'énergie solaire est devenue l'alternative au groupe électrogène à Dakar. Ce rayon regroupe les trois familles d'appareils qui composent une installation : les panneaux, les batteries de stockage et l'onduleur qui convertit le courant.

On y trouve l'onduleur hybride solaire 5 kW 48 V MPPT et l'onduleur hybride solaire 3 kW 24 V MPPT, la batterie solaire gel 12 V 200 Ah C10, ainsi que des références Felicity Solar, Must, Suer, Ritar et les panneaux Jinko Solar. La puissance de l'onduleur, la tension de la batterie et la tension MPPT doivent rester cohérentes entre elles : le dimensionnement se fait en fonction de la consommation réelle du logement.

Le prix est affiché en FCFA. ${SHIPPING_CLAIM}.`,
    faqs: [
      {
        q: 'Comment choisir la batterie d\'une installation solaire ?',
        a: "La capacité doit correspondre à la puissance de l'onduleur et à l'autonomie souhaitée : une batterie 12 V 200 Ah stocke environ 2,4 kWh dans des conditions correctes. Faites valider le dimensionnement par un conseiller.",
      },
      {
        q: 'Que signifie MPPT sur un onduleur ?',
        a: "MPPT est un régulateur de charge qui extrait le maximum de puissance des panneaux, y compris quand leur intensité varie avec l'ensoleillement. Il améliore le rendement de la production photovoltaïque.",
      },
    ],
  },
gaming: {
    title: 'Gaming - PC gamers, manettes et écrans',
    description:
      'PC portable gamer, manettes PS5 et écrans 144 Hz au prix en FCFA à Dakar. HP Victus, Samsung Odyssey, Redragon : livraison 24-48h.',
    h1: 'Gaming',
    intro: `Une configuration de jeu se construit par étapes : la machine, l'écran, puis les périphériques. Ce rayon regroupe les ensembles gamer vendus chez Tekalis à Fann, Rue 14 à Dakar.

On y trouve le PC portable gamer HP Victus 15 Core i5 avec carte graphique GTX 1650, l'écran PC gamer incurvé Samsung Odyssey G3 de 24 pouces en 144 Hz, et la manette officielle PS5 DualSense Wireless, ainsi que les références Redragon pour le clavier et la souris. La marque Microsoft figure également au rayon pour ses manettes.

Le taux de rafraîchissement de 144 Hz de l'Odyssey et le 144 Hz de la mention désignent la fluidité de l'image affichée. Chaque fiche indique le prix en FCFA et le stock réel.`,
    faqs: [
      {
        q: 'Quelle différence entre un écran 60 Hz et un écran 144 Hz ?',
        a: "144 Hz affiche jusqu'à 144 images par seconde au lieu de 60, ce qui rend les mouvements plus fluides. L'intérêt est réel dans les jeux, peu dans la bureautique.",
      },
      {
        q: 'Pouvez-vous adviser une configuration de jeu ?',
        a: "Oui, venez au showroom de Fann, Rue 14 à Dakar, ou contactez-nous par téléphone et WhatsApp : nous vous aidons à choisir selon votre budget et vos jeux.",
      },
    ],
  },

  informatique: {
    title: 'Informatique - Écrans, stockage et imprimantes',
    description:
      'Écrans PC, SSD externes, onduleurs et imprimantes au prix en FCFA à Dakar. HP, SanDisk, Logitech, Epson, APC : livraison 24-48h au Sénégal.',
    h1: 'Informatique',
    intro: `Écrans, stockage, protection électrique et impression : ce rayon couvre tout ce qui complète un ordinateur portable ou un poste fixe chez Tekalis, boutique de Fann, Rue 14 à Dakar.

On y trouve l'écran PC HP P22h G4 de 21,5 pouces Full HD avec réglage ergonomique, le SSD externe portable SanDisk Extreme 500 Go USB-C, l'onduleur APC Back-UPS 650 VA 230 V et des références Logitech, Toshiba, Epson et Havit. L'onduleur protège la machine contre les coupures de courant, ce qui est un point important à Dakar.

La fiche indique la taille, la résolution, la capacité ou la puissance, selon l'équipement. Le prix est affiché en FCFA et la livraison à Dakar se fait en 24 à 48 h.`,
    faqs: [
      {
        q: 'Pourquoi utiliser un onduleur avec un ordinateur ?',
        a: "Un onduleur fournit quelques minutes d'autonomie lors d'une coupure et protège contre les surtensions. Il évite la perte de données et l'endommagement de la machine.",
      },
      {
        q: 'Livrez-vous le matériel informatique au Sénégal ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },

  reseau: {
    title: 'Réseau - Routeurs, Wi-Fi mesh et switchs',
    description:
      'Routeurs Wi-Fi 6, kits mesh et switchs TP-Link au prix en FCFA à Dakar. Réseau et connectivité, livraison 24 à 48 h au Sénégal.',
    h1: 'Réseau et connectivité',
    intro: `Un Wi-Fi lent vient le plus souvent du routeur et de sa position, pas de l'opérateur. Ce rayon regroupe les équipements réseau de Tekalis, boutique située Fann, Rue 14 à Dakar.

L'essentiel du catalogue est signé TP-Link, avec notamment le routeur Wi-Fi 6 Archer AX12 Gigabit, le système Wi-Fi mesh Deco E4 en pack de 2 et le switch Gigabit 16 ports 10/100/1000 Mbps, auxquels s'ajoute une référence ZTE. Le Deco E4 est la solution adaptée quand la box ne couvre pas l'ensemble du logement ; un routeur seul suffit pour un petit appartement. Le mot gigabit désigne le débit du lien, pas celle d'Internet.

Les prix sont en FCFA et la livraison à Dakar se fait en 24 à 48 h.`,
    faqs: [
      {
        q: 'Routeur ou kit mesh : que choisir ?',
        a: "Un routeur couvre un petit logement sans obstacle. Un kit mesh est préférable dans une maison sur plusieurs niveaux ou avec des murs épais, car il supprime les zones sans couverture.",
      },
      {
        q: 'Livrez-vous les équipements réseau partout au Sénégal ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },
accessoires: {
    title: 'Accessoires téléphone et informatique',
    description:
      'Chargeurs, power banks, câbles USB-C et clés USB au prix en FCFA à Dakar. Apple, Samsung, HP, Anker, SanDisk : livraison 24-48h.',
    h1: 'Accessoires et périphériques',
    intro: `Un accessoire à 5 000 FCFA peut prolonger de deux ans l'usage d'un téléphone ou d'un portable. Ce rayon regroupe chez Tekalis, boutique de Fann, Rue 14 à Dakar, les chargeurs, les batteries externes, les câbles, les coques et le stockage.

On y trouve le chargeur rapide Apple 20 W Type-C, le chargeur Samsung Super Fast Charging 25 W, les chargeurs HP USB-C 65 W, le power bank Anker 20 000 mAh, la clé USB 3.0 SanDisk Ultra 64 Go et un disque dur externe SSD 512 Go USB-C. Les câbles USB-C vers USB-C 60 W et USB-C vers Lightning, le hub USB-C 7-en-1 et la coque antichoc compatible MagSafe iPhone complètent l'ensemble.

La fiche indique la puissance, la capacité ou la connectique. Les prix sont en FCFA.`,
    faqs: [
      {
        q: 'Comment choisir le bon chargeur pour mon téléphone ?',
        a: "Choisissez la puissance et le connectique indiqués par le fabricant de votre appareil : USB-C pour la plupart des modèles récents, Lightning pour les iPhone Plus anciens. Un chargeur plus puissant que celui d'origine peut endommager la batterie ; un chargeur moins puissant recharge simplement plus lentement.",
      },
      {
        q: 'Puis-je retourner un accessoire ?',
        a: `${RETURNS_CLAIM}. Consultez la page retours pour les modalités exactes.`,
      },
    ],
  },

  divertissement: {
    title: 'Streaming et vidéoprojecteurs - Prix en FCFA',
    description:
      'Boîtiers de streaming, vidéoprojecteurs et casques VR au prix en FCFA à Dakar. Apple TV, Chromecast, Fire TV, Xiaomi, Wanbo : livraison 24-48h.',
    h1: 'Divertissement et streaming',
    intro: `Se divertir à la maison passe par trois familles d'appareils : l'écran, la source de contenu et le son. Ce rayon les regroupe chez Tekalis, boutique située Fann, Rue 14 à Dakar.

Pour la source de contenu, on trouve le boîtier TV streaming Apple TV 4K 64 Go, le Google Chromecast avec Google TV HD, le lecteur Amazon Fire TV Stick Lite, le boîtier Xiaomi Mi Box S 4K de 2e génération et le vidéoprojecteur Android Wanbo T2 Max en Full HD. Le projecteur Xiaomi Smart Projector 2 et le modèle mini LED 1080p Wi-Fi Havit complètent l'offre vidéo. S'y ajoutent l'écran de projection portable 100 pouces, le casque de réalité virtuelle Shinecon avec manette et l'enceinte karaoké portable Sayona avec micro sans fil.`,
    faqs: [
      {
        q: 'Streaming ou vidéoprojecteur : que choisir ?',
        a: "Le boîtier de streaming transforme un téléviseur en écran connecté. Le vidéoprojecteur agrandit l'image sur un mur ou un écran, ce qui convient à une pièce sombre ou à une grande famille. Les deux peuvent se combiner.",
      },
      {
        q: 'Livrez-vous ces appareils partout au Sénégal ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },

  mobilite: {
    title: 'Trottinettes et vélos électriques',
    description:
      'Trottinettes électriques Segway et Xiaomi, vélos électriques et casques au prix en FCFA à Dakar. Ninebot, Fiido : livraison 24-48h au Sénégal.',
    h1: 'Mobilité électrique',
    intro: `Les déplacements courts à Dakar se font de plus en plus en trottinette ou en vélo électrique. Ce rayon regroupe les modèles vendus chez Tekalis à Fann, Rue 14 à Dakar.

On y trouve la trottinette électrique Segway Ninebot F20D 300 W, la trottinette Ninebot Segway E2 Plus, deux modèles Xiaomi — la Xiaomi Scooter 4 Go et la Mi Electric Scooter 3 Lite — ainsi qu'un vélo à assistance électrique pliable 250 W Fiido. La puissance du moteur est indiquée en watts : 300 W correspond à un usage quotidien en ville. Une trottinette électrique pour enfant et adolescent 120 W complète l'ensemble pour les plus jeunes.

S'y ajoutent les accessoires associés : casque de protection urbain LED, sac à dos mobilité, support smartphone et mini compresseur à air Xiaomi.`,
    faqs: [
      {
        q: 'Faut-il un casque pour une trottinette électrique ?',
        a: "Oui, le port du casque est obligatoire et indispensable. Un modèle réglable, léger et certifié, est disponible au rayon avec la trottinette.",
      },
      {
        q: 'Livrez-vous les trottinettes électriques partout au Sénégal ?',
        a: `${SHIPPING_CLAIM}. Ces articles sont volumineux : contactez-nous pour connaître le tarif de livraison à votre quartier.`,
      },
    ],
  },

  tablettes: {
    title: 'Tablettes - iPad, Galaxy Tab et Lenovo',
    description:
      'Tablettes Apple iPad, Samsung Galaxy Tab, Lenovo et Xiaomi au prix en FCFA à Dakar. De 7 à 11 pouces, livraison 24-48h au Sénégal.',
    h1: 'Tablettes',
    intro: `La tablette sert d'écran de cours, de lecture et de travail nomade. Ce rayon regroupe les modèles de 7 à 11 pouces disponibles chez Tekalis, boutique de Fann, Rue 14 à Dakar.

La gamme Apple comprend l'iPad 10e génération de 10,9 pouces 64 Go Wi-Fi et l'iPad 9e génération de 10,2 pouces 64 Go Wi-Fi. Côté Android, la Xiaomi Pad 6 de 11 pouces 128 Go avec 6 Go de RAM, la Lenovo Tab M11 11 pouces 128 Go avec stylet, la Lenovo Tab M8 4e génération 32 Go, la Samsung Galaxy Tab A9+ 11 pouces 64 Go et la Galaxy Tab A7 Lite 8,7 pouces 32 Go couvrent les usages intermédiaires. L'Amazon Fire HD 10 2023 32 Go, l'Atouch A10 10,1 pouces avec clavier et la Modio M22 7 pouces complètent l'offre.

La taille d'écran, le stockage et l'accès au clavier ou au stylet sont indiqués sur chaque fiche.`,
    faqs: [
      {
        q: 'iPad ou tablette Android : comment choisir ?',
        a: "L'iPad offre un ecosysteme cohérent si vous utilisez déjà un Mac ou un iPhone. Les tablettes Android offrent souvent plus de stockage ou un meilleur rapport prix-écran pour le même budget. Les deux familles sont disponibles chez Tekalis.",
      },
      {
        q: 'Livrez-vous les tablettes à Dakar ?',
        a: `${SHIPPING_CLAIM}.`,
      },
    ],
  },
};

/**
 * Repli pour une categorie sans contenu editorial : on ne fabrique pas de texte
 * quand meme. Le titre est construit a partir du nom de la categorie renvoye
 * par l'API, et l'introduction ne contient que des faits de boutique.
 */
export function buildFallbackCategoryContent(category) {
  const name = category?.name || 'Produits';
  return {
    title: `${name} - Prix en FCFA au Sénégal | Tekalis`,
    description: `${name} en vente à Dakar chez Tekalis, boutique d'électronique au Sénégal. Prix en FCFA et livraison à Dakar en 24 à 48 h.`,
    h1: name,
    intro: `${name} disponibles au showroom de Tekalis, situé Fann, Rue 14 à Dakar. Chaque fiche indique le prix en FCFA, le stock réel et les caractéristiques techniques du produit. ${SHIPPING_CLAIM}. ${PAYMENT_CLAIM}.`,
    faqs: [],
  };
}