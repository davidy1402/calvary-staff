import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import { BottomSheet } from './BottomSheet';
import { ChurchLogo } from './ChurchLogo';
import { Search, X, Check, User } from 'lucide-react';
import type { Coworker } from '../types';

interface IdentitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
}

// Pinned quick access coworkers (family & core leaders)
const PINNED_COWORKER_IDS = ['cw_diana', 'cw_selena', 'cw_yongyi', 'cw_zongyan', 'cw_david', 'cw_kaiyue', 'cw_wensen'];

export const IdentitySelectModal: React.FC<IdentitySelectModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
}) => {
  const { churchState, currentUserId, selectIdentity, language } = useChurch();
  const [search, setSearch] = useState('');

  const pinnedCoworkers = useMemo(() => {
    return PINNED_COWORKER_IDS
      .map((id) => churchState.coworkers.find((c) => c.id === id))
      .filter((c): c is Coworker => Boolean(c && c.active));
  }, [churchState.coworkers]);

  const filteredCoworkers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return churchState.coworkers
      .filter((c) => c.active)
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.englishName.toLowerCase().includes(q) ||
          c.cellGroup.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Current user on top if matches
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return a.name.localeCompare(b.name, 'zh-CN');
      });
  }, [churchState.coworkers, search, currentUserId]);

  if (!isOpen) return null;

  const handleSelect = (cw: Coworker) => {
    selectIdentity(cw.id);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={canDismiss ? onClose : () => {}}
      className="bg-white dark:bg-zinc-900"
      maxHeight="90vh"
    >
      <div className="flex flex-col h-full max-h-[86vh]">
        {/* Welcome Header */}
        <div className="relative px-5 pt-3 pb-3 text-center border-b border-slate-100 dark:border-zinc-800 shrink-0">
          {canDismiss && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3.5 top-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
          <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-zinc-800 border border-blue-100 dark:border-zinc-700">
            <ChurchLogo className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            {language === 'zh' ? '平安！请认领您的姓名' : 'Welcome! Choose Your Identity'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {language === 'zh'
              ? '选择后即可查看为您定制的个人服事日程'
              : 'Select your name to load your personalized duty schedule'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/70 dark:border-zinc-800 shrink-0">
          <div className="relative">
            <Search
              size={15}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === 'zh'
                  ? '搜索姓名或英文名 (如: Diana, 永益)...'
                  : 'Search name (e.g. Diana, Yong Yi)...'
              }
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              autoFocus={!canDismiss}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5"
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Pinned Chips (when search is empty) */}
        {!search && (
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 mb-2">
              {language === 'zh' ? '快速认领（核心同工）' : 'Quick Access'}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {pinnedCoworkers.map((cw) => {
                const isSelected = cw.id === currentUserId;
                return (
                  <button
                    key={cw.id}
                    type="button"
                    onClick={() => handleSelect(cw)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{cw.name}</span>
                    {cw.englishName && (
                      <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {cw.englishName.split(' ')[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All Coworkers List */}
        <div className="overflow-y-auto px-4 py-2 space-y-1.5 flex-1 divide-y divide-slate-100 dark:divide-zinc-800/80">
          {filteredCoworkers.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 dark:text-zinc-500">
              {language === 'zh' ? '未找到对应同工' : 'No coworker found'}
            </div>
          ) : (
            filteredCoworkers.map((cw) => {
              const isSelected = cw.id === currentUserId;
              return (
                <div
                  key={cw.id}
                  onClick={() => handleSelect(cw)}
                  className={`pt-2.5 pb-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-zinc-800 border border-blue-300 dark:border-zinc-600'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {cw.avatar ? (
                      <img
                        src={cw.avatar}
                        alt={cw.name}
                        className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700 shadow-2xs"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {cw.name.slice(0, 1) || <User size={16} strokeWidth={1.75} />}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {cw.name}
                        </span>
                        {cw.englishName && (
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                            ({cw.englishName})
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md border border-blue-100 dark:border-zinc-700">
                          {cw.cellGroup}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 text-center shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            {language === 'zh'
              ? '选定后将保存在本机；可随时在「设置」中更换'
              : 'Saved to this device; switch anytime in Settings'}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
};
