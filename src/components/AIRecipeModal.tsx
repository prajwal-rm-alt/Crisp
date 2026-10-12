import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Youtube, 
  ExternalLink, 
  Copy, 
  Check, 
  ChefHat, 
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Product, ProductRecipe } from '../types';
import { getRecipeIntelligence, DetailedRecipeGuide } from '../utils/recipeIntelligence';

interface AIRecipeModalProps {
  product: Product;
  recipe: ProductRecipe;
  onClose: () => void;
  onAskFullAI?: (product: Product, question: string) => void;
  customApiKey?: string;
}

export const AIRecipeModal: React.FC<AIRecipeModalProps> = ({
  product,
  recipe,
  onClose,
  onAskFullAI,
  customApiKey,
}) => {
  const [guide, setGuide] = useState<DetailedRecipeGuide>(() =>
    getRecipeIntelligence(product, recipe)
  );
  const [copied, setCopied] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [customTip, setCustomTip] = useState<string | null>(null);

  const handleCopy = () => {
    const text = `🍽️ ${guide.dishName}
Appliance: ${guide.applianceBrand} ${guide.applianceName}
Settings: ${guide.temperature} | ${guide.timer} (${guide.cookingMode})

How to Prepare:
${guide.steps.join('\n')}

💡 Chef Pro-Tip: ${guide.proTip}

▶️ Watch YouTube Recipe Demo:
${guide.youtubeUrl}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleAskAIForVariations = async () => {
    setIsGeneratingMore(true);
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Provide 2 quick secret chef hacks or variations for making ${recipe.name} in the ${product.brand} ${product.name}. Keep it concise in 2 bullet points.`,
          currentProduct: product,
          customApiKey: customApiKey || undefined,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (response.ok && data?.reply) {
        setCustomTip(data.reply);
      } else {
        setCustomTip('Tip: Spray light cooking oil and avoid overcrowding for maximum crispiness.');
      }
    } catch {
      setCustomTip('Tip: Spray light cooking oil and avoid overcrowding for maximum crispiness.');
    } finally {
      setIsGeneratingMore(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-16 z-[90] flex items-center justify-center p-3 sm:p-5 bg-black/75 dark:bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl max-h-[calc(100vh-5.5rem)] flex flex-col rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-2xl overflow-hidden text-black dark:text-white transition-colors">
        {/* Header */}
        <div className="px-5 py-3.5 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-playfair text-xs uppercase tracking-widest font-bold text-neutral-600 dark:text-neutral-400">
                  {product.brand}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-black/10 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                  {recipe.dishType}
                </span>
              </div>
              <h2 className="font-playfair text-base sm:text-lg font-bold leading-tight truncate max-w-[280px] sm:max-w-md">
                {recipe.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Dish Image Banner with Overlaid Appliance Tag */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-md border border-black/10 dark:border-white/10">
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Quick settings tag */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="bg-black/85 text-white backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono border border-white/15 shadow-md flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-neutral-300" />
                <span>{guide.temperature} · {guide.timer}</span>
              </div>
              <div className="bg-black/85 text-white backdrop-blur-md px-3 py-1 rounded-xl text-xs font-playfair font-semibold border border-white/15 shadow-md">
                {guide.cookingMode}
              </div>
            </div>
          </div>

          {/* Model Context Callout */}
          <div className="px-3.5 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Appliance Model:</span>
            <span className="font-playfair font-bold text-neutral-900 dark:text-neutral-100">
              {product.name}
            </span>
          </div>

          {/* YouTube Video Action Button (Core Feature) */}
          <a
            href={guide.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/15 dark:border-white/20 flex items-center justify-between group transition shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Youtube className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs font-playfair font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                  Watch Video Demonstration
                </div>
                <div className="text-xs sm:text-sm font-semibold truncate max-w-[220px] sm:max-w-xs text-neutral-900 dark:text-neutral-100">
                  {guide.youtubeTitle}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-playfair font-semibold text-neutral-600 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white shrink-0">
              <span className="hidden sm:inline">Play</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Step-by-Step AI Cooking Instructions */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-playfair text-sm font-bold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
                <ChefHat className="w-4 h-4" />
                <span>How to Prepare in this Appliance:</span>
              </h3>
              <span className="text-[11px] font-mono text-neutral-500">
                {guide.steps.length} Steps
              </span>
            </div>

            <div className="space-y-2">
              {guide.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Chef Pro-Tip Box */}
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
            <div className="text-xs font-playfair font-bold flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chef Secret Tip for Promoters:</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 italic font-serif">
              "{guide.proTip}"
            </p>
          </div>

          {/* Custom AI variation response if loaded */}
          {customTip && (
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-xs text-neutral-800 dark:text-neutral-200 space-y-1">
              <span className="font-playfair font-bold block">✨ AI Chef Suggestions:</span>
              <div className="whitespace-pre-wrap">{customTip}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900 text-xs font-playfair font-semibold flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">Copied Recipe & Link</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Share with Customer</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAskAIForVariations}
              disabled={isGeneratingMore}
              className="px-3.5 py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/20 text-xs font-playfair font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              title="Get secret chef variations from AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingMore ? 'Thinking...' : 'AI Chef Tips'}</span>
            </button>

            {onAskFullAI && (
              <button
                onClick={() => {
                  onClose();
                  onAskFullAI(product, `Explain in detail how to prepare ${recipe.name} in the ${product.name}`);
                }}
                className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-playfair font-bold flex items-center gap-1.5 shadow-md hover:opacity-90 active:scale-95 transition"
              >
                <span>Full AI Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
