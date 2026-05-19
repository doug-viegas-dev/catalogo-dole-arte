export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageUrls?: string[];
  inStock: boolean;
  featured?: boolean;
  minQuantity?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  description?: string;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string; // e.g. "5511999999999"
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactEmail: string;
  contactHours: string;
}

export interface OrderStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface SpecialDateItem {
  id: string;
  title: string;
  description: string;
  dateStr: string;
  imageUrl: string;
  tag: string;
}
