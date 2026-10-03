import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { AddToHomeCard } from './AddToHomeCard';
import { HeartHandshake, Calendar, ChevronRight, Clock, MapPin, AlertTriangle, Sun, Moon } from 'lucide-react';
import { t } from '../utils/i18n';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster }) => {
  const { currentUser, getUserSeasonAssignments, language, isDarkMode, toggleDarkMode } = useChurch();

  const userAssignments = getUserSeasonAssignments(currentUser?.id);

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
    <div className="space-y-4 animate-slide-up">
      {/* Centered AppBar with Church Logo & Name */}
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 px-4 py-2.5 mb-4 sticky top-0 z-20 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="CCCJB Logo" className="w-8 h-8 object-contain shrink-0 dark:hidden" />
          <img src="/logo-white.png" alt="CCCJB Logo" className="w-8 h-8 object-contain shrink-0 hidden dark:block" />
          <div className="text-left">
            <h1 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {language === 'zh' ? '新山加略山社区教会' : 'Calvary Community Church'}
            </h1>
            <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 tracking-wider leading-none">
              CCCJB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? '切换为浅色模式' : '切换为深色模式'}
            title={isDarkMode ? '浅色模式' : '深色模式'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          >
            {isDarkMode ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
          </button>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            {t('home', language)}
          </span>
        </div>
      </div>

      {/* Greeting Card with Volunteer Status */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-blue-200 font-medium">
            {currentUser?.cellGroup || (language === 'zh' ? '新山加略山社区教会' : 'Calvary Community Church Johor Bahru')}
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
            {t('welcomeBack', language)}, {displayName}!
          </h2>
          <div className="flex items-center gap-2 mt-3 text-xs text-blue-100">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs font-semibold">
              {language === 'zh' ? '本季服事：' : 'Assigned: '}
              <strong className="text-white ml-1">{userAssignments.length}</strong>
              {language === 'zh' ? ' 堂' : ' services'}
            </span>
          </div>
        </div>

        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-13 h-13 rounded-full object-cover shrink-0 border-2 border-white/30 shadow-md"
          />
        ) : (
          <div className="w-13 h-13 rounded-full bg-white/15 text-white flex items-center justify-center text-xl font-bold shrink-0 border-2 border-white/20 shadow-md">
            {currentUser?.name?.trim()?.[0] || '同'}
          </div>
        )}
      </div>

      {/* Add To Home Prompt Card */}
      <AddToHomeCard />

      {/* 我的服事 Section (Ergonomic Duty Passes) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center">
              <HeartHandshake size={17} strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('myDuties', language)}</h3>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {userAssignments.length > 0 ? (language === 'zh' ? `共 ${userAssignments.length} 项排班` : `${userAssignments.length} duties`) : ''}
          </span>
        </div>

        {userAssignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-200">{t('noDutiesThisSeason', language)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">{t('noDutiesHint', language)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {userAssignments.map(({ roster, service, roles }, index) => {
              const { month, day, weekday } = getDateParts(roster.date);

              return (
                <div
                  key={`${roster.id}_${index}`}
                  className="py-3.5 flex items-start gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl px-1.5 transition-colors duration-150"
                >
                  {/* Calendar Ticket Badge */}
                  <div className="w-14 shrink-0 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700 rounded-xl p-1.5 text-center flex flex-col items-center justify-center shadow-2xs">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">{month}</span>
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">{day}</span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{weekday}</span>
                  </div>

                  {/* Duty Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {service.name}
                      </h4>
                      {roster.specialEvents && roster.specialEvents.length > 0 && (
                        <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-200/60 dark:border-rose-800/60">
                          {roster.specialEvents[0]}
                        </span>
                      )}
                    </div>

                    {/* Assigned Roles Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      {roles.map((rName) => (
                        <span
                          key={rName}
                          className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 border border-blue-200/80 dark:border-blue-800/70 font-extrabold text-xs shadow-2xs"
                        >
                          {rName}
                        </span>
                      ))}

                      {roles.length > 1 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} strokeWidth={2.5} className="text-amber-700 dark:text-amber-400" />
                          <span>同时有 {roles.length} 项服事</span>
                        </span>
                      )}
                    </div>

                    {/* Timing & Venue Metadata */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Clock size={12} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{service.rehearsalTime}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin size={12} strokeWidth={1.75} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{service.venue}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onNavigateToRoster}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Calendar size={14} strokeWidth={1.75} />
            <span>{t('viewFullRoster', language)}</span>
            <ChevronRight size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};
