"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ConsentBanner from "./ConsentBanner";
import { initAnalytics, trackPageView } from "@/lib/analytics";

/**
 * AnalyticsProvider — charge les trackers admissibles au montage
 * (selon le consentement déjà stocké) et déclenche les PageView SPA
 * à chaque changement de route. Rend aussi la bannière de consentement.
 */
const AnalyticsProvider = ({ children }) => {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return (
    <>
      {children}
      <ConsentBanner />
    </>
  );
};

export default AnalyticsProvider;