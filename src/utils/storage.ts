import { PromoterProfile, Product, AppTheme } from '../types';
import { DEFAULT_PRODUCTS } from '../data/defaultCatalog';

const STORAGE_KEYS = {
  PROFILE: 'sales_hub_profile_v2',
  CATALOG: 'sales_hub_catalog_v5',
  DELETED_PRODUCT_IDS: 'sales_hub_deleted_ids_v1',
  THEME: 'sales_hub_theme_v2',
  API_KEY: 'sales_hub_custom_gemini_key_v2',
};

export const DEFAULT_PROFILE: PromoterProfile = {
  name: 'Prajwal R.M.',
  empId: 'EMP-7842',
  storeLocation: 'Croma Electronics, Indiranagar, Bengaluru',
  storeCode: 'CR-IND-402',
  phone: '+91 98765 43210',
  targetMonthlySales: 450000,
  currentMonthlySales: 312000,
};

// Profile persistence
export function loadProfile(): PromoterProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: PromoterProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

// Track permanently deleted product IDs so they never resurrect on reload
export function getDeletedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_PRODUCT_IDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading deleted product IDs:', e);
  }
  return [];
}

export function recordDeletedProductId(id: string): void {
  try {
    const current = getDeletedProductIds();
    if (!current.includes(id)) {
      localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCT_IDS, JSON.stringify([...current, id]));
    }
  } catch (e) {
    console.error('Error recording deleted product ID:', e);
  }
}

export function clearDeletedProductIds(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DELETED_PRODUCT_IDS);
  } catch (e) {
    console.error('Error clearing deleted product IDs:', e);
  }
}

// Catalog persistence: Single source of truth that preserves user deletions & additions permanently
export function loadCatalog(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      // If user has saved a catalog (even if empty or edited), ALWAYS respect it!
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Check fallback from previous storage keys if migrating
    const rawV3 = localStorage.getItem('sales_hub_catalog_v3');
    if (rawV3) {
      const parsedV3 = JSON.parse(rawV3);
      if (Array.isArray(parsedV3) && parsedV3.length > 0) {
        saveCatalog(parsedV3);
        return parsedV3;
      }
    }
  } catch (e) {
    console.error('Error loading catalog:', e);
  }

  // First time initialization: Seed with default products excluding any previously deleted IDs
  const deletedIds = getDeletedProductIds();
  const initial = DEFAULT_PRODUCTS.filter((p) => !deletedIds.includes(p.id));
  saveCatalog(initial);
  return initial;
}

export function saveCatalog(catalog: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  } catch (e) {
    console.error('Error saving catalog:', e);
  }
}

export function addProductToCatalog(product: Product): Product[] {
  const current = loadCatalog();
  // If product was previously marked deleted, unmark it
  try {
    const deletedIds = getDeletedProductIds().filter((id) => id !== product.id);
    localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCT_IDS, JSON.stringify(deletedIds));
  } catch {}

  const updated = [product, ...current];
  saveCatalog(updated);
  return updated;
}

export function updateProductInCatalog(product: Product): Product[] {
  const current = loadCatalog();
  const updated = current.map((p) => (p.id === product.id ? product : p));
  saveCatalog(updated);
  return updated;
}

export function deleteProductFromCatalog(productId: string): Product[] {
  recordDeletedProductId(productId);
  const current = loadCatalog();
  const updated = current.filter((p) => p.id !== productId);
  saveCatalog(updated);
  return updated;
}

export function deleteRecipeFromProduct(productId: string, recipeId: string): Product[] {
  const current = loadCatalog();
  const updated = current.map((prod) => {
    if (prod.id !== productId) return prod;
    return {
      ...prod,
      recipes: (prod.recipes || []).filter((r) => r.id !== recipeId),
    };
  });
  saveCatalog(updated);
  return updated;
}

export function resetCatalogToDefault(): Product[] {
  clearDeletedProductIds();
  saveCatalog(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

// Theme persistence
export function loadTheme(): AppTheme {
  try {
    const raw = (localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('sales_hub_theme')) as AppTheme;
    if (raw === 'light' || raw === 'dark') {
      return raw;
    }
  } catch (e) {
    console.error('Error loading theme:', e);
  }
  return 'dark';
}

export function saveTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    localStorage.setItem('sales_hub_theme', theme);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
}

// Custom Gemini API Key persistence
export function loadCustomApiKey(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return stored ? stored.trim() : '';
  } catch (e) {
    return '';
  }
}

export function saveCustomApiKey(key: string): void {
  try {
    const trimmed = (key || '').trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  } catch (e) {
    console.error('Error saving custom API key:', e);
  }
}

// Export / Import
export function exportDataJSON(): string {
  const data = {
    profile: loadProfile(),
    catalog: loadCatalog(),
    theme: loadTheme(),
    exportedAt: new Date().toISOString(),
    app: 'SALES Promoters Hub',
  };
  return JSON.stringify(data, null, 2);
}

export function importDataJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveProfile(data.profile);
    if (data.catalog && Array.isArray(data.catalog)) {
      clearDeletedProductIds();
      saveCatalog(data.catalog);
    }
    if (data.theme) saveTheme(data.theme);
    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}
