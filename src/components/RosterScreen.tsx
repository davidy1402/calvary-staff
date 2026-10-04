import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  CalendarDays,
  Pencil,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Share2,
  FileText,
  Clock,
  MapPin,
} from 'lucide-react';
import { CoordinatorPinPopover } from './CoordinatorPinPopover';
import { RosterSaveStatus } from './RosterSaveStatus';
import { AssignModal } from './AssignModal';
import { WhatsAppModal } from './WhatsAppModal';
import { WorshipSongSection } from './WorshipSongSection';
import { ServiceManagerModal } from './ServiceManagerModal';
import { ServiceEventBadge } from './ServiceEventBadge';
import { ChurchLogo } from './ChurchLogo';
import { t } from '../utils/i18n';
import type { RoleDefinition, ServiceRoster, RoleCategoryId } from '../types';

const getTodayDateStr = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const RosterScreen: React.FC<{ setlistDate?: string | null }> = ({ setlistDate }) => {
  const {
    churchState,
    currentUser,
    activeServiceId,
    setActiveServiceId,
    activeService,
    isEditMode,
    getRostersForService,
    updateRosterMeta,
    addSpecialEvent,
    removeSpecialEvent,
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
  const [filterType, setFilterType] = useState<string>(setlistDate ? 'worship' : 'all');

  // Service Edit Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const todayStr = getTodayDateStr();
  const allServiceRosters = getRostersForService(activeServiceId);

  // Upcoming & current: date >= today, sorted ascending (closest upcoming Sunday/service first)
  const upcomingRosters = allServiceRosters
    .filter((r) => r.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Past: date < today, sorted descending (most recently passed at top of past section)
  const pastRosters = allServiceRosters
    .filter((r) => r.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Prioritize upcoming first, past at the bottom
  const [showPast, setShowPast] = useState(false);
  const orderedRosters = [...upcomingRosters, ...(showPast ? pastRosters : [])];

  // Accordion state: default open the closest upcoming service date
  const defaultExpandedDate = setlistDate || upcomingRosters[0]?.date || allServiceRosters[0]?.date;
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(() => {
    if (defaultExpandedDate) {
      return { [defaultExpandedDate]: true };
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
    const weekdaysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return language === 'zh' ? weekdaysZh[date.getDay()] : weekdaysEn[date.getDay()];
  };

  const getServiceShortName = (serviceId: string, defaultShortName: string) => {
    const shortKey = `${serviceId}_short` as any;
    return t(shortKey, language) !== shortKey ? t(shortKey, language) : defaultShortName;
  };

  const coworkerMap = new Map(churchState.coworkers.map((c) => [c.id, c]));

  // Department headings
  const categoryGroups: Array<{
    id: RoleCategoryId;
    nameZh: string;
    nameEn: string;
  }> = [
    { id: 'pulpit', nameZh: '讲台与报告', nameEn: 'Pulpit & Service' },
    { id: 'worship', nameZh: '敬拜赞美团', nameEn: 'Worship Team' },
    { id: 'media', nameZh: '影音多媒体', nameEn: 'AV & Media' },
    { id: 'sundayschool', nameZh: '主日学儿童事工', nameEn: 'Sunday School' },
    { id: 'prayer', nameZh: '守望代祷事工', nameEn: 'Prayer & Intercession' },
    { id: 'hospitality', nameZh: '接待与关怀', nameEn: 'Hospitality & Ushers' },
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
    <div className="min-h-full">
      {/* Centered AppBar with Permission & Mode Switcher */}
      <header className="app-header-safe bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-4 md:px-6 pb-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center justify-between pb-1">
          {/* Title & Active Edit Mode Indicator */}
          <div className="flex items-center gap-2">
            <ChurchLogo className="w-6 h-6 md:w-7 md:h-7 object-contain shrink-0" />
            <h1 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              {isEditMode ? t('editRosterTitle', language) : t('rosterTitle', language)}
            </h1>

          </div>

          {/* Administration is intentionally kept in the overflow menu. */}
          <div className="flex items-center gap-1.5">
            <CoordinatorPinPopover />
          </div>
        </div>

        {/* TabBar: Material Underline Tabs */}
        <div className="flex border-b border-slate-200/80 dark:border-zinc-800 mt-2 px-1">
          {churchState.services.map((svc) => {
            const isActive = svc.id === activeServiceId;
            const tabLabel = svc.shortName || getServiceShortName(svc.id, svc.name);
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => {
                  setActiveServiceId(svc.id);
                  setFilterType('all');
                  const rosters = getRostersForService(svc.id);
                  const up = rosters.filter((r) => r.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
                  const targetDate = up[0]?.date || rosters[0]?.date;
                  if (targetDate) {
                    setExpandedDates({ [targetDate]: true });
                  }
                }}
                className={`flex-1 pb-2 pt-1 text-xs md:text-sm text-center transition-all duration-200 relative cursor-pointer ${
                  isActive
                    ? 'text-blue-900 dark:text-blue-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium'
                }`}
              >
                <span>{tabLabel}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-blue-900 dark:bg-blue-400 rounded-full transition-all duration-200" />
                )}
              </button>
            );
          })}
        </div>
 
        {/* Service Timing & Venue Subheader with Edit Trigger */}
        <div className="flex items-center justify-between text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 px-1 pt-1.5 pb-0.5">
          <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
              <Clock size={12} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
              <span>{activeService.time}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 truncate">
              <MapPin size={12} strokeWidth={1.75} className="shrink-0" />
              <span className="truncate">{activeService.venue}</span>
            </span>
          </div>

          {isEditMode && (
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(true)}
              className="text-[11px] md:text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 shrink-0 ml-2 cursor-pointer hover:underline"
            >
              <Pencil size={12} strokeWidth={2} />
              <span>{language === 'zh' ? '编辑聚会设定' : 'Edit Service'}</span>
            </button>
          )}
        </div>

        {/* Primary views and a compact department filter */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
          {filterChips.slice(0, 2).map((chip) => (
            <button
              key={chip.id}
              type="button"
              aria-pressed={filterType === chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`min-h-11 px-3.5 rounded-xl text-xs md:text-sm font-semibold shrink-0 transition-colors cursor-pointer ${
                filterType === chip.id
                  ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {chip.label}
            </button>
          ))}
          <select
            aria-label={language === 'zh' ? '按事工筛选' : 'Filter by ministry'}
            value={filterType === 'all' || filterType === 'my' ? '' : filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="min-h-11 min-w-0 flex-1 md:max-w-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs md:text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>{language === 'zh' ? '按事工筛选' : 'Ministry'}</option>
            {filterChips.slice(2).filter((chip) => activeService.categoryIds.includes(chip.id as RoleCategoryId)).map((chip) => (
              <option key={chip.id} value={chip.id}>{chip.label}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="px-4 md:px-6 pt-2"><RosterSaveStatus /></div>

      {/* Roster content */}
      <div
        className="px-4 md:px-6 pt-3 space-y-4 touch-pan-y min-h-[50vh] animate-slide-up"
      >
        {orderedRosters.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-zinc-800 text-center text-slate-500 dark:text-zinc-400 animate-slide-up">
          <CalendarDays size={36} strokeWidth={1.5} className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
          <p className="text-base md:text-lg font-bold text-slate-800 dark:text-zinc-200">{pastRosters.length > 0 ? (language === 'zh' ? '暂无即将举行的聚会' : 'No upcoming services') : t('noRosterData', language)}</p>
          <p className="text-xs md:text-sm text-slate-400 dark:text-zinc-500 mt-1">
            {pastRosters.length > 0 ? (language === 'zh' ? '可在下方查看历史侍奉表' : 'View past services below') : (isEditMode ? t('noRosterHintEdit', language) : t('noRosterHintView', language))}
          </p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {orderedRosters.map((roster, index) => {
            const isPast = roster.date < todayStr;
            const isNextUpcoming = !isPast && roster.date === upcomingRosters[0]?.date;
            const isFirstPast = isPast && (index === 0 || orderedRosters[index - 1]?.date >= todayStr);
            const isExpanded = expandedDates[roster.date] ?? (isNextUpcoming && index === 0);
            const dateTitle = `${roster.date.replace(/-/g, '/')} (${getWeekdayShort(roster.date)})`;

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
              <React.Fragment key={roster.id}>
                {isFirstPast && (
                  <div className="pt-3 pb-1 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                      {language === 'zh' ? '已结束的主日 / 聚会' : 'Past Services'}
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
                  </div>
                )}

                <div
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isPast
                      ? 'bg-slate-50/70 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/60 opacity-60 hover:opacity-100'
                      : isNextUpcoming
                      ? 'bg-white dark:bg-zinc-900 border-blue-200/90 dark:border-blue-900/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-2xs'
                  }`}
                >
                  {/* Sticky Date Card Header */}
                  <div
                    className="p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors select-none border-b border-slate-100 dark:border-zinc-800"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(roster.date)}
                      aria-expanded={isExpanded}
                      className="min-h-11 flex-1 flex items-start gap-3 min-w-0 text-left"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                          isPast
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200/60 dark:border-zinc-700/60'
                            : 'bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 border-blue-100/80 dark:border-zinc-700'
                        }`}
                      >
                        <CalendarDays size={22} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-base font-extrabold leading-snug ${
                              isPast ? 'text-slate-500 dark:text-zinc-400' : 'text-slate-900 dark:text-zinc-100'
                            }`}
                          >
                            {dateTitle}
                          </span>

                          {isPast ? (
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                              {language === 'zh' ? '已结束' : 'Past'}
                            </span>
                          ) : isNextUpcoming ? (
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/70 dark:border-blue-900/50">
                              {roster.date === todayStr ? (language === 'zh' ? '今日聚会' : 'Today') : (language === 'zh' ? '来临主日' : 'Upcoming')}
                            </span>
                          ) : null}

                          {/* Staffing details are only needed by coordinators. */}
                          {isEditMode && <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-zinc-700">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isPast
                                    ? 'bg-slate-400 dark:bg-zinc-500'
                                    : isFullyStaffed
                                    ? 'bg-emerald-500'
                                    : 'bg-blue-600 dark:bg-blue-400'
                                }`}
                                style={{ width: `${Math.round((assignedCount / Math.max(totalRoles, 1)) * 100)}%` }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                isPast
                                  ? 'text-slate-400 dark:text-zinc-500'
                                  : isFullyStaffed
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-slate-600 dark:text-zinc-400'
                              }`}
                            >
                              {assignedCount}/{totalRoles}
                            </span>
                            {!isPast && isFullyStaffed && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </div>}

                          {roster.specialEvents?.map((ev) => (
                            <ServiceEventBadge key={ev} event={ev} />
                          ))}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWhatsAppModalRoster(roster);
                        }}
                        title="预览并分享 WhatsApp 侍奉表"
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors active:scale-90 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                      >
                      <Share2 size={17} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(roster.date)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展开' : 'Expand')} ${dateTitle}`}
                      className="min-h-11 min-w-8 flex items-center justify-center text-slate-500 dark:text-zinc-400"
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} strokeWidth={2.25} />
                      ) : (
                        <ChevronDown size={20} strokeWidth={2.25} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 animate-slide-up space-y-3">
                    {/* Theme / Scripture Bar */}
                    {(roster.theme || isEditMode) && <div className="py-1 px-0.5 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText size={15} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        {editingThemeDate === roster.date && isEditMode ? (
                          <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-1 animate-fade-in">
                            <input
                              type="text"
                              value={themeInput}
                              onChange={(e) => setThemeInput(e.target.value)}
                              placeholder={language === 'zh' ? '输入讲道主题或经文...' : 'Enter sermon theme or scripture...'}
                              className="w-full min-h-10 text-sm md:text-xs px-3 py-1.5 bg-white dark:bg-zinc-800 border border-blue-400 dark:border-blue-600 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium shadow-2xs"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateRosterMeta({ theme: themeInput.trim() }, roster.date, roster.serviceId);
                                  setEditingThemeDate(null);
                                } else if (e.key === 'Escape') {
                                  setEditingThemeDate(null);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateRosterMeta({ theme: themeInput.trim() }, roster.date, roster.serviceId);
                                setEditingThemeDate(null);
                              }}
                              className="min-h-10 px-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shrink-0 text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              {t('save', language)}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingThemeDate(null)}
                              className="min-h-10 min-w-8 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 text-sm shrink-0 flex items-center justify-center cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
                              title="取消"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="truncate">
                            <span className="font-semibold text-slate-400 dark:text-zinc-500 mr-1.5">
                              {language === 'zh' ? '讲道主题:' : 'Theme:'}
                            </span>
                            <span className="font-medium text-slate-800 dark:text-zinc-200">
                              {roster.theme || (isEditMode ? (language === 'zh' ? '点击右侧填写主题' : 'Click to set theme') : (language === 'zh' ? '未设定' : 'None'))}
                            </span>
                          </div>
                        )}
                      </div>

                      {isEditMode && editingThemeDate !== roster.date && (
                        <button
                          type="button"
                          onClick={() => {
                            setThemeInput(roster.theme || '');
                            setEditingThemeDate(roster.date);
                          }}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 shrink-0 ml-2 transition-colors cursor-pointer"
                        >
                          {roster.theme ? t('modifyTheme', language) : t('fillTheme', language)}
                        </button>
                      )}
                    </div>}

                    {/* Natively Integrated Worship Song List (No Google Sheets required) */}
                    {activeService.categoryIds.includes('worship') && ['all', 'my', 'worship'].includes(filterType) && (
                      <WorshipSongSection
                        date={roster.date}
                        serviceId={roster.serviceId}
                        songs={roster.songs}
                        initiallyExpanded={roster.date === setlistDate}
                        allowEdit={roster.date >= todayStr && !!currentUser && (roster.assignments.lead_vocal || []).includes(currentUser.id)}
                      />
                    )}

                    {/* Special Event Tags Management in Edit Mode */}
                    {isEditMode && (
                      <div className="py-1 px-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">
                          {t('specialEvents', language)}:
                        </span>
                        {roster.specialEvents?.map((ev) => (
                          <ServiceEventBadge key={ev} event={ev}>
                            <button
                              type="button"
                              onClick={() => removeSpecialEvent(ev, roster.date, roster.serviceId)}
                              aria-label={language === 'zh' ? `移除标签 ${ev}` : `Remove tag ${ev}`}
                              className="hover:opacity-70 cursor-pointer ml-0.5"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          </ServiceEventBadge>
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
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          <span>{t('addTag', language)}</span>
                        </button>
                      </div>
                    )}

                    {/* Department Sections: Clean Typographic Hierarchy with Generous Breathing Room */}
                    {(() => {
                      const displayedCategories = categoryGroups
                        .filter((cat) => {
                          if (!activeService.categoryIds.includes(cat.id)) return false;
                          if (filterType === 'all' || filterType === 'my') return true;
                          return cat.id === filterType;
                        })
                        .map((cat) => {
                          const allCatRoles = activeRoles.filter((r) => r.category === cat.id);
                          const catRoles = allCatRoles.filter((r) => {
                            if (!isEditMode) {
                              const assignedIds = roster.assignments[r.id] || [];
                              if (assignedIds.length === 0 && !roster.dutyNotes?.[r.id]) return false;
                            }
                            if (filterType === 'all') return true;
                            if (filterType === 'my') {
                              const assignedIds = roster.assignments[r.id] || [];
                              return currentUser?.id ? assignedIds.includes(currentUser.id) : true;
                            }
                            return cat.id === filterType;
                          });

                          const catAssignedCount = allCatRoles.filter(
                            (r) => (roster.assignments[r.id]?.length ?? 0) > 0
                          ).length;

                          return {
                            cat,
                            allCatRoles,
                            catRoles,
                            catAssignedCount,
                          };
                        })
                        .filter((item) => item.catRoles.length > 0);

                      if (displayedCategories.length === 0) {
                        return (
                          <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                            {filterType === 'my'
                              ? (language === 'zh' ? '该日无您的服侍安排' : 'No duties assigned to you on this date')
                              : !isEditMode
                              ? (language === 'zh' ? '暂未安排服侍人员' : 'No duties assigned yet')
                              : (language === 'zh' ? '该组暂无岗位设置' : 'No roles in this group')}
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-1">
                          {displayedCategories.map(({ cat, allCatRoles, catRoles, catAssignedCount }) => (
                            <div key={cat.id} className="space-y-1">
                              {/* Department Header: Typographic Header with hairline divider */}
                              <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-100 dark:border-zinc-800">
                                <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 tracking-wide">
                                  {language === 'zh' ? cat.nameZh : cat.nameEn}
                                </span>
                                {isEditMode && (
                                  <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-zinc-500">
                                    {catAssignedCount}/{allCatRoles.length}
                                  </span>
                                )}
                              </div>

                              {/* Department Roster Rows */}
                              <div className="divide-y divide-slate-100/70 dark:divide-zinc-800/50">
                                {catRoles.map((role) => {
                                  const assignedIds = roster.assignments[role.id] || [];
                                  const assignedCoworkers = assignedIds
                                    .map((id) => coworkerMap.get(id))
                                    .filter(Boolean);
                                  const dutyNote = roster.dutyNotes?.[role.id];

                                  return (
                                    <div
                                      key={role.id}
                                      className="py-3 px-1 grid grid-cols-[minmax(4.5rem,auto)_minmax(0,1fr)] gap-x-3 gap-y-1.5"
                                    >
                                      <span className="text-sm font-medium text-slate-600 dark:text-zinc-400 self-center">
                                        {role.name}
                                      </span>
                                      <div className="flex items-center justify-end gap-2 min-w-0">
                                        <div className="min-w-0 text-right text-sm font-semibold text-slate-900 dark:text-zinc-100 break-words">
                                          {assignedCoworkers.length > 0
                                            ? assignedCoworkers.map((cw) => cw?.name).join('、')
                                            : <span className="font-normal text-slate-500 dark:text-zinc-400">{t('pending', language)}</span>}
                                        </div>
                                        {isEditMode && (
                                          <button
                                            type="button"
                                            onClick={() => setSelectedRoleForAssign({ role, date: roster.date, serviceId: roster.serviceId })}
                                            aria-label={language === 'zh' ? `编辑${role.name}` : `Edit ${role.name}`}
                                            className="min-h-11 px-2 shrink-0 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-blue-500"
                                          >
                                            {language === 'zh' ? '编辑' : 'Edit'}
                                          </button>
                                        )}
                                      </div>
                                      {dutyNote && (
                                        <p className="col-span-2 text-xs leading-relaxed whitespace-pre-wrap break-words text-slate-600 dark:text-zinc-400">
                                          {dutyNote}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        </div>
      )}
      </div>

      {pastRosters.length > 0 && (
        <div className="px-4 py-5">
          <button
            type="button"
            aria-expanded={showPast}
            onClick={() => setShowPast((prev) => !prev)}
            className="min-h-11 w-full flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            {showPast ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {language === 'zh'
              ? `${showPast ? '收起' : '查看'}历史侍奉表 ${pastRosters.length}`
              : `${showPast ? 'Hide' : 'Show'} past services (${pastRosters.length})`}
          </button>
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
          showNoteEditor
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

      {/* Service Manager Modal */}
      {isServiceModalOpen && (
        <ServiceManagerModal
          isOpen={true}
          onClose={() => setIsServiceModalOpen(false)}
          initialEditingServiceId={activeServiceId}
        />
      )}
    </div>
  );
};
