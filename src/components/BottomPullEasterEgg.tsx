import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EasterEggModal } from './EasterEggModal';

interface BottomPullEasterEggProps {
  language: 'zh' | 'en';
  disabled?: boolean;
}

export const BottomPullEasterEgg: React.FC<BottomPullEasterEggProps> = ({ language, disabled = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0 to 5 dots
  const [dragNudge, setDragNudge] = useState(0);

  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  // Check if user is scrolled to bottom
  const isAtBottom = useCallback(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    return scrollY + windowHeight >= docHeight - 25;
  }, []);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    isHoldingRef.current = false;
    setPullProgress(0);
  }, []);

  const triggerEasterEgg = useCallback(() => {
    clearHold();
    setIsModalOpen(true);
    setDragNudge(0);
    tapCountRef.current = 0;
  }, [clearHold]);

  const startHold = useCallback(() => {
    if (isHoldingRef.current) return;

    isHoldingRef.current = true;
    setPullProgress(1);

    try {
      if ('vibrate' in navigator) navigator.vibrate(15);
    } catch {
      // ignore
    }

    let currentStep = 1;
    progressIntervalRef.current = window.setInterval(() => {
      currentStep += 1;
      setPullProgress(Math.min(5, currentStep));
      try {
        if ('vibrate' in navigator) navigator.vibrate(12);
      } catch {
        // ignore
      }
    }, 220);

    holdTimerRef.current = window.setTimeout(() => {
      triggerEasterEgg();
    }, 1200);
  }, [triggerEasterEgg]);

  useEffect(() => {
    const isInsideOpenDialog = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('dialog[open]'));

    const handleTouchStart = (e: TouchEvent) => {
      if (disabled || isInsideOpenDialog(e.target)) {
        clearHold();
        startYRef.current = null;
        isPullingRef.current = false;
        return;
      }
      if (isAtBottom()) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        startYRef.current = null;
        isPullingRef.current = false;
        clearHold();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (disabled || isInsideOpenDialog(e.target)) return;
      if (!isPullingRef.current || startYRef.current === null) return;
      if (!isAtBottom()) {
        clearHold();
        return;
      }
      const dy = Math.max(0, startYRef.current - e.touches[0].clientY);
      setDragNudge(Math.min(12, Math.pow(dy, 0.75)));

      // Pull past the threshold, then keep holding for a short moment.
      if (dy >= 45) {
        startHold();
      } else if (dy < 30) {
        clearHold();
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current || startYRef.current === null) return;
      clearHold();
      setDragNudge(0);
      isPullingRef.current = false;
      startYRef.current = null;
    };

    // Desktop trackpad / wheel: keep scrolling at the bottom for the same hold duration.
    let wheelHoldTimer: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (disabled || isInsideOpenDialog(e.target)) {
        clearHold();
        return;
      }
      if (!isAtBottom()) {
        clearHold();
        return;
      }

      if (e.deltaY > 0) {
        startHold();
        if (wheelHoldTimer) window.clearTimeout(wheelHoldTimer);
        wheelHoldTimer = window.setTimeout(() => {
          clearHold();
        }, 400);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      clearHold();
      if (wheelHoldTimer) window.clearTimeout(wheelHoldTimer);
    };
  }, [disabled, isAtBottom, startHold, clearHold]);

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
