import React from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Download, 
  Bot, 
  Store
} from 'lucide-react';
import { PromoterProfile, AppTheme, Product } from '../types';
import { DynamicIsland } from './DynamicIsland';

interface NavbarProps {
  profile: PromoterProfile;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenSettings: (tab?: string) => void;
  isSettingsOpen: boolean;
  onOpenAI: () => void;
  isAIOpen: boolean;
  activeProductForAI: Product | null;
  onInstallApp: () => void;
  isInstallable: boolean;
  activeBrand?: string;
  onSelectBrand?: (brand: 'All' | 'Bajaj' | 'Morphy Richards') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  theme,
  onToggleTheme,
  onOpenSettings,
  isSettingsOpen,
  onOpenAI,
  isAIOpen,
  activeProductForAI,
  onInstallApp,
  isInstallable,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl text-black dark:text-white border-b border-black/10 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.15)] dark:shadow-[0_4px_25px_-2px_rgba(234,179,8,0.25)] transition-colors duration-300">
      {/* Top Thinking Luminous Shine Beam */}
      <div className="absolute top-0 inset-x-0 h-[2px] overflow-hidden pointer-events-none z-20">
        <div className="w-full h-full navbar-thinking-beam" />
      </div>

      {/* Bottom Thinking Luminous Shine Beam (shines like thinking text) */}
      <div className="absolute -bottom-[1px] inset-x-0 h-[2px] overflow-hidden pointer-events-none z-20">
        <div className="w-full h-full navbar-thinking-beam" />
      </div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4 relative">
        {/* Zone 1: Brand Wordmark with Thinking Text Shimmer */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md relative overflow-hidden group shrink-0">
              <span className="font-playfair text-xs sm:text-sm font-bold tracking-widest relative z-10">
                S
              </span>
              <div className="absolute inset-0 thinking-shimmer-bar opacity-40" />
            </div>
            <div className="flex flex-col">
              <span className="font-playfair text-base sm:text-xl font-bold tracking-[0.16em] uppercase leading-none thinking-shimmer-text">
                SALES
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[7.5px] sm:text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium leading-tight">
                  Promoters Hub
                </span>
                <span className="inline-flex items-center gap-0.5 text-[7px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                  <span className="hidden xs:inline">Thinking</span>
                </span>
              </div>
            </div>
          </div>

          {/* Store location tag (desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-black/10 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400">
            <Store className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-200" />
            <span className="truncate max-w-[180px]" title={profile.storeLocation}>
              {profile.storeLocation}
            </span>
          </div>
        </div>

        {/* Zone 2: Center Cool & Compact Dynamic Island */}
        <div className="flex items-center justify-center shrink-0">
          <DynamicIsland
            activeProduct={activeProductForAI}
            onOpenAI={onOpenAI}
            isAIOpen={isAIOpen}
          />
        </div>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={onInstallApp}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 border border-black/15 dark:border-white/20 text-black dark:text-white rounded-full text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="Install app on this device"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install</span>
            </button>
          )}

          {/* AI Trigger (desktop/tablet; on mobile Dynamic Island serves as the AI Chef trigger) */}
          <button
            onClick={onOpenAI}
            className={`hidden sm:flex p-1.5 sm:px-3 sm:py-1.5 rounded-full border text-xs font-medium items-center gap-1.5 transition shadow-sm active:scale-95 ${
              isAIOpen
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border-black/10 dark:border-white/15 text-black dark:text-white'
            }`}
            title="Open AI Chef Assistant"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden md:inline font-playfair font-semibold">AI Chef</span>
          </button>

          {/* Theme Switcher: Crisp Black & White */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/15 text-black dark:text-white transition shadow-sm active:scale-90"
            title={`Current: ${isDark ? 'Black' : 'White'} mode. Click to switch.`}
            aria-label="Toggle Black and White Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-white" />
            ) : (
              <Moon className="w-4 h-4 text-black" />
            )}
          </button>

          {/* Settings Trigger with Active State */}
          <button
            onClick={() => onOpenSettings()}
            className={`p-1.5 sm:p-2 rounded-full border transition active:scale-90 ${
              isSettingsOpen
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm ring-1 ring-black dark:ring-white'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border-black/10 dark:border-white/15 text-black dark:text-white'
            }`}
            title={isSettingsOpen ? 'Close Settings' : 'Settings, Profile & Catalog Management'}
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Promoter Profile Avatar Chip (visible on tablet/desktop) */}
          <button
            onClick={() => onOpenSettings('profile')}
            className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-left transition"
            title="Promoter Profile & Store Info"
          >
            <div className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black font-playfair font-bold text-xs flex items-center justify-center shrink-0">
              {profile.name ? profile.name.charAt(0) : 'P'}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold leading-none truncate max-w-[90px]">
                {profile.name}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                {profile.empId}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
