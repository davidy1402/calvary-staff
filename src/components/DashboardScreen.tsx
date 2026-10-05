import React, { useState } from 'react';
import { ServiceEventBadge } from './ServiceEventBadge';
import { useChurch } from '../context/ChurchContext';
import { AddToHomeCard } from './AddToHomeCard';
import { HeartHandshake, Calendar, ChevronRight, Clock, MapPin, CircleHelp } from 'lucide-react';
import { t } from '../utils/i18n';
import { AppHeader } from './AppHeader';
import { DailyScriptureCard } from './DailyScriptureCard';
import { getTimeGreeting } from '../utils/greetingUtils';
import { RosterDetailModal } from './RosterDetailModal';
import { BirthdayCelebration } from './BirthdayCelebration';
import { UserGuideSheet } from './UserGuideSheet';
import { getClosestDatedItems } from '../utils/closestAssignments';
import { getSeniorCareScheduleRows, isRedundantDutyNote } from '../utils/seniorCare';
import type { ServiceRoster, ServiceDefinition } from '../types';

interface DashboardScreenProps {
  onNavigateToRoster: () => void;
  onOpenSetlist: (date: string, serviceId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToRoster, onOpenSetlist }) => {
  const { churchState, currentUser, currentUserId, getUserSeasonAssignments, language, setIsIdentityModalOpen, isElderMode } = useChurch();

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
  const elderAssignments = getClosestDatedItems(userAssignments, today);
  const assignmentsToDisplay = isElderMode ? elderAssignments : displayedAssignments;

  const [selectedDuty, setSelectedDuty] = useState<{
    roster: ServiceRoster;
    service: ServiceDefinition;
  } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
      <AppHeader title={language === 'zh' ? '首页' : 'Home'} seniorCare={isElderMode} />

      {/* Screen Body Content */}
      <div className={`${isElderMode ? 'px-5 pt-5 space-y-6' : 'px-4 md:px-6 pt-4 space-y-4 md:space-y-6'} animate-slide-up`}>

      {/* Hero Welcome Card */}
      <div className={`${isElderMode ? 'bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 p-6' : 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 md:p-6'} rounded-2xl md:rounded-3xl shadow-xs flex items-center justify-between gap-4`}>
        <div className="min-w-0 flex-1">
          <p className={`${isElderMode ? 'text-sm text-slate-600 dark:text-zinc-300' : 'text-xs md:text-sm text-blue-200'} font-medium`}>{currentUser?.cellGroup || (language === 'zh' ? '新山加略山社区教会' : 'CCCJB Connect')}</p>
          <h2 className={`${isElderMode ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'} font-extrabold tracking-tight mt-1`}>{timeGreeting}，{displayName}</h2>
          {!isElderMode && <div className="mt-3 text-xs md:text-sm text-blue-100">
            {currentUserId !== 'cw_guest' && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/15 font-semibold">
              {language === 'zh' ? '本月服侍：' : 'This month: '}{monthlyAssignments.length}{language === 'zh' ? ' 堂' : ' services'}
            </span>}
          </div>}
        </div>
        <button type="button" onClick={() => setIsIdentityModalOpen(true)} className={`press-feedback flex flex-col items-center gap-1.5 shrink-0 rounded-xl p-1 transition-colors cursor-pointer ${isElderMode ? 'min-h-14 text-base font-bold text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-zinc-800' : 'text-blue-100 hover:text-white'}`} aria-label={language === 'zh' ? '切换服侍人员' : 'Switch volunteer'}>
          {currentUser?.avatar ? <img src={currentUser.avatar} alt="" className={`${isElderMode ? 'w-16 h-16' : 'w-13 h-13 md:w-16 md:h-16'} rounded-full object-cover border-2 border-white/30`} /> : <span className={`${isElderMode ? 'w-16 h-16 text-2xl bg-blue-100 dark:bg-zinc-800' : 'w-13 h-13 md:w-16 md:h-16 bg-white/15 text-xl md:text-2xl'} rounded-full flex items-center justify-center font-bold border-2 border-white/20`}>{currentUser?.name?.trim()[0] || '同'}</span>}
          {/* <span className={`${isElderMode ? 'text-base' : 'text-xs md:text-sm'} font-medium`}>{language === 'zh' ? (currentUserId === 'cw_guest' ? '我是同工' : '切换服侍人员') : 'Switch'}</span> */}
        </button>
      </div>

      {/* Birthday Celebration for current user */}
      {!isElderMode && showBirthdayCelebration && currentUser && (
        <BirthdayCelebration
          name={displayName}
          onClose={handleCloseBirthdayCelebration}
        />
      )}

      {/* Peer Birthday Notification Banner */}
      {!isElderMode && peerBirthdayCoworkers.length > 0 && (
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
      {!isElderMode && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyScriptureCard />
        <AddToHomeCard />
      </div>}

      {/* 我的服侍 Section (Ergonomic Duty Passes) */}
      <div className={`bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl ${isElderMode ? 'p-5 md:p-7' : 'p-4 md:p-6'} border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200`}>
        <div className={`flex items-center justify-between ${isElderMode ? 'pb-4' : 'pb-3'} border-b border-slate-100 dark:border-zinc-800`}>
          <div className="flex items-center gap-2">
            <HeartHandshake size={isElderMode ? 28 : 18} className="text-blue-700 dark:text-blue-400" />
            <h3 className={`${isElderMode ? 'text-2xl md:text-3xl' : 'text-base'} font-bold text-slate-900 dark:text-zinc-100`}>{t('myDuties', language)}</h3>
          </div>
          {isElderMode ? (
            <button type="button" onClick={() => setIsGuideOpen(true)} className="min-h-12 px-3 text-base font-bold text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2 transition-colors">
              <CircleHelp size={22} strokeWidth={2} aria-hidden="true" />
              <span>{t('userGuide', language)}</span>
            </button>
          ) : <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
              {userAssignments.length > 0 ? (language === 'zh' ? `共 ${userAssignments.length} 项排班` : `${userAssignments.length} duties`) : ''}
            </span>}
        </div>

        {currentUserId === 'cw_guest' ? (
          <div className="py-7 px-3 text-center space-y-3">
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {language === 'zh' ? '您当前以访客身份浏览全堂侍奉表' : 'Browsing as Guest'}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {language === 'zh'
                ? '可查看全堂服侍人员与歌单。有服侍安排的成员可点击上方切换姓名。'
                : 'Browse all service rosters and worship setlists. Tap "Switch" above to select your name.'}
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onNavigateToRoster}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>{language === 'zh' ? '前往查看总侍奉表' : 'View Full Roster'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : assignmentsToDisplay.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-zinc-400 text-sm space-y-1">
            <p className="font-semibold text-slate-700 dark:text-zinc-200">{t('noDutiesThisSeason', language)}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">{t('noDutiesHint', language)}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {assignmentsToDisplay.map(({ roster, service, roles }) => {
              const { month, day, weekday } = getDateParts(roster.date);
              const notes = Object.entries(roster.assignments)
                .filter(([, ids]) => currentUser && ids.includes(currentUser.id))
                .map(([roleId]) => roster.dutyNotes?.[roleId])
                .filter((note): note is string => Boolean(note))
                .filter((note) => !isRedundantDutyNote(note, currentUser?.name ? [currentUser.name] : []));

              if (isElderMode) {
                const scheduleRows = getSeniorCareScheduleRows({
                  roles,
                  rehearsalTime: service.rehearsalTime,
                  serviceTime: service.time,
                  venue: service.venue,
                  notes,
                }, language);

                return (
                  <article key={roster.id} className="py-4 first:pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDuty({ roster, service })}
                      className="w-full min-h-14 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left shadow-xs transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500 dark:hover:bg-zinc-800"
                    >
                      <p className="text-xl font-extrabold text-blue-900 dark:text-blue-300">{month}{day}日 （{weekday}）</p>
                      <h4 className="mt-1 text-2xl font-extrabold leading-8 text-slate-950 dark:text-white">{service.name}</h4>
                      <dl className="mt-5 divide-y divide-slate-200 dark:divide-zinc-800">
                        {scheduleRows.map((row) => (
                          <div key={row.label} className="py-3 first:pt-0">
                            <dt className="text-base font-bold text-blue-900 dark:text-blue-300">{row.label}</dt>
                            <dd className="mt-1 whitespace-pre-wrap break-words text-lg font-semibold leading-7 text-slate-900 dark:text-zinc-100">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <span className="mt-4 inline-flex items-center gap-2 text-lg font-extrabold text-blue-800 dark:text-blue-300">
                        {language === 'zh' ? '查看完整资料' : 'View full details'} <ChevronRight size={22} strokeWidth={2.25} aria-hidden="true" />
                      </span>
                    </button>
                    {roster.date >= today && currentUser && (roster.assignments.lead_vocal || []).includes(currentUser.id) && (
                      <button type="button" onClick={() => onOpenSetlist(roster.date, service.id)} className="mt-3 min-h-14 w-full rounded-2xl border-2 border-blue-800 bg-white px-4 text-lg font-extrabold text-blue-800 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:bg-zinc-900 dark:text-blue-300 dark:hover:bg-zinc-800">
                        {language === 'zh' ? '更新这次的歌单' : 'Update this setlist'}
                      </button>
                    )}
                  </article>
                );
              }

              return (
                <div key={roster.id} className={isElderMode ? 'py-3' : 'py-2'}>
                  <button
                    type="button"
                    onClick={() => setSelectedDuty({ roster, service })}
                    className={`press-feedback w-full text-left ${isElderMode ? 'py-4 px-2 gap-4' : 'py-3 px-1.5 gap-3'} flex items-start hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 rounded-xl transition-colors group`}
                  >
                  {/* Calendar Ticket Badge */}
                  <div className={`${isElderMode ? 'w-16 min-h-22 p-2' : 'w-13 p-1.5'} shrink-0 bg-slate-100/80 dark:bg-zinc-800/70 rounded-xl text-center flex flex-col items-center justify-center`}>
                    <span className={`${isElderMode ? 'text-xs' : 'text-[10px]'} font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider`}>{month}</span>
                    <span className={`${isElderMode ? 'text-3xl' : 'text-xl'} font-black text-slate-900 dark:text-zinc-100 leading-tight`}>{day}</span>
                    <span className={`${isElderMode ? 'text-xs' : 'text-[10px]'} font-semibold text-slate-500 dark:text-zinc-400`}>{weekday}</span>
                  </div>

                  {/* Duty Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`${isElderMode ? 'text-lg md:text-xl' : 'text-sm'} font-bold text-slate-900 dark:text-zinc-100 leading-snug`}>
                        {service.name}
                      </h4>
                      {!isElderMode && roster.specialEvents && roster.specialEvents.length > 0 && (
                    <ServiceEventBadge event={roster.specialEvents[0]} />
                  )}
                    </div>

                    {/* Assigned Roles Pills */}
                    {isElderMode ? (
                      <p className="mt-2 text-base leading-6 font-semibold text-blue-800 dark:text-blue-300">
                        {language === 'zh' ? '岗位：' : 'Role: '}{roles.join(language === 'zh' ? '、' : ', ')}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      {roles.map((rName) => (
                        <span
                          key={rName}
                          className="px-2 py-0.5 text-xs rounded-md bg-blue-50 dark:bg-zinc-800 text-blue-800 dark:text-blue-300 font-bold"
                        >
                          {rName}
                        </span>
                      ))}
                      </div>
                    )}

                    {notes.map((note, noteIndex) => (
                      <p key={noteIndex} className={`mt-2 ${isElderMode ? 'text-base' : 'text-sm'} leading-relaxed whitespace-pre-wrap break-words text-slate-600 dark:text-zinc-400`}>{note}</p>
                    ))}

                    {/* Timing & Venue Metadata */}
                    <div className={`flex items-center gap-3 ${isElderMode ? 'text-base mt-3' : 'text-sm mt-2'} text-slate-600 dark:text-zinc-400 flex-wrap`}>
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-zinc-300">
                        <Clock size={isElderMode ? 17 : 12} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{service.rehearsalTime}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                        <MapPin size={isElderMode ? 17 : 12} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span>{language === 'zh' ? service.venue.split(' ')[0] : service.venue}</span>
                      </span>
                    </div>
                    <p className={`mt-1 ${isElderMode ? 'text-base' : 'text-sm'} text-slate-600 dark:text-zinc-400`}>{language === 'zh' ? '聚会时间 ' : 'Service time '}{service.time}</p>
                  </div>

                  {!isElderMode && <ChevronRight size={16} strokeWidth={2} className="text-slate-300 dark:text-zinc-600 shrink-0 self-center group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors" />}
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


        <div className={`pt-3.5 border-t border-slate-100 dark:border-zinc-800 ${isElderMode ? '' : 'flex justify-end'}`}>
          <button
            type="button"
            onClick={onNavigateToRoster}
            className={isElderMode ? 'min-h-14 w-full rounded-2xl bg-blue-800 px-4 text-lg font-extrabold text-white transition-colors hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center gap-2' : 'text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-all duration-150 active:scale-95 cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-800'}
          >
            <Calendar size={isElderMode ? 22 : 14} strokeWidth={isElderMode ? 2.25 : 1.75} />
            <span>{t('viewFullRoster', language)}</span>
            <ChevronRight size={isElderMode ? 22 : 14} strokeWidth={isElderMode ? 2.25 : 1.75} />
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
      <UserGuideSheet isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} language={language} seniorCare={isElderMode} />
    </div>
  );
};
