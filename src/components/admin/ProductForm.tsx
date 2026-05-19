import { Image as ImageIcon, Save, Upload, X } from 'lucide-react';
import type { Category, Product } from '../../types';

interface ProductFormProps {
  categories: Category[];
  isAddingNewProduct: boolean;
  isImageUploading: boolean;
  isLoading: boolean;
  product: Product;
  onCancel: () => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProductChange: (product: Product) => void;
  onRemoveImage: (imageUrl: string) => void;
  onSave: (event: React.FormEvent) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  isAddingNewProduct,
  isImageUploading,
  isLoading,
  product,
  onCancel,
  onImageChange,
  onProductChange,
  onRemoveImage,
  onSave,
}) => {
  const images = product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []);
  const handleRequiresMinQuantityChange = (requiresMinQuantity: boolean) => {
    if (requiresMinQuantity) {
      onProductChange({
        ...product,
        requiresMinQuantity,
        minQuantity: product.minQuantity && product.minQuantity > 0 ? product.minQuantity : 1,
      });
      return;
    }

    const productWithoutMinQuantity = { ...product };
    delete productWithoutMinQuantity.minQuantity;
    onProductChange({ ...productWithoutMinQuantity, requiresMinQuantity });
  };

  return (
    <form onSubmit={onSave}>
      <div className="form-header">
        <h3>{isAddingNewProduct ? 'Cadastrar Novo Produto' : `Editar Produto: ${product.name}`}</h3>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Nome do Produto</label>
          <input
            type="text"
            required
            value={product.name}
            onChange={(event) => onProductChange({ ...product, name: event.target.value })}
            className="form-control"
          />
        </div>

        <div className="form-group full-width">
          <label>Descricao Curta</label>
          <textarea
            required
            rows={3}
            value={product.description}
            onChange={(event) => onProductChange({ ...product, description: event.target.value })}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Preco "A partir de" (R$)</label>
          <input
            type="number"
            step="0.01"
            required
            value={product.price}
            onChange={(event) => onProductChange({ ...product, price: parseFloat(event.target.value) || 0 })}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Categoria</label>
          <select
            value={product.category}
            onChange={(event) => onProductChange({ ...product, category: event.target.value })}
            className="form-control"
          >
            {categories.filter((category) => category.id !== 'todas').length === 0 && (
              <option value="">Cadastre uma categoria primeiro</option>
            )}
            {categories.filter((category) => category.id !== 'todas').map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="upload-box">
          <label className="upload-label">
            <Upload size={20} />
            Fotos do Produto
          </label>
          <p className="upload-desc">
            As imagens sao otimizadas e enviadas para armazenamento antes de salvar o produto.
          </p>

          <div className="upload-actions">
            <label className="btn-choose">
              <ImageIcon size={20} /> Escolher Fotos...
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onImageChange} className="hidden-input" />
            </label>

            {isImageUploading && <span className="converting-msg">Enviando imagens...</span>}
          </div>

          {images.length > 0 && (
            <div className="preview-grid">
              {images.map((imageUrl, index) => (
                <div className="preview-card" key={`${imageUrl}-${index}`}>
                  <img src={imageUrl} alt={`Previa ${index + 1}`} className="img-preview" />
                  <button type="button" className="btn-remove-image" onClick={() => onRemoveImage(imageUrl)} aria-label="Remover foto">
                    <X size={14} />
                  </button>
                  {index === 0 && <span className="main-image-badge">Principal</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Status de Estoque</label>
          <select
            value={product.inStock ? 'true' : 'false'}
            onChange={(event) => onProductChange({ ...product, inStock: event.target.value === 'true' })}
            className="form-control"
          >
            <option value="true">Disponivel em Estoque</option>
            <option value="false">Esgotado / Indisponivel</option>
          </select>
        </div>

        <div className="form-group">
          <label>Destaque na Pagina Inicial</label>
          <select
            value={product.featured ? 'true' : 'false'}
            onChange={(event) => onProductChange({ ...product, featured: event.target.value === 'true' })}
            className="form-control"
          >
            <option value="true">Sim, exibir com destaque</option>
            <option value="false">Nao</option>
          </select>
        </div>

        <div className="form-group">
          <label>Pedido Minimo</label>
          <label className="checkbox-control">
            <input
              type="checkbox"
              checked={product.requiresMinQuantity}
              onChange={(event) => handleRequiresMinQuantityChange(event.target.checked)}
            />
            <span>Exige quantidade minima por pedido</span>
          </label>
        </div>

        {product.requiresMinQuantity && (
          <div className="form-group">
            <label>Quantidade Minima por Pedido</label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={product.minQuantity || 1}
              onChange={(event) => onProductChange({
                ...product,
                minQuantity: Math.max(1, parseInt(event.target.value, 10) || 1),
              })}
              className="form-control"
            />
          </div>
        )}

        <div className="form-submit-row">
          <button type="submit" disabled={isLoading || isImageUploading} className="btn-primary btn-save-full">
            <Save size={22} /> {isLoading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </div>
    </form>
  );
};
