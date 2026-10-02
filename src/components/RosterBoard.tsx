import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import type { RoleDefinition } from '../types';
import { AssignModal } from './AssignModal';
import {
  Mic,
  Music,
  Tv,
  HeartHandshake,
  Plus,
  Clock,
  MapPin,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';

const CATEGORY_META = {
  pulpit: {
    title: '讲台与主理',
    icon: Mic,
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  worship: {
    title: '敬拜赞美团',
    icon: Music,
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  media: {
    title: '影音多媒体',
    icon: Tv,
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  hospitality: {
    title: '接待与关怀',
    icon: HeartHandshake,
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
  },
};

export const RosterBoard: React.FC = () => {
  const {
    churchState,
    activeService,
    currentRoster,
    removeAssignment,
    updateRosterMeta,
    getCoworkerConflictRoles,
  } = useChurch();

  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [editingTheme, setEditingTheme] = useState(false);
  const [themeInput, setThemeInput] = useState(currentRoster?.theme || '');

  const coworkerMap = new Map(churchState.coworkers.map((c) => [c.id, c]));

  const handleSaveTheme = () => {
    updateRosterMeta({ theme: themeInput.trim() });
    setEditingTheme(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Service Info Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {activeService.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({activeService.time})
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={14} strokeWidth={1.75} className="text-amber-500" />
              <span>{activeService.rehearsalTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} strokeWidth={1.75} className="text-slate-400" />
              <span>{activeService.venue}</span>
            </div>
          </div>
        </div>

        {/* Theme or Sermon Title */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1">
            <FileText size={15} strokeWidth={1.75} className="text-slate-400 shrink-0" />
            {editingTheme ? (
              <div className="flex items-center gap-2 flex-1 mr-2">
                <input
                  type="text"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder="输入本周讲道主题或经文（选填）..."
                  className="w-full text-xs px-2.5 py-1 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  className="px-2.5 py-1 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shrink-0"
                >
                  保存
                </button>
              </div>
            ) : (
              <span className="text-slate-700 font-medium truncate">
                {currentRoster?.theme ? (
                  `本周主题：${currentRoster.theme}`
                ) : (
                  <span className="text-slate-400 italic">未填讲道主题（点击右侧添加）</span>
                )}
              </span>
            )}
          </div>

          {!editingTheme && (
            <button
              type="button"
              onClick={() => {
                setThemeInput(currentRoster?.theme || '');
                setEditingTheme(true);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 ml-2 shrink-0"
            >
              {currentRoster?.theme ? '修改' : '设置主题'}
            </button>
          )}
        </div>
      </div>

      {/* Role Categories Grid */}
      {activeService.categoryIds.map((catId) => {
        const meta = CATEGORY_META[catId];
        const categoryRoles = churchState.roles.filter((r) => r.category === catId);
        const IconComponent = meta.icon;

        return (
          <div
            key={catId}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
          >
            {/* Category Header */}
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border ${meta.badgeBg}`}
                >
                  <IconComponent size={16} strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{meta.title}</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {categoryRoles.length} 个岗位
              </span>
            </div>

            {/* Roles Rows */}
            <div className="divide-y divide-slate-100">
              {categoryRoles.map((role) => {
                const assignedIds = currentRoster?.assignments[role.id] || [];

                return (
                  <div
                    key={role.id}
                    className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Role Title and Description */}
                    <div className="sm:w-1/3 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {role.name}
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {role.description}
                        </p>
                      )}
                    </div>

                    {/* Assigned Coworkers Tags & Add Action */}
                    <div className="sm:w-2/3 flex flex-wrap items-center gap-1.5 sm:justify-end">
                      {assignedIds.map((cwId) => {
                        const cw = coworkerMap.get(cwId);
                        if (!cw) return null;
                        const conflicts = getCoworkerConflictRoles(cw.id).filter(
                          (n) => n !== role.name
                        );

                        return (
                          <span
                            key={cwId}
                            className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              conflicts.length > 0
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span>{cw.name}</span>
                            {conflicts.length > 0 && (
                              <span
                                title={`本日兼任其他岗位：${conflicts.join('、')}`}
                                className="text-amber-600"
                              >
                                <AlertCircle size={13} strokeWidth={2} />
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeAssignment(role.id, cw.id)}
                              aria-label={`移除 ${cw.name}`}
                              className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
                            >
                              <X size={12} strokeWidth={2} />
                            </button>
                          </span>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          assignedIds.length === 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Plus size={13} strokeWidth={2} />
                        <span>{assignedIds.length === 0 ? '指派同工' : '添加'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Assignment Modal */}
      {selectedRole && (
        <AssignModal
          role={selectedRole}
          isOpen={true}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
};
