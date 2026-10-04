import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAfterClose?: () => void;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  dismissible?: boolean;
  labelledBy?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen, onClose, onAfterClose, children, className = 'bg-white dark:bg-zinc-900',
  maxHeight = '88dvh', dismissible = true, labelledBy,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frames = useRef<number[]>([]);
  const startY = useRef<number | null>(null);
  const dragY = useRef(0);
  const previousOverflow = useRef('');
  const callbacks = useRef({ onClose, onAfterClose });
  useEffect(() => { callbacks.current = { onClose, onAfterClose }; });

  const triggerClose = useCallback(() => {
    if (!dismissible || timeout.current || !dialog.current?.open) return;
    const node = dialog.current;
    node.dataset.state = 'closing';
    panel.current?.removeAttribute('data-dragging');
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    // Delay the close request too: some callers unmount their sheet when closed.
    timeout.current = setTimeout(() => {
      timeout.current = null;
      node.close();
      document.body.style.overflow = previousOverflow.current;
      startY.current = null;
      dragY.current = 0;
      panel.current?.style.removeProperty('--sheet-drag');
      callbacks.current.onClose();
      callbacks.current.onAfterClose?.();
    }, duration);
  }, [dismissible]);

  useEffect(() => {
    const node = dialog.current;
    return () => {
      frames.current.forEach(cancelAnimationFrame);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = null;
      if (node?.open) {
        node.close();
        document.body.style.overflow = previousOverflow.current;
      }
    };
  }, []);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    frames.current.forEach(cancelAnimationFrame);
    frames.current = [];
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;

    if (isOpen) {
      if (!node.open) {
        previousOverflow.current = document.body.style.overflow;
        node.dataset.state = 'entering';
        node.showModal();
        document.body.style.overflow = 'hidden';
        node.querySelector<HTMLElement>('[data-sheet-initial-focus]')?.focus({ preventScroll: true });
      }
      // Paint the initial position before transitioning; also supports reopening mid-exit.
      frames.current.push(requestAnimationFrame(() => {
        frames.current.push(requestAnimationFrame(() => { node.dataset.state = 'open'; }));
      }));
    } else if (node.open) {
      node.dataset.state = 'closing';
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
      timeout.current = setTimeout(() => {
        timeout.current = null;
        node.close();
        document.body.style.overflow = previousOverflow.current;
        startY.current = null;
        dragY.current = 0;
        panel.current?.style.removeProperty('--sheet-drag');
        callbacks.current.onAfterClose?.();
      }, duration);
    }
  }, [isOpen]);

  const resetDrag = () => {
    startY.current = null;
    dragY.current = 0;
    panel.current?.removeAttribute('data-dragging');
    panel.current?.style.removeProperty('--sheet-drag');
  };

  const endDrag = () => {
    if (dragY.current > 75) triggerClose();
    resetDrag();
  };

  return createPortal(
    <dialog ref={dialog} aria-labelledby={labelledBy} className="bottom-sheet-dialog"
      onCancel={(event) => { event.preventDefault(); triggerClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) triggerClose(); }}>
      <div className="sheet-positioner" onClick={(event) => { if (event.target === event.currentTarget) triggerClose(); }}>
        <div ref={panel} style={{ maxHeight }}
          className={`sheet-panel w-full max-w-lg mx-auto rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden ${className}`}>
          {dismissible ? <div
            onPointerDown={(event) => {
              if (timeout.current) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              startY.current = event.clientY;
              panel.current?.setAttribute('data-dragging', '');
            }}
            onPointerMove={(event) => {
              if (startY.current === null) return;
              dragY.current = Math.max(0, event.clientY - startY.current);
              // Keep pointer tracking off React's render path, especially for long lists.
              panel.current?.style.setProperty('--sheet-drag', `${dragY.current}px`);
            }}
            onPointerUp={endDrag} onPointerCancel={resetDrag} onLostPointerCapture={resetDrag}
            className="pt-3 pb-2 flex justify-center shrink-0 cursor-grab touch-none select-none" aria-hidden="true">
            <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full" />
          </div> : <div className="h-4 shrink-0" />}
          {children}
        </div>
      </div>
    </dialog>, document.body,
  );
};
