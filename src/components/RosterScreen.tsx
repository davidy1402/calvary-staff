import React, { useState, useRef } from 'react';
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
  MessageSquare,
  Clock,
  MapPin,
} from 'lucide-react';
import { AssignModal } from './AssignModal';
import { WhatsAppModal } from './WhatsAppModal';
import { WorshipSongSection } from './WorshipSongSection';
import { ServiceManagerModal } from './ServiceManagerModal';
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

export const RosterScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    activeServiceId,
    setActiveServiceId,
    activeService,
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
  const orderedRosters = [...upcomingRosters, ...pastRosters];

  // Accordion state: default open the closest upcoming service date
  const defaultExpandedDate = upcomingRosters[0]?.date || allServiceRosters[0]?.date;
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(() => {
    if (defaultExpandedDate) {
      return { [defaultExpandedDate]: true };
    }
    return {};
  });

  // Editing theme per date
  const [editingThemeDate, setEditingThemeDate] = useState<string | null>(null);
  const [themeInput, setThemeInput] = useState<string>('');

  // Editing note for a specific role
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  const handleEnterEditMode = () => {
    const pin = window.prompt(language === 'zh' ? '请输入统筹管理 4 位 PIN 码' : 'Enter 4-digit coordinator PIN');
    if (pin === '2026' || pin === '1402' || pin === '1234') {
      setUserMode('editor');
    } else if (pin !== null) {
      alert(language === 'zh' ? 'PIN 码错误' : 'Incorrect PIN');
    }
  };

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

  // Department categories with semantic accents
  const categoryGroups: Array<{
    id: RoleCategoryId;
    nameZh: string;
    nameEn: string;
    accentBg: string;
    accentText: string;
  }> = [
    { id: 'pulpit', nameZh: '讲台与报告', nameEn: 'Pulpit & Service', accentBg: 'bg-indigo-50 dark:bg-indigo-950/50', accentText: 'text-indigo-800 dark:text-indigo-300' },
    { id: 'worship', nameZh: '敬拜赞美团', nameEn: 'Worship Team', accentBg: 'bg-blue-50 dark:bg-blue-950/50', accentText: 'text-blue-800 dark:text-blue-300' },
    { id: 'media', nameZh: '影音多媒体', nameEn: 'AV & Media', accentBg: 'bg-cyan-50 dark:bg-cyan-950/50', accentText: 'text-cyan-800 dark:text-cyan-300' },
    { id: 'sundayschool', nameZh: '主日学儿童事工', nameEn: 'Sunday School', accentBg: 'bg-amber-50 dark:bg-amber-950/50', accentText: 'text-amber-800 dark:text-amber-300' },
    { id: 'prayer', nameZh: '守望代祷事工', nameEn: 'Prayer & Intercession', accentBg: 'bg-purple-50 dark:bg-purple-950/50', accentText: 'text-purple-800 dark:text-purple-300' },
    { id: 'hospitality', nameZh: '接待与关怀', nameEn: 'Hospitality & Ushers', accentBg: 'bg-emerald-50 dark:bg-emerald-950/50', accentText: 'text-emerald-800 dark:text-emerald-300' },
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

  // Touch swipe gesture handling for category switching (Selena & David's HCI request)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Detect predominantly horizontal swipe (minimum 40px, deltaX > 1.3 * deltaY)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIndex = filterChips.findIndex((c) => c.id === filterType);
      if (currentIndex === -1) return;

      if (deltaX < 0) {
        // Swiped LEFT: advance to next category
        if (currentIndex < filterChips.length - 1) {
          const nextChip = filterChips[currentIndex + 1];
          setFilterType(nextChip.id);
          document.getElementById(`chip-${nextChip.id}`)?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        }
      } else {
        // Swiped RIGHT: go back to previous category
        if (currentIndex > 0) {
          const prevChip = filterChips[currentIndex - 1];
          setFilterType(prevChip.id);
          document.getElementById(`chip-${prevChip.id}`)?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        }
      }
    }
  };

  return (
    <div className="min-h-full">
      {/* Centered AppBar with Permission & Mode Switcher */}
      <header className="app-header-safe bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-4 pb-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center justify-between pb-1">
          {/* Title & Active Edit Mode Indicator */}
          <div className="flex items-center gap-2">
            <ChurchLogo className="w-6 h-6 object-contain shrink-0" />
            <h1 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              {isEditMode ? t('editRosterTitle', language) : t('rosterTitle', language)}
            </h1>
            {isEditMode && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                <span>{language === 'zh' ? '编辑中' : 'Editing'}</span>
              </span>
            )}
          </div>

          {/* Right actions: Mode Switch Action */}
          <div className="flex items-center gap-1.5">
            {isEditMode ? (
              <button
                type="button"
                onClick={() => setUserMode('member')}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>{t('done', language)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnterEditMode}
                className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-800"
                title={language === 'zh' ? '输入统筹 PIN 码管理排班' : 'Enter PIN to edit schedule'}
              >
                <Edit2 size={12} strokeWidth={2} />
                <span>{language === 'zh' ? '管理排班' : 'Edit'}</span>
              </button>
            )}
          </div>
        </div>

        {/* TabBar: Material Underline Tabs */}
        <div className="flex border-b border-slate-200/80 dark:border-zinc-800 mt-2 px-1">
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
                  const up = rosters.filter((r) => r.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
                  const targetDate = up[0]?.date || rosters[0]?.date;
                  if (targetDate) {
                    setExpandedDates({ [targetDate]: true });
                  }
                }}
                className={`flex-1 pb-2 pt-1 text-xs text-center transition-all duration-200 relative cursor-pointer ${
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
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 px-1 pt-1.5 pb-0.5">
          <div className="flex items-center gap-2.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
              <Clock size={11} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
              <span>{activeService.time}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 truncate">
              <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
              <span className="truncate">{activeService.venue}</span>
            </span>
          </div>

          {isEditMode && (
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(true)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 shrink-0 ml-2 cursor-pointer hover:underline"
            >
              <Edit2 size={11} strokeWidth={2} />
              <span>{language === 'zh' ? '编辑堂次' : 'Edit'}</span>
            </button>
          )}
        </div>

        {/* Fast Filter Chips Row (High Ergonomics for Selena) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-none">
          {filterChips.map((chip) => {
            const isChipActive = filterType === chip.id;
            return (
              <button
                key={chip.id}
                id={`chip-${chip.id}`}
                type="button"
                onClick={() => setFilterType(chip.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-95 ${
                  isChipActive
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Editing Mode Subtle Indicator Banner */}
      {isEditMode && (
        <div className="bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-100/90 dark:border-blue-900/40 px-4 py-1.5 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300 animate-slide-up">
          <span className="flex items-center gap-1.5 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shrink-0" />
            <span>{language === 'zh' ? '排班编辑模式已开启，改动即时生效' : 'Editing schedule. Changes save automatically.'}</span>
          </span>
          <button
            type="button"
            onClick={() => setUserMode('member')}
            className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer ml-2 shrink-0"
          >
            {language === 'zh' ? '完成并锁定' : 'Done'}
          </button>
        </div>
      )}

      {/* Swipeable Content Area (Left/Right swipe switches category tabs) */}
      <div
        className="px-4 pt-3 space-y-4 touch-pan-y min-h-[50vh] animate-slide-up"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {orderedRosters.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-slate-200 dark:border-zinc-800 text-center text-slate-500 dark:text-zinc-400 animate-slide-up">
          <CalendarDays size={36} strokeWidth={1.5} className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
          <p className="text-base font-bold text-slate-800 dark:text-zinc-200">{t('noRosterData', language)}</p>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
            {isEditMode ? t('noRosterHintEdit', language) : t('noRosterHintView', language)}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                    onClick={() => toggleExpand(roster.date)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors select-none border-b border-slate-100 dark:border-zinc-800"
                  >
                    <div className="flex items-start gap-3 min-w-0">
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

                          {/* Graphical Staffing Progress Meter */}
                          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-zinc-700">
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
                          </div>

                          {roster.specialEvents &&
                            roster.specialEvents.map((ev) => (
                              <span
                                key={ev}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isPast
                                    ? 'text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800'
                                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40'
                                }`}
                              >
                                {ev}
                              </span>
                            ))}
                        </div>
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
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors active:scale-90 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                      >
                      <Share2 size={17} strokeWidth={2} />
                    </button>
                    <div className="text-slate-400 dark:text-zinc-500 p-1">
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
                  <div className="px-4 pb-4 pt-3 animate-slide-up space-y-3">
                    {/* Theme / Scripture Bar */}
                    <div className="py-1 px-0.5 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText size={15} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        {editingThemeDate === roster.date ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={themeInput}
                              onChange={(e) => setThemeInput(e.target.value)}
                              placeholder={language === 'zh' ? '输入讲道主题或经文' : 'Enter sermon theme or scripture'}
                              className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateRosterMeta({ theme: themeInput.trim() }, roster.date, roster.serviceId);
                                setEditingThemeDate(null);
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shrink-0 text-xs transition-colors active:scale-95 cursor-pointer"
                            >
                              {t('save', language)}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingThemeDate(null)}
                              className="px-1 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 text-xs shrink-0 cursor-pointer"
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
                      <div className="py-1 px-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">
                          {t('specialEvents', language)}:
                        </span>
                        {roster.specialEvents &&
                          roster.specialEvents.map((ev) => (
                            <span
                              key={ev}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg"
                            >
                              <span>{ev}</span>
                              <button
                                type="button"
                                onClick={() => removeSpecialEvent(ev, roster.date, roster.serviceId)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer ml-0.5"
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
                              if (assignedIds.length === 0) return false;
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
                              ? (language === 'zh' ? '该日无您的服事安排' : 'No duties assigned to you on this date')
                              : !isEditMode
                              ? (language === 'zh' ? '暂未安排服事同工' : 'No duties assigned yet')
                              : (language === 'zh' ? '该组暂无岗位设置' : 'No roles in this group')}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4 pt-1">
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
                                  const isNoteEditing = editingNoteKey === `${roster.id}_${role.id}`;

                                  return (
                                    <div
                                      key={role.id}
                                      className="py-2.5 px-1 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                                    >
                                      {/* Left: Role Title (Clean readable label, no gray pill border) */}
                                      <div className="flex items-center gap-1.5 shrink-0 min-w-[4.5rem]">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                                          {role.name}
                                        </span>

                                        {dutyNote && !isNoteEditing && (
                                          <span
                                            title={dutyNote}
                                            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 cursor-help"
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
                                            placeholder={language === 'zh' ? '输入服事备注' : 'Add note'}
                                            className="text-xs px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 min-w-0"
                                            autoFocus
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              updateDutyNote(role.id, noteInput, roster.date, roster.serviceId);
                                              setEditingNoteKey(null);
                                            }}
                                            className="px-2.5 py-1 bg-blue-600 text-white font-bold text-xs rounded-md shrink-0 cursor-pointer"
                                          >
                                            {t('save', language)}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingNoteKey(null)}
                                            className="px-1 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 text-xs shrink-0 cursor-pointer"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        /* Center/Right: Assigned Coworkers (Natural typography, no heavy nested boxes) */
                                        <div className="flex-1 flex items-center justify-end gap-2 flex-wrap min-w-0">
                                          {assignedCoworkers.length === 0 ? (
                                            <span className="text-xs font-normal text-slate-300 dark:text-zinc-600">
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
                                                  className={`inline-flex items-center gap-1 text-sm font-bold ${
                                                    hasConflict
                                                      ? 'text-amber-700 dark:text-amber-400'
                                                      : 'text-slate-900 dark:text-zinc-100'
                                                  }`}
                                                >
                                                  <span>{cw.name}</span>

                                                  {/* Conflict Warning */}
                                                  {hasConflict && (
                                                    <span
                                                      title={`时间冲突: 当天同时服事 ${dateConflicts.map((c) => `[${c.serviceName} ${c.roleName}]`).join('、')}`}
                                                      className="text-amber-600 dark:text-amber-400"
                                                    >
                                                      <AlertTriangle size={13} strokeWidth={2.5} />
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
                                                      className="text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer p-0.5"
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
                                            <div className="flex items-center gap-1 ml-1 shrink-0">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setNoteInput(dutyNote || '');
                                                  setEditingNoteKey(`${roster.id}_${role.id}`);
                                                }}
                                                title="添加/编辑备注"
                                                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
                                                className="w-6 h-6 rounded flex items-center justify-center text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 bg-blue-50 dark:bg-zinc-800 transition-colors active:scale-90 cursor-pointer"
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
