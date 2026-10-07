/**
 * lib/solar/serverData.js
 * Fetch catalogue solaire cote serveur (Server Components uniquement).
 * Fusionne les annotations backend et les overrides front
 * (data/solar-overrides.json) puis filtre les produits exploitables.
 */
import { serverFetch } from '@/lib/serverFetch';
import { solarCatalog } from './catalog';
import overrides from '@/data/solar-overrides.json';

/**
 * @returns {Promise<Array>} produits solaires disponibles (role, stock > 0)
 * En cas d'API injoignable : tableau vide (dimensionnement seul possible).
 */
export async function fetchSolarProducts() {
  try {
    const data = await serverFetch('/products?limit=200', { revalidate: 3600 });
    const list = data?.data || data?.products || (Array.isArray(data) ? data : []);
    return solarCatalog(list, overrides);
  } catch {
    return [];
  }
}
