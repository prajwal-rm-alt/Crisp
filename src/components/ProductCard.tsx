import React, { useState } from 'react';
import { ChefHat, Zap, Ruler, ArrowRight, Bot, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onOpenAIForProduct: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onOpenAIForProduct,
  onDeleteProduct,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const discountPercent = Math.round(
    ((product.mrp - product.sellingPrice) / product.mrp) * 100
  );

  return (
    <div
      onClick={() => onSelect(product)}
      className="glass-card rounded-3xl overflow-hidden cursor-pointer flex flex-col group relative transition-all duration-300"
    >
      {/* Inline Delete Confirmation Overlay (No window.confirm, 100% iframe reliable) */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-black/92 dark:bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center text-white space-y-3 animate-in fade-in duration-150"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-playfair text-sm font-bold">Remove Appliance?</h4>
            <p className="text-[11px] text-neutral-300 max-w-[240px] mt-1 font-serif">
              "{product.brand} {product.name}" will be deleted from your store catalog.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-playfair font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
                onDeleteProduct?.(product.id);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-playfair font-bold shadow-md transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Image container with subtle scrim */}
      <div className="relative aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Brand Tag (Monochrome Luxury) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="font-playfair text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm bg-black/85 dark:bg-white/90 text-white dark:text-black border border-white/20 dark:border-black/20">
            {product.brand}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-md">
            {product.category}
          </span>
        </div>

        {/* Top Right Badges: Discount & Quick Delete Trigger */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {discountPercent > 0 && (
            <span className="bg-white/90 dark:bg-black/90 text-black dark:text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm border border-black/10 dark:border-white/20">
              {discountPercent}% OFF
            </span>
          )}
          {onDeleteProduct && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              title="Delete this appliance from catalog"
              aria-label="Delete appliance"
              className="p-1 rounded-full bg-black/75 hover:bg-red-600 text-white/80 hover:text-white backdrop-blur-md transition shadow-sm active:scale-90"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Recipe image preview strip at bottom of photo */}
        {product.recipes && product.recipes.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/75 dark:bg-black/85 backdrop-blur-md text-white text-[11px] border border-white/10">
            <div className="flex items-center gap-1.5 font-playfair">
              <ChefHat className="w-3.5 h-3.5 text-white" />
              <span>{product.recipes.length} Prepared Dishes</span>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
              {product.recipes.slice(0, 3).map((r) => (
                <img
                  key={r.id}
                  src={r.imageUrl}
                  alt={r.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white/60"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-black dark:text-white">
        <div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mb-1">
            Model: {product.modelNumber}
          </div>
          <h3 className="font-playfair text-base font-bold group-hover:opacity-80 transition-opacity line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Quick Specifications */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
            <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-black/5 dark:border-white/5">
              <Zap className="w-3 h-3 text-neutral-800 dark:text-neutral-200" />
              {product.power}
            </span>
            <span className="bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-black/5 dark:border-white/5">
              {product.capacity}
            </span>
            {product.dimensions && (
              <span className="flex items-center gap-1 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-black/5 dark:border-white/5 text-[11px]">
                <Ruler className="w-3 h-3 text-neutral-500" />
                {product.dimensions.height}
              </span>
            )}
          </div>

          {/* Promoter Pitch One-Liner */}
          {product.promoterPitchHook && (
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 italic bg-black/[0.03] dark:bg-white/[0.03] p-2.5 rounded-xl border border-black/5 dark:border-white/5 font-serif">
              "{product.promoterPitchHook}"
            </p>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-playfair text-lg font-bold text-black dark:text-white">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-500 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
              Save ₹{(product.mrp - product.sellingPrice).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAIForProduct(product);
              }}
              title="Ask AI Chef how to cook or pitch with this model"
              className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/20 text-black dark:text-white transition active:scale-95"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-playfair font-semibold flex items-center gap-1 transition shadow-sm hover:opacity-90 active:scale-95"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
