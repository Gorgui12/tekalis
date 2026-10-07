/**
 * lib/solar/presets.js
 * Presets pour pages /kit-solaire/[slug] (Phase 4)
 */
export function buildKitPresets() {
  return [
    { slug: 'kit-solaire-1000w', label: 'Kit solaire 1000W', devices: [{ id: 'led', qty: 5, hours: 5 }, { id: 'tv_led', qty: 1, hours: 4 }, { id: 'decoder', qty: 1, hours: 4 }, { id: 'router', qty: 1, hours: 24 }] },
    { slug: 'kit-solaire-2000w', label: 'Kit solaire 2000W', devices: [{ id: 'led', qty: 8, hours: 5 }, { id: 'fan', qty: 2, hours: 6 }, { id: 'tv_led', qty: 1, hours: 4 }, { id: 'fridge', qty: 1, hours: 24 }] },
    { slug: 'kit-solaire-3000w', label: 'Kit solaire 3000W', devices: [{ id: 'led', qty: 10, hours: 5 }, { id: 'fan', qty: 3, hours: 6 }, { id: 'tv_led', qty: 2, hours: 4 }, { id: 'fridge', qty: 1, hours: 24 }, { id: 'freezer', qty: 1, hours: 24 }] },
    { slug: 'kit-solaire-5000w', label: 'Kit solaire 5000W', devices: [{ id: 'led', qty: 12, hours: 5 }, { id: 'fan', qty: 4, hours: 6 }, { id: 'tv_led', qty: 2, hours: 4 }, { id: 'fridge', qty: 1, hours: 24 }, { id: 'freezer', qty: 1, hours: 24 }, { id: 'water_pump', qty: 1, hours: 2 }] },
  ];
}
