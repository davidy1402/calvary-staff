import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EasterEggModal } from './EasterEggModal';
import { Sparkles, Gift } from 'lucide-react';

interface BottomPullEasterEggProps {
  language: 'zh' | 'en';
}

export const BottomPullEasterEgg: React.FC<BottomPullEasterEggProps> = ({ language }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [pullCount, setPullCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  // Check if page is scrolled to bottom
  const isAtBottom = useCallback(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    return scrollY + windowHeight >= docHeight - 35;
  }, []);

  const triggerEasterEgg = useCallback(() => {
    setIsModalOpen(true);
    setPullDistance(0);
    setPullCount(0);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (isAtBottom()) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        startYRef.current = null;
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || startYRef.current === null) return;
      if (!isAtBottom()) {
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const dy = startYRef.current - currentY; // positive when pulling UP (trying to scroll past bottom)

      if (dy > 0) {
        // Apply resistance physics: square root dampening
        const dampened = Math.min(120, Math.pow(dy, 0.85) * 2.2);
        setPullDistance(dampened);
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 65) {
        triggerEasterEgg();
      } else if (pullDistance > 25) {
        setPullCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            triggerEasterEgg();
            return 0;
          }
          return next;
        });
      }
      setPullDistance(0);
      isPullingRef.current = false;
      startYRef.current = null;
    };

    // Wheel event for desktop trackpad / mouse
    let wheelAccumulator = 0;
    let wheelTimer: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (!isAtBottom()) {
        wheelAccumulator = 0;
        return;
      }

      if (e.deltaY > 0) {
        wheelAccumulator += e.deltaY;
        setPullDistance(Math.min(80, wheelAccumulator * 0.4));

        if (wheelTimer) window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          if (wheelAccumulator > 120) {
            triggerEasterEgg();
          }
          wheelAccumulator = 0;
          setPullDistance(0);
        }, 300);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimer) window.clearTimeout(wheelTimer);
    };
  }, [isAtBottom, pullDistance, triggerEasterEgg]);

  // Fallback tap trigger: tap 5 times on bottom area
  const handleFooterTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 5) {
      triggerEasterEgg();
      tapCountRef.current = 0;
    } else {
      tapTimerRef.current = window.setTimeout(() => {
        tapCountRef.current = 0;
      }, 1500);
    }
  };

  const isVisible = pullDistance > 8 || pullCount > 0;

  return (
    <>
      {/* Interactive Bottom Pull Indicator */}
      <div
        ref={containerRef}
        onClick={handleFooterTap}
        className="text-center pt-2 pb-6 select-none cursor-pointer"
        style={{
          transform: `translateY(-${Math.min(pullDistance * 0.4, 25)}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
        }}
      >
        {/* Dynamic Pull Visualizer */}
        <div
          className={`overflow-hidden transition-all duration-200 flex flex-col items-center justify-center ${
            isVisible ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'
          }`}
          style={{ height: isVisible ? `${Math.max(36, pullDistance * 0.85)}px` : '0px' }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-xs animate-pulse">
            {pullDistance > 65 ? (
              <>
                <Sparkles size={14} className="text-amber-500 animate-spin" />
                <span>{language === 'zh' ? '松开召唤彩蛋！🎉' : 'Release to unlock! 🎉'}</span>
              </>
            ) : pullCount > 0 ? (
              <>
                <Gift size={13} className="text-blue-600 dark:text-blue-400" />
                <span>
                  {language === 'zh'
                    ? `再用力拉 ${3 - pullCount} 次... ✨`
                    : `Pull ${3 - pullCount} more times... ✨`}
                </span>
              </>
            ) : (
              <>
                <Gift size={13} className="text-blue-600 dark:text-blue-400" />
                <span>{language === 'zh' ? '继续往下拉到底... 👀' : 'Keep pulling down... 👀'}</span>
              </>
            )}
          </div>
        </div>

        {/* Discrete hint dots */}
        <div className="flex justify-center items-center gap-1 py-1 opacity-25 hover:opacity-70 transition-opacity">
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-zinc-600" />
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-zinc-600" />
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-zinc-600" />
        </div>
      </div>

      {/* Pop-up Celebration Modal */}
      <EasterEggModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
      />
    </>
  );
};
