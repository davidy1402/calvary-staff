import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { AddToHomeCard } from './AddToHomeCard';
import { HeartHandshake, Calendar, ChevronRight, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { t } from '../utils/i18n';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster }) => {
  const { currentUser, getUserSeasonAssignments, language } = useChurch();

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
      {/* Centered AppBar */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3.5 mb-4 sticky top-0 z-20 shadow-2xs">
        <h1 className="text-base font-bold text-slate-900 text-center">
          {t('home', language)}
        </h1>
      </div>

      {/* Greeting Card with Volunteer Status */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-blue-200 font-medium">
            {currentUser?.cellGroup || (language === 'zh' ? '加略山社区教会' : 'Calvary Community Church')}
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
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <HeartHandshake size={17} strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('myDuties', language)}</h3>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {userAssignments.length > 0 ? (language === 'zh' ? `共 ${userAssignments.length} 项排班` : `${userAssignments.length} duties`) : ''}
          </span>
        </div>

        {userAssignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm space-y-1">
            <p className="font-semibold text-slate-700">{t('noDutiesThisSeason', language)}</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{t('noDutiesHint', language)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userAssignments.map(({ roster, service, roles }, index) => {
              const { month, day, weekday } = getDateParts(roster.date);

              return (
                <div
                  key={`${roster.id}_${index}`}
                  className="py-3.5 flex items-start gap-3 hover:bg-slate-50/70 rounded-xl px-1.5 transition-colors duration-150"
                >
                  {/* Calendar Ticket Badge */}
                  <div className="w-14 shrink-0 bg-slate-50 border border-slate-200/90 rounded-xl p-1.5 text-center flex flex-col items-center justify-center shadow-2xs">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{month}</span>
                    <span className="text-xl font-black text-slate-900 leading-tight">{day}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{weekday}</span>
                  </div>

                  {/* Duty Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {service.name}
                      </h4>
                      {roster.specialEvents && roster.specialEvents.length > 0 && (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200/60">
                          {roster.specialEvents[0]}
                        </span>
                      )}
                    </div>

                    {/* Assigned Roles Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      {roles.map((rName) => (
                        <span
                          key={rName}
                          className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/80 font-extrabold text-xs shadow-2xs"
                        >
                          {rName}
                        </span>
                      ))}

                      {roles.length > 1 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} strokeWidth={2.5} className="text-amber-700" />
                          <span>同时有 {roles.length} 项服事</span>
                        </span>
                      )}
                    </div>

                    {/* Timing & Venue Metadata */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock size={12} strokeWidth={2} className="text-blue-600 shrink-0" />
                        <span>{service.rehearsalTime}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin size={12} strokeWidth={1.75} className="text-slate-400 shrink-0" />
                        <span>{service.venue}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3.5 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onNavigateToRoster}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50"
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
