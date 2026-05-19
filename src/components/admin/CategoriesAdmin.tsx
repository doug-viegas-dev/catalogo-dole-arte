import { Edit, Plus, Save, Trash2 } from 'lucide-react';
import type { Category } from '../../types';
import { CATEGORY_ICON_OPTIONS, renderCategoryIcon } from '../../utils/categoryIcons';

interface CategoriesAdminProps {
  categories: Category[];
  editingCategory: Category | null;
  isAddingNewCategory: boolean;
  isLoading: boolean;
  onCancelEdit: () => void;
  onCategoryChange: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (category: Category) => void;
  onSaveCategory: (event: React.FormEvent) => void;
  onStartAddCategory: () => void;
}

export const CategoriesAdmin: React.FC<CategoriesAdminProps> = ({
  categories,
  editingCategory,
  isAddingNewCategory,
  isLoading,
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
          <h3>{isAddingNewCategory ? 'Cadastrar Nova Categoria' : `Editar Categoria: ${editingCategory.name}`}</h3>
          <button type="button" onClick={onCancelEdit} className="btn-secondary">
            Cancelar
          </button>
        </div>

        <div className="form-grid max-w-600">
          <div className="form-group full-width">
            <label>Nome da Categoria</label>
            <input
              type="text"
              required
              value={editingCategory.name}
              onChange={(event) => onCategoryChange({ ...editingCategory, name: event.target.value })}
              placeholder="Ex: Quadros Decorativos"
              className="form-control"
            />
          </div>

          <div className="form-group full-width">
            <label>Icone da Categoria</label>
            <div className="icon-picker" role="radiogroup" aria-label="Icone da categoria">
              {CATEGORY_ICON_OPTIONS.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  className={`icon-option ${editingCategory.icon === option.name ? 'active' : ''}`}
                  onClick={() => onCategoryChange({ ...editingCategory, icon: option.name })}
                  aria-pressed={editingCategory.icon === option.name}
                >
                  {renderCategoryIcon(option.name, 22)}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-submit-row">
            <button type="submit" disabled={isLoading} className="btn-primary btn-save-full">
              <Save size={22} /> {isLoading ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="admin-section-header">
        <h3>Gerenciar Categorias da Loja</h3>
        <button onClick={onStartAddCategory} className="btn-primary btn-add">
          <Plus size={18} /> Adicionar Nova Categoria
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="th-icon">Icone</th>
              <th>Nome da Categoria</th>
              <th className="th-actions">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td data-label="Icone" className="cell-icon-col">
                  {renderCategoryIcon(category.icon, 24)}
                </td>
                <td data-label="Categoria" className="cell-bold">
                  {category.name} {category.id === 'todas' && <span className="cat-fixed-badge">(Fixo)</span>}
                </td>
                <td data-label="Acoes">
                  {category.id !== 'todas' && (
                    <div className="actions-cell">
                      <button onClick={() => onEditCategory(category)} className="btn-edit">
                        <Edit size={16} /> Editar
                      </button>
                      <button onClick={() => onDeleteCategory(category.id)} className="btn-delete">
                        <Trash2 size={16} /> Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
