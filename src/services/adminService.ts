import type { Category, Product, StoreSettings } from '../types';
import { firebaseService } from './firebase';
import type { User } from 'firebase/auth';

export interface AdminUser {
  email: string;
}

const toAdminUser = (user: User): AdminUser => {
  return { email: user.email || '' };
};

export const adminService = {
  getConfigurationError(): string {
    return firebaseService.getConfigurationError();
  },

  onSessionChange(callback: (user: AdminUser | null, error?: Error) => void): () => void {
    return firebaseService.onAuthStateChanged((user) => {
      void (async () => {
        if (!user) {
          callback(null);
          return;
        }

        callback(toAdminUser(user));
      })();
    });
  },

  async loginWithEmail(email: string, password: string): Promise<AdminUser> {
    return toAdminUser(await firebaseService.loginAdmin(email, password));
  },

  async loginWithGoogle(): Promise<void> {
    await firebaseService.loginWithGoogle();
  },

  async getRedirectUser(): Promise<AdminUser | null> {
    const user = await firebaseService.getGoogleRedirectUser();
    return user ? toAdminUser(user) : null;
  },

  async logout(): Promise<void> {
    await firebaseService.logoutAdmin();
  },

  async uploadProductImage(productId: string, image: Blob, index: number): Promise<string> {
    return firebaseService.uploadProductImage(productId, image, index);
  },

  async saveProduct(product: Product): Promise<void> {
    await firebaseService.saveProductToFirebase(product);
  },

  async deleteProduct(id: string): Promise<void> {
    await firebaseService.deleteProductFromFirebase(id);
  },

  async saveCategory(category: Category): Promise<void> {
    await firebaseService.saveCategoryToFirebase(category);
  },

  async deleteCategory(id: string): Promise<void> {
    await firebaseService.deleteCategoryFromFirebase(id);
  },

  async saveSettings(settings: StoreSettings): Promise<void> {
    await firebaseService.saveSettingsToFirebase(settings);
  },
};
