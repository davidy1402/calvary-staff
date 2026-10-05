import React, { useMemo, useState } from 'react';
import { CalendarDays, Music, Users } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { useChurch } from '../context/ChurchContext';
import type { ServiceRoster } from '../types';
import { canShowSeniorCareRole, isRedundantDutyNote } from '../utils/seniorCare';
import { SongPreviewLink } from './SongPreviewLink';

const getTodayDateStr = () => new Date().toLocaleDateString('en-CA');

export const SeniorCareRosterScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    activeService,
    activeServiceId,
    setActiveServiceId,
    getRostersForService,
    language,
  } = useChurch();
  const [view, setView] = useState<'mine' | 'all'>('mine');
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const selectedViewButton = 'bg-blue-800 text-white';
  const unselectedViewButton = 'border-2 border-slate-300 bg-white text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';
  const today = getTodayDateStr();
  const coworkerMap = useMemo(
    () => new Map(churchState.coworkers.map((coworker) => [coworker.id, coworker])),
    [churchState.coworkers],
  );

  const rosters = getRostersForService(activeServiceId);
  const upcoming = rosters.filter((roster) => roster.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = rosters.filter((roster) => roster.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const visibleRosters = [...(showAllUpcoming ? upcoming : upcoming.slice(0, 2)), ...(showPast ? past : [])];

  const formatDate = (date: string) => {
    const localDate = new Date(`${date}T12:00:00`);
    return language === 'zh'
      ? `${localDate.getFullYear()}年${localDate.getMonth() + 1}月${localDate.getDate()}日（星期${['日', '一', '二', '三', '四', '五', '六'][localDate.getDay()]}）`
      : localDate.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const rosterRoles = (roster: ServiceRoster) => churchState.roles
    .filter((role) => activeService.categoryIds.includes(role.category))
    .map((role) => ({
      role,
      coworkerIds: roster.assignments[role.id] ?? [],
      note: roster.dutyNotes?.[role.id],
    }))
    .filter(({ coworkerIds }) => canShowSeniorCareRole({ view, currentUserId: currentUser?.id, coworkerIds }));

  return (
    <div className="min-h-full pb-6">
      <AppHeader title={language === 'zh' ? '侍奉表' : 'Serving Schedule'} seniorCare />

      <main className="px-5 pt-5 space-y-6 senior-care-content">
        <section aria-labelledby="senior-service-choice" className="space-y-2">
          <label id="senior-service-choice" htmlFor="senior-service-select" className="block text-lg font-bold text-slate-900 dark:text-zinc-100">
            {language === 'zh' ? '选择聚会' : 'Choose a service'}
          </label>
          <select
            id="senior-service-select"
            value={activeServiceId}
            onChange={(event) => {
              setActiveServiceId(event.target.value);
              setShowAllUpcoming(false);
              setShowPast(false);
            }}
            className="min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg font-bold text-slate-900 shadow-xs focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950"
          >
            {churchState.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
        </section>

        <section aria-label={language === 'zh' ? '聚会资料' : 'Service details'} className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950 dark:border-blue-900 dark:bg-zinc-900 dark:text-white">
          <h2 className="text-xl font-extrabold">{activeService.name}</h2>
          <dl className="mt-4 space-y-3 text-lg leading-7">
            <div><dt className="font-semibold text-blue-900 dark:text-blue-300">{language === 'zh' ? '集合时间' : 'Arrival time'}</dt><dd>{activeService.rehearsalTime}</dd></div>
            <div><dt className="font-semibold text-blue-900 dark:text-blue-300">{language === 'zh' ? '聚会时间' : 'Service time'}</dt><dd>{activeService.time}</dd></div>
            <div><dt className="font-semibold text-blue-900 dark:text-blue-300">{language === 'zh' ? '地点' : 'Venue'}</dt><dd>{activeService.venue}</dd></div>
          </dl>
        </section>

        <div className="grid grid-cols-2 gap-3" role="group" aria-label={language === 'zh' ? '侍奉表显示方式' : 'Schedule display'}>
          <button type="button" aria-pressed={view === 'mine'} onClick={() => setView('mine')} className={`min-h-14 rounded-2xl px-3 text-lg font-extrabold transition-colors ${view === 'mine' ? selectedViewButton : unselectedViewButton}`}>
            {language === 'zh' ? '我的服侍' : 'My duties'}
          </button>
          <button type="button" aria-pressed={view === 'all'} onClick={() => setView('all')} className={`min-h-14 rounded-2xl px-3 text-lg font-extrabold transition-colors ${view === 'all' ? selectedViewButton : unselectedViewButton}`}>
            {language === 'zh' ? '全部安排' : 'Full schedule'}
          </button>
        </div>

        <section aria-labelledby="senior-schedule-title">
          <div className="flex items-center gap-3">
            <CalendarDays size={26} className="text-blue-800 dark:text-blue-300" aria-hidden="true" />
            <h2 id="senior-schedule-title" className="text-2xl font-extrabold text-slate-950 dark:text-white">
              {language === 'zh' ? '接下来的安排' : 'Upcoming services'}
            </h2>
          </div>

          <div className="mt-4 space-y-5">
            {visibleRosters.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-lg leading-7 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                {language === 'zh' ? '目前没有可显示的侍奉安排。' : 'There are no serving arrangements to show.'}
              </p>
            ) : visibleRosters.map((roster) => {
              const roles = rosterRoles(roster);
              return (
                <article key={roster.id} className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xl font-extrabold leading-8 text-slate-950 dark:text-white">{formatDate(roster.date)}</p>
                  {roster.theme && <p className="mt-2 text-lg leading-7 text-slate-700 dark:text-zinc-200">{language === 'zh' ? '主题：' : 'Theme: '}{roster.theme}</p>}
                  {roles.length === 0 ? (
                    <p className="mt-4 text-lg leading-7 text-slate-700 dark:text-zinc-300">
                      {view === 'mine' ? (language === 'zh' ? '这一天没有您的服侍安排。' : 'You are not scheduled for this date.') : (language === 'zh' ? '暂未安排服侍人员。' : 'No volunteers assigned yet.')}
                    </p>
                  ) : (
                    <dl className="mt-5 divide-y divide-slate-200 dark:divide-zinc-800">
                      {roles.map(({ role, coworkerIds, note }) => {
                        const assignedNames = coworkerIds
                          .map((id) => coworkerMap.get(id)?.name)
                          .filter((name): name is string => Boolean(name));
                        const names = assignedNames.join(language === 'zh' ? '、' : ', ');
                        const displayNote = note && !isRedundantDutyNote(note, assignedNames) ? note : null;
                        return (
                          <div key={role.id} className="py-4 first:pt-0">
                            <dt className="text-lg font-extrabold text-blue-900 dark:text-blue-300">{role.name}</dt>
                            <dd className="mt-1 text-lg leading-7 font-semibold text-slate-950 dark:text-white">{names || (language === 'zh' ? '尚未安排' : 'Not assigned')}</dd>
                            {displayNote && <dd className="mt-2 text-base leading-7 text-slate-700 dark:text-zinc-200"><span className="font-bold">{language === 'zh' ? '备注：' : 'Note: '}</span>{displayNote}</dd>}
                          </div>
                        );
                      })}
                    </dl>
                  )}
                  {activeService.categoryIds.includes('worship') && roster.songs && roster.songs.length > 0 && (
                    <section className="mt-5 border-t-2 border-slate-200 pt-4 dark:border-zinc-800" aria-label={language === 'zh' ? '敬拜歌单' : 'Worship songs'}>
                      <div className="flex items-center gap-2 text-lg font-extrabold text-slate-950 dark:text-white">
                        <Music size={21} className="text-blue-800 dark:text-blue-300" aria-hidden="true" />
                        {language === 'zh' ? '敬拜歌单' : 'Worship songs'}
                      </div>
                      <ol className="mt-3 divide-y divide-slate-200 dark:divide-zinc-800">
                        {roster.songs.map((song, index) => (
                          <li key={song.id || `${song.title}-${index}`} className="flex items-center gap-3 py-3 first:pt-0">
                            <span className="w-6 shrink-0 text-base font-bold text-blue-800 dark:text-blue-300">{index + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-lg font-bold leading-7 text-slate-950 dark:text-white">{song.title}</p>
                              {song.key && <p className="mt-0.5 text-base text-slate-700 dark:text-zinc-300">{language === 'zh' ? `Key: ${song.key}` : `Key: ${song.key}`}</p>}
                            </div>
                            <SongPreviewLink title={song.title} youtubeUrl={song.youtubeUrl} language={language} />
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                </article>
              );
            })}
          </div>

          {upcoming.length > 2 && !showAllUpcoming && <button type="button" onClick={() => setShowAllUpcoming(true)} className="mt-4 min-h-14 w-full rounded-2xl border-2 border-blue-800 bg-white px-4 text-lg font-extrabold text-blue-800 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:bg-zinc-900 dark:text-blue-300 dark:hover:bg-zinc-800">
            {language === 'zh' ? `查看其余 ${upcoming.length - 2} 个日期` : `Show ${upcoming.length - 2} more dates`}
          </button>}
          {past.length > 0 && <button type="button" onClick={() => setShowPast((current) => !current)} className="mt-3 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg font-extrabold text-slate-800 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
            {showPast ? (language === 'zh' ? '收起历史安排' : 'Hide past services') : (language === 'zh' ? `查看 ${past.length} 个历史安排` : `Show ${past.length} past services`)}
          </button>}
        </section>

        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-4 py-3 text-base leading-6 text-slate-700 dark:bg-zinc-900 dark:text-zinc-200">
          <Users size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          {language === 'zh' ? '长者关怀模式专注清楚阅读；如需修改排班，请先在设置中关闭此模式。' : 'Senior Care Mode is designed for clear reading. Turn it off in Settings to edit the roster.'}
        </p>
      </main>
    </div>
  );
};
