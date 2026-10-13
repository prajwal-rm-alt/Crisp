import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChefHat, 
  Store, 
  Bot, 
  Layers, 
  Plus,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Camera,
  Trash2,
  CheckCircle2,
  RotateCw
} from 'lucide-react';
import { 
  Product, 
  ProductRecipe,
  PromoterProfile, 
  Category, 
  BrandFilter, 
  AppTheme 
} from './types';
import { 
  loadProfile, 
  saveProfile, 
  loadCatalog, 
  saveCatalog, 
  loadTheme, 
  saveTheme, 
  loadCustomApiKey, 
  saveCustomApiKey,
  resetCatalogToDefault,
  deleteProductFromCatalog,
  deleteRecipeFromProduct
} from './utils/storage';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RecipeGalleryModal } from './components/RecipeGalleryModal';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

const CATEGORIES: Category[] = [
  'All',
  'Air Fryers',
  'OTG & Ovens',
  'Mixer Grinders',
  'Induction Cooktops',
  'Electric Kettles',
  'Juicers & Blenders',
  'Toasters & Grills',
];

export default function App() {
  // Persistence state
  const [profile, setProfile] = useState<PromoterProfile>(() => loadProfile());
  const [catalog, setCatalog] = useState<Product[]>(() => loadCatalog());
  const [theme, setTheme] = useState<AppTheme>(() => loadTheme());
  const [customApiKey, setCustomApiKey] = useState<string>(() => loadCustomApiKey());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const p = loadProfile();
    return !!(p.name && p.empId);
  });

  // UI state
  const [activeView, setActiveView] = useState<'gallery' | 'appliances'>('gallery');
  const [selectedBrand, setSelectedBrand] = useState<BrandFilter>('All');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedModelId, setSelectedModelId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeProductForAI, setActiveProductForAI] = useState<Product | null>(catalog[0] || null);
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);
  const [selectedRecipeForAI, setSelectedRecipeForAI] = useState<{ product: Product; recipe: ProductRecipe } | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'profile' | 'images' | 'catalog' | 'ai-generator' | 'ai-key' | 'appearance'>('profile');
  const [settingsInitialProductId, setSettingsInitialProductId] = useState<string | undefined>(undefined);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleOpenSettings = (
    tab: 'profile' | 'images' | 'catalog' | 'ai-generator' | 'ai-key' | 'appearance' = 'profile',
    productId?: string
  ) => {
    setSettingsInitialTab(tab);
    setSettingsInitialProductId(productId);
    setIsSettingsOpen(true);
  };

  const handleToggleSettings = (
    tab: 'profile' | 'images' | 'catalog' | 'ai-generator' | 'ai-key' | 'appearance' = 'profile',
    productId?: string
  ) => {
    if (isSettingsOpen && settingsInitialTab === tab && !productId) {
      setIsSettingsOpen(false);
    } else {
      setSettingsInitialTab(tab);
      setSettingsInitialProductId(productId);
      setIsSettingsOpen(true);
    }
  };

  // PWA install hook
  const { isInstallable, install, isIOS } = usePWAInstall();

  // Apply theme to document element and body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    document.body.classList.remove('dark', 'light');
    if (theme === 'light') {
      root.classList.add('light');
      document.body.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
    saveTheme(theme);
  }, [theme]);

  // Sync profile & catalog changes
  const handleUpdateProfile = (newProfile: PromoterProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleUpdateCatalog = (newCatalog: Product[]) => {
    setCatalog(newCatalog);
    saveCatalog(newCatalog);
  };

  // Delete product permanently (survives page refresh)
  const handleDeleteProduct = (productId: string) => {
    const updated = deleteProductFromCatalog(productId);
    setCatalog(updated);
    if (selectedProduct?.id === productId) setSelectedProduct(null);
    if (activeProductForAI?.id === productId) setActiveProductForAI(updated[0] || null);
    showToast('Appliance permanently removed from catalog.');
  };

  // Delete specific prepared dish recipe permanently
  const handleDeleteRecipe = (productId: string, recipeId: string) => {
    const updated = deleteRecipeFromProduct(productId, recipeId);
    setCatalog(updated);
    if (selectedProduct?.id === productId) {
      const match = updated.find((p) => p.id === productId);
      if (match) setSelectedProduct(match);
    }
    showToast('Dish recipe removed from catalog.');
  };

  const handleResetCatalog = () => {
    const fresh = resetCatalogToDefault();
    setCatalog(fresh);
    showToast('Catalog reset to factory specifications.');
  };

  const handleSaveCustomApiKey = (key: string) => {
    setCustomApiKey(key);
    saveCustomApiKey(key);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      if (selectedBrand !== 'All' && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchModel = product.modelNumber.toLowerCase().includes(q);
        const matchFeatures = product.features.some((f) => f.toLowerCase().includes(q));
        const matchBrand = product.brand.toLowerCase().includes(q);
        return matchName || matchModel || matchFeatures || matchBrand;
      }
      return true;
    });
  }, [catalog, selectedBrand, selectedCategory, searchQuery]);

  // Models matching current category and brand filters for the dropdown
  const availableModelsForDropdown = useMemo(() => {
    return catalog.filter((p) => {
      if (selectedBrand !== 'All' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [catalog, selectedBrand, selectedCategory]);

  // Aggregate all recipes across products for the Pure Image Gallery
  const allRecipesWithProduct = useMemo(() => {
    const list: { recipe: ProductRecipe; product: Product }[] = [];
    catalog.forEach((prod) => {
      if (selectedBrand !== 'All' && prod.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return;
      }
      if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
        return;
      }
      if (selectedModelId !== 'All' && prod.id !== selectedModelId) {
        return;
      }
      prod.recipes?.forEach((rec) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchRecipe = rec.name.toLowerCase().includes(q) || rec.dishType.toLowerCase().includes(q);
          const matchProd = prod.name.toLowerCase().includes(q) || prod.brand.toLowerCase().includes(q);
          if (!matchRecipe && !matchProd) return;
        }
        list.push({ recipe: rec, product: prod });
      });
    });
    return list;
  }, [catalog, selectedBrand, selectedCategory, selectedModelId, searchQuery]);

  const handleOpenRecipeInAIChef = (product: Product, recipe: ProductRecipe) => {
    setActiveProductForAI(product);
    setSelectedRecipeForAI({ product, recipe });
    setIsAIOpen(true);
  };

  const handleOpenAIForProduct = (product: Product, _recipeName?: string) => {
    setActiveProductForAI(product);
    setIsAIOpen(true);
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSInstallGuide(true);
    } else {
      alert('To install this app, tap your browser menu (⋮ or Share) and select "Add to Home screen".');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      } flex flex-col relative pt-16 pb-20 sm:pb-12 transition-colors duration-300 font-sans select-none`}
    >
      {/* Main Top Navigation - Always Visible on Top of Everything */}
      <Navbar
        profile={profile}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={(tab) => handleToggleSettings((tab as any) || 'profile')}
        isSettingsOpen={isSettingsOpen}
        onOpenAI={() => setIsAIOpen((prev) => !prev)}
        isAIOpen={isAIOpen}
        activeProductForAI={activeProductForAI}
        onInstallApp={handleTriggerInstall}
        isInstallable={isInstallable || isIOS}
        activeBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
      />

      {/* Main Presentation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
        {/* Demonstration Showcase Header */}
        <section className="text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 pb-3 border-b border-black/10 dark:border-white/10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
              <span className="font-playfair text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">
                {profile.storeLocation} · Demonstration Hub
              </span>
            </div>
            <h1 className="font-playfair text-2xl sm:text-4xl font-bold tracking-tight">
              Culinary & Appliance Gallery
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-serif max-w-xl">
              Explore authentic dishes and gourmet recipes prepared with our premier Morphy Richards & Bajaj appliances.
            </p>
          </div>

          {/* Primary View Switcher: Prepared Food Gallery vs Appliances */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center p-1 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/10 dark:border-white/10 shrink-0">
            <button
              onClick={() => setActiveView('gallery')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-playfair font-semibold flex items-center justify-center gap-1.5 transition ${
                activeView === 'gallery'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Dishes Gallery</span>
            </button>
            <button
              onClick={() => setActiveView('appliances')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-playfair font-semibold flex items-center justify-center gap-1.5 transition ${
                activeView === 'appliances'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Appliances ({filteredProducts.length})</span>
            </button>
          </div>
        </section>

        {/* Search & Category Filter Navigation */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes (samosa, cake, tikka) or models..."
                className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-none transition shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Brand Toggle */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
              {(['All', 'Bajaj', 'Morphy Richards'] as BrandFilter[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-2 rounded-2xl text-xs font-playfair font-semibold transition text-center truncate ${
                    selectedBrand === b
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'
                  }`}
                >
                  {b === 'All' ? 'All Brands' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (selectedModelId !== 'All') {
                      const currentModel = catalog.find((p) => p.id === selectedModelId);
                      if (currentModel && cat !== 'All' && currentModel.category !== cat) {
                        setSelectedModelId('All');
                      }
                    }
                  }}
                  className={`px-3.5 py-1.5 text-xs font-playfair font-semibold rounded-full transition whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* VIEW 1: PURE DISHES GALLERY (JUST IMAGES, NO CARDS, NO LINKS, FILTER BY CATEGORY & MODELS) */}
        {activeView === 'gallery' && (
          <section className="space-y-4">
            {/* Gallery Header & Filter Selection Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-black/10 dark:border-white/10">
              <div>
                <h2 className="font-playfair text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                  <span>Prepared Dishes Gallery</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 font-normal">
                    {allRecipesWithProduct.length} dishes
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-serif">
                  Select category or model to filter. Tap any dish image to let AI Chef show the recipe.
                </p>
              </div>

              {/* Filtering Controls: Appliance Model & Category selection */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Model Selection Dropdown */}
                <div className="flex items-center gap-1.5 w-full xs:w-auto">
                  <span className="text-xs font-playfair font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    Model:
                  </span>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    aria-label="Filter dishes by appliance model"
                    className="flex-1 xs:flex-initial px-3 py-1.5 rounded-xl text-xs font-playfair bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/15 dark:border-white/20 text-black dark:text-white focus:outline-none cursor-pointer max-w-full xs:max-w-[260px] truncate transition shadow-sm"
                  >
                    <option value="All" className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                      All Models ({catalog.length})
                    </option>
                    {availableModelsForDropdown.map((prod) => (
                      <option
                        key={prod.id}
                        value={prod.id}
                        className="bg-white dark:bg-neutral-900 text-black dark:text-white"
                      >
                        {prod.brand} · {prod.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete Mode Toggle to easily purge unwanted dishes */}
                <button
                  type="button"
                  onClick={() => setIsDeleteMode((prev) => !prev)}
                  className={`px-2.5 py-1.5 text-[11px] font-playfair font-semibold rounded-xl border transition flex items-center gap-1.5 ${
                    isDeleteMode
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 shadow-sm'
                      : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 border-black/10 dark:border-white/10'
                  }`}
                  title="Toggle dish delete buttons"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isDeleteMode ? 'Done Deleting' : 'Delete Dishes'}</span>
                </button>

                {/* Reset Filters button if any filter is active */}
                {(selectedCategory !== 'All' || selectedModelId !== 'All' || selectedBrand !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedModelId('All');
                      setSelectedBrand('All');
                      setSearchQuery('');
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-playfair font-semibold rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 border border-black/10 dark:border-white/10 transition"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {allRecipesWithProduct.length === 0 ? (
              <div className="glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-3 border border-black/10 dark:border-white/15">
                <ChefHat className="w-8 h-8 mx-auto text-neutral-400" />
                <h3 className="font-playfair text-lg font-bold">No dishes found for this filter</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto font-serif">
                  Try choosing another category or selecting "All Models" to display dishes.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand('All');
                    setSelectedCategory('All');
                    setSelectedModelId('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-playfair font-bold transition hover:opacity-90"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* PURE DISH IMAGES ONLY - NO CARDS, NO LINKS, JUST IMAGES */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {allRecipesWithProduct.map(({ recipe, product }, idx) => (
                  <div
                    key={`${product.id}-${recipe.id}-${idx}`}
                    onClick={() => handleOpenRecipeInAIChef(product, recipe)}
                    className="group relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bg-neutral-100 dark:bg-neutral-900 shadow-sm hover:shadow-2xl transition-all duration-300 select-none transform hover:-translate-y-1 active:scale-[0.98]"
                    title={`Tap image to have AI Chef show recipe: ${recipe.name} (${product.name})`}
                  >
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    {/* Delete dish button (Direct deletion of useless dishes) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecipe(product.id, recipe.id);
                      }}
                      title={`Permanently delete dish "${recipe.name}"`}
                      aria-label="Delete dish"
                      className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white/90 hover:text-white backdrop-blur-md transition shadow-md active:scale-90 z-20 ${
                        isDeleteMode ? 'opacity-100 ring-2 ring-red-500 scale-110' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Clean bottom gradient badge with dish name & AI Chef prompt */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 sm:p-2.5 flex flex-col justify-end pointer-events-none transition-opacity duration-200">
                      <span className="text-white text-[11px] sm:text-xs font-playfair font-bold line-clamp-1 leading-snug drop-shadow-sm">
                        {recipe.name}
                      </span>
                      <span className="text-amber-300 text-[9px] sm:text-[10px] font-serif flex items-center gap-1 mt-0.5 opacity-90 group-hover:opacity-100">
                        <Bot className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="truncate">AI Chef Recipe</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW 2: APPLIANCES MODELS SHOWCASE */}
        {activeView === 'appliances' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-playfair text-xl sm:text-2xl font-bold tracking-tight">
                  Kitchen Appliances on Floor
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-serif">
                  Select an appliance to inspect dimensions, technical specifications, and prepared dishes.
                </p>
              </div>

              <span className="font-playfair text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {filteredProducts.length} Models
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="glass-panel rounded-3xl p-10 text-center space-y-3 border border-black/10 dark:border-white/15">
                <Search className="w-8 h-8 mx-auto text-neutral-400" />
                <h3 className="font-playfair text-lg font-bold">No models match your filter</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto font-serif">
                  Try clearing the category or brand search.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand('All');
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-playfair font-bold transition hover:opacity-90"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => {
                      setSelectedProduct(p);
                      setActiveProductForAI(p);
                    }}
                    onOpenAIForProduct={(p) => handleOpenAIForProduct(p)}
                    onDeleteProduct={handleDeleteProduct}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Action Button to launch Full-Screen AI */}
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 px-4 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-playfair font-bold text-xs border border-white/20 dark:border-black/20"
        title="Open Full-Screen AI Assistant"
      >
        <Bot className="w-4 h-4" />
        <span>Ask AI Chef</span>
      </button>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-black/10 dark:border-white/10 px-4 py-2.5 flex items-center justify-around transition-colors">
        <button
          onClick={() => {
            setActiveView('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-playfair ${
            activeView === 'gallery'
              ? 'text-black dark:text-white font-bold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <ChefHat className="w-5 h-5" />
          <span>Dishes Gallery</span>
        </button>

        <button
          onClick={() => {
            setActiveView('appliances');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-playfair ${
            activeView === 'appliances'
              ? 'text-black dark:text-white font-bold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Appliances</span>
        </button>

        <button
          onClick={() => setIsAIOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] text-black dark:text-white font-playfair font-bold"
        >
          <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center -mt-2 shadow-lg">
            <Bot className="w-4 h-4" />
          </div>
          <span>AI Chef</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-playfair text-neutral-500 dark:text-neutral-400"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Modals & Full-Screen AI */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAskAIHowToPrepare={(p, r) => {
            setSelectedProduct(null);
            handleOpenAIForProduct(p, r);
          }}
          onViewRecipeGallery={(p) => {
            setSelectedProduct(null);
            setGalleryProduct(p);
          }}
          onSelectRecipeForAI={(p, r) => {
            setSelectedProduct(null);
            handleOpenRecipeInAIChef(p, r);
          }}
          onDeleteProduct={handleDeleteProduct}
          onDeleteRecipe={handleDeleteRecipe}
        />
      )}

      {galleryProduct && (
        <RecipeGalleryModal
          product={galleryProduct}
          onClose={() => setGalleryProduct(null)}
          onSelectRecipeForAI={(p, r) => {
            setGalleryProduct(null);
            handleOpenRecipeInAIChef(p, r);
          }}
        />
      )}

      {/* Full-Screen AI Assistant - The Exclusive Intelligence for Recipe Guidance */}
      <FloatingAIAssistant
        isOpen={isAIOpen}
        onClose={() => {
          setIsAIOpen(false);
          setSelectedRecipeForAI(null);
        }}
        activeProduct={activeProductForAI}
        profile={profile}
        customApiKey={customApiKey}
        selectedRecipeForAI={selectedRecipeForAI}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          catalog={catalog}
          onUpdateCatalog={handleUpdateCatalog}
          onResetCatalog={handleResetCatalog}
          customApiKey={customApiKey}
          onSaveCustomApiKey={handleSaveCustomApiKey}
          theme={theme}
          onChangeTheme={setTheme}
          initialTab={settingsInitialTab}
          initialProductToEdit={settingsInitialProductId}
        />
      )}

      {/* Login Screen (if user is logged out) */}
      {!isLoggedIn && (
        <LoginModal
          initialProfile={profile}
          onLoginSuccess={(newProfile) => {
            handleUpdateProfile(newProfile);
            setIsLoggedIn(true);
          }}
        />
      )}

      {/* PWA Install Banner */}
      <PWAInstallBanner
        forceShowIOSGuide={showIOSInstallGuide}
        onCloseGuide={() => setShowIOSInstallGuide(false)}
      />

      {/* In-App Toast Confirmation Banner (Guaranteed feedback in all environments) */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 rounded-2xl bg-black/92 dark:bg-white/95 text-white dark:text-black font-playfair text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 dark:border-black/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
