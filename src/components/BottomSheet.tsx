import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  className = 'bg-white',
  maxHeight = '88vh',
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const triggerClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      setDragY(0);
      document.body.style.overflow = '';
      onClose();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      if (!isRendered) {
        setIsRendered(true);
      }
      setIsClosing(false);
      setDragY(0);
      document.body.style.overflow = 'hidden';
    } else if (isRendered) {
      triggerClose();
    }
  }, [isOpen, isRendered, triggerClose]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startYRef.current;
    if (deltaY > 0) {
      setDragY(deltaY);
      currentYRef.current = e.clientY;
    } else {
      setDragY(0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture release fails
    }

    const deltaY = currentYRef.current - startYRef.current;
    if (deltaY > 75) {
      triggerClose();
    } else {
      setDragY(0);
    }
  };

  if (!isRendered) return null;

  let transformStyle = 'translateY(0)';
  let transitionStyle = isDragging
    ? 'none'
    : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';

  if (isClosing) {
    transformStyle = 'translateY(100%)';
    transitionStyle = 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)';
  } else if (isDragging || dragY > 0) {
    transformStyle = `translateY(${dragY}px)`;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-200 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-backdrop'
      }`}
      onClick={triggerClose}
    >
      <div
        style={{
          transform: transformStyle,
          transition: transitionStyle,
          maxHeight,
        }}
        className={`w-full max-w-lg mx-auto rounded-t-[28px] rounded-b-none shadow-2xl flex flex-col overflow-hidden ${
          isClosing || isDragging || dragY > 0 ? '' : 'animate-sheet-up'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Draggable Grab Handle Zone */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full pt-3 pb-2 flex justify-center bg-inherit shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          title="向下拖拽关闭"
        >
          <div className="w-10 h-1 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors" />
        </div>

        {/* Content */}
        {children}
      </div>
    </div>,
    document.body
  );
};
