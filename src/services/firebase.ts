import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import type { Product, StoreSettings, Category } from '../types';
import { storeService } from './store';

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

const normalizeProductImages = (product: Product): Product => ({
  ...product,
  imageUrls: product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []),
});

export const firebaseService = {
  isConfigured() {
    return isFirebaseConfigured;
  },

  getAuthInstance() {
    return auth;
  },

  async loginAdmin(email: string, pass: string): Promise<void> {
    if (!auth) throw new Error('Firebase Auth nao configurado ou offline.');
    await signInWithEmailAndPassword(auth, email, pass);
  },

  async loginWithGoogle(): Promise<void> {
    if (!auth) throw new Error('Firebase Auth nao configurado ou offline.');
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

  async syncProductsFromFirebase(): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) return storeService.getProducts().map(normalizeProductImages);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const products: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        products.push(normalizeProductImages({ id: docSnap.id, ...docSnap.data() } as Product));
      });
      storeService.saveProducts(products);
      return products;
    } catch (e) {
      console.error('Erro ao buscar produtos do Firestore:', e);
    }
    return storeService.getProducts().map(normalizeProductImages);
  },

  async saveProductToFirebase(product: Product): Promise<void> {
    const normalizedProduct = normalizeProductImages(product);
    const current = storeService.getProducts();
    const updated = current.map(p => p.id === normalizedProduct.id ? normalizedProduct : p);
    if (!current.some(p => p.id === normalizedProduct.id)) updated.push(normalizedProduct);
    storeService.saveProducts(updated);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'products', normalizedProduct.id), normalizedProduct);
      } catch {
        console.warn('Erro ao salvar no Firestore. Produto salvo localmente.');
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
        console.warn('Erro ao deletar no Firestore. Produto excluido localmente.');
      }
    }
  },

  async syncCategoriesFromFirebase(): Promise<Category[]> {
    if (!isFirebaseConfigured || !db) return storeService.getCategories();
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories: Category[] = [];
      querySnapshot.forEach((docSnap) => {
        categories.push({ id: docSnap.id, ...docSnap.data() } as Category);
      });
      storeService.saveCategories(categories);
      return categories;
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
        console.warn('Erro ao excluir categoria no Firestore. Excluido localmente.');
      }
    }
  },

  async getSettingsFromFirebase(): Promise<StoreSettings> {
    if (!isFirebaseConfigured || !db) return storeService.getSettings();
    try {
      const querySnapshot = await getDocs(collection(db, 'settings'));
      let settings: StoreSettings | null = null;
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id === 'general') settings = docSnap.data() as StoreSettings;
      });
      if (settings) {
        storeService.saveSettings(settings);
        return settings;
      }
    } catch (e) {
      console.error('Erro ao buscar configuracoes:', e);
    }
    return storeService.getSettings();
  },

  async saveSettingsToFirebase(settings: StoreSettings): Promise<void> {
    storeService.saveSettings(settings);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'settings', 'general'), settings);
      } catch (e) {
        console.warn('Erro ao salvar configuracoes no Firestore. Salvo localmente.', e);
      }
    }
  },
};
