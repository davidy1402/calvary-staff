import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheet } from './BottomSheet';
import type { Language } from '../utils/i18n';

const ROW_HEIGHT = 44;
const MIN_YEAR = 1940;

interface BirthdayParts {
  year: number | null;
  month: number;
  day: number;
}

const parseBirthday = (birthday?: string): BirthdayParts => {
  const parts = birthday?.split('-').map(Number) || [];
  if (parts.length === 3 && parts.every(Number.isFinite)) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  }
  if (parts.length === 2 && parts.every(Number.isFinite)) {
    return { year: null, month: parts[0], day: parts[1] };
  }
  return { year: null, month: 1, day: 1 };
};

const getDaysInMonth = (year: number | null, month: number) => new Date(year || 2000, month, 0).getDate();

interface WheelColumnProps {
  label: string;
  options: Array<{ value: number | null; label: string }>;
  selected: number | null;
  onSelect: (value: number | null) => void;
  ariaLabel: string;
  resetKey: boolean;
}

const WheelColumn: React.FC<WheelColumnProps> = ({ label, options, selected, onSelect, ariaLabel, resetKey }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
  const skipScrollSync = useRef(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selected));

  useEffect(() => {
    if (skipScrollSync.current) {
      skipScrollSync.current = false;
      return;
    }
    if (listRef.current) listRef.current.scrollTop = selectedIndex * ROW_HEIGHT;
  }, [resetKey, selectedIndex]);

  useEffect(() => () => {
    if (scrollTimer.current !== null) window.clearTimeout(scrollTimer.current);
  }, []);

  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">{label}</p>
      <div className="relative h-[220px] overflow-hidden rounded-2xl bg-slate-50 dark:bg-zinc-800/70">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-[88px] z-10 h-11 rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-800 dark:bg-blue-950/40" />
        <div
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="h-full overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const element = event.currentTarget;
            const index = Math.min(options.length - 1, Math.max(0, Math.round(element.scrollTop / ROW_HEIGHT)));
            if (options[index] && options[index].value !== selected) {
              skipScrollSync.current = true;
              onSelect(options[index].value);
            }
            if (scrollTimer.current !== null) window.clearTimeout(scrollTimer.current);
            scrollTimer.current = window.setTimeout(() => {
              const nearest = Math.min(options.length - 1, Math.max(0, Math.round(element.scrollTop / ROW_HEIGHT)));
              element.scrollTo({ top: nearest * ROW_HEIGHT, behavior: 'smooth' });
            }, 90);
          }}
        >
          <div aria-hidden="true" className="h-[88px]" />
          {options.map((option) => (
            <button
              key={option.value ?? 'no-year'}
              type="button"
              role="option"
              aria-selected={option.value === selected}
              onClick={() => {
                skipScrollSync.current = true;
                onSelect(option.value);
                const index = options.indexOf(option);
                listRef.current?.scrollTo({ top: index * ROW_HEIGHT, behavior: 'smooth' });
              }}
              className={`relative z-20 flex h-11 w-full snap-center items-center justify-center text-base transition-colors ${option.value === selected ? 'font-bold text-blue-800 dark:text-blue-200' : 'font-medium text-slate-400 dark:text-zinc-500'}`}
            >
              {option.label}
            </button>
          ))}
          <div aria-hidden="true" className="h-[88px]" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-30 h-16 bg-gradient-to-b from-slate-50 to-transparent dark:from-zinc-800/70" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-16 bg-gradient-to-t from-slate-50 to-transparent dark:from-zinc-800/70" />
      </div>
    </div>
  );
};

interface BirthdayPickerSheetProps {
  isOpen: boolean;
  birthday?: string;
  language: Language;
  onClose: () => void;
  onSave: (birthday: string) => void;
}

export const BirthdayPickerSheet: React.FC<BirthdayPickerSheetProps> = ({ isOpen, birthday, language, onClose, onSave }) => {
  const [parts, setParts] = useState(() => parseBirthday(birthday));
  const [currentYear] = useState(() => new Date().getFullYear());
  const zh = language === 'zh';

  const yearOptions = useMemo(() => [
    { value: null, label: zh ? '不填写' : '—' },
    ...Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, index) => {
      const year = currentYear - index;
      return { value: year, label: String(year) };
    }),
  ], [currentYear, zh]);
  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: zh ? `${index + 1}月` : new Date(2000, index, 1).toLocaleDateString('en-MY', { month: 'short' }),
  }));
  const dayCount = getDaysInMonth(parts.year, parts.month);
  const dayOptions = Array.from({ length: dayCount }, (_, index) => ({
    value: index + 1,
    label: zh ? `${index + 1}日` : String(index + 1),
  }));

  const handleClose = () => {
    setParts(parseBirthday(birthday));
    onClose();
  };

  const save = () => {
    const monthDay = `${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    onSave(parts.year ? `${parts.year}-${monthDay}` : monthDay);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} maxHeight="55dvh" labelledBy="birthday-picker-title">
      <div className="px-5 pb-safe-bottom pt-1">
        <div className="flex items-center justify-between gap-3">
          <h2 id="birthday-picker-title" className="text-lg font-bold text-slate-900 dark:text-zinc-100">{zh ? '选择生日' : 'Choose birthday'}</h2>
          <button type="button" onClick={handleClose} className="min-h-11 px-3 text-sm font-semibold text-slate-500 dark:text-zinc-400">{zh ? '取消' : 'Cancel'}</button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{zh ? '上下滑动选择；年份可留空。' : 'Scroll to choose. Year is optional.'}</p>
        <div className="mt-5 flex gap-2" aria-label={zh ? '生日年月日' : 'Birthday year, month, and day'}>
          <WheelColumn resetKey={isOpen} label={zh ? '年' : 'Year'} ariaLabel={zh ? '选择年份' : 'Select year'} options={yearOptions} selected={parts.year} onSelect={(year) => setParts((current) => ({ ...current, year, day: Math.min(current.day, getDaysInMonth(year, current.month)) }))} />
          <WheelColumn resetKey={isOpen} label={zh ? '月' : 'Month'} ariaLabel={zh ? '选择月份' : 'Select month'} options={monthOptions} selected={parts.month} onSelect={(month) => setParts((current) => ({ ...current, month: month || 1, day: Math.min(current.day, getDaysInMonth(current.year, month || 1)) }))} />
          <WheelColumn resetKey={isOpen} label={zh ? '日' : 'Day'} ariaLabel={zh ? '选择日期' : 'Select day'} options={dayOptions} selected={parts.day} onSelect={(day) => setParts((current) => ({ ...current, day: day || 1 }))} />
        </div>
        <button type="button" onClick={save} className="mt-5 min-h-12 w-full rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-800">{zh ? '保存生日' : 'Save birthday'}</button>
      </div>
    </BottomSheet>
  );
};
