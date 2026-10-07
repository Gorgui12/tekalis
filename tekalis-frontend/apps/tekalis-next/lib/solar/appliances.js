/**
 * lib/solar/appliances.js
 * Liste indicative d'appareils pour estimation. duty = % fonctionnement réel (frigo tourne par intermittence).
 * surgeFactor = facteur de démarrage (moteurs/compresseurs).
 */
const APPLIANCES = [
  { id: 'led', label: 'Ampoule LED', category: 'eclairage', watts: 10, surgeFactor: 1.0, defaultHours: 5, duty: 1.0, essential: true, notes: 'Ind.' },
  { id: 'fan', label: 'Ventilateur', category: 'climatisation', watts: 70, surgeFactor: 1.2, defaultHours: 6, duty: 1.0, essential: true },
  { id: 'ceiling_fan', label: 'Ventilateur plafond', category: 'climatisation', watts: 80, surgeFactor: 1.3, defaultHours: 6, duty: 1.0, essential: true },
  { id: 'tv_led', label: 'TV LED', category: 'loisir', watts: 70, surgeFactor: 1.0, defaultHours: 4, duty: 1.0, essential: true },
  { id: 'decoder', label: 'Décodeur', category: 'loisir', watts: 20, surgeFactor: 1.0, defaultHours: 4, duty: 1.0, essential: true },
  { id: 'laptop', label: 'Ordinateur portable', category: 'informatique', watts: 60, surgeFactor: 1.0, defaultHours: 4, duty: 1.0, essential: true },
  { id: 'pc', label: 'Ordinateur fixe', category: 'informatique', watts: 150, surgeFactor: 1.0, defaultHours: 4, duty: 1.0, essential: true },
  { id: 'phone_charger', label: 'Chargeur téléphone', category: 'informatique', watts: 10, surgeFactor: 1.0, defaultHours: 3, duty: 1.0, essential: true },
  { id: 'router', label: 'Routeur WiFi', category: 'informatique', watts: 15, surgeFactor: 1.0, defaultHours: 24, duty: 1.0, essential: true },
  { id: 'camera', label: 'Caméra surveillance', category: 'securite', watts: 15, surgeFactor: 1.0, defaultHours: 24, duty: 1.0, essential: true },
  { id: 'fridge', label: 'Réfrigérateur', category: 'electromenager', watts: 150, surgeFactor: 2.0, defaultHours: 24, duty: 0.4, essential: true, notes: 'Compresseur - démarrage élevé' },
  { id: 'freezer', label: 'Congélateur', category: 'electromenager', watts: 200, surgeFactor: 2.0, defaultHours: 24, duty: 0.4, essential: true, notes: 'Compresseur' },
  { id: 'ac_1cv', label: 'Climatiseur 1 CV', category: 'climatisation', watts: 900, surgeFactor: 2.5, defaultHours: 6, duty: 0.8, essential: false },
  { id: 'ac_15cv', label: 'Climatiseur 1,5 CV', category: 'climatisation', watts: 1300, surgeFactor: 2.5, defaultHours: 6, duty: 0.8, essential: false },
  { id: 'water_pump', label: 'Pompe à eau', category: 'hydraulique', watts: 750, surgeFactor: 3.0, defaultHours: 2, duty: 1.0, essential: false, notes: 'Moteur - pic fort' },
  { id: 'washing_machine', label: 'Machine à laver', category: 'electromenager', watts: 500, surgeFactor: 2.0, defaultHours: 1, duty: 1.0, essential: false },
  { id: 'iron', label: 'Fer à repasser', category: 'electromenager', watts: 1000, surgeFactor: 1.0, defaultHours: 1, duty: 1.0, essential: false, notes: 'Très gourmand en énergie' },
  { id: 'microwave', label: 'Micro-ondes', category: 'electromenager', watts: 900, surgeFactor: 1.0, defaultHours: 1, duty: 1.0, essential: false },
  { id: 'blender', label: 'Mixeur', category: 'electromenager', watts: 300, surgeFactor: 1.5, defaultHours: 0.5, duty: 1.0, essential: false },
  { id: 'sewing_machine', label: 'Machine à coudre', category: 'atelier', watts: 100, surgeFactor: 1.5, defaultHours: 3, duty: 1.0, essential: false },
  { id: 'printer', label: 'Imprimante', category: 'informatique', watts: 50, surgeFactor: 1.5, defaultHours: 1, duty: 1.0, essential: false },
  { id: 'sound_system', label: 'Enceinte/sono', category: 'loisir', watts: 150, surgeFactor: 1.2, defaultHours: 3, duty: 1.0, essential: false },
];

export default APPLIANCES;
export { APPLIANCES };
