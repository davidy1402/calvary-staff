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
import { BirthdayCelebration } from './BirthdayCelebration';
import type { ServiceRoster, ServiceDefinition } from '../types';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
  onOpenSetlist: (date: string, serviceId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster, onOpenSetlist }) => {
  const { churchState, currentUser, currentUserId, getUserSeasonAssignments, language, setIsIdentityModalOpen } = useChurch();

  const userAssignments = getUserSeasonAssignments(currentUser?.id);
  const [today] = useState(() => new Date().toLocaleDateString('en-CA'));
  const todayMMDD = today.slice(5); // e.g. "10-04"

  const isCurrentUserBirthday = Boolean(
    currentUser?.birthday &&
      (currentUser.birthday === today || currentUser.birthday.endsWith(todayMMDD))
  );

  const [showBirthdayCelebration, setShowBirthdayCelebration] = useState(() => {
    if (!isCurrentUserBirthday || !currentUser) return false;
    try {
      const key = `calvary_birthday_seen_${currentUser.id}_${today}`;
      return !localStorage.getItem(key);
    } catch {
      return true;
    }
  });

  const handleCloseBirthdayCelebration = () => {
    setShowBirthdayCelebration(false);
    if (currentUser) {
      try {
        localStorage.setItem(`calvary_birthday_seen_${currentUser.id}_${today}`, 'true');
      } catch {}
    }
  };

  // Other peers who celebrate their birthday today
  const peerBirthdayCoworkers = churchState.coworkers.filter((cw) => {
    if (cw.id === currentUserId || !cw.active || !cw.birthday) return false;
    return cw.birthday === today || cw.birthday.endsWith(todayMMDD);
  });

  const displayedAssignments = userAssignments;
  const monthlyAssignments = userAssignments.filter(({ roster }) => roster.date.slice(0, 7) === today.slice(0, 7));

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
  const timeGreeting = isCurrentUserBirthday
    ? (language === 'zh' ? '生日蒙福' : 'Happy Birthday')
    : getTimeGreeting(language);

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
      <header className="app-header-safe bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 px-4 md:px-6 pb-3 sticky top-0 z-30 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ChurchLogo className="w-8 h-8 object-contain shrink-0" />
          <div className="text-left">
            <h1 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
              {language === 'zh' ? '新山加略山社区教会' : 'CCCJB Connect'}
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider leading-none">
              CCCJB Connect
            </p>
          </div>
        </div>
      </header>

      {/* Screen Body Content */}
      <div className="px-4 md:px-6 pt-4 space-y-4 md:space-y-6 animate-slide-up">

      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm text-blue-200 font-medium">{currentUser?.cellGroup || (language === 'zh' ? '新山加略山社区教会' : 'CCCJB Connect')}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">{timeGreeting}，{displayName}</h2>
          <div className="mt-3 text-xs md:text-sm text-blue-100">
            {currentUserId !== 'cw_guest' && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/15 font-semibold">
              {language === 'zh' ? '本月服侍：' : 'This month: '}{monthlyAssignments.length}{language === 'zh' ? ' 堂' : ' services'}
            </span>}
          </div>
        </div>
        <button type="button" onClick={() => setIsIdentityModalOpen(true)} className="press-feedback flex flex-col items-center gap-1.5 shrink-0 rounded-xl p-1 text-blue-100 hover:text-white transition-colors cursor-pointer" aria-label={language === 'zh' ? '切换同工' : 'Switch volunteer'}>
          {currentUser?.avatar ? <img src={currentUser.avatar} alt="" className="w-13 h-13 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/30" /> : <span className="w-13 h-13 md:w-16 md:h-16 rounded-full bg-white/15 flex items-center justify-center text-xl md:text-2xl font-bold border-2 border-white/20">{currentUser?.name?.trim()[0] || '同'}</span>}
          <span className="text-xs md:text-sm font-medium">{language === 'zh' ? (currentUserId === 'cw_guest' ? '我是同工' : '切换同工') : 'Switch'}</span>
        </button>
      </div>

      {/* Birthday Celebration for current user */}
      {showBirthdayCelebration && currentUser && (
        <BirthdayCelebration
          name={displayName}
          onClose={handleCloseBirthdayCelebration}
        />
      )}

      {/* Peer Birthday Notification Banner */}
      {peerBirthdayCoworkers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/40 dark:to-rose-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              🎂
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  {language === 'zh' ? '今日寿星' : 'Birthday Today'}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                  {peerBirthdayCoworkers.map((c) => c.name).join('、')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 leading-snug">
                {language === 'zh'
                  ? '今天过生日！遇见时别忘了向寿星道一句「生日蒙福」🎂'
                  : 'Celebrating birthday today! Wish them a blessed birthday!'}
              </p>
            </div>
          </div>
          {peerBirthdayCoworkers[0]?.phone && (
            <a
              href={`https://wa.me/60${peerBirthdayCoworkers[0].phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                language === 'zh'
                  ? `平安！${peerBirthdayCoworkers[0].name}，祝你生日蒙福！愿耶和华赐福给你，主恩满溢！🎂✨`
                  : `Happy Blessed Birthday ${peerBirthdayCoworkers[0].name}! May God bless you abundantly! 🎂`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              title="发送 WhatsApp 祝福"
            >
              <span>祝贺</span>
            </a>
          )}
        </div>
      )}

      {/* Scripture & Quick Add Grid for iPad landscape */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyScriptureCard />
        <AddToHomeCard />
      </div>

      {/* 我的服侍 Section (Ergonomic Duty Passes) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <HeartHandshake size={18} className="text-blue-700 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{t('myDuties', language)}</h3>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
            {userAssignments.length > 0 ? (language === 'zh' ? `共 ${userAssignments.length} 项排班` : `${userAssignments.length} duties`) : ''}
          </span>
        </div>

        {currentUserId === 'cw_guest' ? (
          <div className="py-7 px-3 text-center space-y-3">
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {language === 'zh' ? '您当前以访客身份浏览全堂排班' : 'Browsing as Guest'}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {language === 'zh'
                ? '可查看全堂服侍人员与歌单。有服侍安排的同工可点击我是同工，选择姓名。'
                : 'Browse all service rosters and worship setlists. Tap "I am volunteer" above if you have duties.'}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onNavigateToRoster}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>{language === 'zh' ? '前往查看总排班表' : 'View Full Roster'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : displayedAssignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-zinc-400 text-sm space-y-1">
            <p className="font-semibold text-slate-700 dark:text-zinc-200">{t('noDutiesThisSeason', language)}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">{t('noDutiesHint', language)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {displayedAssignments.map(({ roster, service, roles }) => {
              const { month, day, weekday } = getDateParts(roster.date);

              return (
                <div key={roster.id} className="py-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDuty({ roster, service })}
                    className="press-feedback w-full text-left py-3 flex items-start gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 rounded-xl px-1.5 transition-colors group"
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
