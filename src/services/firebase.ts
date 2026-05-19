import { initializeApp } from 'firebase/app';
import {
  browserSessionPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import type { Category, Product, StoreSettings } from '../types';
import { storeService } from './store';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let isFirebaseConfigured = false;
let firebaseInitError = '';
let authPersistenceReady: Promise<void> = Promise.resolve();

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    authPersistenceReady = setPersistence(auth, browserSessionPersistence);
    storage = getStorage(app);
    isFirebaseConfigured = true;
  } else {
    firebaseInitError = 'Variaveis VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID ou VITE_FIREBASE_APP_ID ausentes.';
  }
} catch (e) {
  firebaseInitError = e instanceof Error ? e.message : 'Erro desconhecido ao inicializar Firebase.';
  console.error('Erro ao inicializar Firebase:', e);
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const asString = (value: unknown, fallback = '') => (
  typeof value === 'string' ? value : fallback
);

const asNumber = (value: unknown, fallback = 0) => (
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
);

const asBoolean = (value: unknown, fallback = false) => (
  typeof value === 'boolean' ? value : fallback
);

const asStringArray = (value: unknown): string[] => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length > 0) : []
);

const safePathSegment = (value: string): string => (
  value.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80) || 'product'
);

const normalizeProduct = (id: string, data: unknown): Product | null => {
  if (!isRecord(data)) return null;

  const name = asString(data.name).trim();
  const description = asString(data.description).trim();
  const category = asString(data.category).trim();
  const price = asNumber(data.price);
  const imageUrl = asString(data.imageUrl).trim();
  const imageUrls = asStringArray(data.imageUrls);
  const normalizedImages = imageUrls.length ? imageUrls : (imageUrl ? [imageUrl] : []);

  if (!id || !name || !description || !category) return null;

  return {
    id,
    name,
    description,
    price,
    category,
    imageUrl: normalizedImages[0] || '',
    imageUrls: normalizedImages,
    inStock: asBoolean(data.inStock, true),
    featured: asBoolean(data.featured),
    minQuantity: asNumber(data.minQuantity, 0) || undefined,
  };
};

const normalizeCategory = (id: string, data: unknown): Category | null => {
  if (!isRecord(data)) return null;

  const name = asString(data.name).trim();
  if (!id || !name) return null;

  return {
    id,
    name,
    icon: asString(data.icon, 'Sparkles'),
    description: asString(data.description) || undefined,
  };
};

const normalizeSettings = (data: unknown): StoreSettings | null => {
  if (!isRecord(data)) return null;

  return {
    storeName: asString(data.storeName),
    whatsappNumber: asString(data.whatsappNumber),
    instagramUrl: asString(data.instagramUrl),
    heroTitle: asString(data.heroTitle),
    heroSubtitle: asString(data.heroSubtitle),
    aboutText: asString(data.aboutText),
    contactEmail: asString(data.contactEmail),
    contactHours: asString(data.contactHours),
  };
};

export const firebaseService = {
  isConfigured() {
    return isFirebaseConfigured;
  },

  getConfigurationError() {
    return firebaseInitError;
  },

  async loginAdmin(email: string, pass: string): Promise<User> {
    if (!auth) throw new Error(firebaseInitError || 'Autenticacao indisponivel.');
    await authPersistenceReady;
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return credential.user;
  },

  async loginWithGoogle(): Promise<void> {
    if (!auth) throw new Error(firebaseInitError || 'Autenticacao indisponivel.');
    await authPersistenceReady;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  },

  async getGoogleRedirectUser(): Promise<User | null> {
    if (!auth) return null;
    await authPersistenceReady;
    return auth.currentUser;
  },

  async logoutAdmin(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!auth) return () => undefined;
    return onAuthStateChanged(auth, callback);
  },

  async syncProductsFromFirebase(): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) return [];

    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs
      .map((docSnap) => normalizeProduct(docSnap.id, docSnap.data()))
      .filter((product): product is Product => Boolean(product));

    storeService.saveProducts(products);
    return products;
  },

  async saveProductToFirebase(product: Product): Promise<void> {
    const normalizedProduct = normalizeProduct(product.id, product);
    if (!normalizedProduct) throw new Error('Produto invalido.');

    if (!isFirebaseConfigured || !db) {
      throw new Error('Nao foi possivel salvar agora. Verifique a configuracao do Firebase.');
    }

    await setDoc(doc(db, 'products', normalizedProduct.id), normalizedProduct);
    storeService.saveProducts([
      ...storeService.getProducts().filter((item) => item.id !== normalizedProduct.id),
      normalizedProduct,
    ]);
  },

  async deleteProductFromFirebase(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Nao foi possivel excluir agora. Verifique a configuracao do Firebase.');
    }

    await deleteDoc(doc(db, 'products', id));
    storeService.saveProducts(storeService.getProducts().filter((product) => product.id !== id));
  },

  async uploadProductImage(productId: string, image: Blob, index: number): Promise<string> {
    if (!isFirebaseConfigured || !storage) {
      throw new Error('Envio de imagem indisponivel. Verifique a configuracao do Firebase.');
    }

    const path = `products/${safePathSegment(productId)}/${Date.now()}-${index}.webp`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, image, { contentType: 'image/webp' });
    return getDownloadURL(storageRef);
  },

  async syncCategoriesFromFirebase(): Promise<Category[]> {
    if (!isFirebaseConfigured || !db) return [];

    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categories = querySnapshot.docs
      .map((docSnap) => normalizeCategory(docSnap.id, docSnap.data()))
      .filter((category): category is Category => Boolean(category));

    storeService.saveCategories(categories);
    return categories;
  },

  async saveCategoryToFirebase(category: Category): Promise<void> {
    const normalizedCategory = normalizeCategory(category.id, category);
    if (!normalizedCategory) throw new Error('Categoria invalida.');

    if (!isFirebaseConfigured || !db) {
      throw new Error('Nao foi possivel salvar agora. Verifique a configuracao do Firebase.');
    }

    await setDoc(doc(db, 'categories', normalizedCategory.id), normalizedCategory);
    storeService.saveCategories([
      ...storeService.getCategories().filter((item) => item.id !== normalizedCategory.id),
      normalizedCategory,
    ]);
  },

  async deleteCategoryFromFirebase(id: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Nao foi possivel excluir agora. Verifique a configuracao do Firebase.');
    }

    await deleteDoc(doc(db, 'categories', id));
    storeService.saveCategories(storeService.getCategories().filter((category) => category.id !== id));
  },

  async getSettingsFromFirebase(): Promise<StoreSettings> {
    if (!isFirebaseConfigured || !db) return storeService.getSettings();

    const querySnapshot = await getDocs(collection(db, 'settings'));
    const settingsDoc = querySnapshot.docs.find((docSnap) => docSnap.id === 'general');
    const settings = normalizeSettings(settingsDoc?.data());

    if (!settings) return storeService.getSettings();

    storeService.saveSettings(settings);
    return settings;
  },

  async saveSettingsToFirebase(settings: StoreSettings): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Nao foi possivel salvar agora. Verifique a configuracao do Firebase.');
    }

    await setDoc(doc(db, 'settings', 'general'), settings);
    storeService.saveSettings(settings);
  },
};
