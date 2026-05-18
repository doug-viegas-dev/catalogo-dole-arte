import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, CheckCircle, Database, AlertTriangle, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import type { Product, StoreSettings, Category } from '../types';
import { firebaseService } from '../services/firebase';
import { convertToWebP } from '../utils/image';

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
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'dolearte2026') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta. A senha padrão é dolearte2026');
    }
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
      let finalCat = { ...editingCategory };
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
      alert('Erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container" style={{ minHeight: '100vh', background: '#fcfaf7', paddingBottom: '80px' }}>
      <header className="admin-topbar" style={{ background: '#0d6864', color: '#fff', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBackToStore} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Voltar para a Loja
          </button>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} /> Painel Administrativo DoLe Arte
          </h2>
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Ambiente Seguro</div>
      </header>

      <main className="container" style={{ marginTop: '40px', maxWidth: '1100px' }}>
        {!isAuthenticated ? (
          <div style={{ background: '#fff', padding: '48px 40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(13,104,100,0.08)', maxWidth: '460px', margin: '60px auto', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#0d6864', marginBottom: '16px', fontFamily: 'Playfair Display, serif' }}>Acesso Restrito</h3>
            <p style={{ color: '#666', marginBottom: '28px', fontSize: '1rem' }}>
              Digite a senha administrativa para gerenciar o catálogo, envio de imagens e categorias da loja.
            </p>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Senha de acesso..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '16px 24px', borderRadius: '99px', border: '2px solid #eee', marginBottom: '20px', fontSize: '1.05rem', outline: 'none' }}
              />
              {authError && <div style={{ color: '#ff5252', marginBottom: '16px', fontSize: '0.95rem' }}>{authError}</div>}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px 32px', fontSize: '1.1rem' }}>
                Acessar Painel
              </button>
            </form>
            <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#888' }}>
              Dica: a senha padrão configurada é <strong>dolearte2026</strong>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 10px 35px rgba(0,0,0,0.06)', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="tabs-nav" style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #eee', marginBottom: '32px' }}>
              <button
                className={activeTab === 'products' ? 'active' : ''}
                onClick={() => { setActiveTab('products'); setEditingProduct(null); setIsAddingNewProduct(false); setEditingCategory(null); }}
                style={{ fontSize: '1.1rem', padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'products' ? '3px solid #0d6864' : '3px solid transparent', color: activeTab === 'products' ? '#0d6864' : '#666', fontWeight: 600, cursor: 'pointer' }}
              >
                Produtos ({products.length})
              </button>
              <button
                className={activeTab === 'categories' ? 'active' : ''}
                onClick={() => { setActiveTab('categories'); setEditingCategory(null); setIsAddingNewCategory(false); setEditingProduct(null); }}
                style={{ fontSize: '1.1rem', padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'categories' ? '3px solid #0d6864' : '3px solid transparent', color: activeTab === 'categories' ? '#0d6864' : '#666', fontWeight: 600, cursor: 'pointer' }}
              >
                Categorias ({categories.length})
              </button>
              <button
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => { setActiveTab('settings'); setEditingProduct(null); setEditingCategory(null); }}
                style={{ fontSize: '1.1rem', padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'settings' ? '3px solid #0d6864' : '3px solid transparent', color: activeTab === 'settings' ? '#0d6864' : '#666', fontWeight: 600, cursor: 'pointer' }}
              >
                Configurações do Site
              </button>
            </div>

            {saveSuccess && (
              <div style={{ background: '#d4edda', color: '#155724', padding: '16px 24px', borderRadius: '16px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: 500 }}>
                <CheckCircle size={22} />
                <span>{saveSuccess}</span>
              </div>
            )}

            {!firebaseService.isConfigured() && (
              <div style={{ background: '#fff3cd', color: '#856404', padding: '16px 24px', borderRadius: '16px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                <AlertTriangle size={22} style={{ flexShrink: 0 }} />
                <span>
                  Modo de Armazenamento Local (LocalStorage). Para sincronizar na nuvem, insira suas chaves do Firebase no arquivo <code>.env</code>.
                </span>
              </div>
            )}

            {/* ABA: PRODUTOS */}
            {activeTab === 'products' && !editingProduct && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#0d6864', margin: 0 }}>Gerenciamento de Produtos</h3>
                  <button onClick={handleStartAddProduct} className="btn-primary" style={{ padding: '12px 26px' }}>
                    <Plus size={18} /> Adicionar Novo Produto
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="products-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864' }}>Imagem</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864' }}>Nome do Produto</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864' }}>Categoria</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864' }}>Preço Inicial</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864' }}>Estoque</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '16px' }}>
                            <img src={prod.imageUrl} alt={prod.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #ddd' }} />
                          </td>
                          <td style={{ padding: '16px', fontWeight: 600, fontSize: '1.05rem' }}>{prod.name}</td>
                          <td style={{ padding: '16px', textTransform: 'capitalize', color: '#666' }}>
                            {categories.find(c => c.id === prod.category)?.name || prod.category}
                          </td>
                          <td style={{ padding: '16px', fontWeight: 600, color: '#df842a' }}>R$ {prod.price.toFixed(2)}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, background: prod.inStock ? '#d4edda' : '#f8d7da', color: prod.inStock ? '#155724' : '#721c24' }}>
                              {prod.inStock ? 'Disponível' : 'Esgotado'}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => setEditingProduct(prod)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#eef6f6', color: '#0d6864', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Edit size={16} /> Editar
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#fdf3f4', color: '#dc3545', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#0d6864', margin: 0 }}>
                    {isAddingNewProduct ? 'Cadastrar Novo Produto' : `Editar Produto: ${editingProduct.name}`}
                  </h3>
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary" style={{ padding: '10px 20px' }}>
                    Cancelar
                  </button>
                </div>

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Nome do Produto</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Descrição Curta</label>
                    <textarea
                      required
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Preço "A partir de" (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Categoria</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none', background: '#fff' }}
                    >
                      {categories.filter(c => c.id !== 'todas').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* UPLOAD DE ARQUIVO DE IMAGEM */}
                  <div style={{ gridColumn: '1 / -1', background: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{ fontWeight: 600, color: '#0d6864', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={20} />
                      Enviar Foto do Produto (Conversão Automática para WebP)
                    </label>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                      Selecione um arquivo de imagem. Ele será automaticamente redimensionado e convertido para o formato WebP para garantir máxima velocidade de carregamento e economia de banco de dados.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                      <label style={{ padding: '14px 28px', background: '#0d6864', color: '#fff', borderRadius: '99px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
                        <ImageIcon size={20} /> Escolher Arquivo...
                        <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: 'none' }} />
                      </label>

                      {imgUploading && <span style={{ color: '#df842a', fontWeight: 600 }}>Convertendo imagem para WebP... ⏳</span>}
                    </div>

                    {editingProduct.imageUrl && (
                      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={editingProduct.imageUrl} alt="Prévia" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '14px', border: '2px solid #df842a' }} />
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontWeight: 600, color: '#28a745', display: 'block', fontSize: '0.95rem' }}>✓ Imagem pronta no formato WebP</span>
                          <span style={{ fontSize: '0.8rem', color: '#888', wordBreak: 'break-all' }}>{editingProduct.imageUrl.substring(0, 60)}...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Status de Estoque</label>
                    <select
                      value={editingProduct.inStock ? 'true' : 'false'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'true' })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none', background: '#fff' }}
                    >
                      <option value="true">Disponível em Estoque</option>
                      <option value="false">Esgotado / Indisponível</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Destaque na Página Inicial</label>
                    <select
                      value={editingProduct.featured ? 'true' : 'false'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.value === 'true' })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none', background: '#fff' }}
                    >
                      <option value="true">Sim, exibir com destaque</option>
                      <option value="false">Não</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
                    <button type="submit" disabled={loading || imgUploading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px 32px', fontSize: '1.15rem' }}>
                      <Save size={22} /> {loading ? 'Salvando...' : 'Salvar Produto no Catálogo'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ABA: CATEGORIAS */}
            {activeTab === 'categories' && !editingCategory && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#0d6864', margin: 0 }}>Gerenciar Categorias da Loja</h3>
                  <button onClick={handleStartAddCategory} className="btn-primary" style={{ padding: '12px 26px' }}>
                    <Plus size={18} /> Adicionar Nova Categoria
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864', width: '120px' }}>Ícone</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864' }}>Nome da Categoria</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#0d6864', width: '200px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: '#df842a', fontSize: '1.2rem' }}>
                            [{cat.icon}]
                          </td>
                          <td style={{ padding: '16px', fontWeight: 600, fontSize: '1.1rem' }}>
                            {cat.name} {cat.id === 'todas' && <span style={{ fontSize: '0.8rem', color: '#888' }}>(Fixo)</span>}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {cat.id !== 'todas' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setEditingCategory(cat)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#eef6f6', color: '#0d6864', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Edit size={16} /> Editar
                                </button>
                                <button onClick={() => handleDeleteCategory(cat.id)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#fdf3f4', color: '#dc3545', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#0d6864', margin: 0 }}>
                    {isAddingNewCategory ? 'Cadastrar Nova Categoria' : `Editar Categoria: ${editingCategory.name}`}
                  </h3>
                  <button type="button" onClick={() => setEditingCategory(null)} className="btn-secondary" style={{ padding: '10px 20px' }}>
                    Cancelar
                  </button>
                </div>

                <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Nome da Categoria</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      placeholder="Ex: Quadros Decorativos"
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600, color: '#333' }}>Ícone da Categoria</label>
                    <select
                      value={editingCategory.icon}
                      onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none', background: '#fff' }}
                    >
                      <option value="Sparkles">✨ Sparkles (Brilho geral)</option>
                      <option value="Coffee">☕ Coffee (Canecas / Copos)</option>
                      <option value="LayoutGrid">🖼️ LayoutGrid (Azulejos / Quadros)</option>
                      <option value="Shirt">👕 Shirt (Camisetas / Têxtil)</option>
                      <option value="Gift">🎁 Gift (Kits Presente)</option>
                      <option value="Heart">❤️ Heart (Lembrancinhas / Romântico)</option>
                    </select>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px 32px', fontSize: '1.15rem' }}>
                      <Save size={22} /> {loading ? 'Salvando...' : 'Salvar Categoria'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ABA: CONFIGURAÇÕES */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings}>
                <h3 style={{ fontSize: '1.5rem', color: '#0d6864', marginBottom: '8px' }}>Configurações Gerais do Site</h3>
                <p style={{ color: '#666', marginBottom: '32px' }}>
                  Ajuste o número do WhatsApp de atendimento e os textos apresentados nas páginas da loja.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>Nome da Loja</label>
                    <input
                      type="text"
                      required
                      value={localSettings.storeName}
                      onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>WhatsApp de Atendimento (DDD + Número)</label>
                    <input
                      type="text"
                      required
                      value={localSettings.whatsappNumber}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>URL do Instagram</label>
                    <input
                      type="url"
                      required
                      value={localSettings.instagramUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>Título Principal do Banner (Hero)</label>
                    <input
                      type="text"
                      required
                      value={localSettings.heroTitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>Subtítulo Principal do Banner</label>
                    <textarea
                      required
                      rows={3}
                      value={localSettings.heroSubtitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>História da Marca ("Sobre a Loja")</label>
                    <textarea
                      required
                      rows={5}
                      value={localSettings.aboutText}
                      onChange={(e) => setLocalSettings({ ...localSettings, aboutText: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>E-mail de Contato</label>
                    <input
                      type="email"
                      required
                      value={localSettings.contactEmail}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 600 }}>Horários de Atendimento</label>
                    <input
                      type="text"
                      required
                      value={localSettings.contactHours}
                      onChange={(e) => setLocalSettings({ ...localSettings, contactHours: e.target.value })}
                      style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #ccc', fontSize: '1.05rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px 32px', fontSize: '1.15rem' }}>
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
