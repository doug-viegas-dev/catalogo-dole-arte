import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X } from 'lucide-react';
import type { StoreSettings } from '../types';
import { getWhatsappLink } from '../utils/whatsapp';
import { InstagramIcon } from './InstagramIcon';

interface NavbarProps {
  settings: StoreSettings;
}

  export const Navbar: React.FC<NavbarProps> = ({ settings }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }

        const sections = ['hero', 'categorias', 'catalogo', 'como-funciona', 'datas-especiais', 'sobre', 'contato'];
        for (const s of sections) {
          const el = document.getElementById(s);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
              setActiveSection(s);
              break;
            }
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
      setMobileMenuOpen(false);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const whatsappUrl = getWhatsappLink(settings.whatsappNumber);

    return (
      <>
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="container nav-container">
            <div className="logo" onClick={() => scrollTo('hero')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="DoLe Arte Logo" style={{ height: '64px', width: 'auto', objectFit: 'contain' }} />
            </div>

          <ul className="nav-links">
            <li>
              <a 
                href="#catalogo" 
                className={activeSection === 'catalogo' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); scrollTo('catalogo'); }}
              >
                Catálogo
              </a>
            </li>
            <li>
              <a 
                href="#como-funciona" 
                className={activeSection === 'como-funciona' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); scrollTo('como-funciona'); }}
              >
                Como Funciona
              </a>
            </li>
            <li>
              <a 
                href="#datas-especiais" 
                className={activeSection === 'datas-especiais' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); scrollTo('datas-especiais'); }}
              >
                Datas Especiais
              </a>
            </li>
            <li>
              <a 
                href="#sobre" 
                className={activeSection === 'sobre' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); scrollTo('sobre'); }}
              >
                Sobre
              </a>
            </li>
            <li>
              <a 
                href="#contato" 
                className={activeSection === 'contato' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); scrollTo('contato'); }}
              >
                Contato
              </a>
            </li>
          </ul>

          <div className="nav-actions">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" title="Falar no WhatsApp">
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </a>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="menu-toggle" aria-label="Menu">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul className="mobile-links">
            <li>
              <a href="#catalogo" onClick={(e) => { e.preventDefault(); scrollTo('catalogo'); }}>
                Catálogo de Produtos
              </a>
            </li>
            <li>
              <a href="#como-funciona" onClick={(e) => { e.preventDefault(); scrollTo('como-funciona'); }}>
                Como Funciona o Pedido
              </a>
            </li>
            <li>
              <a href="#datas-especiais" onClick={(e) => { e.preventDefault(); scrollTo('datas-especiais'); }}>
                Datas Especiais
              </a>
            </li>
            <li>
              <a href="#sobre" onClick={(e) => { e.preventDefault(); scrollTo('sobre'); }}>
                Sobre a Loja
              </a>
            </li>
            <li>
              <a href="#contato" onClick={(e) => { e.preventDefault(); scrollTo('contato'); }}>
                Contato
              </a>
            </li>
            <li>
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}>
                <InstagramIcon size={20} /> Instagram da Loja
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
