import React, { useState, useMemo, useEffect } from 'react';
import { Search, MessageCircle, AlertCircle } from 'lucide-react';
import type { Product, Category } from '../types';
import { getWhatsappLink } from '../utils/whatsapp';
import '../styles/Catalog.scss';

interface CatalogProps {
  products: Product[];
  categories: Category[];
  whatsappNumber: string;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

const ProductImageCarousel: React.FC<{ product: Product }> = ({ product }) => {
  const images = product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []);
  const [activeIndex, setActiveIndex] = useState(0);
  const displayIndex = images.length ? activeIndex % images.length : 0;

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [images.length, product.id]);

  return (
    <>
      {images.map((imageUrl, index) => (
        <img
          key={`${imageUrl}-${index}`}
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className={index === displayIndex ? 'active' : ''}
        />
      ))}
      {images.length > 1 && (
        <div className="carousel-dots" aria-hidden="true">
          {images.map((_, index) => (
            <span key={index} className={index === displayIndex ? 'active' : ''} />
          ))}
        </div>
      )}
    </>
  );
};

export const Catalog: React.FC<CatalogProps> = ({ 
  products, 
  categories, 
  whatsappNumber, 
  selectedCategory, 
  onSelectCategory 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'todas' || product.category === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch && product.inStock;
    });
  }, [products, selectedCategory, searchTerm]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <section id="catalogo" className="catalog">
      <div className="container">
        <div className="catalog-header">
          <h2>Catálogo de Produtos</h2>
          <p>Escolha o produto ideal e envie sua ideia de personalização pelo WhatsApp</p>
        </div>

        <div className="filter-bar">
          <div className="category-tabs">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                className={selectedCategory === cat.id ? 'active' : ''}
                onClick={() => onSelectCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="search-input">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou detalhe..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-results">
            <AlertCircle size={48} className="no-results-icon" />
            <h3>Nenhum produto encontrado</h3>
            <p>Tente buscar por outro termo ou navegue por todas as categorias.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const whatsappLink = getWhatsappLink(whatsappNumber, product.name);
              return (
                <div key={product.id} className="product-card">
                  <div className="img-wrapper">
                    <ProductImageCarousel product={product} />
                    {product.minQuantity && (
                      <span className="badge">Min. {product.minQuantity} un.</span>
                    )}
                    {!product.minQuantity && product.featured && (
                      <span className="badge">Destaque</span>
                    )}
                  </div>

                  <div className="card-content">
                    <h3>{product.name}</h3>
                    <p className="description">{product.description}</p>

                    <div className="card-footer">
                      <div className="price-block">
                        <span className="label">a partir de</span>
                        <span className="price">{formatPrice(product.price)}</span>
                      </div>

                      <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-whatsapp btn-order-whatsapp"
                      >
                        <MessageCircle size={18} />
                        <span>Pedir no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
