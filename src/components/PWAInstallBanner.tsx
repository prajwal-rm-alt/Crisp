import React, { useState } from 'react';
import { Download, X, Share2, PlusSquare, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  forceShowIOSGuide?: boolean;
  onCloseGuide?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  forceShowIOSGuide,
  onCloseGuide,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || dismissed) {
    if (!forceShowIOSGuide && !showIOSModal) return null;
  }

  const isModalActive = forceShowIOSGuide || showIOSModal;

  return (
    <>
      {/* Floating Bottom Prompt for Android / Desktop */}
      {isInstallable && !dismissed && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 rounded-2xl glass-panel p-4 border border-black/15 dark:border-white/20 shadow-2xl text-black dark:text-white transition-colors">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-md">
                <span className="font-playfair text-xs font-bold tracking-widest">
                  SALES
                </span>
              </div>
              <div>
                <h4 className="font-playfair text-xs font-bold tracking-tight">
                  Install SALES Promoters App
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                  Instant offline store floor access with full native performance
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="text-neutral-500 hover:text-black dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={install}
              className="flex-1 py-2 px-3 bg-black text-white dark:bg-white dark:text-black font-playfair font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition hover:opacity-90 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install to Phone / Home Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {isModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 dark:bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-2xl relative text-center text-black dark:text-white">
            <button
              onClick={() => {
                setShowIOSModal(false);
                onCloseGuide?.();
              }}
              className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-3 shadow-xl">
              <span className="font-playfair text-base font-bold tracking-widest">
                SALES
              </span>
            </div>

            <h3 className="font-playfair text-lg font-bold tracking-tight">
              Install on iPhone / iPad
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-serif">
              Add SALES Hub to your home screen for instantaneous store floor access:
            </p>

            <div className="mt-5 space-y-3 text-left text-xs text-neutral-800 dark:text-neutral-200">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="w-8 h-8 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>
                  1. Tap the <strong>Share</strong> icon in the Safari bottom toolbar.
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="w-8 h-8 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>
                  2. Scroll down and select <strong>"Add to Home Screen"</strong>.
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="w-8 h-8 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <span>
                  3. Tap <strong>Add</strong> in the top-right corner. Done!
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                onCloseGuide?.();
              }}
              className="mt-5 w-full py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black font-playfair font-semibold rounded-xl text-xs transition hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
