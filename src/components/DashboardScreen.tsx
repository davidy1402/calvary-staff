import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { AddToHomeCard } from './AddToHomeCard';
import { HeartHandshake, Calendar, ChevronRight } from 'lucide-react';
import { formatShortDate } from '../utils/dateUtils';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster }) => {
  const { currentUser, getUserSeasonAssignments } = useChurch();

  const userAssignments = getUserSeasonAssignments(currentUser?.id);

  // Short display name: if 3 Chinese chars, take the given name (e.g. 杨家维 -> 家维)
  const getShortName = (fullName?: string) => {
    if (!fullName) return '同工';
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
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[date.getDay()];
  };

  return (
    <div className="space-y-4">
      {/* Centered AppBar */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3.5 mb-4 sticky top-0 z-20">
        <h1 className="text-base font-bold text-slate-900 text-center">首頁</h1>
      </div>

      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          歡迎回來，{displayName}！
        </h2>
      </div>

      {/* Add To Home Prompt Card */}
      <AddToHomeCard />

      {/* 我的服事 Section */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HeartHandshake size={20} strokeWidth={2} className="text-blue-900" />
          <h3 className="text-base font-bold text-slate-900">我的服事</h3>
        </div>

        {userAssignments.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            <p>本季尚无排到服事</p>
            <p className="text-xs text-slate-400 mt-1">若有变动可联系干事或于服事表查看各周安排</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userAssignments.map(({ roster, service, roles }, index) => {
              const dateText = `${formatShortDate(roster.date)} (${getWeekdayShort(roster.date)})`;
              const roleText = roles.join('、');

              return (
                <div key={`${roster.id}_${index}`} className="py-3 flex items-start gap-4">
                  <div className="w-24 shrink-0">
                    <span className="text-sm font-bold text-slate-900 block">{dateText}</span>
                    {roster.specialEvents && roster.specialEvents.length > 0 && (
                      <span className="inline-block text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded mt-0.5">
                        {roster.specialEvents[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {service.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{roleText}</p>
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
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <Calendar size={14} strokeWidth={1.75} />
            <span>查看完整服事表</span>
            <ChevronRight size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};
