import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  Plus,
  X,
  Share2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AssignModal } from './AssignModal';
import { WhatsAppModal } from './WhatsAppModal';
import type { RoleDefinition, ServiceRoster } from '../types';

export const RosterScreen: React.FC = () => {
  const {
    churchState,
    activeServiceId,
    setActiveServiceId,
    activeService,
    isEditMode,
    toggleEditMode,
    getRostersForService,
    removeAssignment,
    updateRosterMeta,
    addSpecialEvent,
    removeSpecialEvent,
    getCoworkerConflictRoles,
  } = useChurch();

  // Selected role for AssignModal
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState<{
    role: RoleDefinition;
    date: string;
    serviceId: string;
  } | null>(null);

  // Selected roster for WhatsApp share
  const [whatsAppModalRoster, setWhatsAppModalRoster] = useState<ServiceRoster | null>(null);

  // Accordion state: dates that are expanded (default first one open)
  const serviceRosters = getRostersForService(activeServiceId);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(() => {
    if (serviceRosters.length > 0) {
      return { [serviceRosters[0].date]: true };
    }
    return {};
  });

  // Editing theme per date
  const [editingThemeDate, setEditingThemeDate] = useState<string | null>(null);
  const [themeInput, setThemeInput] = useState<string>('');

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const getWeekdayShort = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split('-');
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[date.getDay()];
  };

  const coworkerMap = new Map(churchState.coworkers.map((c) => [c.id, c]));

  return (
    <div className="space-y-3">
      {/* Centered AppBar with Edit Action */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 pt-3.5 pb-0 sticky top-0 z-20 shadow-2xs">
        <div className="relative flex items-center justify-center">
          <h1 className="text-base font-bold text-slate-900">
            {isEditMode ? '編輯服事表' : '服事表'}
          </h1>
          <div className="absolute right-0">
            {isEditMode ? (
              <button
                type="button"
                onClick={toggleEditMode}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 flex items-center gap-1 transition-colors"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>完成</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleEditMode}
                title="切換至編輯模式"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Edit2 size={16} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        {/* TabBar: Material Underline Tabs (matching Flutter TabBar) */}
        <div className="flex border-b border-slate-200/80 mt-3 px-1">
          {churchState.services.map((svc) => {
            const isActive = svc.id === activeServiceId;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => {
                  setActiveServiceId(svc.id);
                  const rosters = getRostersForService(svc.id);
                  if (rosters.length > 0) {
                    setExpandedDates({ [rosters[0].date]: true });
                  }
                }}
                className={`flex-1 pb-2 pt-1 text-xs text-center transition-all relative ${
                  isActive ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <span>{svc.shortName}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-blue-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roster Cards List */}
      {serviceRosters.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
          <CalendarDays size={32} strokeWidth={1.5} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">此類別目前沒有服事資訊</p>
          <p className="text-xs text-slate-400 mt-1">
            {isEditMode ? '點擊右上角新增排班日期' : '管理員建立後會在此顯示'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {serviceRosters.map((roster, index) => {
            const isExpanded = expandedDates[roster.date] ?? (index === 0);
            const dateTitle = `${roster.date.replace(/-/g, '/')} (${getWeekdayShort(roster.date)})`;

            // Active categories for this service
            const activeRoles = churchState.roles.filter((r) =>
              activeService.categoryIds.includes(r.category)
            );

            return (
              <div
                key={roster.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Card Header (ExpansionTile) */}
                <div
                  onClick={() => toggleExpand(roster.date)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <CalendarDays
                      size={20}
                      strokeWidth={1.75}
                      className="text-blue-600 mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{dateTitle}</span>
                        {roster.specialEvents &&
                          roster.specialEvents.map((ev) => (
                            <span
                              key={ev}
                              className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 rounded"
                            >
                              {ev}
                            </span>
                          ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{activeService.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhatsAppModalRoster(roster);
                      }}
                      title="预览并分享 WhatsApp 服事表"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <Share2 size={16} strokeWidth={1.75} />
                    </button>
                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp size={18} strokeWidth={1.75} />
                      ) : (
                        <ChevronDown size={18} strokeWidth={1.75} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body (RosterViewCardBody / DutyRow list) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    {/* Theme / Scripture Bar */}
                    <div className="py-2 mb-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <FileText size={14} strokeWidth={1.75} className="text-slate-400 shrink-0" />
                        {editingThemeDate === roster.date ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={themeInput}
                              onChange={(e) => setThemeInput(e.target.value)}
                              placeholder="输入本周讲道主题或经文..."
                              className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateRosterMeta({ theme: themeInput.trim() }, roster.date, roster.serviceId);
                                setEditingThemeDate(null);
                              }}
                              className="px-2 py-1 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shrink-0 text-xs"
                            >
                              保存
                            </button>
                          </div>
                        ) : (
                          <span className="truncate">
                            {roster.theme ? (
                              <span className="font-medium text-slate-800">主题：{roster.theme}</span>
                            ) : (
                              <span className="text-slate-400 italic">未填主题</span>
                            )}
                          </span>
                        )}
                      </div>

                      {isEditMode && editingThemeDate !== roster.date && (
                        <button
                          type="button"
                          onClick={() => {
                            setThemeInput(roster.theme || '');
                            setEditingThemeDate(roster.date);
                          }}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 shrink-0 ml-2"
                        >
                          {roster.theme ? '修改' : '填写真题'}
                        </button>
                      )}
                    </div>

                    {/* Special Event Tags Management in Edit Mode */}
                    {isEditMode && (
                      <div className="py-1.5 flex items-center gap-1.5 flex-wrap border-b border-slate-100 mb-2">
                        <span className="text-[11px] text-slate-500 font-medium">特别聚会：</span>
                        {roster.specialEvents &&
                          roster.specialEvents.map((ev) => (
                            <span
                              key={ev}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded"
                            >
                              <span>{ev}</span>
                              <button
                                type="button"
                                onClick={() => removeSpecialEvent(ev, roster.date, roster.serviceId)}
                                className="text-rose-400 hover:text-rose-700"
                              >
                                <X size={11} strokeWidth={2} />
                              </button>
                            </span>
                          ))}
                        <button
                          type="button"
                          onClick={() => {
                            const name = prompt('输入特别聚会名称（例如：圣餐主日、洗礼主日、宣教主日）：');
                            if (name) addSpecialEvent(name, roster.date, roster.serviceId);
                          }}
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100"
                        >
                          <Plus size={12} strokeWidth={2} />
                          <span>加标签</span>
                        </button>
                      </div>
                    )}

                    {/* Duty Rows List (matching DutyRow in Flutter) */}
                    <div className="divide-y divide-slate-50">
                      {activeRoles.map((role) => {
                        const assignedIds = roster.assignments[role.id] || [];
                        const assignedCoworkers = assignedIds
                          .map((id) => coworkerMap.get(id))
                          .filter(Boolean);

                        return (
                          <div
                            key={role.id}
                            className="py-2 flex items-start text-xs leading-relaxed"
                          >
                            {/* Role Name (Fixed 88px width) */}
                            <div className="w-[88px] shrink-0 text-slate-500 font-medium pt-0.5">
                              {role.name}
                            </div>

                            {/* Volunteer Names */}
                            <div className="flex-1 flex flex-wrap items-center gap-x-1 gap-y-1">
                              {assignedCoworkers.length === 0 ? (
                                <span className="text-slate-400 italic">待定</span>
                              ) : (
                                assignedCoworkers.map((cw, i) => {
                                  if (!cw) return null;
                                  const conflicts = getCoworkerConflictRoles(
                                    cw.id,
                                    roster.date,
                                    roster.serviceId
                                  ).filter((n) => n !== role.name);

                                  return (
                                    <span key={cw.id} className="inline-flex items-center gap-0.5 font-bold text-slate-900">
                                      <span>
                                        {cw.name}
                                        {i < assignedCoworkers.length - 1 ? '、' : ''}
                                      </span>
                                      {conflicts.length > 0 && (
                                        <span
                                          title={`兼任：${conflicts.join('、')}`}
                                          className="text-amber-600 inline-flex align-middle"
                                        >
                                          <AlertCircle size={11} strokeWidth={2.5} />
                                        </span>
                                      )}
                                      {isEditMode && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeAssignment(role.id, cw.id, roster.date, roster.serviceId)
                                          }
                                          className="text-slate-300 hover:text-rose-600 ml-0.5 p-0.5"
                                        >
                                          <X size={11} strokeWidth={2} />
                                        </button>
                                      )}
                                    </span>
                                  );
                                })
                              )}
                            </div>

                            {/* Edit Action Button */}
                            {isEditMode && (
                              <div className="shrink-0 ml-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedRoleForAssign({
                                      role,
                                      date: roster.date,
                                      serviceId: roster.serviceId,
                                    })
                                  }
                                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 transition-colors"
                                >
                                  <Plus size={11} strokeWidth={2} />
                                  <span>{assignedCoworkers.length === 0 ? '指派' : '更换'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Modal */}
      {selectedRoleForAssign && (
        <AssignModal
          role={selectedRoleForAssign.role}
          targetDate={selectedRoleForAssign.date}
          targetServiceId={selectedRoleForAssign.serviceId}
          isOpen={true}
          onClose={() => setSelectedRoleForAssign(null)}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsAppModalRoster && (
        <WhatsAppModal
          isOpen={true}
          initialService={activeService}
          initialRoster={whatsAppModalRoster}
          onClose={() => setWhatsAppModalRoster(null)}
        />
      )}
    </div>
  );
};
