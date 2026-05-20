import React, { Suspense, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { Catalog } from './components/Catalog';
import { HowItWorks } from './components/HowItWorks';
import { SpecialDates } from './components/SpecialDates';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import './App.scss';

import { storeService } from './services/store';
import type { Product, StoreSettings, Category, SpecialDateCategory } from './types';

const AdminPanel = React.lazy(() => (
  import('./components/AdminPanel').then((module) => ({ default: module.AdminPanel }))
));

const PANEL_HOSTNAME = 'painel.dolearte.com';
const STORE_URL = 'https://dolearte.com';

const isPanelHost = () => window.location.hostname === PANEL_HOSTNAME;
const getInitialPage = (): 'home' | 'admin' => (
  isPanelHost() || window.location.hash === '#admin' ? 'admin' : 'home'
);

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(storeService.getCategories());
  const [specialDateCategories, setSpecialDateCategories] = useState<SpecialDateCategory[]>(
    storeService.getSpecialDateCategories(),
  );
  const [settings, setSettings] = useState<StoreSettings>(storeService.getSettings());
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>(getInitialPage);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPage(getInitialPage());
      window.scrollTo(0, 0);
    };

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { firebaseService } = await import('./services/firebase');
        const loadedProducts = await firebaseService.syncProductsFromFirebase();
        const loadedCategories = await firebaseService.syncCategoriesFromFirebase();
        const loadedSpecialDateCategories = await firebaseService.syncSpecialDateCategoriesFromFirebase();
        const loadedSettings = await firebaseService.getSettingsFromFirebase();
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setSpecialDateCategories(loadedSpecialDateCategories);
        setSettings(loadedSettings);
      } catch (err) {
        console.error('Error in initial load, using local storage fallback', err);
        setProducts(storeService.getProducts());
        setCategories(storeService.getCategories());
        setSpecialDateCategories(storeService.getSpecialDateCategories());
        setSettings(storeService.getSettings());
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    storeService.saveProducts(updatedProducts);
  };

  const handleUpdateCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    storeService.saveCategories(updatedCategories);
  };

  const handleUpdateSpecialDateCategories = (updatedCategories: SpecialDateCategory[]) => {
    setSpecialDateCategories(updatedCategories);
    storeService.saveSpecialDateCategories(updatedCategories);
  };

  const handleUpdateSettings = (updatedSettings: StoreSettings) => {
    setSettings(updatedSettings);
    storeService.saveSettings(updatedSettings);
  };

  const handleBackToStore = () => {
    if (isPanelHost()) {
      window.location.href = STORE_URL;
      return;
    }

    window.location.hash = '';
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-container">
          <div className="spinner" />
          <span>Carregando Loja DoLe Arte...</span>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <Suspense fallback={<div className="app-loading-screen"><div className="loading-container"><div className="spinner" /><span>Carregando painel...</span></div></div>}>
        <AdminPanel 
          products={products}
          settings={settings}
          categories={categories}
          specialDateCategories={specialDateCategories}
          onUpdateProducts={handleUpdateProducts}
          onUpdateSettings={handleUpdateSettings}
          onUpdateCategories={handleUpdateCategories}
          onUpdateSpecialDateCategories={handleUpdateSpecialDateCategories}
          onBackToStore={handleBackToStore}
        />
      </Suspense>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar settings={settings} />

      <main>
        <Hero settings={settings} />

        <Categories 
          categories={categories} 
          activeCategory={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
        />

        <Catalog 
          products={products}
          categories={categories}
          whatsappNumber={settings.whatsappNumber}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
        />

        <HowItWorks />

        <SpecialDates
          categories={specialDateCategories}
          products={products}
          whatsappNumber={settings.whatsappNumber}
        />

        <About settings={settings} />

        <Contact settings={settings} />
      </main>

      <Footer settings={settings} />
    </div>
  );
};

export default App;
