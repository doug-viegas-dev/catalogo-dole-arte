import React from 'react';
import { Heart, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import type { StoreSettings } from '../types';
import { getWhatsappLink } from '../utils/whatsapp';
import '../styles/Hero.scss';

interface HeroProps {
  settings: StoreSettings;
}

export const Hero: React.FC<HeroProps> = ({ settings }) => {
  const whatsappUrl = getWhatsappLink(settings.whatsappNumber);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="tagline">
            <Sparkles size={16} />
            <span>Feito sob medida para momentos únicos</span>
          </div>

          <h1>
            {settings.heroTitle}
            <span className="highlight">Presentes Inesquecíveis</span>
          </h1>

          <p>{settings.heroSubtitle}</p>

          <div className="hero-buttons">
            <button onClick={scrollToCatalog} className="btn-primary">
              <span>Explorar Catálogo</span>
              <ArrowRight size={18} />
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <MessageCircle size={18} />
              <span>Falar com Atendimento</span>
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop" 
            alt="Presentes Personalizados DoLe Arte" 
            className="img-main"
          />
          <div className="floating-card">
            <div className="icon-box">
              <Heart size={28} />
            </div>
            <div className="card-info">
              <h4>100% Personalizado</h4>
              <span>Arte feita especialmente para você</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
