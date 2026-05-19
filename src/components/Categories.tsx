import React from 'react';
import type { Category } from '../types';
import { renderCategoryIcon } from '../utils/categoryIcons';
import '../styles/Categories.scss';

interface CategoriesProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ categories, activeCategory, onSelectCategory }) => {
  const handleClick = (id: string) => {
    onSelectCategory(id);
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="categorias" className="categories">
      <div className="container">
        <div className="section-header">
          <h2>O que você procura hoje?</h2>
          <p>Navegue pelas nossas categorias e encontre a lembrança perfeita</p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleClick(cat.id)}
            >
              <div className="cat-icon">
                {renderCategoryIcon(cat.icon, 32)}
              </div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
