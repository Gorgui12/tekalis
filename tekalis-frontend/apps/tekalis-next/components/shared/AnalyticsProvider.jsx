"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ConsentBanner from "./ConsentBanner";
import { initAnalytics, trackPageView, trackPageVisit } from "@/lib/analytics";

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
 *      (comptage des sessions pour l'admin analytics).
 */
const AnalyticsProvider = ({ children }) => {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

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

  return (
    <>
      {children}
      <ConsentBanner />
    </>
  );
};

export default AnalyticsProvider;