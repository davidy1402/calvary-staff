import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { AddToHomeCard } from './AddToHomeCard';
import { HeartHandshake, Calendar, ChevronRight, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { t } from '../utils/i18n';
import { ChurchLogo } from './ChurchLogo';
import { DailyScriptureCard } from './DailyScriptureCard';
import { getTimeGreeting } from '../utils/greetingUtils';
import { RosterDetailModal } from './RosterDetailModal';
import type { ServiceRoster, ServiceDefinition } from '../types';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster }) => {
  const { currentUser, getUserSeasonAssignments, language } = useChurch();

  const userAssignments = getUserSeasonAssignments(currentUser?.id);

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

      {/* Greeting Card with Volunteer Status */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-blue-200 font-medium">
            {currentUser?.cellGroup || (language === 'zh' ? '新山加略山社区教会' : 'CCCJB Connect')}
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
            {timeGreeting}，{displayName}
          </h2>
          <div className="flex items-center gap-2 mt-3 text-xs text-blue-100">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-white/15 backdrop-blur-xs font-semibold">
              {language === 'zh' ? '本月服事：' : 'This Month: '}
              <strong className="text-white ml-1">{userAssignments.length}</strong>
              {language === 'zh' ? ' 堂' : ' services'}
            </span>
          </div>
        </div>

        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-13 h-13 rounded-full object-cover shrink-0 border-2 border-white/30 shadow-md z-10"
          />
        ) : (
          <div className="w-13 h-13 rounded-full bg-white/15 text-white flex items-center justify-center text-xl font-bold shrink-0 border-2 border-white/20 shadow-md z-10">
            {currentUser?.name?.trim()?.[0] || '同'}
          </div>
        )}
      </div>

      {/* Daily Scripture & Reflection Card */}
      <DailyScriptureCard />

      {/* Add To Home Prompt Card */}
      <AddToHomeCard />

      {/* 我的服事 Section (Ergonomic Duty Passes) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-900 dark:text-blue-400 flex items-center justify-center">
              <HeartHandshake size={17} strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{t('myDuties', language)}</h3>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
            {userAssignments.length > 0 ? (language === 'zh' ? `共 ${userAssignments.length} 项排班` : `${userAssignments.length} duties`) : ''}
          </span>
        </div>

        {userAssignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-zinc-400 text-sm space-y-1">
            <p className="font-semibold text-slate-700 dark:text-zinc-200">{t('noDutiesThisSeason', language)}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">{t('noDutiesHint', language)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {userAssignments.map(({ roster, service, roles }, index) => {
              const { month, day, weekday } = getDateParts(roster.date);

              return (
                <div
                  key={`${roster.id}_${index}`}
                  onClick={() => setSelectedDuty({ roster, service })}
                  className="py-3.5 flex items-start gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 rounded-xl px-1.5 transition-colors duration-150 cursor-pointer active:scale-[0.99] group"
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
                        <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                          {roster.specialEvents[0]}
                        </span>
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

                      {roles.length > 1 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                          <AlertTriangle size={11} strokeWidth={2.5} className="text-amber-600 dark:text-amber-400" />
                          <span>同时有 {roles.length} 项服事</span>
                        </span>
                      )}
                    </div>

                    {/* Timing & Venue Metadata */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300">
                        <Clock size={12} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{service.rehearsalTime}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                        <MapPin size={12} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span>{service.venue}</span>
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={15} strokeWidth={2} className="text-slate-300 dark:text-zinc-600 shrink-0 self-center group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors" />
                </div>
              );
            })}
          </div>
        )}

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
