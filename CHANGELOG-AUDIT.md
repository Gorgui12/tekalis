# Changelog — corrections appliquées suite à l'audit du 3 septembre 2026

Ce dossier contient les 3 apps qui comptent (`tekalis-backend`, `tekalis-frontend/apps/admin`,
`tekalis-frontend/apps/tekalis-next`) avec les correctifs de l'audit **déjà appliqués dans le
code**. `node_modules` et `.git` ne sont pas inclus — faites `npm install` dans chaque app avant
de démarrer.

L'app legacy `tekalis-frontend/apps/client` n'est pas incluse ici (hors périmètre demandé).
`tekalis-frontend/packages/shared` est inclus car `admin` en dépend.

---

## ✅ Corrigé et vérifié

### `tekalis-backend`
- **Lockfile nettoyé** : la dépendance native `bcrypt` (fantôme, non utilisée dans le code —
  seul `bcryptjs` l'est) a été retirée. Elle apportait à elle seule 3 CVE critiques + 12 élevées
  via `@mapbox/node-pre-gyp` → `tar`. `npm audit` : **21 vulnérabilités (3 critiques) → 11 (2
  critiques)** après régénération propre du lockfile.
- **Code mort supprimé** : `controllers/dashboardController.js`, `utils/sendEmail.js`,
  `config/redis.js`, `middlewares/cache.js` (doublons non utilisés ou dépendant d'un paquet
  `redis` jamais installé).
- **Dépendances inutilisées retirées** de `package.json` : `body-parser` (redondant avec
  `express.json()`), `moment-timezone`, `node-cron`.
- **Injection regex corrigée** (`utils/regexEscape.js`, nouveau fichier) : les entrées de
  recherche utilisateur étaient injectées telles quelles dans `$regex` Mongo dans
  `controllers/productController.js`, `controllers/orderController.js` et
  `routes/adminRoutes.js`. Un attaquant pouvait envoyer un motif regex coûteux (ReDoS). Toutes
  les recherches passent maintenant par `escapeRegex()`.
- **`server.js` allégé de 660 → ~200 lignes** : tout le routeur admin (catégories, settings,
  codes promo, utilisateurs, produits, commandes, articles, reviews, RMA) a été extrait vers
  `routes/adminRoutes.js`.
- **Assignation de masse corrigée** sur les routes catégories/settings/codes promo : elles
  passaient `req.body` directement à Mongoose (`Category.create(req.body)`). Elles passent
  maintenant par une liste blanche de champs (`pickFields()` dans `adminRoutes.js`).
- **Doublon `/users` (admin) supprimé** : `routes/userRoutes.js` avait un jeu complet de routes
  admin (`GET /`, `GET/PUT/DELETE /:id`, `/analytics/overview`) strictement dupliqué avec
  `/admin/users/*`. Vérifié par grep que l'app admin n'appelle **jamais** `/api/v1/users` en mode
  liste/détail admin (uniquement `/admin/users/*`) — routes supprimées sans risque. Ne reste dans
  `userRoutes.js` que le libre-service (`/me`, `/me/password`, `/me/stats`, `/me/addresses`).
  `/admin/users/*` dans `adminRoutes.js` est désormais l'unique implémentation.
- **`errorHandler.js` réellement monté** à la place du handler dupliqué inline dans `server.js`.
- **Cookie httpOnly ajouté** (`controllers/authController.js`) : en plus du JWT renvoyé en JSON
  (conservé pour compatibilité avec `admin`/`client` qui le stockent en `localStorage`), un
  cookie `tekalis_token` httpOnly/secure/sameSite=lax est déposé au login/register/reset. C'est
  ce cookie que le nouveau middleware de `tekalis-next` vérifie (voir plus bas). Route
  `POST /api/v1/auth/logout` ajoutée pour l'effacer côté serveur.

### `tekalis-frontend/apps/tekalis-next`
- **`middleware.js` implémenté pour de vrai** : avant, il déclarait un `matcher` sur
  `/dashboard`, `/checkout`, `/wishlist` mais ne vérifiait rien (`return NextResponse.next()`
  inconditionnel). Il vérifie maintenant la présence du cookie `tekalis_token` et redirige vers
  `/login?redirect=...` si absent — première vraie protection serveur sur ces routes.
- **XSS stockée corrigée** : `article.content` était injecté sans sanitisation via
  `dangerouslySetInnerHTML` dans `components/blog/ArticleDetailClient.jsx`. Ajout de
  `lib/sanitizeHtml.js` (DOMPurify, liste blanche de balises/attributs) et application avant
  rendu. Les deux seuls autres usages de `dangerouslySetInnerHTML` du projet (Footer, StructuredData)
  ont été vérifiés : ils ne rendent que du JSON-LD statique, sans contenu utilisateur — non concernés.
- **Bug corrigé dans `LoginClient.jsx`** : `const from = "/dashboard" || "/"` ne lisait jamais de
  redirection réelle (le `||` était sans effet, valeur figée). Lit maintenant `?redirect=` posé
  par le middleware via `useSearchParams()`. `app/login/page.jsx` recréé avec un `<Suspense>`
  autour (requis par Next.js dès qu'un composant utilise `useSearchParams`).
- **`npm audit`** : 10 vulnérabilités (1 modérée, 9 élevées) → **2** après `npm audit fix`
  (résolu : `sharp`). Les 2 restantes concernent `postcss` **embarqué dans Next.js lui-même** —
  correctible uniquement par un saut vers Next 16 (changement majeur, volontairement pas fait
  dans cette passe, voir section "Non corrigé" ci-dessous).

### `tekalis-frontend/apps/admin`
- **Alias Vite cassé corrigé** (`vite.config.js`) : `@shared` pointait vers
  `packages/shared/src`, dossier qui n'existe pas (les fichiers sont directement à la racine de
  `packages/shared/`). Vérifié par grep qu'il n'est utilisé nulle part dans `apps/admin/src`
  aujourd'hui — corrigé quand même pour ne pas casser silencieusement une future utilisation.
- **`npm audit`** : 14 vulnérabilités → **1** après `npm audit fix` (résolu : tout sauf `xlsx`,
  qui n'a pas de correctif upstream — voir "Non corrigé").
- **Garde-fou ajouté** sur l'import Excel (`src/pages/AddProduct.jsx`) : limite de 5 Mo sur le
  fichier accepté avant parsing par `xlsx`, pour réduire la surface d'un fichier piégé en
  attendant une éventuelle migration de librairie (voir ci-dessous).

---

## ⚠️ Identifié mais volontairement non corrigé (risque de casse > bénéfice immédiat)

Ces points ont été laissés tels quels parce que les corriger automatiquement aurait nécessité un
changement majeur (montée de version breaking, remplacement de librairie) sans pouvoir tester le
résultat en conditions réelles sur votre infrastructure (paiement, emails, build). Les forcer à
l'aveugle aurait pu casser des fonctionnalités qui marchent aujourd'hui.

| Élément | Pourquoi non corrigé | Action recommandée |
|---|---|---|
| `nodemailer` (backend) | Les CVE ne sont corrigées qu'en v9.x, montée majeure depuis v6.10 (API callback retirée). | Prévoir une session dédiée : migrer `services/emailService.js` vers l'API v9, tester l'envoi réel (register, reset password, confirmation commande) avant de déployer. |
| `qs` via `paydunya`→`superagent` (backend) | `npm audit fix --force` propose de rétrograder `paydunya` vers `1.0.0` — risque direct sur le module de paiement en production. | Ne pas toucher sans tester un paiement PayDunya complet en sandbox après la modification. |
| `postcss` (tekalis-next) | Vulnérabilité interne à Next.js 15.3.3 lui-même ; le correctif implique Next 16 (breaking). | Planifier la montée vers Next 16 comme un chantier à part, avec tests de non-régression sur toute l'app. |
| `xlsx` / SheetJS (admin) | Pas de correctif upstream disponible pour ces 2 CVE (ReDoS + prototype pollution). | Migrer `src/pages/AddProduct.jsx` vers `exceljs` (maintenu activement) — nécessite de réécrire les ~30 lignes qui utilisent l'API `XLSX.*`. |

## 🔧 Signalé dans l'audit mais non traité dans cette passe (dette structurelle)

- Duplication de code entre `packages/shared/` et les copies locales de `tekalis-next`
  (`store/`, `lib/hooks/`, `lib/api.jsx`) : non fusionné, risque de dérive silencieuse toujours
  présent. Décision à prendre : faire consommer `packages/shared` par `tekalis-next`, ou assumer
  la duplication et le documenter clairement.
- Pas de transaction Mongo sur commande + décrément de stock (`orderController.js`).
- Aucun test automatisé sur les 3 apps.
- URLs produits basées sur l'`_id` Mongo plutôt qu'un slug.
- Endpoint `/admin/analytics` est un stub qui renvoie des données vides.

---

## Comment démarrer après extraction de l'archive

```bash
# Backend
cd tekalis-backend && npm install && cp .env.example .env   # puis renseigner .env
npm start

# Admin (Vite)
cd tekalis-frontend/apps/admin && npm install && npm run dev

# tekalis-next
cd tekalis-frontend/apps/tekalis-next && npm install && npm run dev
```
