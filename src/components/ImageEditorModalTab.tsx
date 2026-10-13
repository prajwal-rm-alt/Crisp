import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Store, 
  Utensils, 
  ChefHat, 
  Image as ImageIcon,
  AlertCircle,
  Upload
} from 'lucide-react';
import { Product, ProductRecipe } from '../types';
import { CURATED_IMAGE_PRESETS } from '../data/defaultCatalog';

interface ImageEditorModalTabProps {
  catalog: Product[];
  onUpdateCatalog: (catalog: Product[]) => void;
  onResetCatalog: () => void;
  initialSelectedProductId?: string;
}

export const ImageEditorModalTab: React.FC<ImageEditorModalTabProps> = ({
  catalog,
  onUpdateCatalog,
  onResetCatalog,
  initialSelectedProductId,
}) => {
  const [localCatalog, setLocalCatalog] = useState<Product[]>(catalog);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelectedProductId || catalog[0]?.id || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [presetCategory, setPresetCategory] = useState<'all' | 'dish' | 'appliance'>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Keep in sync if catalog changes from outside
  useEffect(() => {
    setLocalCatalog(catalog);
    if (!selectedProductId && catalog.length > 0) {
      setSelectedProductId(catalog[0].id);
    }
  }, [catalog]);

  const selectedProduct = localCatalog.find((p) => p.id === selectedProductId) || localCatalog[0];

  if (!selectedProduct) {
    return (
      <div className="p-8 text-center text-neutral-500 font-serif">
        No appliances available in catalog.
      </div>
    );
  }

  // Update a field on the currently selected product
  const handleUpdateProductField = (field: keyof Product, value: any) => {
    const updated = localCatalog.map((p) =>
      p.id === selectedProduct.id ? { ...p, [field]: value } : p
    );
    setLocalCatalog(updated);
  };

  // Update a specific recipe of the selected product
  const handleUpdateRecipe = (recipeId: string, updates: Partial<ProductRecipe>) => {
    const currentRecipes = selectedProduct.recipes || [];
    const updatedRecipes = currentRecipes.map((r) =>
      r.id === recipeId ? { ...r, ...updates } : r
    );
    handleUpdateProductField('recipes', updatedRecipes);
  };

  // Delete a recipe from the selected product
  const handleDeleteRecipe = (recipeId: string) => {
    const currentRecipes = selectedProduct.recipes || [];
    const updatedRecipes = currentRecipes.filter((r) => r.id !== recipeId);
    handleUpdateProductField('recipes', updatedRecipes);
  };

  // Add a brand-new dish recipe to the selected product
  const handleAddRecipe = () => {
    const currentRecipes = selectedProduct.recipes || [];
    const newRecipe: ProductRecipe = {
      id: `rec-custom-${Date.now()}`,
      name: 'New Custom Prepared Dish',
      dishType: 'Specialty Creation',
      prepTime: '15 mins',
      cookingMode: 'Standard Setting',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      description: 'Freshly prepared specialty dish demonstrated in store appliance.',
      youtubeQuery: `${selectedProduct.name} recipe demonstration`,
    };
    handleUpdateProductField('recipes', [...currentRecipes, newRecipe]);
  };

  // Handle local image file upload for appliance
  const handleUploadApplianceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleUpdateProductField('imageUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local image file upload for recipe
  const handleUploadRecipeImage = (recipeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleUpdateRecipe(recipeId, { imageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all changes permanently
  const handleSaveAll = () => {
    onUpdateCatalog(localCatalog);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const filteredPresets = CURATED_IMAGE_PRESETS.filter((pr) => {
    if (presetCategory === 'all') return true;
    return pr.category === presetCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
        <div>
          <h3 className="font-playfair text-base sm:text-lg font-bold flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Image & Gallery Editor</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-serif">
            Directly update appliance photos and prepared dish imagery. Paste custom image URLs or pick from verified presets.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-playfair font-bold text-xs rounded-xl shadow-md transition hover:opacity-90 active:scale-95 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Image Edits</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm((prev) => !prev)}
            className="p-2 text-neutral-500 hover:text-black dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 transition"
            title="Reset all images to default verified library"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs animate-in fade-in duration-150">
          <span className="text-red-700 dark:text-red-300 font-medium">
            Reset all appliance & dish images back to factory library?
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1 rounded-xl bg-black/10 dark:bg-white/10 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResetConfirm(false);
                onResetCatalog();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2500);
              }}
              className="px-3.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 text-xs font-playfair font-semibold flex items-center gap-2 text-black dark:text-white transition">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>All image updates saved to floor catalog and local storage!</span>
        </div>
      )}

      {/* Appliance Selector Strip */}
      <div className="space-y-2">
        <label className="text-xs font-playfair font-bold text-neutral-700 dark:text-neutral-300 block">
          Select Appliance to Edit ({localCatalog.length} available):
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {localCatalog.map((prod) => {
            const isCurrent = prod.id === selectedProduct.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => setSelectedProductId(prod.id)}
                className={`px-3 py-2 rounded-xl text-xs font-playfair font-medium transition whitespace-nowrap flex items-center gap-2 border shrink-0 ${
                  isCurrent
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                    : 'bg-black/[0.03] dark:bg-white/[0.03] text-neutral-700 dark:text-neutral-300 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                }`}
              >
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-5 h-5 rounded-md object-cover bg-neutral-200 dark:bg-neutral-800"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <span className="truncate max-w-[150px]">{prod.brand} · {prod.name}</span>
                <span className="opacity-60 text-[10px]">({prod.recipes?.length || 0})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: APPLIANCE PRODUCT IMAGE */}
      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-playfair font-bold flex items-center gap-1.5 uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <Store className="w-3.5 h-3.5" />
            <span>Appliance Hardware Photo</span>
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            {selectedProduct.modelNumber}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Live Preview */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-black/15 dark:border-white/20 relative group">
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-playfair font-semibold">
              Live Preview
            </div>
          </div>

          {/* URL Input and Presets */}
          <div className="flex-1 w-full space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 font-serif">
                  Appliance Image URL:
                </label>
                <label className="cursor-pointer text-[10px] font-playfair font-semibold px-2 py-0.5 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center gap-1 shadow-sm hover:opacity-90 active:scale-95 transition">
                  <Upload className="w-3 h-3" />
                  <span>Upload from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadApplianceImage}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="text"
                value={selectedProduct.imageUrl}
                onChange={(e) => handleUpdateProductField('imageUrl', e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-xl px-3 py-2 text-xs font-mono placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            {/* Quick appliance photo presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-500 font-serif">Curated Appliance Presets:</span>
              {CURATED_IMAGE_PRESETS.filter((p) => p.category === 'appliance').slice(0, 4).map((pr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUpdateProductField('imageUrl', pr.url)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 font-playfair transition"
                >
                  {pr.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PREPARED DISHES / RECIPES GALLERY IMAGES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-playfair text-sm font-bold flex items-center gap-1.5">
              <ChefHat className="w-4 h-4" />
              <span>Prepared Dishes for this Appliance ({selectedProduct.recipes?.length || 0})</span>
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-serif">
              These dishes appear in the gallery mode shown to store customers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddRecipe}
            className="px-3 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 font-playfair font-semibold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Recipes Grid/List */}
        <div className="space-y-3">
          {(!selectedProduct.recipes || selectedProduct.recipes.length === 0) ? (
            <div className="p-6 rounded-2xl text-center text-xs text-neutral-500 border border-dashed border-black/15 dark:border-white/15">
              No dishes added for this appliance yet. Click "Add New Dish" above.
            </div>
          ) : (
            selectedProduct.recipes.map((recipe, idx) => (
              <div
                key={recipe.id}
                className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
              >
                {/* Thumbnail Preview */}
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-black/15 dark:border-white/20 relative group">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-playfair font-semibold">
                    Preview
                  </div>
                </div>

                {/* Form fields for this recipe */}
                <div className="flex-1 w-full space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-neutral-500 font-serif mb-0.5">
                        Dish Name:
                      </label>
                      <input
                        type="text"
                        value={recipe.name}
                        onChange={(e) => handleUpdateRecipe(recipe.id, { name: e.target.value })}
                        className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-lg px-2.5 py-1.5 text-xs font-playfair font-semibold focus:outline-none"
                        placeholder="e.g. Crispy Punjabi Samosas"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-500 font-serif mb-0.5">
                        Prep Time & Mode:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={recipe.prepTime}
                          onChange={(e) => handleUpdateRecipe(recipe.id, { prepTime: e.target.value })}
                          className="w-1/2 bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                          placeholder="e.g. 15 mins"
                        />
                        <input
                          type="text"
                          value={recipe.dishType}
                          onChange={(e) => handleUpdateRecipe(recipe.id, { dishType: e.target.value })}
                          className="w-1/2 bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                          placeholder="e.g. Snack / Baking"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-neutral-500 font-serif">
                        Dish Image URL:
                      </label>
                      <label className="cursor-pointer text-[10px] font-playfair font-semibold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 flex items-center gap-1 transition">
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadRecipeImage(recipe.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={recipe.imageUrl}
                      onChange={(e) => handleUpdateRecipe(recipe.id, { imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/15 focus:border-black dark:focus:border-white text-black dark:text-white rounded-lg px-2.5 py-1.5 text-xs font-mono placeholder:text-neutral-400 focus:outline-none"
                    />
                  </div>

                  {/* Preset quick buttons for this recipe */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-neutral-500 font-serif">Presets:</span>
                    {CURATED_IMAGE_PRESETS.filter((p) => p.category === 'dish').slice(idx * 2, idx * 2 + 3).map((pr, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleUpdateRecipe(recipe.id, { imageUrl: pr.url })}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 font-playfair transition"
                      >
                        {pr.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition shrink-0 self-end sm:self-center"
                  title="Remove dish from gallery"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: CURATED PRESETS EXPLORER */}
      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-playfair font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Res Photo Library Presets ({CURATED_IMAGE_PRESETS.length})</span>
          </span>

          <div className="flex items-center gap-1 text-[11px] font-playfair">
            <button
              type="button"
              onClick={() => setPresetCategory('all')}
              className={`px-2 py-0.5 rounded-lg transition ${
                presetCategory === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                  : 'text-neutral-500'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setPresetCategory('dish')}
              className={`px-2 py-0.5 rounded-lg transition ${
                presetCategory === 'dish'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                  : 'text-neutral-500'
              }`}
            >
              Dishes
            </button>
            <button
              type="button"
              onClick={() => setPresetCategory('appliance')}
              className={`px-2 py-0.5 rounded-lg transition ${
                presetCategory === 'appliance'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                  : 'text-neutral-500'
              }`}
            >
              Appliances
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {filteredPresets.map((preset, pIdx) => (
            <div
              key={pIdx}
              onClick={() => {
                if (preset.category === 'appliance') {
                  handleUpdateProductField('imageUrl', preset.url);
                } else if (selectedProduct.recipes && selectedProduct.recipes.length > 0) {
                  // Apply to the first recipe or active
                  handleUpdateRecipe(selectedProduct.recipes[0].id, { imageUrl: preset.url });
                }
              }}
              className="p-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 cursor-pointer hover:border-black dark:hover:border-white transition group flex flex-col items-center text-center"
              title={`Click to copy or apply "${preset.name}"`}
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-1.5">
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-playfair font-semibold truncate w-full">
                {preset.name}
              </span>
              <span className="text-[9px] text-neutral-400 capitalize">
                {preset.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
