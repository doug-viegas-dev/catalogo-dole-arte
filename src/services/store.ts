import type { Product, Category, StoreSettings, SpecialDateItem } from '../types';

const EMPTY_SETTINGS: StoreSettings = {
  storeName: '',
  whatsappNumber: '',
  instagramUrl: '',
  heroTitle: '',
  heroSubtitle: '',
  aboutText: '',
  contactEmail: '',
  contactHours: '',
};

export const SPECIAL_DATES: SpecialDateItem[] = [];

const STORAGE_PRODUCTS_KEY = 'dolearte_products_v3';
const STORAGE_SETTINGS_KEY = 'dolearte_settings_v3';
const STORAGE_CATEGORIES_KEY = 'dolearte_categories_v3';

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return fallback;
  }
};

export const storeService = {
  getProducts(): Product[] {
    return readJson<Product[]>(STORAGE_PRODUCTS_KEY, []);
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products', e);
    }
  },

  getCategories(): Category[] {
    return readJson<Category[]>(STORAGE_CATEGORIES_KEY, []);
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories', e);
    }
  },

  getSettings(): StoreSettings {
    return readJson<StoreSettings>(STORAGE_SETTINGS_KEY, EMPTY_SETTINGS);
  },

  saveSettings(settings: StoreSettings): void {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },
};
