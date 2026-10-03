import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import type { RoleDefinition } from '../types';
import { Search, Star, User } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { t } from '../utils/i18n';

interface AssignModalProps {
  role: RoleDefinition;
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
  targetServiceId?: string;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  role,
  isOpen,
  onClose,
  targetDate,
  targetServiceId,
}) => {
  const {
    churchState,
    selectedDate,
    activeServiceId,
    assignCoworker,
    removeAssignment,
    getCoworkerConflictRoles,
    language,
  } = useChurch();
  const [search, setSearch] = useState('');

  const effectiveDate = targetDate || selectedDate;
  const effectiveServiceId = targetServiceId || activeServiceId;
  const rosterKey = `${effectiveDate}_${effectiveServiceId}`;
  const targetRoster = churchState.rosters[rosterKey];

  const assignedIds = useMemo(() => {
    return targetRoster?.assignments?.[role.id] || [];
  }, [targetRoster?.assignments, role.id]);

  const filteredCoworkers = useMemo(() => {
    return churchState.coworkers.filter((cw) => {
      if (!cw.active) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        cw.name.toLowerCase().includes(q) ||
        cw.englishName.toLowerCase().includes(q) ||
        cw.cellGroup.toLowerCase().includes(q)
      );
    });
  }, [churchState.coworkers, search]);

  // Sort coworkers: already assigned first, then qualified/recommended, then others
  const sortedCoworkers = useMemo(() => {
    return [...filteredCoworkers].sort((a, b) => {
      const aAssigned = assignedIds.includes(a.id);
      const bAssigned = assignedIds.includes(b.id);
      if (aAssigned && !bAssigned) return -1;
      if (!aAssigned && bAssigned) return 1;

      const aQualified = a.qualifiedRoleIds.includes(role.id);
      const bQualified = b.qualifiedRoleIds.includes(role.id);
      if (aQualified && !bQualified) return -1;
      if (!aQualified && bQualified) return 1;

      return a.name.localeCompare(b.name, 'zh-CN');
    });
  }, [filteredCoworkers, assignedIds, role.id]);

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="bg-white" maxHeight="88vh">
      {/* Sheet Title */}
      <div className="px-4 pb-2.5 pt-0.5 bg-white border-b border-slate-100 text-center shrink-0">
        <h2 className="text-sm font-bold text-slate-900 leading-tight">
          {t('assignRole', language)}: {role.name}
        </h2>
        <p className="text-[10px] text-slate-400 font-medium">
          {t('selectCoworkerHint', language)}
        </p>
      </div>

        {/* Search Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/70 shrink-0">
          <div className="relative">
            <Search
              size={15}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchCoworker', language)}
              className="w-full pl-9 pr-4 py-2 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Coworkers List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-slate-100 pb-8 sm:pb-6">
          {sortedCoworkers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              {t('noCoworkerFound', language)}
            </div>
          ) : (
            sortedCoworkers.map((cw) => {
              const isAssigned = assignedIds.includes(cw.id);
              const isQualified = cw.qualifiedRoleIds.includes(role.id);
              const conflictRoles = getCoworkerConflictRoles(
                cw.id,
                effectiveDate,
                effectiveServiceId
              ).filter((name) => name !== role.name);

              return (
                <div
                  key={cw.id}
                  onClick={() => {
                    if (isAssigned) {
                      removeAssignment(role.id, cw.id, effectiveDate, effectiveServiceId);
                    } else {
                      assignCoworker(role.id, cw.id, effectiveDate, effectiveServiceId);
                    }
                  }}
                  className={`pt-2.5 pb-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isAssigned
                      ? 'bg-blue-50/80 border border-blue-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {cw.avatar ? (
                      <img
                        src={cw.avatar}
                        alt={cw.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                          isAssigned
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {cw.name.slice(0, 1) || <User size={16} strokeWidth={1.75} />}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {cw.name}
                        </span>
                        {cw.englishName && (
                          <span className="text-[11px] text-slate-500">
                            ({cw.englishName})
                          </span>
                        )}
                        {isQualified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                            <Star size={10} strokeWidth={2} />
                            {t('regularRole', language)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {cw.cellGroup}
                        </span>
                      </div>

                      {conflictRoles.length > 0 && (
                        <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                          {t('todayAssigned', language)}: {conflictRoles.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      isAssigned
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isAssigned && <span className="text-xs font-bold leading-none">✓</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
    </BottomSheet>
  );
};
