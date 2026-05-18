import React from 'react';
import type { SpecialDateItem } from '../types';

interface SpecialDatesProps {
  items: SpecialDateItem[];
}

export const SpecialDates: React.FC<SpecialDatesProps> = ({ items }) => {
  return (
    <section id="datas-especiais" className="special-dates">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2>Presentes para Datas Especiais</h2>
          <p>Inspirações para emocionar em todas as épocas do ano</p>
        </div>

        <div className="dates-grid">
          {items.map((item) => (
            <div key={item.id} className="date-card">
              <img src={item.imageUrl} alt={item.title} loading="lazy" />
              <div className="overlay">
                <span className="date-tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
