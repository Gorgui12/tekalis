# SOLAR_DECISIONS.md
# Décisions techniques à valider par technicien

## Paramètres à valider
- simultaneityFactor=0.7
- inverterOversize=1.25
- mpptSafetyFactor=1.25
- PR=0.75
- etaInv=0.90
- psfDefault=5.0 (prudence; PVGIS suggère ~6.0 pour villes sénégalaises - voir SOLAR_AUDIT.md)
- DOD: gel/AGM/lead-acid 0.5, lithium 0.8
- Seuils tension: <=1000VA->12V, <=3000VA->24V, >3000VA->48V

## Points [A VERIFIER]
- PSH régional exact par ville (Dakar/Thiès/St-Louis/Kaolack/Touba-Tambacounda/Ziguinchor)
- Voc/Vmp panneaux réels (à compléter via CSV)
- Pic onduleur (inverterPeakW) pour gros moteurs
- Compatibilité série/parallèle

## TODO (données manquantes)
- Specs complètes dans solar.solar (Voc/Vmp/mpptMaxVoc/mpptMaxA/cycles)
- Si API inaccessible côté front, utiliser data/solar-overrides.json
