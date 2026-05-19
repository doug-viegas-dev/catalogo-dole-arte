import { Search } from 'lucide-react';
import type { Category } from '../../types';
import type { ProductStockFilter } from './types';

interface ProductFiltersProps {
  categories: Category[];
  categoryFilter: string;
  search: string;
  stockFilter: ProductStockFilter;
  onCategoryFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onSearchChange: (value: string) => void;
  onStockFilterChange: (value: ProductStockFilter) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  categoryFilter,
  search,
  stockFilter,
  onCategoryFilterChange,
  onClearFilters,
  onSearchChange,
  onStockFilterChange,
}) => (
  <div className="admin-product-filters">
    <div className="admin-product-search">
      <Search size={18} />
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar produto..."
      />
    </div>

    <select
      value={categoryFilter}
      onChange={(event) => onCategoryFilterChange(event.target.value)}
      aria-label="Filtrar por categoria"
    >
      <option value="all">Todas as categorias</option>
      {categories.filter((category) => category.id !== 'todas').map((category) => (
        <option key={category.id} value={category.id}>{category.name}</option>
      ))}
    </select>

    <select
      value={stockFilter}
      onChange={(event) => onStockFilterChange(event.target.value as ProductStockFilter)}
      aria-label="Filtrar por estoque"
    >
      <option value="all">Todos os status</option>
      <option value="available">Disponiveis</option>
      <option value="out">Esgotados</option>
    </select>

    <button type="button" className="btn-clear-filters" onClick={onClearFilters}>
      Limpar
    </button>
  </div>
);
