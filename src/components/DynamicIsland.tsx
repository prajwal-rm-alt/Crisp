import React, { useState, useEffect } from 'react';
import { Sparkles, ChefHat } from 'lucide-react';
import { Product } from '../types';

interface DynamicIslandProps {
  activeProduct: Product | null;
  onOpenAI: () => void;
  isAIOpen?: boolean;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeProduct,
  onOpenAI,
}) => {
  const [pulse, setPulse] = useState(false);

  // Trigger subtle micro-pulse when active appliance switches
  useEffect(() => {
    if (activeProduct) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [activeProduct]);

  return (
    <button
      type="button"
      onClick={onOpenAI}
      className={`group relative cursor-pointer flex items-center justify-between h-[28px] px-2.5 sm:px-3 rounded-full bg-neutral-950 text-white border border-white/20 dark:border-white/30 shadow-md transition-all duration-300 ease-out hover:scale-105 active:scale-95 select-none ${
        pulse ? 'ring-2 ring-white/60 scale-[1.03]' : ''
      } max-w-[170px] sm:max-w-[240px]`}
      title="Tap to open AI Chef Assistant in full"
      aria-label="Open AI Assistant"
    >
      {/* Left: glowing icon */}
      <div className="flex items-center gap-1.5 truncate relative z-10">
        <div className="w-3.5 h-3.5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          {activeProduct ? (
            <ChefHat className="w-2.5 h-2.5 text-white" />
          ) : (
            <Sparkles className="w-2.5 h-2.5 text-neutral-300" />
          )}
        </div>
        <span className="font-playfair text-[10px] sm:text-[11px] font-semibold tracking-wide truncate text-white thinking-shimmer-text">
          {activeProduct ? activeProduct.name : 'SALES Co-Pilot'}
        </span>
      </div>

      {/* Thinking shimmer overlay */}
      <div className="absolute inset-0 rounded-full thinking-shimmer-bar opacity-25 pointer-events-none" />

      {/* Right: mini soundwave / tap indicator */}
      <div className="flex items-center gap-1 pl-1.5 shrink-0">
        <div className="flex items-center gap-0.5 h-2.5">
          <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" />
          <span className="w-0.5 h-1 bg-white rounded-full animate-pulse" />
        </div>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-mono hidden sm:inline">
          AI
        </span>
      </div>
    </button>
  );
};
