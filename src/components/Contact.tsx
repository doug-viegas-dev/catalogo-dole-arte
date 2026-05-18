import React from 'react';
import { MessageCircle, Mail, Clock } from 'lucide-react';
import type { StoreSettings } from '../types';
import { getWhatsappLink } from '../utils/whatsapp';
import { InstagramIcon } from './InstagramIcon';
import '../styles/Contact.scss';

interface ContactProps {
  settings: StoreSettings;
}

export const Contact: React.FC<ContactProps> = ({ settings }) => {
  const whatsappUrl = getWhatsappLink(settings.whatsappNumber);

  return (
    <section id="contato" className="contact">
      <div className="container">
        <div className="contact-box">
          <h2>Vamos criar algo incrível juntos?</h2>
          <p>Entre em contato pelo nosso WhatsApp ou acompanhe nossas novidades no Instagram</p>

          <div className="contact-buttons">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-contact-large">
              <MessageCircle size={22} />
              <span>Falar no WhatsApp</span>
            </a>

            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-instagram">
              <InstagramIcon size={22} />
              <span>Seguir no Instagram</span>
            </a>
          </div>

          <div className="contact-info">
            <div className="info-item">
              <Clock size={20} />
              <span>{settings.contactHours}</span>
            </div>
            <div className="info-item">
              <Mail size={20} />
              <span>{settings.contactEmail}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
