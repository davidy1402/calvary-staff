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
  AlertTriangle,
  FileText,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { AssignModal } from './AssignModal';
import { WhatsAppModal } from './WhatsAppModal';
import { WorshipSongSection } from './WorshipSongSection';
import { t } from '../utils/i18n';
import type { RoleDefinition, ServiceRoster, RoleCategoryId } from '../types';

export const RosterScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    activeServiceId,
    setActiveServiceId,
    activeService,
    userMode,
    setUserMode,
    isEditMode,
    getRostersForService,
    removeAssignment,
    updateRosterMeta,
    updateDutyNote,
    addSpecialEvent,
    removeSpecialEvent,
    getCoworkerDateConflicts,
    language,
  } = useChurch();

  // Selected role for AssignModal
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState<{
    role: RoleDefinition;
    date: string;
    serviceId: string;
  } | null>(null);

  // Selected roster for WhatsApp share
  const [whatsAppModalRoster, setWhatsAppModalRoster] = useState<ServiceRoster | null>(null);

  // Active filter chip
  const [filterType, setFilterType] = useState<string>('all');

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

  // Editing note for a specific role
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const getWeekdayShort = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split('-');
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const weekdaysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
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

  // Department categories with semantic accents
  const categoryGroups: Array<{
    id: RoleCategoryId;
    nameZh: string;
    nameEn: string;
    accentBg: string;
    accentText: string;
  }> = [
    { id: 'pulpit', nameZh: '讲台与报告', nameEn: 'Pulpit & Service', accentBg: 'bg-indigo-50', accentText: 'text-indigo-800' },
    { id: 'worship', nameZh: '敬拜赞美团', nameEn: 'Worship Team', accentBg: 'bg-blue-50', accentText: 'text-blue-800' },
    { id: 'media', nameZh: '影音多媒体', nameEn: 'AV & Media', accentBg: 'bg-cyan-50', accentText: 'text-cyan-800' },
    { id: 'sundayschool', nameZh: '主日学儿童事工', nameEn: 'Sunday School', accentBg: 'bg-amber-50', accentText: 'text-amber-800' },
    { id: 'prayer', nameZh: '守望代祷事工', nameEn: 'Prayer & Intercession', accentBg: 'bg-purple-50', accentText: 'text-purple-800' },
    { id: 'hospitality', nameZh: '接待与关怀', nameEn: 'Hospitality & Ushers', accentBg: 'bg-emerald-50', accentText: 'text-emerald-800' },
  ];

  const filterChips: Array<{ id: string; label: string }> = [
    { id: 'all', label: t('filterAll', language) },
    { id: 'my', label: t('filterMyDuties', language) },
    { id: 'worship', label: t('filterWorship', language) },
    { id: 'media', label: t('filterMedia', language) },
    { id: 'sundayschool', label: t('filterSundaySchool', language) },
    { id: 'pulpit', label: t('filterPulpit', language) },
    { id: 'prayer', label: t('filterPrayer', language) },
    { id: 'hospitality', label: t('filterHospitality', language) },
  ];

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Centered AppBar with Permission & Mode Switcher */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 pt-3.5 pb-0 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center justify-between pb-1">
          {/* Title & Mode Status Indicator */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CCCJB" className="w-6 h-6 rounded-md object-contain bg-black p-0.5 shadow-2xs shrink-0" />
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? t('editRosterTitle', language) : t('rosterTitle', language)}
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                userMode === 'editor'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {userMode === 'editor' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>{language === 'zh' ? '编辑中' : 'Editing'}</span>
                </>
              ) : (
                <>
                  <Lock size={10} strokeWidth={2.5} className="text-slate-400" />
                  <span>{language === 'zh' ? '只读' : 'Read-only'}</span>
                </>
              )}
            </span>
          </div>

          {/* Mode Switch Action */}
          <div>
            {isEditMode ? (
              <button
                type="button"
                onClick={() => setUserMode('member')}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>{t('done', language)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUserMode('editor');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-200/80"
              >
                <Edit2 size={13} strokeWidth={2} />
                <span>{language === 'zh' ? '编辑' : 'Edit'}</span>
              </button>
            )}
          </div>
        </div>

        {/* TabBar: Material Underline Tabs */}
        <div className="flex border-b border-slate-200/80 mt-2 px-1">
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
                  isActive ? 'text-blue-900 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
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

        {/* Fast Filter Chips Row (High Ergonomics for Selena) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-none">
          {filterChips.map((chip) => {
            const isChipActive = filterType === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilterType(chip.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-95 ${
                  isChipActive
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roster Cards List */}
      {serviceRosters.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 animate-slide-up">
          <CalendarDays size={36} strokeWidth={1.5} className="mx-auto text-slate-300 mb-2" />
          <p className="text-base font-bold text-slate-800">{t('noRosterData', language)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {isEditMode ? t('noRosterHintEdit', language) : t('noRosterHintView', language)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviceRosters.map((roster, index) => {
            const isExpanded = expandedDates[roster.date] ?? (index === 0);
            const dateTitle = `${roster.date.replace(/-/g, '/')} (${getWeekdayShort(roster.date)})`;
            const currentServiceName = getServiceName(activeService.id, activeService.name);

            // Active categories and roles for this service
            const activeRoles = churchState.roles.filter((r) =>
              activeService.categoryIds.includes(r.category)
            );

            // Staffing metrics
            const totalRoles = activeRoles.length;
            const assignedCount = activeRoles.filter(
              (r) => (roster.assignments[r.id]?.length ?? 0) > 0
            ).length;
            const isFullyStaffed = assignedCount === totalRoles;

            return (
              <div
                key={roster.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                {/* Sticky Date Card Header (Selena's readability fix: Date is never lost) */}
                <div
                  onClick={() => toggleExpand(roster.date)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none border-b border-slate-100"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100/80">
                      <CalendarDays size={22} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-slate-900 leading-snug">
                          {dateTitle}
                        </span>
                        {/* Graphical Staffing Progress Meter */}
                        <div className="flex items-center gap-1.5 bg-slate-100/90 px-2 py-0.5 rounded-full border border-slate-200/60">
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFullyStaffed ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.round((assignedCount / Math.max(totalRoles, 1)) * 100)}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-mono font-bold ${isFullyStaffed ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {assignedCount}/{totalRoles}
                          </span>
                          {isFullyStaffed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>

                        {roster.specialEvents &&
                          roster.specialEvents.map((ev) => (
                            <span
                              key={ev}
                              className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded"
                            >
                              {ev}
                            </span>
                          ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                        {currentServiceName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhatsAppModalRoster(roster);
                      }}
                      title="预览并分享 WhatsApp 服事表"
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors active:scale-90 cursor-pointer border border-slate-200/80"
                    >
                      <Share2 size={17} strokeWidth={2} />
                    </button>
                    <div className="text-slate-400 p-1">
                      {isExpanded ? (
                        <ChevronUp size={20} strokeWidth={2.25} />
                      ) : (
                        <ChevronDown size={20} strokeWidth={2.25} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 animate-slide-up">
                    {/* Theme / Scripture Bar */}
                    <div className="py-2.5 px-3 mb-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText size={16} strokeWidth={2} className="text-blue-600 shrink-0" />
                        {editingThemeDate === roster.date ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={themeInput}
                              onChange={(e) => setThemeInput(e.target.value)}
                              placeholder={language === 'zh' ? '输入讲道主题或经文...' : 'Enter sermon theme or scripture...'}
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateRosterMeta({ theme: themeInput.trim() }, roster.date, roster.serviceId);
                                setEditingThemeDate(null);
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shrink-0 text-xs transition-colors active:scale-95"
                            >
                              {t('save', language)}
                            </button>
                          </div>
                        ) : (
                          <span className="truncate">
                            {roster.theme ? (
                              <span className="font-semibold text-slate-900">
                                {t('theme', language)}: <strong className="font-bold text-blue-900">{roster.theme}</strong>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic font-medium">{t('unfilledTheme', language)}</span>
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
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0 ml-2 transition-colors active:scale-95 cursor-pointer"
                        >
                          {roster.theme ? t('modifyTheme', language) : t('fillTheme', language)}
                        </button>
                      )}
                    </div>

                    {/* Natively Integrated Worship Song List (No Google Sheets required) */}
                    {activeService.categoryIds.includes('worship') && (
                      <WorshipSongSection
                        date={roster.date}
                        serviceId={roster.serviceId}
                        songs={roster.songs}
                      />
                    )}

                    {/* Special Event Tags Management in Edit Mode */}
                    {isEditMode && (
                      <div className="py-2 px-3 flex items-center gap-1.5 flex-wrap bg-slate-50/50 rounded-xl border border-slate-100 mb-3">
                        <span className="text-xs text-slate-500 font-bold">
                          {t('specialEvents', language)}:
                        </span>
                        {roster.specialEvents &&
                          roster.specialEvents.map((ev) => (
                            <span
                              key={ev}
                              className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg"
                            >
                              <span>{ev}</span>
                              <button
                                type="button"
                                onClick={() => removeSpecialEvent(ev, roster.date, roster.serviceId)}
                                className="text-rose-400 hover:text-rose-700 cursor-pointer ml-0.5"
                              >
                                <X size={12} strokeWidth={2.5} />
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
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 transition-colors active:scale-95 cursor-pointer"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          <span>{t('addTag', language)}</span>
                        </button>
                      </div>
                    )}

                    {/* Department Sections (High Readability for Selena & Diana) */}
                    <div className="space-y-4">
                      {categoryGroups
                        .filter((cat) => {
                          if (!activeService.categoryIds.includes(cat.id)) return false;
                          if (filterType === 'all' || filterType === 'my') return true;
                          return cat.id === filterType;
                        })
                        .map((cat) => {
                          const catRoles = activeRoles.filter((r) => {
                            if (r.category !== cat.id) return false;
                            if (filterType === 'all') return true;
                            if (filterType === 'my') {
                              const assignedIds = roster.assignments[r.id] || [];
                              return currentUser?.id ? assignedIds.includes(currentUser.id) : true;
                            }
                            return cat.id === filterType;
                          });

                          if (catRoles.length === 0) return null;

                          const catAssignedCount = catRoles.filter(
                            (r) => (roster.assignments[r.id]?.length ?? 0) > 0
                          ).length;

                          return (
                            <div
                              key={cat.id}
                              className="bg-slate-50/70 rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs"
                            >
                              {/* Department Header with visual fill count */}
                              <div className={`px-3.5 py-2 flex items-center justify-between border-b border-slate-200/70 ${cat.accentBg}`}>
                                <span className={`text-xs font-black tracking-tight ${cat.accentText}`}>
                                  {language === 'zh' ? cat.nameZh : cat.nameEn}
                                </span>
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200/60 shadow-2xs ${cat.accentText}`}>
                                  {catAssignedCount}/{catRoles.length}
                                </span>
                              </div>

                              {/* Department Roster Rows: High Readability, No Grey Clutter */}
                              <div className="divide-y divide-slate-100 bg-white">
                                {catRoles.map((role) => {
                                  const assignedIds = roster.assignments[role.id] || [];
                                  const assignedCoworkers = assignedIds
                                    .map((id) => coworkerMap.get(id))
                                    .filter(Boolean);
                                  const dutyNote = roster.dutyNotes?.[role.id];
                                  const isNoteEditing = editingNoteKey === `${roster.id}_${role.id}`;

                                  return (
                                    <div
                                      key={role.id}
                                      className="p-2.5 sm:px-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                                    >
                                      {/* Left: Role Pill with fixed optical min-width */}
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-xs font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md min-w-[3.5rem] text-center shrink-0">
                                          {role.name}
                                        </span>

                                        {dutyNote && !isNoteEditing && (
                                          <span
                                            title={dutyNote}
                                            className="text-amber-600 hover:text-amber-800 cursor-help"
                                          >
                                            <MessageSquare size={13} strokeWidth={2} />
                                          </span>
                                        )}
                                      </div>

                                      {/* Inline Note Editor in Edit Mode */}
                                      {isNoteEditing ? (
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                          <input
                                            type="text"
                                            value={noteInput}
                                            onChange={(e) => setNoteInput(e.target.value)}
                                            placeholder={language === 'zh' ? '输入服事备注...' : 'Add note...'}
                                            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 min-w-0"
                                            autoFocus
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              updateDutyNote(role.id, noteInput, roster.date, roster.serviceId);
                                              setEditingNoteKey(null);
                                            }}
                                            className="px-2 py-1 bg-blue-600 text-white font-bold text-xs rounded-md shrink-0"
                                          >
                                            {t('save', language)}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingNoteKey(null)}
                                            className="px-1 text-slate-400 hover:text-slate-600 text-xs shrink-0"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        /* Center/Right: Assigned Coworkers (Large bold font for readability) */
                                        <div className="flex-1 flex items-center justify-end gap-1.5 flex-wrap min-w-0">
                                          {assignedCoworkers.length === 0 ? (
                                            <span className="text-xs font-semibold text-slate-400 italic">
                                              {t('pending', language)}
                                            </span>
                                          ) : (
                                            assignedCoworkers.map((cw) => {
                                              if (!cw) return null;
                                              const dateConflicts = getCoworkerDateConflicts(cw.id, roster.date);
                                              const hasConflict = dateConflicts.length > 1;

                                              return (
                                                <div
                                                  key={cw.id}
                                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-black shadow-2xs ${
                                                    hasConflict
                                                      ? 'bg-amber-50 text-amber-950 border border-amber-300'
                                                      : 'bg-slate-50/90 text-slate-900 border border-slate-200/90'
                                                  }`}
                                                >
                                                  <span>{cw.name}</span>

                                                  {/* Conflict Warning */}
                                                  {hasConflict && (
                                                    <span
                                                      title={`时间撞了: 当天同时服事 ${dateConflicts.map((c) => `[${c.serviceName} ${c.roleName}]`).join('、')}`}
                                                      className="text-amber-700"
                                                    >
                                                      <AlertTriangle size={12} strokeWidth={2.5} />
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
                                                      className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                                                    >
                                                      <X size={12} strokeWidth={2.5} />
                                                    </button>
                                                  )}
                                                </div>
                                              );
                                            })
                                          )}

                                          {/* Actions in Edit Mode: Assign & Add Note */}
                                          {isEditMode && (
                                            <div className="flex items-center gap-0.5 ml-1 shrink-0">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setNoteInput(dutyNote || '');
                                                  setEditingNoteKey(`${roster.id}_${role.id}`);
                                                }}
                                                title="添加/编辑备注"
                                                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                              >
                                                <MessageSquare size={12} strokeWidth={2} />
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setSelectedRoleForAssign({
                                                    role,
                                                    date: roster.date,
                                                    serviceId: roster.serviceId,
                                                  })
                                                }
                                                className="w-6 h-6 rounded flex items-center justify-center text-blue-700 hover:text-blue-900 hover:bg-blue-50 border border-blue-200/70 transition-colors active:scale-90"
                                                title={assignedCoworkers.length === 0 ? t('assign', language) : t('change', language)}
                                              >
                                                <Plus size={12} strokeWidth={2.5} />
                                              </button>
                                            </div>
                                          )}
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

      {/* Role Assignment Modal */}
      {selectedRoleForAssign && (
        <AssignModal
          role={selectedRoleForAssign.role}
          isOpen={Boolean(selectedRoleForAssign)}
          onClose={() => setSelectedRoleForAssign(null)}
          targetDate={selectedRoleForAssign.date}
          targetServiceId={selectedRoleForAssign.serviceId}
        />
      )}

      {/* WhatsApp Share Modal */}
      {whatsAppModalRoster && (
        <WhatsAppModal
          initialRoster={whatsAppModalRoster}
          isOpen={Boolean(whatsAppModalRoster)}
          onClose={() => setWhatsAppModalRoster(null)}
        />
      )}
    </div>
  );
};
