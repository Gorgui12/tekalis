# SOLAR_DECISIONS.md
# Décisions techniques à valider par technicien

## Paramètres du moteur (`lib/solar/constants.js`) — à valider

- simultaneityFactor=0.7
- inverterOversize=1.25
- mpptSafetyFactor=1.25
- PR=0.75
- etaInv=0.90
- psfDefault=5.0 (prudence ; PVGIS suggère ~6.0 pour les villes sénégalaises)
- DOD: gel/AGM/lead-acid 0.5, lithium 0.8
- Seuils tension: <=1000VA→12V, <=3000VA→24V, >3000VA→48V
- comfortMargin=0.30 (niveau Confort) ; comfortAutonomyExtra=0.5 jour
- Rendement onduleur utilisé pour panneaux DS: Eday ÷ 0.90 ÷ (PSH × PR)

## PSH par région (`PSH_BY_REGION`, source PVGIS Commission européenne)

- prudent=5.0 (défaut, valeur pluie/orage), Dakar=6.16, Thiès=6.30, Saint-Louis=6.47,
  Kaolack=6.40, Diourbel/Touba=6.44, Tambacounda=6.29, Ziguinchor=5.98.

## Points [A VERIFIER] par un technicien

- PSH régional exact par ville (les valeurs PVGIS 2020 sont citées dans constants.js mais restent à confirmer).
- Voc/Vmp panneaux réels : valeurs départ dans `data/solar-overrides.json`, marquées à valider.
- Pic onduleur (inverterPeakW) pour gros moteurs (pompe ×3, compresseur ×2,5).
- Compatibilité série/parallèle des batteries (chaîne <= Vsys) et des panneaux (série si Vpanneau < Vsys×1.1).
- DoD des batteries exactes du catalogue (marquage lithium vs gel par données produit).

## Données manquantes / prochaines étapes

- Compléter les specs `solar.solar` (Voc/Vmp/mpptMaxVoc/mpptMaxA/cycles) via le CSV puis `solar-apply --apply --api`.
- Vérifier les prix/stocks = uniquement API ; aucun prix n'est inventé dans le front.
- Brancher les pages guides dans `/prix` ou un hub solaire si le volume de recherche le justifie (voir backlog).

## Principes non négociables

- Aucune URL existante modifiée ; seule redirection ajoutée : `/configurator` → `/configurateur-solaire` (308).
- Aucune donnée inventée : prix/stock/specs viennent de l'API (annotations marquées à valider).
- Avertissement « Estimation indicative, à faire valider par un technicien » sur toutes les pages et sorties.
- Pas de modification paiement/auth/panier existants : le configurateur passe par `useCart().addItem` et les actions existantes.