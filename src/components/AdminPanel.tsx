import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, CheckCircle, Database, AlertTriangle, ArrowLeft, Upload, Image as ImageIcon, LogOut, Sparkles, Coffee, LayoutGrid, Shirt, Gift, Heart } from 'lucide-react';
import type { Product, StoreSettings, Category } from '../types';
import { firebaseService } from '../services/firebase';
import { convertToWebP } from '../utils/image';
import '../styles/AdminPanel.scss';

interface AdminPanelProps {
  products: Product[];
  settings: StoreSettings;
  categories: Category[];
  onUpdateProducts: (updated: Product[]) => void;
  onUpdateSettings: (updated: StoreSettings) => void;
  onUpdateCategories: (updated: Category[]) => void;
  onBackToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  settings,
  categories,
  onUpdateProducts,
  onUpdateSettings,
  onUpdateCategories,
  onBackToStore,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee size={24} />;
      case 'LayoutGrid': return <LayoutGrid size={24} />;
      case 'Shirt': return <Shirt size={24} />;
      case 'Gift': return <Gift size={24} />;
      case 'Heart': return <Heart size={24} />;
      default: return <Sparkles size={24} />;
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setEmailInput(user.email || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings'>('products');
  
  // Estado para Produtos
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  // Estado para Categorias
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  // Estado para Configurações
  const [localSettings, setLocalSettings] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);

    try {
      if (firebaseService.isConfigured() && emailInput) {
        await firebaseService.loginAdmin(emailInput, passwordInput);
        setIsAuthenticated(true);
      } else if (passwordInput === 'dolearte2026') {
        setIsAuthenticated(true);
      } else {
        setAuthError('Informe o e-mail cadastrado ou verifique a senha.');
      }
    } catch (err) {
      console.error(err);
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setAuthError('E-mail ou senha incorretos.');
      } else {
        setAuthError('Erro na autenticação. Verifique as credenciais no Firebase.');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setLoadingAuth(true);
    try {
      if (firebaseService.isConfigured()) {
        await firebaseService.loginWithGoogle();
        setIsAuthenticated(true);
      } else {
        setAuthError('Firebase não está configurado para autenticação na nuvem.');
      }
    } catch (err) {
      console.error('Erro no login do Google:', err);
      setAuthError('Não foi possível entrar com o Google.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await firebaseService.logoutAdmin();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Upload e Conversão de Imagem para WebP
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setImgUploading(true);
    try {
      const webpDataUrl = await convertToWebP(file, 1000, 0.85);
      setEditingProduct({ ...editingProduct, imageUrl: webpDataUrl });
    } catch (err) {
      console.error(err);
      alert('Erro ao converter imagem para WebP.');
    } finally {
      setImgUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);
    try {
      await firebaseService.saveProductToFirebase(editingProduct);
      
      let updatedList = [...products];
      if (isAddingNewProduct) {
        updatedList.push(editingProduct);
      } else {
        updatedList = updatedList.map(p => p.id === editingProduct.id ? editingProduct : p);
      }

      onUpdateProducts(updatedList);
      setEditingProduct(null);
      setIsAddingNewProduct(false);
      setSaveSuccess('Produto salvo com sucesso!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar o produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await firebaseService.deleteProductFromFirebase(id);
      const updatedList = products.filter(p => p.id !== id);
      onUpdateProducts(updatedList);
      setSaveSuccess('Produto excluído com sucesso!');
      setTimeout(() => setSaveSuccess(''), 3000);
    }
  };

  const handleStartAddProduct = () => {
    setIsAddingNewProduct(true);
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      category: categories[1]?.id || 'canecas',
      imageUrl: '',
      inStock: true,
      featured: false,
    });
  };

  // Funções de Categorias
  const handleStartAddCategory = () => {
    setIsAddingNewCategory(true);
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      icon: 'Sparkles',
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setLoading(true);
    try {
      // Se for nova, cria o ID simples em lowercase
      const finalCat = { ...editingCategory };
      if (isAddingNewCategory) {
        const slugId = finalCat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        finalCat.id = slugId || finalCat.id;
      }

      await firebaseService.saveCategoryToFirebase(finalCat);

      let updatedList = [...categories];
      if (isAddingNewCategory) {
        updatedList.push(finalCat);
      } else {
        updatedList = updatedList.map(c => c.id === finalCat.id ? finalCat : c);
      }

      onUpdateCategories(updatedList);
      setEditingCategory(null);
      setIsAddingNewCategory(false);
      setSaveSuccess('Categoria salva com sucesso!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar a categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (id === 'todas') {
      alert('A categoria principal não pode ser excluída.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await firebaseService.deleteCategoryFromFirebase(id);
      const updatedList = categories.filter(c => c.id !== id);
      onUpdateCategories(updatedList);
      setSaveSuccess('Categoria excluída com sucesso!');
      setTimeout(() => setSaveSuccess(''), 3000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebaseService.saveSettingsToFirebase(localSettings);
      onUpdateSettings(localSettings);
      setSaveSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button onClick={onBackToStore} className="btn-secondary btn-back">
            <ArrowLeft size={16} /> Voltar para a Loja
          </button>
          <h2>
            <Database size={22} /> Painel Administrativo DoLe Arte
          </h2>
        </div>
        <div className="admin-topbar-right">
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn-secondary btn-logout">
              <LogOut size={16} /> Sair
            </button>
          )}
          <div className="ssl-badge">Ambiente Seguro • SSL</div>
        </div>
      </header>

      <main className="container admin-main-container">
        {!isAuthenticated ? (
          <div className="auth-card">
            <h3 className="auth-title">Acesso Restrito</h3>
            <p className="auth-subtitle">
              Entre com seu e-mail e senha de administrador para gerenciar o catálogo da loja.
            </p>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="E-mail do administrador..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Senha secreta..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="auth-input"
              />
              {authError && <div className="auth-error">{authError}</div>}
              <button type="submit" disabled={loadingAuth} className="btn-primary auth-btn">
                {loadingAuth ? 'Autenticando...' : 'Acessar Painel com E-mail'}
              </button>

              <div className="divider-row">
                <div className="line" />
                <span>ou</span>
                <div className="line" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loadingAuth}
                className="btn-google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continuar com o Google
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-content-card">
            <div className="admin-tabs-nav">
              <button
                className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => { setActiveTab('products'); setEditingProduct(null); setIsAddingNewProduct(false); setEditingCategory(null); }}
              >
                Produtos ({products.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => { setActiveTab('categories'); setEditingCategory(null); setIsAddingNewCategory(false); setEditingProduct(null); }}
              >
                Categorias ({categories.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('settings'); setEditingProduct(null); setEditingCategory(null); }}
              >
                Configurações do Site
              </button>
            </div>

            {saveSuccess && (
              <div className="admin-alert-success">
                <CheckCircle size={22} />
                <span>{saveSuccess}</span>
              </div>
            )}

            {!firebaseService.isConfigured() && (
              <div className="admin-alert-warning">
                <AlertTriangle size={22} className="alert-icon" />
                <span>
                  Modo de Armazenamento Local (LocalStorage). Para sincronizar na nuvem, insira suas chaves do Firebase no arquivo <code>.env</code>.
                </span>
              </div>
            )}

            {/* ABA: PRODUTOS */}
            {activeTab === 'products' && !editingProduct && (
              <>
                <div className="admin-section-header">
                  <h3>Gerenciamento de Produtos</h3>
                  <button onClick={handleStartAddProduct} className="btn-primary btn-add">
                    <Plus size={18} /> Adicionar Novo Produto
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Imagem</th>
                        <th>Nome do Produto</th>
                        <th>Categoria</th>
                        <th>Preço Inicial</th>
                        <th>Estoque</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod.id}>
                          <td>
                            <img src={prod.imageUrl} alt={prod.name} className="table-img" />
                          </td>
                          <td className="cell-bold">{prod.name}</td>
                          <td className="cell-category">
                            {categories.find(c => c.id === prod.category)?.name || prod.category}
                          </td>
                          <td className="cell-price">R$ {prod.price.toFixed(2)}</td>
                          <td>
                            <span className={`stock-badge ${prod.inStock ? 'available' : 'out'}`}>
                              {prod.inStock ? 'Disponível' : 'Esgotado'}
                            </span>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button onClick={() => setEditingProduct(prod)} className="btn-edit">
                                <Edit size={16} /> Editar
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="btn-delete">
                                <Trash2 size={16} /> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* FORMULÁRIO DE PRODUTO */}
            {activeTab === 'products' && editingProduct && (
              <form onSubmit={handleSaveProduct}>
                <div className="form-header">
                  <h3>
                    {isAddingNewProduct ? 'Cadastrar Novo Produto' : `Editar Produto: ${editingProduct.name}`}
                  </h3>
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nome do Produto</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Descrição Curta</label>
                    <textarea
                      required
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Preço "A partir de" (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoria</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="form-control"
                    >
                      {categories.filter(c => c.id !== 'todas').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* UPLOAD DE ARQUIVO DE IMAGEM */}
                  <div className="upload-box">
                    <label className="upload-label">
                      <Upload size={20} />
                      Enviar Foto do Produto (Conversão Automática para WebP)
                    </label>
                    <p className="upload-desc">
                      Selecione um arquivo de imagem. Ele será automaticamente redimensionado e convertido para o formato WebP para garantir máxima velocidade de carregamento e economia de banco de dados.
                    </p>

                    <div className="upload-actions">
                      <label className="btn-choose">
                        <ImageIcon size={20} /> Escolher Arquivo...
                        <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden-input" />
                      </label>

                      {imgUploading && <span className="converting-msg">Convertendo imagem para WebP... ⏳</span>}
                    </div>

                    {editingProduct.imageUrl && (
                      <div className="preview-box">
                        <img src={editingProduct.imageUrl} alt="Prévia" className="img-preview" />
                        <div className="preview-info">
                          <span className="ready-title">✓ Imagem pronta no formato WebP</span>
                          <span className="url-text">{editingProduct.imageUrl.substring(0, 60)}...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Status de Estoque</label>
                    <select
                      value={editingProduct.inStock ? 'true' : 'false'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'true' })}
                      className="form-control"
                    >
                      <option value="true">Disponível em Estoque</option>
                      <option value="false">Esgotado / Indisponível</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Destaque na Página Inicial</label>
                    <select
                      value={editingProduct.featured ? 'true' : 'false'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.value === 'true' })}
                      className="form-control"
                    >
                      <option value="true">Sim, exibir com destaque</option>
                      <option value="false">Não</option>
                    </select>
                  </div>

                  <div className="form-submit-row">
                    <button type="submit" disabled={loading || imgUploading} className="btn-primary btn-save-full">
                      <Save size={22} /> {loading ? 'Salvando...' : 'Salvar Produto no Catálogo'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ABA: CATEGORIAS */}
            {activeTab === 'categories' && !editingCategory && (
              <>
                <div className="admin-section-header">
                  <h3>Gerenciar Categorias da Loja</h3>
                  <button onClick={handleStartAddCategory} className="btn-primary btn-add">
                    <Plus size={18} /> Adicionar Nova Categoria
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="th-icon">Ícone</th>
                        <th>Nome da Categoria</th>
                        <th className="th-actions">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id}>
                          <td className="cell-icon-col">
                            {renderCategoryIcon(cat.icon)}
                          </td>
                          <td className="cell-bold">
                            {cat.name} {cat.id === 'todas' && <span className="cat-fixed-badge">(Fixo)</span>}
                          </td>
                          <td>
                            {cat.id !== 'todas' && (
                              <div className="actions-cell">
                                <button onClick={() => setEditingCategory(cat)} className="btn-edit">
                                  <Edit size={16} /> Editar
                                </button>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="btn-delete">
                                  <Trash2 size={16} /> Excluir
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'categories' && editingCategory && (
              <form onSubmit={handleSaveCategory}>
                <div className="form-header">
                  <h3>
                    {isAddingNewCategory ? 'Cadastrar Nova Categoria' : `Editar Categoria: ${editingCategory.name}`}
                  </h3>
                  <button type="button" onClick={() => setEditingCategory(null)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>

                <div className="form-grid max-w-600">
                  <div className="form-group full-width">
                    <label>Nome da Categoria</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      placeholder="Ex: Quadros Decorativos"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Ícone da Categoria</label>
                    <select
                      value={editingCategory.icon}
                      onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                      className="form-control"
                    >
                      <option value="Sparkles">✨ Sparkles (Brilho geral)</option>
                      <option value="Coffee">☕ Coffee (Canecas / Copos)</option>
                      <option value="LayoutGrid">🖼️ LayoutGrid (Azulejos / Quadros)</option>
                      <option value="Shirt">👕 Shirt (Camisetas / Têxtil)</option>
                      <option value="Gift">🎁 Gift (Kits Presente)</option>
                      <option value="Heart">❤️ Heart (Lembrancinhas / Romântico)</option>
                    </select>
                  </div>

                  <div className="form-submit-row">
                    <button type="submit" disabled={loading} className="btn-primary btn-save-full">
                      <Save size={22} /> {loading ? 'Salvando...' : 'Salvar Categoria'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ABA: CONFIGURAÇÕES */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings}>
                <div className="form-header mb-16">
                  <h3>Configurações Gerais do Site</h3>
                </div>
                <p className="settings-desc">
                  Ajuste o número do WhatsApp de atendimento e os textos apresentados nas páginas da loja.
                </p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome da Loja</label>
                    <input
                      type="text"
                      required
                      value={localSettings.storeName}
                      onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>WhatsApp de Atendimento (DDD + Número)</label>
                    <input
                      type="text"
                      required
                      value={localSettings.whatsappNumber}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>URL do Instagram</label>
                    <input
                      type="url"
                      required
                      value={localSettings.instagramUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Título Principal do Banner (Hero)</label>
                    <input
                      type="text"
                      required
                      value={localSettings.heroTitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Subtítulo Principal do Banner</label>
                    <textarea
                      required
                      rows={3}
                      value={localSettings.heroSubtitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>História da Marca ("Sobre a Loja")</label>
                    <textarea
                      required
                      rows={5}
                      value={localSettings.aboutText}
                      onChange={(e) => setLocalSettings({ ...localSettings, aboutText: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>E-mail de Contato</label>
                    <input
                      type="email"
                      required
                      value={localSettings.contactEmail}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Horários de Atendimento</label>
                    <input
                      type="text"
                      required
                      value={localSettings.contactHours}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactHours: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-submit-row">
                    <button type="submit" disabled={loading} className="btn-primary btn-save-full">
                      <Save size={22} /> {loading ? 'Salvando...' : 'Salvar Todas as Configurações'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
