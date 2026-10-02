import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { AddToHomeCard } from './AddToHomeCard';
import { HeartHandshake, Calendar, ChevronRight, Languages } from 'lucide-react';
import { formatShortDate } from '../utils/dateUtils';
import { t } from '../utils/i18n';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster }) => {
  const { currentUser, getUserSeasonAssignments, language, toggleLanguage } = useChurch();

  const userAssignments = getUserSeasonAssignments(currentUser?.id);

  // Short display name: if 3 Chinese chars, take the given name (e.g. 杨家维 -> 家维)
  const getShortName = (fullName?: string) => {
    if (!fullName) return language === 'zh' ? '同工' : 'Volunteer';
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

  const getWeekdayShort = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split('-');
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const weekdaysZh = ['日', '一', '二', '三', '四', '五', '六'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return language === 'zh' ? weekdaysZh[date.getDay()] : weekdaysEn[date.getDay()];
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Centered AppBar with Language Toggle */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3.5 mb-4 sticky top-0 z-20 shadow-2xs">
        <div className="relative flex items-center justify-center">
          <h1 className="text-base font-bold text-slate-900 text-center">
            {t('home', language)}
          </h1>
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'zh' ? 'Switch to English' : '切换为中文'}
            className="absolute right-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all duration-150 active:scale-90 cursor-pointer"
          >
            <Languages size={13} strokeWidth={2} />
            <span>{language === 'zh' ? 'EN' : '中文'}</span>
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('welcomeBack', language)}，{displayName}！
        </h2>
      </div>

      {/* Add To Home Prompt Card */}
      <AddToHomeCard />

      {/* 我的服事 Section */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HeartHandshake size={20} strokeWidth={2} className="text-blue-900" />
          <h3 className="text-base font-bold text-slate-900">{t('myDuties', language)}</h3>
        </div>

        {userAssignments.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm space-y-1">
            <p className="font-medium">{t('noDutiesThisSeason', language)}</p>
            <p className="text-xs text-slate-400">{t('noDutiesHint', language)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userAssignments.map(({ roster, service, roles }, index) => {
              const dateText = `${formatShortDate(roster.date)} (${getWeekdayShort(roster.date)})`;
              const roleText = roles.join('、');

              return (
                <div
                  key={`${roster.id}_${index}`}
                  className="py-3 flex items-start gap-4 hover:bg-slate-50/60 rounded-lg px-1 transition-colors duration-150"
                >
                  <div className="w-24 shrink-0">
                    <span className="text-sm font-bold text-slate-900 block">{dateText}</span>
                    {roster.specialEvents && roster.specialEvents.length > 0 && (
                      <span className="inline-block text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded mt-0.5 border border-rose-100">
                        {roster.specialEvents[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {service.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">{roleText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onNavigateToRoster}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer"
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
