# SOLAR_CONTENT_BACKLOG.md
# Backlog d'optimisation sémantique solaire (prochaine passe)

## Requêtes ciblées (longue traîne)

- kit solaire senegal (intent: transactionnel/info)
- kit solaire dakar
- prix kit solaire senegal
- panneau solaire dakar
- batterie solaire prix senegal
- onduleur solaire dakar
- calculateur panneau solaire
- kit solaire maison
- kit solaire 1000w prix
- solution coupure courant senelec

## Pages déjà couvertes

- `/configurateur-solaire` : outil dimensionnement (intent calculatrice).
- `/kit-solaire/[slug]` : 12 presets (1000W, 2000W, 3000W, 5000W, foyer, boutique, atelier, climatisation, securite, bureau, pompe-eau, coupures).
- `/outils/calculateur-consommation-electrique`, `.../calculateur-batterie-solaire`, `.../calculateur-panneaux-solaires` : 3 calculatrices.
- `/blog/dimensionner-kit-solaire-senegal`, `.../batterie-gel-ou-lithium`, `.../onduleur-hybride-ou-off-grid` : 3 guides.

## À faire (priorité)

1. Garde-fous produits solaires actifs sur `app/products/[id]` : si produit `solar.role`, ajouter bloc « Besoin d'un kit ? » + lien configurateur.
2. Maillage `app/category/[slug]` : bloc solaire sur les catégories énergie.
3. Hub « Solaire » sur `app/solar/page.jsx` ? (à décider — amplitude faible pour l'instant).
4. Comparer les revenus OG `api/og` une fois en prod ; désactiver si non exploitables.

## Hors périmètre (mission)

- Backend articles blog : les guides sont des pages statiques (segment statique > `[slug]`), pas d'articles API créés.