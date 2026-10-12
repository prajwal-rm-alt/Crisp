export interface PromoterProfile {
  name: string;
  empId: string;
  storeLocation: string;
  storeCode: string;
  phone?: string;
  targetMonthlySales?: number;
  currentMonthlySales?: number;
  avatarUrl?: string;
}

export interface ProductDimensions {
  height: string;
  width: string;
  depth: string;
  weight: string;
}

export interface ProductRecipe {
  id: string;
  name: string;
  dishType: string;
  prepTime: string;
  cookingMode: string;
  imageUrl: string;
  description?: string;
  youtubeQuery?: string;
}

export interface Product {
  id: string;
  brand: 'Bajaj' | 'Morphy Richards' | string;
  name: string;
  modelNumber: string;
  category: string;
  mrp: number;
  sellingPrice: number;
  power: string;
  capacity: string;
  warranty: string;
  dimensions: ProductDimensions;
  features: string[];
  keySellingPoints: string[];
  promoterPitchHook: string;
  imageUrl: string;
  additionalImages?: string[];
  recipes: ProductRecipe[];
  officialWebsiteUrl?: string;
  youtubeSearchQuery?: string;
  inStock: boolean;
  stockCount: number;
}

export type Category = 
  | 'All'
  | 'Air Fryers'
  | 'OTG & Ovens'
  | 'Mixer Grinders'
  | 'Induction Cooktops'
  | 'Electric Kettles'
  | 'Juicers & Blenders'
  | 'Toasters & Grills';

export type BrandFilter = 'All' | 'Bajaj' | 'Morphy Richards';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  youtubeLinks?: { title: string; query: string }[];
}

export type AppTheme = 'dark' | 'light';
