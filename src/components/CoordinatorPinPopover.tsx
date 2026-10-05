import React, { useEffect, useId, useRef, useState } from 'react';
import { MoreHorizontal, ShieldCheck, X } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

export const CoordinatorPinPopover: React.FC = () => {
  const { language, isEditMode, startAdminEditing, exitAdminEditing } = useChurch();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<'menu' | 'pin'>('menu');
  const [showEditModeNotice, setShowEditModeNotice] = useState(false);
  const noticeTimer = useRef<number | null>(null);
  const zh = language === 'zh';

  useEffect(() => () => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
  }, []);

  return <>
    <button type="button" popoverTarget={id} aria-haspopup="dialog"
      aria-label={zh ? '更多选项' : 'More options'}
      className="min-h-11 min-w-11 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors">
      <MoreHorizontal size={20} />
    </button>
    <div id={id} ref={panel} popover="auto" role="dialog" aria-labelledby={`${id}-title`}
      onToggle={(event) => {
        if (event.newState === 'open' && view === 'pin') input.current?.focus();
        else if (event.newState === 'closed') { setPin(''); setError(false); setView('menu'); }
      }}
      className="pin-popover fixed inset-0 m-auto w-[min(340px,calc(100vw-32px))] max-h-fit p-5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xl">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 id={`${id}-title`} className="font-bold text-base">{zh ? '更多选项' : 'More options'}</h2>
        <button type="button" popoverTarget={id} popoverTargetAction="hide" aria-label={zh ? '关闭' : 'Close'} className="min-h-11 min-w-11 -mr-2 rounded-lg flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"><X size={18} /></button>
      </div>
      {view === 'menu' ? (
        <div className="pt-1">
          {isEditMode ? (
            <button
              type="button"
              onClick={() => { exitAdminEditing(); panel.current?.hidePopover(); }}
              className="min-h-12 w-full px-3 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-3"
            >
              <ShieldCheck size={17} className="text-slate-500" />
              {zh ? '退出编辑模式' : 'Exit edit mode'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setView('pin'); requestAnimationFrame(() => input.current?.focus()); }}
              className="min-h-12 w-full px-3 rounded-xl text-left text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-3"
            >
              <ShieldCheck size={17} className="text-slate-500" />
              {zh ? '进入编辑模式' : 'Enter edit mode'}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          const result = await startAdminEditing(pin);
          setIsSubmitting(false);
          if (!result.error) {
            panel.current?.hidePopover();
            setShowEditModeNotice(true);
            if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
            noticeTimer.current = window.setTimeout(() => setShowEditModeNotice(false), 2600);
          } else {
            setError(true);
            input.current?.select();
          }
        }}>
          <button type="button" onClick={() => { setView('menu'); setError(false); }} className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3">
            {zh ? '返回' : 'Back'}
          </button>
          <p className="mb-4 text-sm text-slate-600 dark:text-zinc-400">{zh ? '输入管理 PIN 后可进入编辑模式。' : 'Enter the management PIN to edit the roster.'}</p>
          <label htmlFor={`${id}-input`} className="block text-sm font-medium mb-2">PIN</label>
          <input ref={input} id={`${id}-input`} type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={12} value={pin}
            aria-invalid={error} aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => { setPin(event.target.value.replace(/\D/g, '')); setError(false); }}
            className="w-full min-h-12 px-3 rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-base tracking-[0.35em] focus:ring-2 focus:ring-blue-600" />
          {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-400">{zh ? 'PIN 不正确或管理验证尚未配置，请重试。' : 'Incorrect PIN or management verification is unavailable.'}</p>}
          <button disabled={isSubmitting} type="submit" className="mt-4 min-h-11 w-full rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors">{zh ? '进入编辑模式' : 'Enter edit mode'}</button>
        </form>
      )}
    </div>
    {showEditModeNotice && (
      <div role="status" className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
        {zh ? '已进入编辑模式' : 'Edit mode is on'}
      </div>
    )}
  </>;
};
