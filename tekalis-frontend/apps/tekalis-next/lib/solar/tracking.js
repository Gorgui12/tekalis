export const trackEvent = (name, params = {}) => {
  if (typeof window === 'undefined') return;
  try {
    if (window.dataLayer) window.dataLayer.push({ event: name, ...params });
    if (window.gtag) window.gtag('event', name, params);
  } catch (e) {}
};
