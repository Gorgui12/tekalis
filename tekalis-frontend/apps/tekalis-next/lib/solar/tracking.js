/**
 * lib/solar/tracking.js
 * Événements solaires — délègue à lib/analytics.js (GA4 + Meta + CAPI)
 * pour respecter le consentement et la déduplication browser/serveur.
 * Seul le préfixe `solar_` est ajouté ici.
 */
import { trackEvent as analyticsTrackEvent } from '@/lib/analytics';

export const SOLAR_EVENTS = {
  START: 'solar_start',
  STEP_COMPLETE: 'solar_step_complete',
  TIER_SELECT: 'solar_tier_select',
  QUOTE_WHATSAPP: 'solar_quote_whatsapp',
  ADD_TO_CART: 'solar_add_to_cart',
  COMPLETE: 'solar_complete',
};

export const trackSolarEvent = (name, params = {}) => {
  if (typeof window === 'undefined') return;
  try {
    analyticsTrackEvent(name, params);
  } catch {
    /* le tracking ne doit jamais casser l'UI */
  }
};
