import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import type { RoleDefinition } from '../types';
import { X, Search, Check, AlertTriangle, Star, User } from 'lucide-react';

interface AssignModalProps {
  role: RoleDefinition;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({ role, isOpen, onClose }) => {
  const { churchState, currentRoster, assignCoworker, removeAssignment, getCoworkerConflictRoles } =
    useChurch();
  const [search, setSearch] = useState('');

  const assignedIds = currentRoster?.assignments[role.id] || [];

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              指派岗位：{role.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              点击同工名字即可分配或取消分配
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭窗口"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索同工姓名、英文名或小组..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Coworkers List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-slate-50">
          {sortedCoworkers.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              没有找到符合条件的同工
            </div>
          ) : (
            sortedCoworkers.map((cw) => {
              const isAssigned = assignedIds.includes(cw.id);
              const isQualified = cw.qualifiedRoleIds.includes(role.id);
              const conflictRoles = getCoworkerConflictRoles(cw.id).filter(
                (name) => name !== role.name
              );

              return (
                <div
                  key={cw.id}
                  onClick={() => {
                    if (isAssigned) {
                      removeAssignment(role.id, cw.id);
                    } else {
                      assignCoworker(role.id, cw.id);
                    }
                  }}
                  className={`pt-2 pb-2 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isAssigned
                      ? 'bg-blue-50/80 border border-blue-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                        isAssigned
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cw.name.slice(0, 1) || <User size={16} strokeWidth={1.75} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {cw.name}
                        </span>
                        {cw.englishName && (
                          <span className="text-xs text-slate-500">
                            ({cw.englishName})
                          </span>
                        )}
                        {isQualified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                            <Star size={10} strokeWidth={2} />
                            常用
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{cw.cellGroup}</span>
                      </div>

                      {/* Conflict Alert Tag */}
                      {conflictRoles.length > 0 && !isAssigned && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1 font-medium bg-amber-50/60 px-2 py-0.5 rounded">
                          <AlertTriangle size={12} strokeWidth={2} />
                          <span>本日已排：{conflictRoles.join('、')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                        isAssigned
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isAssigned && <Check size={14} strokeWidth={2.5} />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
          >
            完成选择（已排 {assignedIds.length} 位）
          </button>
        </div>
      </div>
    </div>
  );
};
