import { Edit, Trash2 } from 'lucide-react';
import type { Category, Product } from '../../types';

interface ProductTableProps {
  categories: Category[];
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ categories, products, onDeleteProduct, onEditProduct }) => {
  if (products.length === 0) {
    return (
      <div className="admin-empty-state">
        Nenhum produto encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Imagem</th>
          <th>Nome do Produto</th>
          <th>Categoria</th>
          <th>Preco Inicial</th>
          <th>Estoque</th>
          <th>Acoes</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td data-label="Imagem">
              <img src={product.imageUrl} alt={product.name} className="table-img" />
            </td>
            <td data-label="Produto" className="cell-bold">{product.name}</td>
            <td data-label="Categoria" className="cell-category">
              {categories.find((category) => category.id === product.category)?.name || product.category}
            </td>
            <td data-label="Preco" className="cell-price">R$ {product.price.toFixed(2)}</td>
            <td data-label="Estoque">
              <span className={`stock-badge ${product.inStock ? 'available' : 'out'}`}>
                {product.inStock ? 'Disponivel' : 'Esgotado'}
              </span>
            </td>
            <td data-label="Acoes">
              <div className="actions-cell">
                <button onClick={() => onEditProduct(product)} className="btn-edit">
                  <Edit size={16} /> Editar
                </button>
                <button onClick={() => onDeleteProduct(product.id)} className="btn-delete">
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
