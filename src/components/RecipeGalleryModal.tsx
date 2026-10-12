import React, { useState } from 'react';
import { 
  X, 
  ChefHat, 
  Bot, 
  Youtube, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Product, ProductRecipe } from '../types';

interface RecipeGalleryModalProps {
  product: Product;
  onClose: () => void;
  onSelectRecipeForAI: (product: Product, recipe: ProductRecipe) => void;
}

export const RecipeGalleryModal: React.FC<RecipeGalleryModalProps> = ({
  product,
  onClose,
  onSelectRecipeForAI,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const recipes = product.recipes || [];
  const current = recipes[activeIndex] || recipes[0];

  if (!current) return null;

  const nextRecipe = () => {
    setActiveIndex((prev) => (prev + 1) % recipes.length);
  };

  const prevRecipe = () => {
    setActiveIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
  };

  const youtubeQuery =
    current.youtubeQuery ||
    `${product.brand} ${product.name} ${current.name} recipe demonstration`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    youtubeQuery
  )}`;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-16 z-[90] flex items-center justify-center p-2.5 sm:p-5 bg-black/40 dark:bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl max-h-[calc(100vh-4.5rem)] sm:max-h-[calc(100vh-5.5rem)] rounded-2xl sm:rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-2xl overflow-hidden flex flex-col text-black dark:text-white transition-colors">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-playfair text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
              {product.brand}
            </span>
            <span className="font-playfair text-xs font-semibold truncate text-neutral-600 dark:text-neutral-400 max-w-[180px] sm:max-w-xs">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500">
              {activeIndex + 1} / {recipes.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clean, Non-Bulky Visual Container */}
        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {/* Main Photo with smooth navigation arrows */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-xl border border-black/10 dark:border-white/10">
            <img
              src={current.imageUrl}
              alt={current.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Prev & Next floating controls */}
            {recipes.length > 1 && (
              <>
                <button
                  onClick={prevRecipe}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md transition active:scale-90 shadow-md"
                  aria-label="Previous dish"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextRecipe}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md transition active:scale-90 shadow-md"
                  aria-label="Next dish"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Tags overlay */}
            <div className="absolute top-3 left-3 bg-black/80 text-white px-2.5 py-1 rounded-full text-xs font-playfair font-semibold backdrop-blur-md border border-white/10">
              {current.dishType}
            </div>

            <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2.5 py-1 rounded-xl text-xs font-mono backdrop-blur-md border border-white/10 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-neutral-300" />
              <span>{current.prepTime}</span>
            </div>
          </div>

          {/* Dish Title & Cooking Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div>
              <h2 className="font-playfair text-xl sm:text-2xl font-bold tracking-tight">
                {current.name}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                Mode: {current.cookingMode}
              </p>
            </div>
          </div>

          {/* Actions: AI How to Prepare Button & YouTube Link (The User's Core Request) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => onSelectRecipeForAI(product, current)}
              className="py-3 px-4 bg-black text-white dark:bg-white dark:text-black font-playfair font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-95 transition"
            >
              <Bot className="w-4 h-4" />
              <span>AI: How to Prepare & YT Link</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/15 dark:border-white/20 text-xs sm:text-sm font-playfair font-semibold flex items-center justify-center gap-2 transition"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Watch YouTube Video</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Clean Thumbnails strip */}
          {recipes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar">
              {recipes.map((r, idx) => (
                <button
                  key={r.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    activeIndex === idx
                      ? 'border-black dark:border-white scale-105 shadow-md'
                      : 'border-black/10 dark:border-white/10 opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
