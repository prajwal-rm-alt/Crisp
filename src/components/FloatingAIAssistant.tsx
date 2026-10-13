import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Youtube, 
  ChefHat, 
  Copy, 
  Check, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Product, ProductRecipe, ChatMessage, PromoterProfile } from '../types';
import { getRecipeIntelligence } from '../utils/recipeIntelligence';
import { sendAIChatMessage } from '../utils/geminiClient';

interface FloatingAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeProduct: Product | null;
  profile: PromoterProfile;
  customApiKey?: string;
  selectedRecipeForAI?: { product: Product; recipe: ProductRecipe } | null;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  isOpen,
  onClose,
  activeProduct,
  profile,
  customApiKey,
  selectedRecipeForAI,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! Welcome to the SALES Culinary AI Co-Pilot.
${activeProduct ? `We are currently exploring the **${activeProduct.brand} ${activeProduct.name}** (${activeProduct.power || activeProduct.capacity}).` : 'Select any appliance or tap any dish in the gallery to reveal recipe instructions!'}

Here to help you with:
• Step-by-step recipe instructions using this exact appliance (time, temperature, mode)
• What dishes and baking can be done in this model
• Showing YouTube recipe demonstration videos to customers!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastHandledRecipeRef = useRef<string | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // When selectedRecipeForAI is passed, AI Chef provides the complete recipe demonstration
  useEffect(() => {
    if (selectedRecipeForAI && isOpen) {
      const { product, recipe } = selectedRecipeForAI;
      if (lastHandledRecipeRef.current === `${product.id}-${recipe.id}`) {
        return;
      }
      lastHandledRecipeRef.current = `${product.id}-${recipe.id}`;

      const intel = getRecipeIntelligence(product, recipe);
      const stepsList = intel.steps.map((step: string) => `${step}`).join('\n');

      const recipeMsg: ChatMessage = {
        id: `chef-recipe-${Date.now()}`,
        role: 'assistant',
        content: `### 👨‍🍳 AI Chef Official Recipe: **${intel.dishName}**\n\n` +
          `**Appliance Model:** ${intel.applianceBrand} ${intel.applianceName} (#${intel.modelNumber})\n` +
          `⏱ **Timer:** ${intel.timer} | 🌡 **Temperature / Setting:** ${intel.temperature}\n` +
          `♨ **Cooking Mode:** ${intel.cookingMode} | 🥣 **Accessory:** ${intel.accessoryUsed}\n\n` +
          `#### 🍳 Step-by-Step Appliance Settings & Cooking:\n${stepsList}\n\n` +
          `💡 **Executive Chef Pro-Tip:** ${intel.proTip}\n\n` +
          `*Feel free to ask me below for ingredient substitutions, portion scaling, or step-by-step cooking assistance!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        youtubeLinks: [
          {
            title: intel.youtubeTitle,
            query: intel.youtubeQuery,
          },
        ],
      };

      setMessages((prev) => [...prev, recipeMsg]);
    }
  }, [selectedRecipeForAI, isOpen]);

  // When activeProduct changes and AI is opened, add contextual suggestion
  useEffect(() => {
    if (activeProduct && isOpen) {
      const hasProductMention = messages[messages.length - 1]?.content.includes(activeProduct.name);
      if (!hasProductMention) {
        setMessages((prev) => [
          ...prev,
          {
            id: `prod-${Date.now()}`,
            role: 'assistant',
            content: `Now exploring **${activeProduct.brand} ${activeProduct.name}**.\n\nAsk me how to prepare any specific dish in this model (e.g. Samosas, Pizza, Cake, Paneer Tikka)!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            youtubeLinks: activeProduct.youtubeSearchQuery
              ? [{ title: `${activeProduct.name} Demonstration`, query: activeProduct.youtubeSearchQuery }]
              : undefined,
          },
        ]);
      }
    }
  }, [activeProduct, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { reply } = await sendAIChatMessage({
        message: query,
        history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        currentProduct: activeProduct,
        customApiKey,
      });

      // Check if YouTube recommendations can be extracted
      const searchTerms: { title: string; query: string }[] = [];
      if (reply.toLowerCase().includes('youtube')) {
        const dishMatch = query.match(/(how to (make|prepare|cook)|recipe for)\s+([a-zA-Z\s]+)/i);
        const dish = dishMatch ? dishMatch[3] : 'appliance recipe';
        searchTerms.push({
          title: `YouTube Demo: ${dish} in ${activeProduct?.brand || 'Appliance'}`,
          query: `${activeProduct?.brand || ''} ${activeProduct?.name || ''} ${dish} recipe`,
        });
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        youtubeLinks: searchTerms.length > 0 ? searchTerms : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Resilient local fallback if any unexpected error occurs
      const fallbackReply = activeProduct
        ? `### 👨‍🍳 AI Chef Floor Guidance: **${activeProduct.brand} ${activeProduct.name}**\n\n` +
          `**Appliance Features:** ${activeProduct.power || activeProduct.capacity} (${activeProduct.category})\n` +
          `• **Recommended Temperature:** 180°C - 200°C for baking/crisping; 60°C - 80°C for warming.\n` +
          `• **Top Prepared Dishes:** ${activeProduct.recipes?.map(r => r.name).join(', ') || 'Cakes, Samosas, Grilled Veggies'}.\n` +
          `• **Key Selling Pitch Hook:** "${activeProduct.promoterPitchHook}"\n\n` +
          `*(Note: Guidance delivered via built-in culinary intelligence)*`
        : `### 👨‍🍳 SALES AI Chef Guidance\n\n` +
          `Select any appliance or dish image in the catalog to get exact cooking temperatures, time presets, and YouTube demonstration links.\n\n` +
          `*(Note: Built-in culinary intelligence is active)*`;

      setMessages((prev) => [
        ...prev,
        {
          id: `fallback-${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'new-chat',
        role: 'assistant',
        content: `Chat history cleared. What would you like to prepare in ${activeProduct ? activeProduct.name : 'our kitchen appliances'}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-[90] bg-white dark:bg-black flex flex-col text-black dark:text-white transition-colors duration-300">
      {/* Full-Screen Header */}
      <header className="w-full bg-white/90 dark:bg-black/90 border-b border-black/10 dark:border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-playfair text-base sm:text-lg font-bold tracking-tight">
                SALES Culinary AI Co-Pilot
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/20">
                Full-Screen Mode
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-sm sm:max-w-md">
              {activeProduct
                ? `Active Appliance: ${activeProduct.brand} ${activeProduct.name}`
                : 'Customer Demonstration & Recipe Intelligence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            title="Clear conversation"
            className="p-2 text-neutral-500 hover:text-black dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Full-Screen AI"
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Body */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden p-4 sm:p-6">
        {/* Quick prompt chips */}
        <div className="mb-3 flex items-center gap-2 overflow-x-auto py-1 no-scrollbar shrink-0">
          <span className="font-playfair text-xs font-semibold text-neutral-500 dark:text-neutral-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Quick Topics:
          </span>
          {activeProduct ? (
            <>
              <button
                onClick={() =>
                  handleSendMessage(
                    `How do I prepare crispy Samosas or Fries in this ${activeProduct.name}? Give exact temperature and timer.`
                  )
                }
                className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs transition font-playfair shrink-0"
              >
                🍳 How to cook in this model
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `What are all the different dishes and recipes I can prepare in this ${activeProduct.brand} ${activeProduct.name}?`
                  )
                }
                className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs transition font-playfair shrink-0"
              >
                📖 Complete list of dishes possible
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `Recommend the best YouTube demonstration videos for cooking in the ${activeProduct.name}.`
                  )
                }
                className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs transition font-playfair shrink-0"
              >
                ▶️ YouTube recipe demos
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  handleSendMessage(
                    'What recipes can be prepared in an Air Fryer versus an OTG Oven?'
                  )
                }
                className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs transition font-playfair shrink-0"
              >
                🥘 Air Fryer vs OTG recipes
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    'Which kitchen appliance is best for baking cakes, pizzas, and garlic bread?'
                  )
                }
                className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs transition font-playfair shrink-0"
              >
                🍕 Best appliance for baking
              </button>
            </>
          )}
        </div>

        {/* Message Feed in Full Screen */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 text-sm sm:text-base leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium rounded-tr-sm shadow-md'
                    : 'bg-black/5 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-tl-sm shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {/* YouTube Link Cards if any */}
                {m.youtubeLinks && m.youtubeLinks.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                    <span className="text-xs font-playfair font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Youtube className="w-4 h-4 text-red-500" /> Recommended YouTube Recipe Demo:
                    </span>
                    {m.youtubeLinks.map((yt, idx) => (
                      <a
                        key={idx}
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          yt.query
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/15 text-xs sm:text-sm transition group"
                      >
                        <span className="truncate pr-2 font-medium">{yt.title}</span>
                        <ExternalLink className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>{m.timestamp}</span>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:opacity-80 flex items-center gap-1 transition"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/20">
                <ChefHat className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-black/5 dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-2xl rounded-tl-sm px-5 py-3.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping" />
                <span>AI Chef is computing cooking instructions & model settings...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Full-Screen Input Bar */}
        <div className="pt-3 border-t border-black/10 dark:border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeProduct
                  ? `Ask how to prepare any recipe in ${activeProduct.name}...`
                  : 'Ask AI how to prepare any recipe or recommend an appliance...'
              }
              className="flex-1 bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/20 focus:border-black dark:focus:border-white text-black dark:text-white rounded-2xl px-4 py-3 text-sm sm:text-base placeholder:text-neutral-400 focus:outline-none transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-black text-white dark:bg-white dark:text-black disabled:opacity-40 font-playfair font-bold rounded-2xl text-sm sm:text-base transition flex items-center gap-2 shadow-md active:scale-95 shrink-0 hover:opacity-90"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
