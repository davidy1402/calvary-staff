import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  dismissible?: boolean;
  labelledBy?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen, onClose, children, className = 'bg-white dark:bg-zinc-900',
  maxHeight = '88dvh', dismissible = true, labelledBy,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const closeCallback = useRef(onClose);
  useEffect(() => { closeCallback.current = onClose; }, [onClose]);

  const triggerClose = useCallback(() => {
    if (!dismissible || timeout.current || !dialog.current?.open) return;
    dialog.current.classList.add('sheet-closing');
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
    timeout.current = setTimeout(() => {
      timeout.current = null;
      dialog.current?.close();
      closeCallback.current();
    }, duration);
  }, [dismissible]);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (!isOpen) { node.close(); return; }
    node.classList.remove('sheet-closing');
    node.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.querySelector<HTMLElement>('[data-sheet-initial-focus]')?.focus();
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = null;
      node.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const endDrag = () => {
    if (dragY > 75) triggerClose();
    startY.current = null;
    setDragY(0);
  };

  return createPortal(
    <dialog ref={dialog} aria-labelledby={labelledBy} className="bottom-sheet-dialog"
      onCancel={(event) => { event.preventDefault(); triggerClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) triggerClose(); }}>
      <div className="sheet-positioner" onClick={(event) => { if (event.target === event.currentTarget) triggerClose(); }}>
        <div style={{ maxHeight, ...(dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : {}) }}
          className={`sheet-panel w-full max-w-lg mx-auto rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden ${className}`}>
          {dismissible ? <div
            onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); startY.current = event.clientY; }}
            onPointerMove={(event) => { if (startY.current !== null) setDragY(Math.max(0, event.clientY - startY.current)); }}
            onPointerUp={endDrag} onPointerCancel={() => { startY.current = null; setDragY(0); }}
            className="pt-3 pb-2 flex justify-center shrink-0 cursor-grab touch-none select-none" aria-hidden="true">
            <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full" />
          </div> : <div className="h-4 shrink-0" />}
          {children}
        </div>
      </div>
    </dialog>, document.body,
  );
};
