import { PromoterProfile, Product, AppTheme } from '../types';
import { DEFAULT_PRODUCTS } from '../data/defaultCatalog';

const STORAGE_KEYS = {
  PROFILE: 'sales_hub_profile_v2',
  CATALOG: 'sales_hub_catalog_v3',
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

// Catalog persistence
export function loadCatalog(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading catalog:', e);
  }
  // Initialize with default
  saveCatalog(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
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
  const current = loadCatalog();
  const updated = current.filter((p) => p.id !== productId);
  saveCatalog(updated);
  return updated;
}

export function resetCatalogToDefault(): Product[] {
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

// Default Google AI Studio API Key from user
export const DEFAULT_API_KEY = 'AIzaSyDxrDQPUZWfspw0mlBC-fBbgSil1n40PdU';

// Custom Gemini API Key persistence
export function loadCustomApiKey(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return stored && stored.trim() ? stored.trim() : DEFAULT_API_KEY;
  } catch (e) {
    return DEFAULT_API_KEY;
  }
}

export function saveCustomApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
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
    if (data.catalog && Array.isArray(data.catalog)) saveCatalog(data.catalog);
    if (data.theme) saveTheme(data.theme);
    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}
