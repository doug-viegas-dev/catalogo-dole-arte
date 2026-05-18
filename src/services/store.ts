import type { Product, Category, StoreSettings, SpecialDateItem } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'todas', name: 'Todos os Produtos', icon: 'Sparkles' },
  { id: 'canecas', name: 'Canecas', icon: 'Coffee' },
  { id: 'azulejos', name: 'Azulejos', icon: 'LayoutGrid' },
  { id: 'textil', name: 'Camisetas & Almofadas', icon: 'Shirt' },
  { id: 'kits', name: 'Kits Presente', icon: 'Gift' },
  { id: 'lembrancinhas', name: 'Lembrancinhas', icon: 'Heart' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Caneca Personalizada com Foto',
    description: 'Sua foto favorita, logotipo ou momento inesquecível gravado em alta definição com brilho impecável.',
    price: 39.90,
    category: 'canecas',
    imageUrl: '/caneca_foto.png',
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-2',
    name: 'Caneca com Interior Colorido',
    description: 'Toque especial de cor na alça e no interior combinando perfeitamente com sua arte e estilo.',
    price: 44.90,
    category: 'canecas',
    imageUrl: '/caneca_colorida.png',
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-3',
    name: 'Azulejo Personalizado 15x15cm',
    description: 'Acompanha suporte de mesa elegante. Excelente para decorar estantes, mesas de trabalho e quartos.',
    price: 34.90,
    category: 'azulejos',
    imageUrl: '/azulejo_quinze.png',
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-4',
    name: 'Azulejo Personalizado 20x20cm',
    description: 'Tamanho ampliado com acabamento premium vitrificado. Perfeito para eternizar grandes recordações e fotos de família.',
    price: 49.90,
    category: 'azulejos',
    imageUrl: '/azulejo_vinte.png',
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-5',
    name: 'Camiseta Personalizada',
    description: 'Tecido premium com toque macio de algodão e poliéster. Estampa duradoura com sublimação de ponta que não desbota.',
    price: 64.90,
    category: 'textil',
    imageUrl: '/camiseta_custom.png',
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-6',
    name: 'Almofada Personalizada',
    description: 'Almofada super macia 40x40cm com capa lavável e enchimento fofinho antialérgico. Estampa em alta resolução.',
    price: 54.90,
    category: 'textil',
    imageUrl: '/almofada_custom.png',
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-7',
    name: 'Kit Presente Personalizado',
    description: 'Caneca + Almofada em uma caixa de presente exclusiva decorada com laço artesanal e muito carinho.',
    price: 114.90,
    category: 'kits',
    imageUrl: '/kit_presente.png',
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-8',
    name: 'Lembrancinhas Personalizadas',
    description: 'Chaveiros e mimos personalizados para festas de aniversário, casamentos, batizados e eventos corporativos.',
    price: 12.90,
    category: 'lembrancinhas',
    imageUrl: '/lembrancinha_festa.png',
    inStock: true,
    featured: true,
    minQuantity: 10,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'DoLe Arte',
  whatsappNumber: '5511999999999',
  instagramUrl: 'https://instagram.com/dole.arte',
  heroTitle: 'Transforme momentos únicos em',
  heroSubtitle: 'Personalização com carinho, criatividade e cuidado em cada detalhe. O presente ideal feito sob medida para quem você ama.',
  aboutText: 'A DoLe Arte nasceu do desejo de transformar momentos e sentimentos especiais em peças únicas e eternas. Trabalhamos com matéria-prima de altíssima qualidade, estamparia digital de ponta e um carinho imenso em cada etapa do processo. Nosso objetivo é que cada cliente sinta a emoção de entregar (e receber) um presente feito exclusivamente para sua história.',
  contactEmail: 'contato@dolearte.com.br',
  contactHours: 'Segunda a Sexta das 9h às 18h | Sábados das 9h às 13h',
};

export const SPECIAL_DATES: SpecialDateItem[] = [
  {
    id: 'date-1',
    title: 'Dia das Mães',
    description: 'Canecas com colher, azulejos com fotos de família e almofadas com mensagens cheias de afeto.',
    dateStr: 'Maio',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    tag: 'Especial Mães',
  },
  {
    id: 'date-2',
    title: 'Dia dos Namorados',
    description: 'Kits românticos, almofadas que se completam e canecas mágicas que revelam a foto ao colocar bebida quente.',
    dateStr: '12 de Junho',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
    tag: 'Romântico',
  },
  {
    id: 'date-3',
    title: 'Aniversários & Comemorações',
    description: 'Presentes divertidos com caricaturas, frases engraçadas ou homenagens emocionantes de amigos e familiares.',
    dateStr: 'O ano todo',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop',
    tag: 'Festa',
  },
  {
    id: 'date-4',
    title: 'Lembranças de Casamento',
    description: 'Presentes especiais para padrinhos e madrinhas, ou mimos delicados para encantar todos os convidados.',
    dateStr: 'Sob encomenda',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    tag: 'Casamentos',
  },
];

const STORAGE_PRODUCTS_KEY = 'dolearte_products_v3';
const STORAGE_SETTINGS_KEY = 'dolearte_settings_v3';
const STORAGE_CATEGORIES_KEY = 'dolearte_categories_v3';

export const storeService = {
  getProducts(): Product[] {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading products', e);
    }
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products', e);
    }
  },

  getCategories(): Category[] {
    try {
      const stored = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading categories', e);
    }
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories', e);
    }
  },

  getSettings(): StoreSettings {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading settings', e);
    }
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: StoreSettings): void {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },
};
