import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  ChefHat, 
  ShieldCheck, 
  Zap, 
  Ruler, 
  Sparkles, 
  ExternalLink, 
  Youtube, 
  CheckCircle2, 
  Maximize2,
  Trash2
} from 'lucide-react';
import { Product, ProductRecipe } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAskAIHowToPrepare: (product: Product, recipeName?: string) => void;
  onViewRecipeGallery: (product: Product) => void;
  onSelectRecipeForAI?: (product: Product, recipe: ProductRecipe) => void;
  onDeleteProduct?: (productId: string) => void;
  onDeleteRecipe?: (productId: string, recipeId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAskAIHowToPrepare,
  onViewRecipeGallery,
  onSelectRecipeForAI,
  onDeleteProduct,
  onDeleteRecipe,
}) => {
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [showDeleteApplianceConfirm, setShowDeleteApplianceConfirm] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<ProductRecipe | null>(null);

  const images = [product.imageUrl, ...(product.additionalImages || [])];
  const discountPercent = Math.round(
    ((product.mrp - product.sellingPrice) / product.mrp) * 100
  );

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-16 z-[90] flex items-start sm:items-center justify-center p-2.5 sm:p-5 md:p-6 bg-black/40 dark:bg-black/85 backdrop-blur-xl overflow-y-auto"
    >
      <div className="w-full max-w-4xl rounded-2xl sm:rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-2xl overflow-hidden my-auto max-h-[calc(100vh-4.5rem)] sm:max-h-[calc(100vh-5.5rem)] flex flex-col text-black dark:text-white transition-colors relative">
        
        {/* Appliance Deletion In-App Confirmation Modal */}
        {showDeleteApplianceConfirm && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 bg-black/90 dark:bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in duration-150"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold">Remove Appliance from Catalog?</h3>
              <p className="text-xs text-neutral-300 max-w-sm mt-1 font-serif">
                "{product.brand} {product.name}" will be permanently removed from your floor presentation catalog.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteApplianceConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-playfair font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteApplianceConfirm(false);
                  onDeleteProduct?.(product.id);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-playfair font-bold shadow-lg transition"
              >
                Yes, Delete Appliance
              </button>
            </div>
          </div>
        )}

        {/* Recipe Deletion In-App Confirmation Modal */}
        {recipeToDelete && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-50 bg-black/90 dark:bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in duration-150"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold">Delete Recipe "{recipeToDelete.name}"?</h3>
              <p className="text-xs text-neutral-300 max-w-sm mt-1 font-serif">
                This prepared dish recipe will be removed from this appliance model.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecipeToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-playfair font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteRecipe) {
                    onDeleteRecipe(product.id, recipeToDelete.id);
                  }
                  setRecipeToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-playfair font-bold shadow-lg transition"
              >
                Yes, Delete Recipe
              </button>
            </div>
          </div>
        )}

        {/* Top Header bar */}
        <div className="px-3.5 sm:px-5 py-3 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-playfair text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
              {product.brand}
            </span>
            <span className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate max-w-[120px] xs:max-w-none">
              #{product.modelNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onDeleteProduct && (
              <button
                type="button"
                onClick={() => setShowDeleteApplianceConfirm(true)}
                title="Remove this appliance from catalog"
                className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-playfair text-[11px]">Delete</span>
              </button>
            )}

            <button
              onClick={() => onAskAIHowToPrepare(product)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-playfair font-semibold flex items-center gap-1.5 hover:opacity-90 transition shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Ask AI Chef</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Grid: Images + Core Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Gallery showcase */}
            <div className="space-y-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 relative">
                <img
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-3 left-3 bg-black/80 text-white font-playfair text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  {product.category}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        activeImage === img
                          ? 'border-black dark:border-white scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Technical Specs & Price hook */}
            <div className="space-y-4">
              <div>
                <h2 className="font-playfair text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                  {product.name}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                  Warranty: {product.warranty}
                </p>
              </div>

              {/* Price card */}
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                    Store Floor Special Offer
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="font-playfair text-2xl font-bold">
                      ₹{product.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-neutral-500 line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full">
                    Save ₹{(product.mrp - product.sellingPrice).toLocaleString('en-IN')} ({discountPercent}%)
                  </span>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3" /> Power Wattage
                  </span>
                  <p className="font-semibold">{product.power}</p>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3" /> Usable Capacity
                  </span>
                  <p className="font-semibold">{product.capacity}</p>
                </div>
                {product.dimensions && (
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1 col-span-2">
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                      <Ruler className="w-3 h-3" /> Floor Dimensions (H × W × D)
                    </span>
                    <p className="font-semibold">
                      {product.dimensions.height} × {product.dimensions.width} × {product.dimensions.depth} ({product.dimensions.weight})
                    </p>
                  </div>
                )}
              </div>

              {/* Promoter Pitch Hook */}
              {product.promoterPitchHook && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-neutral-900 dark:text-amber-100 space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick Customer Closing Pitch
                  </div>
                  <p className="text-xs italic font-serif leading-relaxed">
                    "{product.promoterPitchHook}"
                  </p>
                </div>
              )}

              {/* Official Brand Portal Query */}
              <div className="pt-2 flex flex-wrap gap-2">
                {product.officialWebsiteQuery && (
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `${product.brand} ${product.name} official specifications Bajaj Morphy Richards`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition p-2 rounded-xl border border-black/10 dark:border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Official Portal Search</span>
                  </a>
                )}

                {product.youtubeSearchQuery && (
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      product.youtubeSearchQuery
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:opacity-80 transition p-2 rounded-xl border border-red-500/20 bg-red-500/5"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Demonstration Videos</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Section: Key Appliance Advantages */}
          <div className="p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-3">
            <h3 className="font-playfair text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <span>Key Appliance Advantages & Features:</span>
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
              {product.keySellingPoints?.map((usp, i) => (
                <li key={i} className="flex items-start gap-2 bg-black/5 dark:bg-white/5 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                  <span>{usp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Recipe Image Collection Gallery */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-playfair text-lg font-bold flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                  <span>Dishes You Can Prepare with this Model ({product.recipes?.length || 0})</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Show this image gallery to customers to spark inspiration & close the sale!
                </p>
              </div>

              <button
                onClick={() => onViewRecipeGallery(product)}
                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-playfair font-semibold flex items-center gap-1 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full-Screen Gallery</span>
              </button>
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {product.recipes?.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => {
                    if (onSelectRecipeForAI) {
                      onSelectRecipeForAI(product, recipe);
                    } else {
                      onAskAIHowToPrepare(product, recipe.name);
                    }
                  }}
                  className="rounded-2xl overflow-hidden glass-card flex flex-col group relative cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative bg-neutral-100 dark:bg-neutral-900">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded-md text-[10px] text-white font-mono backdrop-blur-sm">
                      {recipe.prepTime}
                    </div>

                    {/* Delete Dish Recipe Button */}
                    {onDeleteRecipe && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecipeToDelete(recipe);
                        }}
                        title={`Delete dish "${recipe.name}"`}
                        aria-label="Delete dish"
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/75 hover:bg-red-600 text-white/80 hover:text-white transition shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-playfair text-xs font-bold line-clamp-1">
                        {recipe.name}
                      </h4>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1 font-mono">
                        {recipe.cookingMode}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectRecipeForAI) {
                          onSelectRecipeForAI(product, recipe);
                        } else {
                          onAskAIHowToPrepare(product, recipe.name);
                        }
                      }}
                      className="mt-2.5 w-full py-1.5 px-2 bg-black text-white dark:bg-white dark:text-black font-playfair font-semibold rounded-lg text-[10px] flex items-center justify-center gap-1 transition hover:opacity-85 shadow-sm"
                    >
                      <Bot className="w-3 h-3" />
                      <span>AI Recipe & YT Link</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
