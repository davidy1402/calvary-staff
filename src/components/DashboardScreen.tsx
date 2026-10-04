import React, { useState } from 'react';
import { ServiceEventBadge } from './ServiceEventBadge';
import { useChurch } from '../context/ChurchContext';
import { AddToHomeCard } from './AddToHomeCard';
import { HeartHandshake, Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import { t } from '../utils/i18n';
import { ChurchLogo } from './ChurchLogo';
import { DailyScriptureCard } from './DailyScriptureCard';
import { getTimeGreeting } from '../utils/greetingUtils';
import { RosterDetailModal } from './RosterDetailModal';
import type { ServiceRoster, ServiceDefinition } from '../types';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
  onOpenSetlist: (date: string, serviceId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster, onOpenSetlist }) => {
  const { currentUser, getUserSeasonAssignments, language, setIsIdentityModalOpen } = useChurch();

  const userAssignments = getUserSeasonAssignments(currentUser?.id);
  const [today] = useState(() => new Date().toLocaleDateString('en-CA'));
  const upcoming = userAssignments.filter(({ roster }) => roster.date >= today);
  const past = userAssignments.filter(({ roster }) => roster.date < today).reverse();
  const [showPast, setShowPast] = useState(false);
  const displayedAssignments = [...upcoming, ...(showPast ? past : [])];

  const [selectedDuty, setSelectedDuty] = useState<{
    roster: ServiceRoster;
    service: ServiceDefinition;
  } | null>(null);

  // Short display name
  const getShortName = (fullName?: string) => {
    if (!fullName) return language === 'zh' ? '服侍人员' : 'Volunteer';
    if (language === 'en') {
      return currentUser?.englishName || fullName;
    }
    const trimmed = fullName.trim();
    if (trimmed.length === 3) {
      return trimmed.substring(1);
    }
    return trimmed;
  };

  const displayName = getShortName(currentUser?.name);
  const timeGreeting = getTimeGreeting(language);

  const getDateParts = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split('-');
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const weekdaysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      month: language === 'zh' ? `${Number(mm)}月` : monthsEn[Number(mm) - 1],
      day: dd,
      weekday: language === 'zh' ? weekdaysZh[date.getDay()] : weekdaysEn[date.getDay()],
    };
  };

  return (
    <div className="min-h-full">
      {/* Centered AppBar with Church Logo & Name */}
      <header className="app-header-safe bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-4 pb-3 sticky top-0 z-30 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ChurchLogo className="w-8 h-8 object-contain shrink-0" />
          <div className="text-left">
            <h1 className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
              {language === 'zh' ? '新山加略山社区教会' : 'CCCJB Connect'}
            </h1>
            <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 tracking-wider leading-none">
              CCCJB Connect
            </p>
          </div>
        </div>
      </header>

      {/* Screen Body Content */}
      <div className="px-4 pt-4 space-y-4 animate-slide-up">

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
            {timeGreeting}，<span className="font-bold text-slate-900 dark:text-zinc-100">{displayName}</span>
          </p>
          <button
            type="button"
            onClick={() => setIsIdentityModalOpen(true)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-0.5 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {language === 'zh' ? '切换同工' : 'Switch'}
          </button>
        </div>

      {/* 我的服事 Section (Ergonomic Duty Passes) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <HeartHandshake size={18} className="text-blue-700 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{language === 'zh' ? '接下来的服事' : 'Upcoming duties'}</h3>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
            {upcoming.length > 0 ? (language === 'zh' ? `${upcoming.length} 次安排` : `${upcoming.length} services`) : ''}
          </span>
        </div>

        {displayedAssignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-zinc-400 text-sm space-y-1">
            <p className="font-semibold text-slate-700 dark:text-zinc-200">{language === 'zh' ? '目前没有接下来的服事安排' : 'No upcoming duties'}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">{t('noDutiesHint', language)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {displayedAssignments.map(({ roster, service, roles }, index) => {
              const { month, day, weekday } = getDateParts(roster.date);

              return (
                <div key={roster.id} className="py-2">
                  {index === 0 && upcoming.length > 0 && <p className="px-1.5 pt-2 text-xs font-semibold text-blue-700 dark:text-blue-400">{language === 'zh' ? '下一次服事' : 'Your next service'}</p>}
                  {roster.date === past[0]?.roster.date && showPast && <p className="px-1.5 pt-2 text-xs text-slate-600 dark:text-zinc-400">{language === 'zh' ? '已结束的服事' : 'Past duties'}</p>}
                  <button
                    type="button"
                    onClick={() => setSelectedDuty({ roster, service })}
                    className="w-full text-left py-3 flex items-start gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 rounded-xl px-1.5 transition-colors group"
                  >
                  {/* Calendar Ticket Badge */}
                  <div className="w-13 shrink-0 bg-slate-100/80 dark:bg-zinc-800/70 rounded-xl p-1.5 text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">{month}</span>
                    <span className="text-xl font-black text-slate-900 dark:text-zinc-100 leading-tight">{day}</span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">{weekday}</span>
                  </div>

                  {/* Duty Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                        {service.name}
                      </h4>
                      {roster.specialEvents && roster.specialEvents.length > 0 && (
                    <ServiceEventBadge event={roster.specialEvents[0]} />
                  )}
                    </div>

                    {/* Assigned Roles Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      {roles.map((rName) => (
                        <span
                          key={rName}
                          className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-zinc-800 text-blue-800 dark:text-blue-300 font-bold text-xs"
                        >
                          {rName}
                        </span>
                      ))}


                    </div>

                    {Object.entries(roster.assignments).filter(([, ids]) => currentUser && ids.includes(currentUser.id)).map(([roleId]) => roster.dutyNotes?.[roleId]).filter(Boolean).map((note, noteIndex) => (
                      <p key={noteIndex} className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-600 dark:text-zinc-400">{note}</p>
                    ))}

                    {/* Timing & Venue Metadata */}
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-zinc-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300">
                        <Clock size={12} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{service.rehearsalTime}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                        <MapPin size={12} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span>{language === 'zh' ? service.venue.split(' ')[0] : service.venue}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{language === 'zh' ? '聚会时间 ' : 'Service time '}{service.time}</p>
                  </div>

                  <ChevronRight size={16} strokeWidth={2} className="text-slate-300 dark:text-zinc-600 shrink-0 self-center group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors" />
                  </button>
                  {roster.date >= today && currentUser && (roster.assignments.lead_vocal || []).includes(currentUser.id) && (
                    <button type="button" onClick={() => onOpenSetlist(roster.date, service.id)} className="min-h-11 ml-1.5 px-3 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800">
                      {language === 'zh' ? '更新这次的歌单' : 'Update this setlist'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {past.length > 0 && <button type="button" onClick={() => setShowPast((prev) => !prev)} aria-expanded={showPast} className="min-h-11 w-full text-left text-sm text-slate-600 dark:text-zinc-400">{language === 'zh' ? (showPast ? '收起历史安排' : '查看历史安排') : (showPast ? 'Hide past duties' : 'Show past duties')}</button>}

        <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onNavigateToRoster}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-800"
          >
            <Calendar size={14} strokeWidth={1.75} />
            <span>{t('viewFullRoster', language)}</span>
            <ChevronRight size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <DailyScriptureCard />
      <AddToHomeCard />
      </div>

      {/* Roster Day Detail Modal */}
      <RosterDetailModal
        isOpen={!!selectedDuty}
        onClose={() => setSelectedDuty(null)}
        roster={selectedDuty?.roster || null}
        service={selectedDuty?.service || null}
      />
    </div>
  );
};
