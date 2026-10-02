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
  Languages,
} from 'lucide-react';
import { AssignModal } from './AssignModal';
import { WhatsAppModal } from './WhatsAppModal';
import { t } from '../utils/i18n';
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
    language,
    toggleLanguage,
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
    const weekdaysZh = ['日', '一', '二', '三', '四', '五', '六'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return language === 'zh' ? weekdaysZh[date.getDay()] : weekdaysEn[date.getDay()];
  };

  const getServiceName = (serviceId: string, defaultName: string) => {
    const key = serviceId as any;
    return t(key, language) !== key ? t(key, language) : defaultName;
  };

  const getServiceShortName = (serviceId: string, defaultShortName: string) => {
    const shortKey = `${serviceId}_short` as any;
    return t(shortKey, language) !== shortKey ? t(shortKey, language) : defaultShortName;
  };

  const coworkerMap = new Map(churchState.coworkers.map((c) => [c.id, c]));

  const categoryGroups: Array<{
    id: 'pulpit' | 'worship' | 'media' | 'hospitality';
    nameZh: string;
    nameEn: string;
  }> = [
    { id: 'pulpit', nameZh: '讲台与主理', nameEn: 'Pulpit & Service' },
    { id: 'worship', nameZh: '敬拜赞美团', nameEn: 'Worship Team' },
    { id: 'media', nameZh: '影音多媒体', nameEn: 'AV & Media' },
    { id: 'hospitality', nameZh: '接待与关怀', nameEn: 'Hospitality & Ushers' },
  ];

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Centered AppBar with Edit Action & Language Toggle */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 pt-3.5 pb-0 sticky top-0 z-20 shadow-2xs">
        <div className="relative flex items-center justify-between">
          {/* Left Action: Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'zh' ? 'Switch to English' : '切换为中文'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all duration-150 active:scale-90 cursor-pointer"
          >
            <Languages size={13} strokeWidth={2} />
            <span>{language === 'zh' ? 'EN' : '中文'}</span>
          </button>

          <h1 className="text-base font-bold text-slate-900">
            {isEditMode ? t('editRosterTitle', language) : t('rosterTitle', language)}
          </h1>

          {/* Right Action: Edit Toggle */}
          <div>
            {isEditMode ? (
              <button
                type="button"
                onClick={toggleEditMode}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>{t('done', language)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleEditMode}
                title={t('editRosterTooltip', language)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90 cursor-pointer"
              >
                <Edit2 size={16} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        {/* TabBar: Material Underline Tabs */}
        <div className="flex border-b border-slate-200/80 mt-3 px-1">
          {churchState.services.map((svc) => {
            const isActive = svc.id === activeServiceId;
            const tabLabel = getServiceShortName(svc.id, svc.shortName);
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
                className={`flex-1 pb-2 pt-1 text-xs text-center transition-all duration-200 relative cursor-pointer ${
                  isActive ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <span>{tabLabel}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-blue-900 rounded-full transition-all duration-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roster Cards List */}
      {serviceRosters.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 animate-slide-up">
          <CalendarDays size={32} strokeWidth={1.5} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">{t('noRosterData', language)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {isEditMode ? t('noRosterHintEdit', language) : t('noRosterHintView', language)}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {serviceRosters.map((roster, index) => {
            const isExpanded = expandedDates[roster.date] ?? (index === 0);
            const dateTitle = `${roster.date.replace(/-/g, '/')} (${getWeekdayShort(roster.date)})`;
            const currentServiceName = getServiceName(activeService.id, activeService.name);

            // Active categories and roles for this service
            const activeRoles = churchState.roles.filter((r) =>
              activeService.categoryIds.includes(r.category)
            );

            // Staffing metrics (HCI Glanceability)
            const totalRoles = activeRoles.length;
            const assignedCount = activeRoles.filter(
              (r) => (roster.assignments[r.id]?.length ?? 0) > 0
            ).length;
            const isFullyStaffed = assignedCount === totalRoles;

            return (
              <div
                key={roster.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                {/* Card Header */}
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
                        {/* Staffing Health Pill */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            isFullyStaffed
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                              : 'text-blue-700 bg-blue-50 border border-blue-200/60'
                          }`}
                        >
                          {isFullyStaffed
                            ? (language === 'zh' ? '全员就绪' : 'Fully Staffed')
                            : (language === 'zh' ? `${assignedCount}/${totalRoles} 已排` : `${assignedCount}/${totalRoles} Staffed`)}
                        </span>

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
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{currentServiceName}</p>
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors active:scale-90 cursor-pointer"
                    >
                      <Share2 size={16} strokeWidth={1.75} />
                    </button>
                    <div className="text-slate-400 transition-transform duration-200">
                      {isExpanded ? (
                        <ChevronUp size={18} strokeWidth={1.75} />
                      ) : (
                        <ChevronDown size={18} strokeWidth={1.75} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 animate-slide-up">
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
                              placeholder={language === 'zh' ? '输入本周讲道主题或经文...' : 'Enter sermon theme or scripture...'}
                              className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateRosterMeta({ theme: themeInput.trim() }, roster.date, roster.serviceId);
                                setEditingThemeDate(null);
                              }}
                              className="px-2 py-1 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shrink-0 text-xs transition-colors active:scale-95"
                            >
                              {t('save', language)}
                            </button>
                          </div>
                        ) : (
                          <span className="truncate">
                            {roster.theme ? (
                              <span className="font-medium text-slate-800">
                                {t('theme', language)}: {roster.theme}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">{t('unfilledTheme', language)}</span>
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
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 shrink-0 ml-2 transition-colors active:scale-95 cursor-pointer"
                        >
                          {roster.theme ? t('modifyTheme', language) : t('fillTheme', language)}
                        </button>
                      )}
                    </div>

                    {/* Special Event Tags Management in Edit Mode */}
                    {isEditMode && (
                      <div className="py-1.5 flex items-center gap-1.5 flex-wrap border-b border-slate-100 mb-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {t('specialEvents', language)}:
                        </span>
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
                                className="text-rose-400 hover:text-rose-700 cursor-pointer"
                              >
                                <X size={11} strokeWidth={2} />
                              </button>
                            </span>
                          ))}
                        <button
                          type="button"
                          onClick={() => {
                            const name = prompt(
                              language === 'zh'
                                ? '输入特别聚会名称（例如：圣餐主日、洗礼主日、宣教主日）：'
                                : 'Enter special event name (e.g. Holy Communion, Baptism Sunday):'
                            );
                            if (name) addSpecialEvent(name, roster.date, roster.serviceId);
                          }}
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 transition-colors active:scale-95 cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={2} />
                          <span>{t('addTag', language)}</span>
                        </button>
                      </div>
                    )}

                    {/* Department-Grouped Duty Rows (Gestalt HCI Organization) */}
                    <div className="space-y-3 pt-1">
                      {categoryGroups
                        .filter((cat) => activeService.categoryIds.includes(cat.id))
                        .map((cat) => {
                          const catRoles = activeRoles.filter((r) => r.category === cat.id);
                          if (catRoles.length === 0) return null;

                          return (
                            <div key={cat.id} className="space-y-1">
                              {/* Department Subheader */}
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-0.5 border-b border-slate-100">
                                {language === 'zh' ? cat.nameZh : cat.nameEn}
                              </div>

                              <div className="divide-y divide-slate-50">
                                {catRoles.map((role) => {
                                  const assignedIds = roster.assignments[role.id] || [];
                                  const assignedCoworkers = assignedIds
                                    .map((id) => coworkerMap.get(id))
                                    .filter(Boolean);

                                  return (
                                    <div
                                      key={role.id}
                                      className="py-2 flex items-start text-xs leading-relaxed hover:bg-slate-50/50 rounded px-1 transition-colors"
                                    >
                                      {/* Role Name */}
                                      <div className="w-[88px] shrink-0 text-slate-500 font-medium pt-0.5">
                                        {role.name}
                                      </div>

                                      {/* Volunteer Names */}
                                      <div className="flex-1 flex flex-wrap items-center gap-x-1 gap-y-1">
                                        {assignedCoworkers.length === 0 ? (
                                          <span className="text-slate-400 italic bg-slate-50 px-1.5 py-0.2 rounded border border-dashed border-slate-200">
                                            {t('pending', language)}
                                          </span>
                                        ) : (
                                          assignedCoworkers.map((cw, i) => {
                                            if (!cw) return null;
                                            const conflicts = getCoworkerConflictRoles(
                                              cw.id,
                                              roster.date,
                                              roster.serviceId
                                            ).filter((n) => n !== role.name);

                                            return (
                                              <span
                                                key={cw.id}
                                                className="inline-flex items-center gap-0.5 font-bold text-slate-900"
                                              >
                                                <span>
                                                  {cw.name}
                                                  {i < assignedCoworkers.length - 1 ? '、' : ''}
                                                </span>
                                                {conflicts.length > 0 && (
                                                  <span
                                                    title={`${t('conflict', language)}: ${conflicts.join('、')}`}
                                                    className="text-amber-600 inline-flex align-middle"
                                                  >
                                                    <AlertCircle size={11} strokeWidth={2.5} />
                                                  </span>
                                                )}
                                                {isEditMode && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      removeAssignment(
                                                        role.id,
                                                        cw.id,
                                                        roster.date,
                                                        roster.serviceId
                                                      )
                                                    }
                                                    className="text-slate-300 hover:text-rose-600 ml-0.5 p-0.5 cursor-pointer"
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
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                                          >
                                            <Plus size={11} strokeWidth={2} />
                                            <span>
                                              {assignedCoworkers.length === 0
                                                ? t('assign', language)
                                                : t('change', language)}
                                            </span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
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
