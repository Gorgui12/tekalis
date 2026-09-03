import { NextResponse } from "next/server";

// ===============================================
// middleware.js — 2026-09-03
// Avant cette version, ce fichier déclarait un `matcher` sur les routes
// sensibles mais ne vérifiait rien (voir audit-tekalis.md, section 3.2
// point 1) : la protection reposait entièrement sur un contrôle côté
// client, qui pouvait laisser passer une réponse initiale non protégée.
//
// Le backend (controllers/authController.js) dépose désormais un cookie
// httpOnly nommé "tekalis_token" en plus du JWT renvoyé en JSON. C'est ce
// cookie — inaccessible en JS, donc plus robuste que le token en
// localStorage — que ce middleware vérifie avant de laisser passer une
// requête vers une route protégée.
//
// Ce contrôle reste volontairement simple (présence du cookie, pas de
// vérification de signature ici) : c'est un filtre de premier niveau qui
// évite de servir la coquille de la page à un visiteur non connecté.
// L'API backend continue de vérifier le JWT en profondeur sur chaque
// appel (middlewares/authMiddleware.js), ce qui reste la vraie barrière
// de sécurité des données.
//
// /login et /register ne sont plus dans le matcher : les protéger
// aurait nécessité une logique inverse (rediriger un utilisateur DÉJÀ
// connecté loin de /login), que le middleware précédent ne faisait pas
// non plus. Ajouté comme piste d'amélioration future, pas traité ici
// pour rester sur un changement ciblé et vérifiable.
// ===============================================

const COOKIE_NAME = "tekalis_token";

export function middleware(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout",
    "/checkout/:path*",
    "/wishlist",
    "/wishlist/:path*"
  ]
};
