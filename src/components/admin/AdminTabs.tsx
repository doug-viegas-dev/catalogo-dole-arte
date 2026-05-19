import type { AdminTab } from './types';

interface AdminTabsProps {
  activeTab: AdminTab;
  categoriesCount: number;
  productsCount: number;
  onChange: (tab: AdminTab) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, categoriesCount, productsCount, onChange }) => (
  <div className="admin-tabs-nav">
    <button
      className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
      onClick={() => onChange('products')}
    >
      Produtos ({productsCount})
    </button>
    <button
      className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
      onClick={() => onChange('categories')}
    >
      Categorias ({categoriesCount})
    </button>
    <button
      className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
      onClick={() => onChange('settings')}
    >
      Configuracoes do Site
    </button>
  </div>
);
