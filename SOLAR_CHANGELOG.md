# SOLAR_CHANGELOG.md
# Changelog des phases (mission feat/solar-configurator)

## Phases originales (audit — stubs, remplacées par la suite)

- Phase 0 (4dfa2ed): Audit catalogue, specs, composants réutilisables, analytics. SOLAR_AUDIT.md créé.
- Phase 1 (58a05c8) → corrigée par 584debe (ci-dessous).
- Phase 2 (120785f) → corrigée par 97e824f (ci-dessous).
- Phase 3 (8c5785d) → corrigée par e753450 (ci-dessous).
- Phase 4 (3cdc5dc) → corrigée par 11419ff (ci-dessous).
- Phase 5 (324912e) → corrigée par 1c324c8 (ci-dessous).
- Phase 6 (8f000b3) → corrigée par 0d52a7c (ci-dessous).

## Phases réellement implémentées (1 commit = 1 phase)

- Phase backend (274ea42): schéma produit `solar` additif + whitelist productController.
- Phase 1 (584debe): `solar-extract.mjs` chemin corrigé, `scripts/solar-apply.mjs` réel (dry-run par défaut, `--apply` + `--api`), 16 slugs annotés dans `data/solar-overrides.json`.
- Phase 2 (97e824f): moteur réel `lib/solar/matching.js` (`buildNeed`, `tierNeed`, `findMatchingKits`, 3 niveaux × 3 profils, compatibilité tension/stock), `catalog.js`, 14 tests (20/20).
- Phase 3 (e753450): `SolarConfigurator.jsx` 4 étapes (Appareils/Contraintes/Résultats/Devis), état URL + brouillon localStorage, presets foyer/boutique/atelier, WhatsApp prérempli, ajout panier, impression, PSH_BY_REGION.
- Phase 4 (11419ff): 12 pages `kit-solaire/[slug]` (generateStaticParams, contenu réel, noindex <2 produits), 3 outils via `ToolCalculator.jsx`, 3 guides blog statiques, sitemap, redirect 308 `/configurator`, maillage footer/home/blog/page accueil, OG dynamique `/api/og`.
- Phase 5 (1c324c8): `lib/solar/tracking.js` délègue à `lib/analytics.js` (consentement GA4+Meta+CAPI) ; événements `solar_start`, `solar_step_complete`, `solar_tier_select`, `solar_quote_whatsapp`, `solar_add_to_cart`, `solar_complete` branchés dans le configurateur.
- Phase 6 (0d52a7c): `scripts/solar-check.mjs` réel (19 URLs, sitemap, 308 `/configurator`, 404 slugs inconnus, title ≤65/description ≤160, H1 unique, JSON-LD, mention indicative). H1 + avertissement rendus côté serveur sur le configurateur.

## Résultats de vérification (Phase 6)

- `node --test "lib/solar/__tests__/*.mjs"` → 20/20 (warning MODULE_TYPELESS_PACKAGE_JSON inoffensif).
- `npm run build` → vert (avertissement ESLint lié à l'environnement, non solaire).
- `node scripts/solar-check.mjs` → 19/19 conformes, 0 erreur, 0 avertissement.