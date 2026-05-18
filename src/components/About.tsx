import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, Smile } from 'lucide-react';
import type { StoreSettings } from '../types';

interface AboutProps {
  settings: StoreSettings;
}

export const About: React.FC<AboutProps> = ({ settings }) => {
  return (
    <section id="sobre" className="about">
      <div className="container about-container">
        <div className="about-images">
          <img 
            src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop" 
            alt="Produção DoLe Arte" 
            className="img-1"
          />
          <div className="badge-box">
            <h4>100%</h4>
            <p>Amor em cada detalhe</p>
          </div>
        </div>

        <div className="about-content">
          <h2>Sobre a DoLe Arte</h2>
          <div className="lead">Criatividade, dedicação e afeto que se transformam em memórias inesquecíveis.</div>
          
          <p>{settings.aboutText}</p>

          <div className="features">
            <div className="feat-item">
              <div className="feat-icon"><HeartHandshake size={24} /></div>
              <span>Atendimento Humanizado</span>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><ShieldCheck size={24} /></div>
              <span>Qualidade Premium Impecável</span>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><Sparkles size={24} /></div>
              <span>Estamparia de Alta Definição</span>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><Smile size={24} /></div>
              <span>Aprovação Prévia da Arte</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
