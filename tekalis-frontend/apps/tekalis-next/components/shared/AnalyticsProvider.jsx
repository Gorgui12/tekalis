"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
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
 *      (comptage des sessions pour l'admin analytics) ;
 *   3. Vercel Analytics (<Analytics/>) est monté SANS condition : il est
 *      cookieless et n'utilise aucun identifiant persistant, donc aucun
 *      consentement n'est requis. Le monter derrière le consentement
 *      biaisait le taux de rebond : Vercel ne mesurait que les visiteurs
 *      ayant accepté, et faisait démarrer leur « session » à l'acceptation
 *      (=> surpondération des sessions à une seule page).
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
      <Analytics />
      {children}
      <ConsentBanner />
    </>
  );
};

export default AnalyticsProvider;
