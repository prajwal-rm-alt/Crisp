import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

interface LongHoldResetButtonProps {
  onReset: () => void;
  label?: string;
  holdDurationMs?: number;
  className?: string;
}

export const LongHoldResetButton: React.FC<LongHoldResetButtonProps> = ({
  onReset,
  label = 'Reset to Factory Catalog',
  holdDurationMs = 3000,
  className = '',
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [completed, setCompleted] = useState(false);
  const [tapWarning, setTapWarning] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    // Only left click or single touch
    if ('button' in e && e.button !== 0) return;
    setTapWarning(false);
    setCompleted(false);
    setHolding(true);
    startTimeRef.current = Date.now();

    const updateLoop = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / holdDurationMs) * 100);
      setProgress(pct);

      if (pct >= 100) {
        // Trigger reset!
        setHolding(false);
        setCompleted(true);
        startTimeRef.current = null;
        if (navigator.vibrate) navigator.vibrate(100);
        onReset();
        setTimeout(() => {
          setCompleted(false);
          setProgress(0);
        }, 3000);
      } else {
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const cancelHold = () => {
    if (holding && progress < 100) {
      if (progress < 15) {
        // Was just a quick tap/click
        setTapWarning(true);
        setTimeout(() => setTapWarning(false), 3500);
      }
      setHolding(false);
      setProgress(0);
      startTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const remainingSeconds = Math.max(0, ((holdDurationMs * (100 - progress)) / 100 / 1000)).toFixed(1);

  return (
    <div className="space-y-2 w-full">
      <div className="relative overflow-hidden rounded-2xl select-none">
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onTouchCancel={cancelHold}
          className={`w-full relative py-3 px-4 font-playfair font-semibold text-xs rounded-2xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
            completed
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
              : holding
              ? 'bg-red-600 text-white border-red-700 shadow-lg scale-[0.99]'
              : 'bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
          } ${className}`}
        >
          {/* Active progress fill bar */}
          {holding && (
            <div
              className="absolute inset-y-0 left-0 bg-red-700/60 transition-all duration-75 pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          )}

          <div className="relative z-10 flex items-center justify-center gap-2">
            {completed ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Catalog Reset to Factory Defaults!</span>
              </>
            ) : holding ? (
              <>
                <ShieldAlert className="w-4 h-4 animate-pulse text-white" />
                <span>Hold to reset: {remainingSeconds}s remaining...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>{label} (Long Press 3s)</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Tap warning if user just clicked instead of holding */}
      {tapWarning && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-xl text-amber-700 dark:text-amber-300 text-[11px] animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Safety Lock:</strong> Please <strong>press and hold for 3 seconds</strong> to reset to factory specifications. This prevents accidental deletion of your products.
          </span>
        </div>
      )}
    </div>
  );
};
