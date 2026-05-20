import type { Product, Category, StoreSettings, SpecialDateCategory, SpecialDateItem } from '../types';

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

export const DEFAULT_SPECIAL_DATE_CATEGORIES: SpecialDateCategory[] = [
  {
    id: 'dia-das-maes',
    name: 'Dia das Maes',
    description: 'Presentes personalizados para emocionar maes e figuras maternas.',
    tag: 'Maio',
  },
  {
    id: 'dia-dos-namorados',
    name: 'Dia dos Namorados',
    description: 'Ideias romanticas para casais, pedidos e lembrancas afetivas.',
    tag: '12 Jun',
  },
  {
    id: 'dia-dos-pais',
    name: 'Dia dos Pais',
    description: 'Produtos criativos para pais, avos e pessoas especiais.',
    tag: 'Agosto',
  },
  {
    id: 'professores',
    name: 'Dia dos Professores',
    description: 'Lembrancinhas e kits para homenagear educadores.',
    tag: '15 Out',
  },
  {
    id: 'natal',
    name: 'Natal',
    description: 'Presentes personalizados para familia, amigos e empresas.',
    tag: 'Dezembro',
  },
  {
    id: 'aniversario',
    name: 'Aniversarios',
    description: 'Produtos para celebrar datas pessoais e lembrancas de festa.',
    tag: 'Todo ano',
  },
];

const STORAGE_PRODUCTS_KEY = 'dolearte_products_v3';
const STORAGE_SETTINGS_KEY = 'dolearte_settings_v3';
const STORAGE_CATEGORIES_KEY = 'dolearte_categories_v3';
const STORAGE_SPECIAL_DATE_CATEGORIES_KEY = 'dolearte_special_date_categories_v1';

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

  getSpecialDateCategories(): SpecialDateCategory[] {
    return readJson<SpecialDateCategory[]>(
      STORAGE_SPECIAL_DATE_CATEGORIES_KEY,
      DEFAULT_SPECIAL_DATE_CATEGORIES,
    );
  },

  saveSpecialDateCategories(specialDateCategories: SpecialDateCategory[]): void {
    try {
      localStorage.setItem(STORAGE_SPECIAL_DATE_CATEGORIES_KEY, JSON.stringify(specialDateCategories));
    } catch (e) {
      console.error('Error saving special date categories', e);
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
