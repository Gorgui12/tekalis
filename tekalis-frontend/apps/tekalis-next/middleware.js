import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo/config";

// ===============================================
// middleware.js — 2026-10-18
//
// Deux responsabilites independantes, regroupees ici parce que le middleware
// est le seul point qui s'execute avant le rendu de *toutes* les routes :
//
// 1. GARDE-FOU DE DOMAINE (SEO)
//    Le site canonique est `https://tekalis.com` (sans www). La plateforme
//    Vercel redirige deja `www.tekalis.com` en 308, mais les URLs de preview
//    (`*.vercel.app`) continuent de servir le site en 200 : autant de contenus
//    dupliques indexables. Ce middleware :
//      - renvoie un 308 vers l'apex si l'hote est `www.<canonique>` (filet de
//        securite si la redirection de la plateforme etait contournee) ;
//      - pose `X-Robots-Tag: noindex, nofollow` sur tout autre hote non
//        canonique (`*.vercel.app` et domaines de preview), pour ne jamais les
//        faire indexer.
//    Les hotes de developpement locaux (localhost, 127.0.0.1, *.local) ne sont
//    jamais touches.
//
// 2. PROTECTION DES ROUTES PRIVEES (securite)
//    Avant la version du 2026-09-03, ce fichier declarait un `matcher` sur les
//    routes sensibles mais ne verifiait rien (audit-tekalis.md, section 3.2,
//    point 1) : la protection reposait entierement sur un controle cote client,
//    qui pouvait laisser passer une reponse initiale non protegee.
//
//    Le backend (controllers/authController.js) depose un cookie httpOnly nomme
//    "tekalis_token" en plus du JWT renvoye en JSON. C'est ce cookie — inaccessible
//    en JS, donc plus robuste que le token en localStorage — que ce middleware
//    verifie avant de laisser passer une requete vers une route protegee.
//
//    Ce controle reste volontairement simple (presence du cookie, pas de
//    verification de signature ici) : c'est un filtre de premier niveau qui evite
//    de servir la coquille de la page a un visiteur non connecte. L'API backend
//    continue de verifier le JWT en profondeur sur chaque appel
//    (middlewares/authMiddleware.js), ce qui reste la vraie barriere de securite.
//
// /login et /register ne sont pas proteges : une redirection d'un utilisateur
// DEJA connecte necessiterait une logique inverse, non traitee ici pour rester
// sur un changement cible et verifiable.
// ===============================================

const COOKIE_NAME = "tekalis_token";

// Hote canonique, sans protocole, port ni slash (ex. "tekalis.com").
const CANONICAL_HOST = new URL(SITE_URL).hostname;

// Routes qui exigent une session (cookie httpOnly `tekalis_token`).
const PROTECTED_PREFIXES = ["/dashboard", "/checkout", "/wishlist"];

function isProtected(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isLocalHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local")
  );
}

export function middleware(request) {
  // L'hote reel de la requete HTTP, sans port (ex. "tekalis.vercel.app").
  // On lit l'entete `Host` plutot que `request.nextUrl.hostname` : quand le
  // serveur est lie a `localhost`, Next reconstruit `nextUrl` sur cet hote et
  // ignore l'entete `Host` recue (protection anti-spoofing). L'entete, lui,
  // reflete toujours le domaine demande — donc le domaine reellement indexe.
  const hostHeader = request.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // 1. Garde-fou de domaine.
  if (hostname !== CANONICAL_HOST && !isLocalHost(hostname)) {
    if (hostname === `www.${CANONICAL_HOST}`) {
      const target = new URL(`${pathname}${request.nextUrl.search}`, SITE_URL);
      return NextResponse.redirect(target, 308);
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // 2. Protection des routes privees.
  if (isProtected(pathname)) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * On laisse le middleware s'executer sur toutes les pages (il doit pouvoir
   * poser X-Robots-Tag sur n'importe quelle route d'un hote non canonique),
   * mais pas sur les assets, l'API et les fichiers a extension. Pattern repris
   * de la documentation Next.js : le `.*\\.[^/]+$` exclut robots.txt,
   * sitemap.xml, favicon.ico, /_next/static/*, /og-image.png, etc.
   */
  matcher: [
    "/((?!api/|_next/static|_next/image|.*\\.[^/]+$).*)",
  ],
};
