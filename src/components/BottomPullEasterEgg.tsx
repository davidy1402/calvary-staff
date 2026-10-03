import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EasterEggModal } from './EasterEggModal';

interface BottomPullEasterEggProps {
  language: 'zh' | 'en';
}

export const BottomPullEasterEgg: React.FC<BottomPullEasterEggProps> = ({ language }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0 to 5
  const [dragNudge, setDragNudge] = useState(0);

  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const pullCountRef = useRef(0);
  const pullTimerRef = useRef<number | null>(null);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  // Check if user is scrolled to bottom
  const isAtBottom = useCallback(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    return scrollY + windowHeight >= docHeight - 20;
  }, []);

  const triggerEasterEgg = useCallback(() => {
    setIsModalOpen(true);
    pullCountRef.current = 0;
    setPullProgress(0);
    setDragNudge(0);
    tapCountRef.current = 0;
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
        setDragNudge(0);
        return;
      }
      const dy = Math.max(0, startYRef.current - e.touches[0].clientY);
      setDragNudge(Math.min(12, Math.pow(dy, 0.75)));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isPullingRef.current || startYRef.current === null) return;
      setDragNudge(0);

      if (!isAtBottom()) {
        isPullingRef.current = false;
        startYRef.current = null;
        return;
      }

      const endY = e.changedTouches[0]?.clientY ?? startYRef.current;
      const dy = startYRef.current - endY; // positive when dragged UP past bottom

      // Substantial deliberate pull
      if (dy > 70) {
        pullCountRef.current += 1;
        setPullProgress(pullCountRef.current);

        // Subtle haptic tick for each successful pull
        try {
          if ('vibrate' in navigator) navigator.vibrate(15);
        } catch {
          // ignore
        }

        if (pullTimerRef.current) window.clearTimeout(pullTimerRef.current);
        pullTimerRef.current = window.setTimeout(() => {
          pullCountRef.current = 0;
          setPullProgress(0);
        }, 2800);

        // Require pulling hard 5 times at bottom within 2.8 seconds
        if (pullCountRef.current >= 5) {
          triggerEasterEgg();
        }
      }

      isPullingRef.current = false;
      startYRef.current = null;
    };

    // Desktop trackpad / mouse wheel
    let wheelAccumulator = 0;
    let wheelTimer: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (!isAtBottom()) {
        wheelAccumulator = 0;
        return;
      }

      if (e.deltaY > 0) {
        wheelAccumulator += e.deltaY;
        setPullProgress(Math.min(4, Math.floor(wheelAccumulator / 90)));

        if (wheelTimer) window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          if (wheelAccumulator > 380) {
            triggerEasterEgg();
          }
          wheelAccumulator = 0;
          setPullProgress(0);
        }, 320);
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
      if (pullTimerRef.current) window.clearTimeout(pullTimerRef.current);
    };
  }, [isAtBottom, triggerEasterEgg]);

  // Discrete fallback: 10 rapid taps on bottom area
  const handleFooterTap = () => {
    tapCountRef.current += 1;
    setPullProgress(Math.min(5, Math.floor(tapCountRef.current / 2)));

    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 10) {
      triggerEasterEgg();
    } else {
      tapTimerRef.current = window.setTimeout(() => {
        tapCountRef.current = 0;
        setPullProgress(0);
      }, 1800);
    }
  };

  return (
    <>
      {/* Subtle, non-obvious micro hint: tiny discrete dots */}
      <div
        onClick={handleFooterTap}
        className="w-full flex items-center justify-center py-2 select-none cursor-pointer"
        style={{
          transform: `translateY(-${dragNudge}px)`,
          transition: dragNudge === 0 ? 'transform 0.25s ease-out' : 'none',
        }}
        aria-hidden="true"
      >
        <div
          className="flex items-center gap-1.5 transition-opacity duration-300"
          style={{
            opacity: pullProgress > 0 ? 0.35 : 0.1,
          }}
        >
          <span className={`w-1 h-1 rounded-full transition-colors duration-200 ${pullProgress >= 1 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-zinc-600'}`} />
          <span className={`w-1 h-1 rounded-full transition-colors duration-200 ${pullProgress >= 2 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-zinc-600'}`} />
          <span className={`w-1 h-1 rounded-full transition-colors duration-200 ${pullProgress >= 3 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-zinc-600'}`} />
          <span className={`w-1 h-1 rounded-full transition-colors duration-200 ${pullProgress >= 4 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-zinc-600'}`} />
          <span className={`w-1 h-1 rounded-full transition-colors duration-200 ${pullProgress >= 5 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-zinc-600'}`} />
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
