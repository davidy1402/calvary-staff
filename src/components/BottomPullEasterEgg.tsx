import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EasterEggModal } from './EasterEggModal';

interface BottomPullEasterEggProps {
  language: 'zh' | 'en';
}

export const BottomPullEasterEgg: React.FC<BottomPullEasterEggProps> = ({ language }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isPullingRef.current || startYRef.current === null) return;
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

        if (pullTimerRef.current) window.clearTimeout(pullTimerRef.current);
        pullTimerRef.current = window.setTimeout(() => {
          pullCountRef.current = 0;
        }, 2500);

        // Require pulling hard 5 times at bottom within 2.5 seconds
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
        if (wheelTimer) window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          // Hard rapid scroll
          if (wheelAccumulator > 380) {
            triggerEasterEgg();
          }
          wheelAccumulator = 0;
        }, 300);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimer) window.clearTimeout(wheelTimer);
      if (pullTimerRef.current) window.clearTimeout(pullTimerRef.current);
    };
  }, [isAtBottom, triggerEasterEgg]);

  // Discrete fallback: 10 rapid taps on bottom area
  const handleFooterTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 10) {
      triggerEasterEgg();
    } else {
      tapTimerRef.current = window.setTimeout(() => {
        tapCountRef.current = 0;
      }, 1800);
    }
  };

  return (
    <>
      {/* Invisible trigger area - zero text, zero prompts, zero emojis */}
      <div
        onClick={handleFooterTap}
        className="w-full h-8 select-none"
        aria-hidden="true"
      />

      {/* Pop-up Celebration Modal */}
      <EasterEggModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
      />
    </>
  );
};
