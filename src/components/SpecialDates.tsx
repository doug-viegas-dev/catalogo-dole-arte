import React, { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { Product, SpecialDateCategory } from '../types';
import { getWhatsappLink } from '../utils/whatsapp';
import '../styles/SpecialDates.scss';

interface SpecialDatesProps {
  categories: SpecialDateCategory[];
  products: Product[];
  whatsappNumber: string;
}

const formatPrice = (price: number) => (
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
);

export const SpecialDates: React.FC<SpecialDatesProps> = ({ categories, products, whatsappNumber }) => {
  const visibleCategories = useMemo(() => (
    categories.filter((category) => (
      products.some((product) => (
        product.inStock && product.specialDateCategoryIds?.includes(category.id)
      ))
    ))
  ), [categories, products]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const activeCategory = visibleCategories.find((category) => category.id === selectedCategoryId) || visibleCategories[0];

  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];

    return products.filter((product) => (
      product.inStock && product.specialDateCategoryIds?.includes(activeCategory.id)
    ));
  }, [activeCategory, products]);

  if (!activeCategory || categoryProducts.length === 0) return null;

  return (
    <section id="datas-especiais" className="special-dates">
      <div className="container">
        <div className="special-header">
          <h2>Presentes para Datas Especiais</h2>
          <p>Escolha a ocasiao e veja produtos que combinam com esse momento</p>
        </div>

        <div className="special-date-tabs" role="tablist" aria-label="Datas especiais">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={category.id === activeCategory.id ? 'active' : ''}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <span>{category.tag}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="special-date-intro">
          <span>{activeCategory.tag}</span>
          <div>
            <h3>{activeCategory.name}</h3>
            <p>{activeCategory.description}</p>
          </div>
        </div>

        <div className="special-products-grid">
          {categoryProducts.slice(0, 6).map((product) => {
            const image = product.imageUrls?.[0] || product.imageUrl;
            const whatsappLink = getWhatsappLink(whatsappNumber, product.name);

            return (
              <article key={product.id} className="special-product-card">
                {image && <img src={image} alt={product.name} loading="lazy" />}
                <div className="special-product-content">
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                  <div className="special-product-footer">
                    <div>
                      <span>a partir de</span>
                      <strong>{formatPrice(product.price)}</strong>
                    </div>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                      <MessageCircle size={17} />
                      Pedir
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
