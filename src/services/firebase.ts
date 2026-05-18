// Serviço de integração com o Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import type { Product, StoreSettings, Category } from '../types';
import { storeService, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from './store';

const firebaseConfig = {
  apiKey: "AIzaSyAm1JpltYryh4aJsnZyrqEe1vgmPig3Ras",
  authDomain: "catalogo-dole-arte.firebaseapp.com",
  projectId: "catalogo-dole-arte",
  storageBucket: "catalogo-dole-arte.firebasestorage.app",
  messagingSenderId: "442411515418",
  appId: "1:442411515418:web:25c337aa4ab9877e561ba3",
  measurementId: "G-339VCR2Y3J"
};

let db: Firestore | null = null;
let auth: Auth | null = null;
let isFirebaseConfigured = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza')) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log('Firebase inicializado com sucesso no projeto:', firebaseConfig.projectId);
  } else {
    console.warn('Modo LocalStorage ativado. Para nuvem, insira credenciais corretas.');
  }
} catch (e) {
  console.error('Erro ao inicializar Firebase:', e);
}

export const firebaseService = {
  isConfigured() {
    return isFirebaseConfigured;
  },

  getAuthInstance() {
    return auth;
  },

  async loginAdmin(email: string, pass: string): Promise<void> {
    if (!auth) throw new Error('Firebase Auth não configurado ou offline.');
    await signInWithEmailAndPassword(auth, email, pass);
  },

  async loginWithGoogle(): Promise<void> {
    if (!auth) throw new Error('Firebase Auth não configurado ou offline.');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  },

  async logoutAdmin(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  },

  async seedInitialDataIfEmpty(forceProducts = false): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      // 1. Povoar Produtos se vazio ou se forçado
      const prodSnap = await getDocs(collection(db, 'products'));
      if (prodSnap.empty || forceProducts) {
        console.log('Povoando Firestore com imagens e produtos iniciais...');
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.id), prod);
        }
      }

      // 2. Povoar Categorias se vazio
      const catSnap = await getDocs(collection(db, 'categories'));
      if (catSnap.empty) {
        console.log('Coleção categories vazia. Povoando com categorias iniciais...');
        for (const cat of INITIAL_CATEGORIES) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
      }

      // 3. Povoar Configurações se vazio
      const setSnap = await getDocs(collection(db, 'settings'));
      if (setSnap.empty) {
        console.log('Coleção settings vazia. Povoando com configurações iniciais...');
        await setDoc(doc(db, 'settings', 'general'), INITIAL_SETTINGS);
      }
    } catch (e) {
      console.error('Erro ao realizar o seeding no Firestore:', e);
    }
  },

  async syncProductsFromFirebase(): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) return storeService.getProducts();
    try {
      await this.seedInitialDataIfEmpty();

      const querySnapshot = await getDocs(collection(db, 'products'));
      let products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      // Se houver imagens antigas do unsplash, força a atualização para as imagens locais premium
      if (products.some(p => p.imageUrl?.includes('unsplash.com'))) {
        await this.seedInitialDataIfEmpty(true);
        products = [...INITIAL_PRODUCTS];
      }

      if (products.length > 0) {
        storeService.saveProducts(products);
        return products;
      }
    } catch (e) {
      console.error('Erro ao buscar produtos do Firestore:', e);
    }
    return storeService.getProducts();
  },

  async saveProductToFirebase(product: Product): Promise<void> {
    const current = storeService.getProducts();
    const updated = current.map(p => p.id === product.id ? product : p);
    if (!current.some(p => p.id === product.id)) updated.push(product);
    storeService.saveProducts(updated);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'products', product.id), product);
      } catch {
        console.warn('Erro ao salvar no Firestore (verifique as Regras de Segurança no console do Firebase). Produto salvo localmente.');
      }
    }
  },

  async deleteProductFromFirebase(id: string): Promise<void> {
    const current = storeService.getProducts();
    storeService.saveProducts(current.filter(p => p.id !== id));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch {
        console.warn('Erro ao deletar no Firestore. Produto excluído localmente.');
      }
    }
  },

  async syncCategoriesFromFirebase(): Promise<Category[]> {
    if (!isFirebaseConfigured || !db) return storeService.getCategories();
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });
      if (categories.length > 0) {
        storeService.saveCategories(categories);
        return categories;
      }
    } catch (e) {
      console.error('Erro ao buscar categorias:', e);
    }
    return storeService.getCategories();
  },

  async saveCategoryToFirebase(category: Category): Promise<void> {
    const current = storeService.getCategories();
    const updated = current.map(c => c.id === category.id ? category : c);
    if (!current.some(c => c.id === category.id)) updated.push(category);
    storeService.saveCategories(updated);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'categories', category.id), category);
      } catch {
        console.warn('Erro ao salvar categoria no Firestore. Salvo localmente.');
      }
    }
  },

  async deleteCategoryFromFirebase(id: string): Promise<void> {
    const current = storeService.getCategories();
    storeService.saveCategories(current.filter(c => c.id !== id));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch {
        console.warn('Erro ao excluir categoria no Firestore. Excluído localmente.');
      }
    }
  },

  async getSettingsFromFirebase(): Promise<StoreSettings> {
    if (!isFirebaseConfigured || !db) return storeService.getSettings();
    try {
      const querySnapshot = await getDocs(collection(db, 'settings'));
      let settings: Partial<StoreSettings> = {};
      querySnapshot.forEach((doc) => {
        if (doc.id === 'general') settings = doc.data() as StoreSettings;
      });
      if (Object.keys(settings).length > 0) {
        const fullSettings = { ...storeService.getSettings(), ...settings };
        storeService.saveSettings(fullSettings);
        return fullSettings;
      }
    } catch (e) {
      console.error('Erro ao buscar configurações:', e);
    }
    return storeService.getSettings();
  },

  async saveSettingsToFirebase(settings: StoreSettings): Promise<void> {
    storeService.saveSettings(settings);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'settings', 'general'), settings);
      } catch (e) {
        console.warn('Erro ao salvar configurações no Firestore (verifique regras de segurança). Salvo localmente.', e);
      }
    }
  }
};
