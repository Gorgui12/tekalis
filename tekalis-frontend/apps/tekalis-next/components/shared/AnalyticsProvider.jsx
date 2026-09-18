"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import ConsentBanner from "./ConsentBanner";
import {
  initAnalytics,
  trackPageView,
  trackPageVisit,
  getConsent,
  CONSENT,
} from "@/lib/analytics";

const CONSENT_EVENT = "tekalis:consent-changed";

/**
 * AnalyticsProvider — charge les trackers admissibles au montage
 * (selon le consentement déjà stocké) et déclenche les PageView SPA
 * à chaque changement de route. Rend aussi la bannière de consentement.
 *
 * Flux :
 *   1. au montage : ensureConfig() (IDs depuis settings/public) puis
 *      chargement des scripts si consentement déjà accordé, puis une
 *      seule page_view pour la route initiale ;
 *   2. à chaque changement de route : trackPageView() + trackPageVisit()
 *      (comptage des sessions pour l'admin analytics) ;
 *   3. Vercel Analytics (<Analytics/>) n'est monté qu'après acceptation.
 */
const AnalyticsProvider = ({ children }) => {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState(CONSENT.PENDING);

  useEffect(() => {
    setConsent(getConsent());
    const onConsent = () => setConsent(getConsent());
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initAnalytics();
      if (!cancelled) {
        trackPageView();
        trackPageVisit();
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    trackPageView();
    trackPageVisit();
  }, [pathname, ready]);

  const analyticsGranted = consent === CONSENT.ACCEPTED;

  return (
    <>
      {analyticsGranted && <Analytics />}
      {children}
      <ConsentBanner />
    </>
  );
};

export default AnalyticsProvider;