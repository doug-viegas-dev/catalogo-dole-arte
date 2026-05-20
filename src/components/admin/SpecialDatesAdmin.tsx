import { Edit, Plus, Save, Trash2 } from 'lucide-react';
import type { Product, SpecialDateCategory } from '../../types';

interface SpecialDatesAdminProps {
  editingCategory: SpecialDateCategory | null;
  isAddingNewCategory: boolean;
  isLoading: boolean;
  products: Product[];
  specialDateCategories: SpecialDateCategory[];
  onCancelEdit: () => void;
  onCategoryChange: (category: SpecialDateCategory) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (category: SpecialDateCategory) => void;
  onSaveCategory: (event: React.FormEvent) => void;
  onStartAddCategory: () => void;
}

export const SpecialDatesAdmin: React.FC<SpecialDatesAdminProps> = ({
  editingCategory,
  isAddingNewCategory,
  isLoading,
  products,
  specialDateCategories,
  onCancelEdit,
  onCategoryChange,
  onDeleteCategory,
  onEditCategory,
  onSaveCategory,
  onStartAddCategory,
}) => {
  if (editingCategory) {
    return (
      <form onSubmit={onSaveCategory}>
        <div className="form-header">
          <h3>{isAddingNewCategory ? 'Cadastrar Data Especial' : `Editar Data: ${editingCategory.name}`}</h3>
          <button type="button" onClick={onCancelEdit} className="btn-secondary">
            Cancelar
          </button>
        </div>

        <div className="form-grid max-w-600">
          <div className="form-group full-width">
            <label>Nome da Data</label>
            <input
              type="text"
              required
              value={editingCategory.name}
              onChange={(event) => onCategoryChange({ ...editingCategory, name: event.target.value })}
              placeholder="Ex: Dia das Maes"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Etiqueta</label>
            <input
              type="text"
              required
              maxLength={30}
              value={editingCategory.tag}
              onChange={(event) => onCategoryChange({ ...editingCategory, tag: event.target.value })}
              placeholder="Ex: Maio"
              className="form-control"
            />
          </div>

          <div className="form-group full-width">
            <label>Descricao</label>
            <textarea
              required
              rows={3}
              value={editingCategory.description}
              onChange={(event) => onCategoryChange({ ...editingCategory, description: event.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-submit-row">
            <button type="submit" disabled={isLoading} className="btn-primary btn-save-full">
              <Save size={22} /> {isLoading ? 'Salvando...' : 'Salvar Data Especial'}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="admin-section-header">
        <div>
          <h3>Datas especiais</h3>
          <p className="settings-desc">
            Cadastre as datas aqui. Depois, abra um produto e marque em quais datas ele deve aparecer.
          </p>
        </div>
        <button onClick={onStartAddCategory} className="btn-primary btn-add">
          <Plus size={18} /> Adicionar Data
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data especial</th>
              <th>Etiqueta</th>
              <th>Produtos</th>
              <th className="th-actions">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {specialDateCategories.map((category) => {
              const productCount = products.filter((product) => (
                product.specialDateCategoryIds?.includes(category.id)
              )).length;

              return (
                <tr key={category.id}>
                  <td data-label="Data especial" className="cell-bold">
                    {category.name}
                    <span className="cell-subtext">{category.description}</span>
                  </td>
                  <td data-label="Etiqueta" className="cell-category">{category.tag}</td>
                  <td data-label="Produtos">
                    <span className="stock-badge available">{productCount} produtos</span>
                  </td>
                  <td data-label="Acoes">
                    <div className="actions-cell">
                      <button onClick={() => onEditCategory(category)} className="btn-edit">
                        <Edit size={16} /> Editar
                      </button>
                      <button onClick={() => onDeleteCategory(category.id)} className="btn-delete">
                        <Trash2 size={16} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
