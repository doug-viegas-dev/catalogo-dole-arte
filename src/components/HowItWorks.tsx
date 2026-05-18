import React from 'react';
import { MousePointer, MessageCircle, CheckCircle2, Gift } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: 1,
      title: 'Escolha seu Produto',
      description: 'Navegue pelo nosso catálogo e escolha a peça que mais combina com a ocasião.',
      icon: <MousePointer size={36} />
    },
    {
      step: 2,
      title: 'Chame no WhatsApp',
      description: 'Clique em "Pedir no WhatsApp" e envie sua foto, frase ou ideia de personalização.',
      icon: <MessageCircle size={36} />
    },
    {
      step: 3,
      title: 'Aprovação da Arte',
      description: 'Montamos uma prévia digital da arte com todo carinho para você aprovar antes da produção.',
      icon: <CheckCircle2 size={36} />
    },
    {
      step: 4,
      title: 'Entrega Encantadora',
      description: 'Produzimos e preparamos seu presente em embalagem especial pronto para surpreender!',
      icon: <Gift size={36} />
    }
  ];

  return (
    <section id="como-funciona" className="how-it-works">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <h2>Como funciona o pedido?</h2>
          <p>O processo de compra é simples, humanizado e feito sob medida para você</p>
        </div>

        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.step} className="step-card">
              <div className="step-number">{s.step}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
