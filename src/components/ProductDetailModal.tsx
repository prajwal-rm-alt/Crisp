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
  Maximize2
} from 'lucide-react';
import { Product, ProductRecipe } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAskAIHowToPrepare: (product: Product, recipeName?: string) => void;
  onViewRecipeGallery: (product: Product) => void;
  onSelectRecipeForAI?: (product: Product, recipe: ProductRecipe) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAskAIHowToPrepare,
  onViewRecipeGallery,
  onSelectRecipeForAI,
}) => {
  const [activeImage, setActiveImage] = useState(product.imageUrl);

  const images = [product.imageUrl, ...(product.additionalImages || [])];
  const discountPercent = Math.round(
    ((product.mrp - product.sellingPrice) / product.mrp) * 100
  );

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-16 z-[90] flex items-start sm:items-center justify-center p-3 sm:p-5 md:p-6 bg-black/40 dark:bg-black/85 backdrop-blur-xl overflow-y-auto"
    >
      <div className="w-full max-w-4xl rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-2xl overflow-hidden my-auto max-h-[calc(100vh-5.5rem)] flex flex-col text-black dark:text-white transition-colors">
        {/* Top Header bar */}
        <div className="px-5 py-3.5 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-playfair text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black">
              {product.brand}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              Model #{product.modelNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAIHowToPrepare(product)}
              className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-playfair font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition active:scale-95 shadow-md"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Co-Pilot</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7">
          {/* Top Hero: Images + Summary Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Images */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 shadow-lg">
                <img
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 text-black dark:text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md border border-black/10 dark:border-white/20">
                  {discountPercent}% OFF
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        activeImage === img
                          ? 'border-black dark:border-white shadow-md'
                          : 'border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Culinary Highlight Callout */}
              {product.promoterPitchHook && (
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10">
                  <div className="text-[11px] font-playfair font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Culinary Highlight:
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 italic font-serif">
                    "{product.promoterPitchHook}"
                  </p>
                </div>
              )}
            </div>

            {/* Right: Pricing, Specs & USPs */}
            <div className="space-y-5">
              <div>
                <span className="font-playfair text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
                  {product.category}
                </span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold mt-1 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Price block */}
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Store Offer Price</div>
                  <div className="font-playfair text-2xl sm:text-3xl font-extrabold">
                    ₹{product.sellingPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Maximum Retail Price</div>
                  <div className="text-base text-neutral-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs font-semibold mt-0.5 text-neutral-700 dark:text-neutral-300">
                    Save ₹{(product.mrp - product.sellingPrice).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Core Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[10px]">Power Rating</span>
                  <span className="font-semibold flex items-center gap-1 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                    {product.power}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[10px]">Capacity</span>
                  <span className="font-semibold mt-0.5 block">
                    {product.capacity}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[10px]">Warranty</span>
                  <span className="font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {product.warranty}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                  <span className="text-neutral-500 dark:text-neutral-400 block text-[10px]">Floor Stock</span>
                  <span className="font-semibold mt-0.5 block">
                    {product.stockCount} Units Available
                  </span>
                </div>
              </div>

              {/* Dimensions Section */}
              {product.dimensions && (
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-playfair font-semibold">
                    <Ruler className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Exact Physical Dimensions & Weight</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">Height</span>
                      <span className="font-mono text-xs">{product.dimensions.height}</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">Width</span>
                      <span className="font-mono text-xs">{product.dimensions.width}</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">Depth</span>
                      <span className="font-mono text-xs">{product.dimensions.depth}</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">Weight</span>
                      <span className="font-mono text-xs font-semibold">{product.dimensions.weight}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Official Links */}
              <div className="flex flex-wrap gap-2 text-xs">
                {product.officialWebsiteUrl && (
                  <a
                    href={product.officialWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition font-playfair font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Official Portal</span>
                  </a>
                )}
                {product.youtubeSearchQuery && (
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      product.youtubeSearchQuery
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition font-playfair font-medium"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube Demo Videos</span>
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
                  <span>Dishes You Can Prepare with this Model</span>
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
