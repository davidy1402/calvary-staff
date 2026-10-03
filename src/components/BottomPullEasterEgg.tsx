import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EasterEggModal } from './EasterEggModal';
import { PartyPopper } from 'lucide-react';

interface BottomPullEasterEggProps {
  language: 'zh' | 'en';
}

export const BottomPullEasterEgg: React.FC<BottomPullEasterEggProps> = ({ language }) => {
  const [pullDistance, setPullDistance] = useState(0);
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
    return scrollY + windowHeight >= docHeight - 30;
  }, []);

  const triggerEasterEgg = useCallback(() => {
    setIsModalOpen(true);
    setPullDistance(0);
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
      const dy = startYRef.current - currentY; // positive when pulling UP past bottom

      if (dy > 0) {
        // Natural rubberband resistance physics
        const dampened = Math.min(90, Math.pow(dy, 0.82) * 1.8);
        setPullDistance(dampened);
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 55) {
        triggerEasterEgg();
      }
      setPullDistance(0);
      isPullingRef.current = false;
      startYRef.current = null;
    };

    // Desktop trackpad / mouse wheel support
    let wheelAccumulator = 0;
    let wheelTimer: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (!isAtBottom()) {
        wheelAccumulator = 0;
        return;
      }

      if (e.deltaY > 0) {
        wheelAccumulator += e.deltaY;
        setPullDistance(Math.min(75, wheelAccumulator * 0.35));

        if (wheelTimer) window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          if (wheelAccumulator > 100) {
            triggerEasterEgg();
          }
          wheelAccumulator = 0;
          setPullDistance(0);
        }, 260);
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

  // Discrete fallback: tap 5 times on bottom area
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

  const isTriggerReady = pullDistance > 55;
  const scale = Math.min(1.25, 0.4 + (pullDistance / 55) * 0.65);
  const opacity = Math.min(1, pullDistance / 25);
  const rotation = Math.sin(pullDistance * 0.1) * 12;

  return (
    <>
      {/* Pure Tactile Rubberband Peek (Zero AI text banners) */}
      <div
        ref={containerRef}
        onClick={handleFooterTap}
        className="w-full flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden transition-all duration-150"
        style={{
          height: `${Math.max(16, pullDistance)}px`,
        }}
        aria-hidden="true"
      >
        <div
          className={`flex items-center justify-center transition-colors duration-150 ${
            isTriggerReady
              ? 'text-amber-500 scale-110'
              : 'text-slate-400 dark:text-zinc-500'
          }`}
          style={{
            opacity: opacity,
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: pullDistance === 0 ? 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
          }}
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shadow-2xs">
            <PartyPopper size={16} strokeWidth={isTriggerReady ? 2.2 : 1.75} />
          </div>
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
