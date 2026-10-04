import React, { useId, useRef, useState } from 'react';
import { Edit2, X } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

export const CoordinatorPinPopover: React.FC = () => {
  const { language, setUserMode } = useChurch();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const zh = language === 'zh';

  return <>
    <button type="button" popoverTarget={id} aria-haspopup="dialog"
      className="min-h-11 px-3 text-xs font-semibold text-slate-700 dark:text-zinc-300 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors">
      <Edit2 size={14} />{zh ? '管理排班' : 'Edit'}
    </button>
    <div id={id} ref={panel} popover="auto" role="dialog" aria-labelledby={`${id}-title`}
      onToggle={(event) => {
        if (event.newState === 'open') input.current?.focus();
        else { setPin(''); setError(false); }
      }}
      className="pin-popover fixed inset-0 m-auto w-[min(340px,calc(100vw-32px))] max-h-fit p-5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xl">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 id={`${id}-title`} className="font-bold text-base">{zh ? '统筹管理' : 'Coordinator access'}</h2>
        <button type="button" popoverTarget={id} popoverTargetAction="hide" aria-label={zh ? '关闭' : 'Close'} className="min-h-11 min-w-11 -mr-2 rounded-lg flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"><X size={18} /></button>
      </div>
      <p className="mb-4 text-sm text-slate-600 dark:text-zinc-400">{zh ? '输入 PIN 后可编辑排班。' : 'Enter your PIN to edit the roster.'}</p>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (['2026', '1402', '1234'].includes(pin)) {
          panel.current?.hidePopover();
          setUserMode('editor');
        } else { setError(true); input.current?.select(); }
      }}>
        <label htmlFor={`${id}-input`} className="block text-sm font-medium mb-2">PIN</label>
        <input ref={input} id={`${id}-input`} type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={pin}
          aria-invalid={error} aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => { setPin(event.target.value.replace(/\D/g, '')); setError(false); }}
          className="w-full min-h-12 px-3 rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-base tracking-[0.35em] focus:ring-2 focus:ring-blue-600" />
        {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-400">{zh ? 'PIN 不正确，请重试。' : 'Incorrect PIN. Try again.'}</p>}
        <button type="submit" className="mt-4 min-h-11 w-full rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors">{zh ? '进入编辑' : 'Start editing'}</button>
      </form>
    </div>
  </>;
};
