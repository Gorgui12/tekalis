import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSEO = ({
  title,
  description,
  image,
  keywords = [],
  type = "website",
  price,
  currency = "XOF",
  availability,
  canonical
}) => {
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_CLIENT_URL || "https://tekalis.com";
  const currentUrl = canonical || `${baseUrl}${location.pathname}`;
  const fullTitle = title ? `${title} | Tekalis` : "Tekalis - Boutique Tech";
  const defaultImage = `${baseUrl}/og-default.jpg`;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('name', 'description', description);
    if (keywords.length > 0) setMeta('name', 'keywords', keywords.join(', '));
    setLink('canonical', currentUrl);
    
    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image || defaultImage);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', type);
    
    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image || defaultImage);
    
    if (type === 'product' && price) {
      setMeta('property', 'product:price:amount', price);
      setMeta('property', 'product:price:currency', currency);
    }
  }, [fullTitle, description, image, currentUrl, type, price]);
};

function setMeta(attr, key, value) {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}