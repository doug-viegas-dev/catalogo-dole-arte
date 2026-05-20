import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { Category, Product, SpecialDateCategory, StoreSettings } from '../types';
import { adminService, type AdminUser } from '../services/adminService';
import { convertToWebP } from '../utils/image';
import { isSafeInstagramUrl } from '../utils/safeLinks';
import { AdminAuthCard } from './admin/AdminAuthCard';
import { AdminTabs } from './admin/AdminTabs';
import { AdminTopbar } from './admin/AdminTopbar';
import { CategoriesAdmin } from './admin/CategoriesAdmin';
import { ProductsAdmin } from './admin/ProductsAdmin';
import { SettingsAdmin } from './admin/SettingsAdmin';
import { SpecialDatesAdmin } from './admin/SpecialDatesAdmin';
import type { AdminTab, ProductStockFilter } from './admin/types';
import '../styles/AdminPanel.scss';

const MAX_UPLOAD_FILES = 5;
const MAX_PRODUCT_IMAGES = 12;
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface AdminPanelProps {
  products: Product[];
  settings: StoreSettings;
  categories: Category[];
  specialDateCategories: SpecialDateCategory[];
  onUpdateProducts: (updated: Product[]) => void;
  onUpdateSettings: (updated: StoreSettings) => void;
  onUpdateCategories: (updated: Category[]) => void;
  onUpdateSpecialDateCategories: (updated: SpecialDateCategory[]) => void;
  onBackToStore: () => void;
}

const createProduct = (categories: Category[]): Product => ({
  id: `prod-${Date.now()}`,
  name: '',
  description: '',
  price: 0,
  category: categories.find((category) => category.id !== 'todas')?.id || '',
  specialDateCategoryIds: [],
  imageUrl: '',
  imageUrls: [],
  inStock: true,
  featured: false,
  requiresMinQuantity: false,
});

const createCategory = (): Category => ({
  id: `cat-${Date.now()}`,
  name: '',
  icon: 'Sparkles',
});

const createSpecialDateCategory = (): SpecialDateCategory => ({
  id: `data-${Date.now()}`,
  name: '',
  description: '',
  tag: '',
});

const slugify = (value: string) => (
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
);

const getLoginErrorMessage = (error: unknown, fallback: string) => {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  if (code === 'auth/unauthorized-domain') {
    return 'Este dominio nao esta autorizado no Firebase Auth.';
  }

  if (code === 'auth/popup-blocked') {
    return 'O navegador bloqueou a janela do Google. Permita pop-ups para este site.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'A janela do Google foi fechada antes de concluir o login.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'O provedor Google nao esta ativado no Firebase Auth.';
  }

  if (error instanceof Error && error.message.includes('VITE_FIREBASE')) {
    return 'Firebase nao configurado na Vercel. Confira as variaveis VITE_FIREBASE_* em Production e faca um novo deploy.';
  }

  if (error instanceof Error && error.message === 'Autenticacao indisponivel.') {
    return 'Autenticacao indisponivel. Confira as variaveis VITE_FIREBASE_* na Vercel.';
  }

  return fallback;
};

const getAdminErrorMessage = (error: unknown, fallback: string) => {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  if (code === 'permission-denied') {
    return `${fallback} As regras do Firestore negaram a operacao. Verifique se as regras publicadas aceitam os campos atuais do produto.`;
  }

  if (code === 'unauthenticated') {
    return `${fallback} Sua sessao expirou. Faca login novamente.`;
  }

  if (error instanceof Error && error.message) {
    return `${fallback} Detalhe: ${error.message}`;
  }

  return fallback;
};

const prepareProductForSave = (product: Product): Product => {
  const requiresMinQuantity = Boolean(product.requiresMinQuantity);
  const productToSave: Product = {
    ...product,
    specialDateCategoryIds: Array.from(new Set(product.specialDateCategoryIds || [])),
    requiresMinQuantity,
  };

  if (requiresMinQuantity) {
    productToSave.minQuantity = Math.max(1, Math.floor(product.minQuantity || 1));
    return productToSave;
  }

  delete productToSave.minQuantity;
  return productToSave;
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  settings,
  categories,
  specialDateCategories,
  onUpdateProducts,
  onUpdateSettings,
  onUpdateCategories,
  onUpdateSpecialDateCategories,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [authError, setAuthError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productStockFilter, setProductStockFilter] = useState<ProductStockFilter>('all');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [editingSpecialDateCategory, setEditingSpecialDateCategory] = useState<SpecialDateCategory | null>(null);
  const [isAddingNewSpecialDateCategory, setIsAddingNewSpecialDateCategory] = useState(false);

  const [localSettings, setLocalSettings] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState('');
  const firebaseConfigurationError = adminService.getConfigurationError();
  const initialAuthError = firebaseConfigurationError
    ? 'Firebase nao configurado na Vercel. Confira as variaveis VITE_FIREBASE_* em Production e faca um novo deploy.'
    : '';
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmAdminAccess = (user: AdminUser) => {
    setEmailInput(user.email);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    void (async () => {
      try {
        const redirectUser = await adminService.getRedirectUser();
        if (redirectUser) {
          confirmAdminAccess(redirectUser);
        }
      } catch (error) {
        console.error(error);
        setAuthError(getLoginErrorMessage(error, 'Nao foi possivel concluir o login com o Google.'));
      }
    })();

    const unsubscribe = adminService.onSessionChange((user, error) => {
      setIsAuthenticated(Boolean(user));
      setEmailInput(user?.email || '');

      if (error) {
        console.error(error);
        setAuthError('Nao foi possivel validar a sessao.');
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search);
      const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter;
      const matchesStock =
        productStockFilter === 'all' ||
        (productStockFilter === 'available' && product.inStock) ||
        (productStockFilter === 'out' && !product.inStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter]);

  const showSuccess = (message: string) => {
    setSaveSuccess(message);
    setErrorMessage('');
    window.setTimeout(() => setSaveSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSaveSuccess('');
  };

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setEditingProduct(null);
    setEditingCategory(null);
    setEditingSpecialDateCategory(null);
    setIsAddingNewProduct(false);
    setIsAddingNewCategory(false);
    setIsAddingNewSpecialDateCategory(false);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    try {
      const user = await adminService.loginWithEmail(emailInput, passwordInput);
      confirmAdminAccess(user);
    } catch (error) {
      console.error(error);
      setAuthError(getLoginErrorMessage(error, 'E-mail ou senha incorretos.'));
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setLoadingAuth(true);

    try {
      await adminService.loginWithGoogle();
    } catch (error) {
      console.error(error);
      setAuthError(getLoginErrorMessage(error, 'Nao foi possivel entrar com o Google.'));
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await adminService.logout();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleClearProductFilters = () => {
    setProductSearch('');
    setProductCategoryFilter('all');
    setProductStockFilter('all');
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !editingProduct) return;
    const currentImageCount = editingProduct.imageUrls?.length || (editingProduct.imageUrl ? 1 : 0);
    const invalidFile = files.find((file) => !ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_UPLOAD_SIZE_BYTES);

    if (files.length > MAX_UPLOAD_FILES) {
      showError(`Envie no maximo ${MAX_UPLOAD_FILES} imagens por vez.`);
      event.target.value = '';
      return;
    }

    if (currentImageCount + files.length > MAX_PRODUCT_IMAGES) {
      showError(`Cada produto pode ter no maximo ${MAX_PRODUCT_IMAGES} imagens.`);
      event.target.value = '';
      return;
    }

    if (invalidFile) {
      showError('Use apenas imagens JPG, PNG ou WebP com ate 5 MB por arquivo.');
      event.target.value = '';
      return;
    }

    setIsImageUploading(true);
    setErrorMessage('');

    try {
      const urls = await Promise.all(
        files.map(async (file, index) => {
          const webpBlob = await convertToWebP(file, 1000, 0.85);
          return adminService.uploadProductImage(editingProduct.id, webpBlob, index);
        }),
      );
      const imageUrls = [...(editingProduct.imageUrls || []), ...urls];
      setEditingProduct({ ...editingProduct, imageUrl: imageUrls[0] || '', imageUrls });
    } catch (error) {
      console.error(error);
      showError('Nao foi possivel enviar as imagens.');
    } finally {
      setIsImageUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveProductImage = (imageUrl: string) => {
    if (!editingProduct) return;
    const imageUrls = (editingProduct.imageUrls || []).filter((url) => url !== imageUrl);
    setEditingProduct({ ...editingProduct, imageUrls, imageUrl: imageUrls[0] || '' });
  };

  const handleSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;

    setLoading(true);
    try {
      if (editingProduct.requiresMinQuantity && (!editingProduct.minQuantity || editingProduct.minQuantity < 1)) {
        showError('Informe a quantidade minima por pedido.');
        return;
      }

      const imageUrls = editingProduct.imageUrls?.length ? editingProduct.imageUrls : (editingProduct.imageUrl ? [editingProduct.imageUrl] : []);
      const productToSave = prepareProductForSave({ ...editingProduct, imageUrl: imageUrls[0] || '', imageUrls });
      await adminService.saveProduct(productToSave);

      const updatedProducts = isAddingNewProduct
        ? [...products, productToSave]
        : products.map((product) => product.id === productToSave.id ? productToSave : product);

      onUpdateProducts(updatedProducts);
      setEditingProduct(null);
      setIsAddingNewProduct(false);
      showSuccess('Produto salvo com sucesso.');
    } catch (error) {
      console.error(error);
      showError(getAdminErrorMessage(error, 'Erro ao salvar o produto.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await adminService.deleteProduct(id);
      onUpdateProducts(products.filter((product) => product.id !== id));
      showSuccess('Produto excluido com sucesso.');
    } catch (error) {
      console.error(error);
      showError(getAdminErrorMessage(error, 'Erro ao excluir o produto.'));
    }
  };

  const handleStartAddProduct = () => {
    setIsAddingNewProduct(true);
    setEditingProduct(createProduct(categories));
  };

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCategory) return;

    setLoading(true);
    try {
      const categoryToSave = {
        ...editingCategory,
        id: isAddingNewCategory ? slugify(editingCategory.name) || editingCategory.id : editingCategory.id,
      };
      await adminService.saveCategory(categoryToSave);

      const updatedCategories = isAddingNewCategory
        ? [...categories, categoryToSave]
        : categories.map((category) => category.id === categoryToSave.id ? categoryToSave : category);

      onUpdateCategories(updatedCategories);
      setEditingCategory(null);
      setIsAddingNewCategory(false);
      showSuccess('Categoria salva com sucesso.');
    } catch (error) {
      console.error(error);
      showError(getAdminErrorMessage(error, 'Erro ao salvar a categoria.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (id === 'todas') {
      showError('A categoria principal nao pode ser excluida.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await adminService.deleteCategory(id);
      onUpdateCategories(categories.filter((category) => category.id !== id));
      showSuccess('Categoria excluida com sucesso.');
    } catch (error) {
      console.error(error);
      showError(getAdminErrorMessage(error, 'Erro ao excluir a categoria.'));
    }
  };

  const handleStartAddCategory = () => {
    setIsAddingNewCategory(true);
    setEditingCategory(createCategory());
  };

  const handleSaveSpecialDateCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingSpecialDateCategory) return;

    setLoading(true);
    try {
      const categoryToSave = {
        ...editingSpecialDateCategory,
        id: isAddingNewSpecialDateCategory
          ? slugify(editingSpecialDateCategory.name) || editingSpecialDateCategory.id
          : editingSpecialDateCategory.id,
      };
      const updatedCategories = isAddingNewSpecialDateCategory
        ? [...specialDateCategories, categoryToSave]
        : specialDateCategories.map((category) => category.id === categoryToSave.id ? categoryToSave : category);

      await Promise.all(updatedCategories.map((category) => adminService.saveSpecialDateCategory(category)));
      onUpdateSpecialDateCategories(updatedCategories);
      setEditingSpecialDateCategory(null);
      setIsAddingNewSpecialDateCategory(false);
      showSuccess('Data especial salva com sucesso.');
    } catch (error) {
      console.error(error);
      showError(getAdminErrorMessage(error, 'Erro ao salvar a data especial.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecialDateCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta data especial?')) return;

    try {
      await adminService.deleteSpecialDateCategory(id);
      const updatedSpecialDateCategories = specialDateCategories.filter((category) => category.id !== id);
      await Promise.all(
        updatedSpecialDateCategories.map((category) => adminService.saveSpecialDateCategory(category)),
      );
      onUpdateSpecialDateCategories(updatedSpecialDateCategories);

      const updatedProducts = products.map((product) => ({
        ...product,
        specialDateCategoryIds: (product.specialDateCategoryIds || []).filter((categoryId) => categoryId !== id),
      }));
      await Promise.all(
        updatedProducts
          .filter((product, index) => product.specialDateCategoryIds?.length !== products[index].specialDateCategoryIds?.length)
          .map((product) => adminService.saveProduct(prepareProductForSave(product))),
      );
      onUpdateProducts(updatedProducts);
      showSuccess('Data especial excluida com sucesso.');
    } catch (error) {
      console.error(error);
      showError(getAdminErrorMessage(error, 'Erro ao excluir a data especial.'));
    }
  };

  const handleStartAddSpecialDateCategory = () => {
    setIsAddingNewSpecialDateCategory(true);
    setEditingSpecialDateCategory(createSpecialDateCategory());
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!isSafeInstagramUrl(localSettings.instagramUrl)) {
        showError('Use uma URL valida do Instagram com https://instagram.com/.');
        return;
      }

      await adminService.saveSettings(localSettings);
      onUpdateSettings(localSettings);
      showSuccess('Configuracoes salvas com sucesso.');
    } catch (error) {
      console.error(error);
      showError(getAdminErrorMessage(error, 'Erro ao salvar as configuracoes.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <AdminTopbar isAuthenticated={isAuthenticated} onBackToStore={onBackToStore} onLogout={handleLogout} />

      <main className="container admin-main-container">
        {!isAuthenticated ? (
          <AdminAuthCard
            authError={authError || initialAuthError}
            email={emailInput}
            isLoading={loadingAuth}
            password={passwordInput}
            onEmailChange={setEmailInput}
            onGoogleLogin={handleGoogleLogin}
            onPasswordChange={setPasswordInput}
            onSubmit={handleLogin}
          />
        ) : (
          <div className="admin-content-card">
            <AdminTabs
              activeTab={activeTab}
              categoriesCount={categories.length}
              productsCount={products.length}
              specialDateCategoriesCount={specialDateCategories.length}
              onChange={handleTabChange}
            />

            {saveSuccess && (
              <div className="admin-alert-success">
                <CheckCircle size={22} />
                <span>{saveSuccess}</span>
              </div>
            )}

            {errorMessage && (
              <div className="admin-alert-warning">
                <AlertTriangle size={22} className="alert-icon" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'products' && (
              <ProductsAdmin
                categories={categories}
                specialDateCategories={specialDateCategories}
                editingProduct={editingProduct}
                filteredProducts={filteredProducts}
                isAddingNewProduct={isAddingNewProduct}
                isImageUploading={isImageUploading}
                isLoading={loading}
                productCategoryFilter={productCategoryFilter}
                productSearch={productSearch}
                productsCount={products.length}
                productStockFilter={productStockFilter}
                onCancelEdit={() => setEditingProduct(null)}
                onCategoryFilterChange={setProductCategoryFilter}
                onClearFilters={handleClearProductFilters}
                onDeleteProduct={handleDeleteProduct}
                onEditProduct={setEditingProduct}
                onImageChange={handleImageFileChange}
                onProductChange={setEditingProduct}
                onRemoveImage={handleRemoveProductImage}
                onSaveProduct={handleSaveProduct}
                onSearchChange={setProductSearch}
                onStartAddProduct={handleStartAddProduct}
                onStockFilterChange={setProductStockFilter}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesAdmin
                categories={categories}
                editingCategory={editingCategory}
                isAddingNewCategory={isAddingNewCategory}
                isLoading={loading}
                onCancelEdit={() => setEditingCategory(null)}
                onCategoryChange={setEditingCategory}
                onDeleteCategory={handleDeleteCategory}
                onEditCategory={setEditingCategory}
                onSaveCategory={handleSaveCategory}
                onStartAddCategory={handleStartAddCategory}
              />
            )}

            {activeTab === 'specialDates' && (
              <SpecialDatesAdmin
                editingCategory={editingSpecialDateCategory}
                isAddingNewCategory={isAddingNewSpecialDateCategory}
                isLoading={loading}
                products={products}
                specialDateCategories={specialDateCategories}
                onCancelEdit={() => setEditingSpecialDateCategory(null)}
                onCategoryChange={setEditingSpecialDateCategory}
                onDeleteCategory={handleDeleteSpecialDateCategory}
                onEditCategory={setEditingSpecialDateCategory}
                onSaveCategory={handleSaveSpecialDateCategory}
                onStartAddCategory={handleStartAddSpecialDateCategory}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsAdmin
                isLoading={loading}
                settings={localSettings}
                onChange={setLocalSettings}
                onSave={handleSaveSettings}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
