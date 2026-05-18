import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import type { StoreSettings } from '../types';
import { getWhatsappLink } from '../utils/whatsapp';
import { InstagramIcon } from './InstagramIcon';
import '../styles/Footer.scss';

interface FooterProps {
  settings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const whatsappUrl = getWhatsappLink(settings.whatsappNumber);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-footer">DoLe Arte</div>
            <p>Presentes personalizados feitos com dedicação, carinho e muito cuidado para tornar cada momento inesquecível.</p>
          </div>

          <div className="footer-links">
            <h4>Navegação Rápida</h4>
            <ul>
              <li><a href="#catalogo">Catálogo de Produtos</a></li>
              <li><a href="#como-funciona">Como Funciona</a></li>
              <li><a href="#datas-especiais">Datas Especiais</a></li>
              <li><a href="#sobre">Sobre a Loja</a></li>
              <li><a href="#contato">Contato</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>Redes Sociais</h4>
            <ul>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </li>
              <li>
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <InstagramIcon size={18} /> Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright-row">
            <span>&copy; {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.</span>
            <a href="#admin" className="admin-secret-link" title="Acesso Reservado">
              🔒
            </a>
          </div>
          <div>
            Desenvolvido com <Heart size={14} className="heart" /> para encantar.
          </div>
        </div>
      </div>
    </footer>
  );
};
