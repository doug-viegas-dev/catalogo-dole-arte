import { Plus } from 'lucide-react';
import type { Category, Product } from '../../types';
import { ProductFilters } from './ProductFilters';
import { ProductForm } from './ProductForm';
import { ProductTable } from './ProductTable';
import type { ProductStockFilter } from './types';

interface ProductsAdminProps {
  categories: Category[];
  filteredProducts: Product[];
  isAddingNewProduct: boolean;
  isImageUploading: boolean;
  isLoading: boolean;
  productCategoryFilter: string;
  productSearch: string;
  productsCount: number;
  productStockFilter: ProductStockFilter;
  editingProduct: Product | null;
  onCancelEdit: () => void;
  onCategoryFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: Product) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProductChange: (product: Product) => void;
  onRemoveImage: (imageUrl: string) => void;
  onSaveProduct: (event: React.FormEvent) => void;
  onSearchChange: (value: string) => void;
  onStartAddProduct: () => void;
  onStockFilterChange: (value: ProductStockFilter) => void;
}

export const ProductsAdmin: React.FC<ProductsAdminProps> = ({
  categories,
  filteredProducts,
  isAddingNewProduct,
  isImageUploading,
  isLoading,
  productCategoryFilter,
  productSearch,
  productsCount,
  productStockFilter,
  editingProduct,
  onCancelEdit,
  onCategoryFilterChange,
  onClearFilters,
  onDeleteProduct,
  onEditProduct,
  onImageChange,
  onProductChange,
  onRemoveImage,
  onSaveProduct,
  onSearchChange,
  onStartAddProduct,
  onStockFilterChange,
}) => {
  if (editingProduct) {
    return (
      <ProductForm
        categories={categories}
        isAddingNewProduct={isAddingNewProduct}
        isImageUploading={isImageUploading}
        isLoading={isLoading}
        product={editingProduct}
        onCancel={onCancelEdit}
        onImageChange={onImageChange}
        onProductChange={onProductChange}
        onRemoveImage={onRemoveImage}
        onSave={onSaveProduct}
      />
    );
  }

  return (
    <>
      <div className="admin-section-header">
        <h3>Gerenciamento de Produtos</h3>
        <button onClick={onStartAddProduct} className="btn-primary btn-add">
          <Plus size={18} /> Adicionar Novo Produto
        </button>
      </div>

      <ProductFilters
        categories={categories}
        categoryFilter={productCategoryFilter}
        search={productSearch}
        stockFilter={productStockFilter}
        onCategoryFilterChange={onCategoryFilterChange}
        onClearFilters={onClearFilters}
        onSearchChange={onSearchChange}
        onStockFilterChange={onStockFilterChange}
      />

      <div className="admin-results-count">
        {filteredProducts.length} de {productsCount} produtos
      </div>

      <div className="admin-table-container">
        <ProductTable
          categories={categories}
          products={filteredProducts}
          onDeleteProduct={onDeleteProduct}
          onEditProduct={onEditProduct}
        />
      </div>
    </>
  );
};
