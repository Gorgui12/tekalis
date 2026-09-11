import DOMPurify from "isomorphic-dompurify";

// ===============================================
// lib/sanitizeHtml.js — 2026-09-03
// Le contenu des articles de blog est écrit en HTML riche depuis le
// back-office et rendu tel quel côté public via dangerouslySetInnerHTML
// (voir components/blog/ArticleDetailClient.jsx). Ni le backend ni le
// frontend ne le sanitisaient auparavant (voir audit-tekalis.md,
// section 3.2 point 3) : si un compte admin est un jour compromis, ou
// si un rôle "éditeur" moins privilégié est ajouté plus tard, c'est une
// XSS stockée directe — combinée au JWT en localStorage, un vol de
// session est possible.
//
// Cette fonction est le seul point d'entrée pour du HTML de confiance
// partielle dans l'app : tout __html doit passer par ici.
// ===============================================

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "img", "blockquote", "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
  // Structure éditoriale
  "section", "div", "span", "hr",
  // Texte enrichi
  "mark", "small", "sup", "sub", "abbr", "cite", "q",
  // Média / illustration
  "figure", "figcaption",
  // Listes de description
  "dl", "dt", "dd"
];

const ALLOWED_ATTR = [
  "href", "src", "alt", "title", "target", "rel", "class",
  "id", "width", "height", "loading"
];

export function sanitizeArticleHtml(html) {
  if (!html || typeof html !== "string") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Empêche javascript:, data: etc. dans href/src
    ALLOW_UNKNOWN_PROTOCOLS: false
  });
}
