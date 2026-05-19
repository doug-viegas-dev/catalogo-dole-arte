import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { Catalog } from './components/Catalog';
import { HowItWorks } from './components/HowItWorks';
import { SpecialDates } from './components/SpecialDates';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import './App.scss';

import { SPECIAL_DATES, storeService } from './services/store';
import { firebaseService } from './services/firebase';
import type { Product, StoreSettings, Category } from './types';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(storeService.getCategories());
  const [settings, setSettings] = useState<StoreSettings>(storeService.getSettings());
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verifica a rota atual via hash
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
        window.scrollTo(0, 0);
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const loadedProducts = await firebaseService.syncProductsFromFirebase();
        const loadedCategories = await firebaseService.syncCategoriesFromFirebase();
        const loadedSettings = await firebaseService.getSettingsFromFirebase();
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setSettings(loadedSettings);
      } catch (err) {
        console.error('Error in initial load, using local storage fallback', err);
        setProducts(storeService.getProducts());
        setCategories(storeService.getCategories());
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

  const handleUpdateSettings = (updatedSettings: StoreSettings) => {
    setSettings(updatedSettings);
    storeService.saveSettings(updatedSettings);
  };

  const handleBackToStore = () => {
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
      <AdminPanel 
        products={products}
        settings={settings}
        categories={categories}
        onUpdateProducts={handleUpdateProducts}
        onUpdateSettings={handleUpdateSettings}
        onUpdateCategories={handleUpdateCategories}
        onBackToStore={handleBackToStore}
      />
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

        {SPECIAL_DATES.length > 0 && <SpecialDates items={SPECIAL_DATES} />}

        <About settings={settings} />

        <Contact settings={settings} />
      </main>

      <Footer settings={settings} />
    </div>
  );
};

export default App;
