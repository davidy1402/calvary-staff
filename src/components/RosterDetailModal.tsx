import React from 'react';
import { BottomSheet } from './BottomSheet';
import { ServiceEventBadge } from './ServiceEventBadge';
import { useChurch } from '../context/ChurchContext';
import { formatDateLabel } from '../utils/dateUtils';
import { Clock, MapPin, Music, Play, CalendarPlus, BookOpen, Mic } from 'lucide-react';
import { downloadCalendarEvent } from '../utils/calendarUtils';
import type { ServiceRoster, ServiceDefinition, RoleCategoryId } from '../types';

interface RosterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: ServiceRoster | null;
  service: ServiceDefinition | null;
}

export const RosterDetailModal: React.FC<RosterDetailModalProps> = ({
  isOpen,
  onClose,
  roster,
  service,
}) => {
  const { churchState, currentUser, language } = useChurch();

  if (!isOpen || !roster || !service) return null;

  const coworkerMap = new Map(churchState.coworkers.map((c) => [c.id, c]));

  const categoryGroups: Array<{
    id: RoleCategoryId;
    nameZh: string;
    nameEn: string;
  }> = [
    { id: 'pulpit', nameZh: '讲台与报告', nameEn: 'Pulpit & Service' },
    { id: 'worship', nameZh: '敬拜赞美团', nameEn: 'Worship Team' },
    { id: 'media', nameZh: '影音多媒体', nameEn: 'AV & Media' },
    { id: 'sundayschool', nameZh: '主日学儿童事工', nameEn: 'Sunday School' },
    { id: 'prayer', nameZh: '守望代祷事工', nameEn: 'Prayer & Intercession' },
    { id: 'hospitality', nameZh: '接待与关怀', nameEn: 'Hospitality & Ushers' },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="bg-slate-50 dark:bg-black"
      maxHeight="88vh"
    >
      <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header matching CoworkerManagerModal style */}
          <div className="px-5 pt-2 pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
                    {service.name}
                  </h2>
                  {roster.specialEvents && roster.specialEvents.length > 0 && (
                    <ServiceEventBadge event={roster.specialEvents[0]} />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                  {formatDateLabel(roster.date)} · {service.time}
                </p>
              </div>

              {/* Add to Calendar Button with 1-week and 1-day reminders */}
              <button
                type="button"
                onClick={() => {
                  const myRoles = Object.entries(roster.assignments || {})
                    .filter(([, ids]) => ids.includes(currentUser?.id || ''))
                    .map(([rId]) => churchState.roles.find((r) => r.id === rId)?.name)
                    .filter(Boolean) as string[];

                  const rolesSummary = myRoles.length > 0 ? myRoles.join('、') : service.name;

                  downloadCalendarEvent({
                    title: `${service.name} - ${rolesSummary}`,
                    serviceName: service.name,
                    rolesSummary,
                    dateStr: roster.date,
                    rehearsalTime: service.rehearsalTime,
                    serviceVenue: service.venue,
                    theme: roster.theme,
                    speaker: roster.speaker,
                  });
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer active:scale-95 border border-blue-200/70 dark:border-zinc-700 shadow-2xs"
                title={language === 'zh' ? '添加至手机日历 (含1周与1天前提醒)' : 'Add to Calendar (with 1-week advance reminder)'}
              >
                <CalendarPlus size={13} strokeWidth={2} />
                <span>{language === 'zh' ? '存入日历' : 'Add to Cal'}</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-5 pt-3 pb-8 overflow-y-auto space-y-4 flex-1 overscroll-contain">
            {/* Timing & Venue */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 flex-wrap pb-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                <Clock size={13} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{service.rehearsalTime.replace(/调音|预备/g, '').trim()}</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <MapPin size={13} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                <span>{language === 'zh' ? service.venue.split(' ')[0] : service.venue}</span>
              </span>
            </div>

            {/* Theme / Speaker with icons */}
            {(roster.theme || roster.speaker) && (
              <div className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1.5">
                {roster.theme && (
                  <div className="flex items-center gap-2">
                    <BookOpen size={13} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {roster.theme}
                    </span>
                  </div>
                )}
                {roster.speaker && (
                  <div className="flex items-center gap-2">
                    <Mic size={13} strokeWidth={2} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      {roster.speaker}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Worship Songs */}
            {roster.songs && roster.songs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <Music size={13} strokeWidth={2.2} className="text-blue-600 dark:text-blue-400" />
                  <span>{language === 'zh' ? '敬拜赞美诗歌' : 'Worship Songs'}</span>
                </div>
                <div className="space-y-1">
                  {roster.songs.map((song, idx) => (
                    <div
                      key={song.id || idx}
                      className="py-1.5 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 last:border-b-0 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-slate-400 dark:text-zinc-500 text-[11px] w-4">
                          {idx + 1}.
                        </span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {song.title}
                        </span>
                        {song.key && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                            Key: {song.key}
                          </span>
                        )}
                        {song.category && (
                          <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                            ({song.category})
                          </span>
                        )}
                      </div>
                      <a
                        href={
                          song.youtubeUrl ||
                          `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title={language === 'zh' ? '在 YouTube 试听' : 'Listen on YouTube'}
                        aria-label={language === 'zh' ? '在 YouTube 试听' : 'Listen on YouTube'}
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      >
                        <Play size={14} className="fill-current" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Department Roster Assignments */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                {language === 'zh' ? '当日服事名单' : 'Duty Roster'}
              </h3>
              {categoryGroups
                .filter((cat) => service.categoryIds.includes(cat.id))
                .map((cat) => {
                  const catRoles = churchState.roles.filter((r) => r.category === cat.id);
                  const hasAnyAssigned = catRoles.some(
                    (r) => (roster.assignments[r.id]?.length ?? 0) > 0
                  );
                  if (!hasAnyAssigned) return null;

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="pt-2 pb-1 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {language === 'zh' ? cat.nameZh : cat.nameEn}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {catRoles.map((role) => {
                          const coworkerIds = roster.assignments[role.id] || [];
                          if (coworkerIds.length === 0) return null;
                          const dutyNote = roster.dutyNotes?.[role.id];

                          return (
                            <div
                              key={role.id}
                              className="py-1 flex items-start justify-between gap-2 text-xs"
                            >
                              <span className="text-slate-500 dark:text-zinc-400 font-medium shrink-0 w-24">
                                {role.name}
                              </span>
                              <div className="flex-1 flex flex-wrap items-center gap-1.5 justify-end">
                                {coworkerIds.map((cid) => {
                                  const cw = coworkerMap.get(cid);
                                  if (!cw) return null;
                                  const isMe = currentUser?.id === cw.id;
                                  return (
                                    <span
                                      key={cw.id}
                                      className={`font-bold px-2 py-0.5 rounded-md ${
                                        isMe
                                          ? 'bg-blue-600 text-white shadow-2xs'
                                          : 'text-slate-800 dark:text-zinc-200'
                                      }`}
                                    >
                                      {cw.name}
                                      {isMe && (
                                        <span className="ml-0.5 text-[10px] font-normal opacity-90">
                                          (我)
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                                {dutyNote && (
                                  <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded font-medium">
                                    {dutyNote}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </BottomSheet>
  );
};
