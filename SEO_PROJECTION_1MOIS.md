## Resultats attendus dans ~1 mois (honnetement)

Sur la base de ta baseline GSC :
- 43 clics / 2453 impressions / CTR 1,75% / position moyenne ~7,7
- ~67% impressions smartphones à ~pos6,5

Avec les corrections appliquees (HTML SSR presente, 404/308 reels, titres + contenu categorie + JSON-LD propre) :

| KPI | Attendu +1 mois | Justification |
|---|---|---|
| Position moyenne | ~7,0 → 7,2 (amélioration modeste) | Les 308 redirigent les URLs indexees (slug numerique) vers le bon slug. Google doit re-evaluer. Pas instantane. |
| % impressions Top 3 | +5–15 pts (progressif) | Meilleur distinctif (titres avec prix quand pertinent), contenu serveur visible, moins de soft-404. Effet lent sur requetes existantes. |
| CTR | Stable ou +0,1–0,3 pts | Conforme au cadrage (CTR depend de la position). A pos6–7, gain faible. |
| Clics | +10–40% max (très hypothétique) | **Jamais chiffre precis.** Dependent du crawl, de la bascule Next.js en prod ET de la competition. |

Facteurs limitants : la production doit servir Next.js (pas Vite). Les 308 sont permanents (bon signe) mais la recrawl prend du temps (1–4 semaines). Sur des positions 5–8, grimper vers top 3 est progressif, rarement explosif en 30 jours.

Conclusion honnête : amélioration des positions (mesurable), clics qui suivent lentement. **Ne pas promettre de clics chiffrés**. Attends +4 semaines pour première mesure fiable, +8 pour tendance solide.
