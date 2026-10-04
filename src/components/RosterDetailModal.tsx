import React, { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { useChurch } from '../context/ChurchContext';
import { formatDateLabel } from '../utils/dateUtils';
import { Clock, MapPin, Music, ExternalLink, MessageSquare } from 'lucide-react';
import type { ServiceRoster, ServiceDefinition, RoleCategoryId } from '../types';
import { WhatsAppModal } from './WhatsAppModal';

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
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

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
    <>
      <BottomSheet
        isOpen={isOpen && !isWhatsAppOpen}
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
                    <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                      {roster.specialEvents[0]}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                  {formatDateLabel(roster.date)} · {service.time}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-5 py-3 overflow-y-auto space-y-4 flex-1 overscroll-contain">
            {/* Timing & Venue */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 flex-wrap pb-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                <Clock size={13} strokeWidth={2} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{service.rehearsalTime}</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <MapPin size={13} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                <span>{service.venue}</span>
              </span>
            </div>

            {/* Theme / Speaker if any */}
            {(roster.theme || roster.speaker) && (
              <div className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-1">
                {roster.theme && (
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-400 dark:text-zinc-500 shrink-0">
                      {language === 'zh' ? '讲道主题:' : 'Theme:'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {roster.theme}
                    </span>
                  </div>
                )}
                {roster.speaker && (
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-400 dark:text-zinc-500 shrink-0">
                      {language === 'zh' ? '当天讲员:' : 'Speaker:'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
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
                      {song.youtubeUrl && (
                        <a
                          href={song.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 flex items-center gap-0.5"
                        >
                          <span>{language === 'zh' ? '试听' : 'Listen'}</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
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

          {/* Footer Actions */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 shrink-0 flex items-center justify-between gap-2 pb-8 sm:pb-4 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsWhatsAppOpen(true)}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              <MessageSquare size={14} strokeWidth={2} />
              <span>{language === 'zh' ? '分享至 WhatsApp' : 'Share WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors cursor-pointer active:scale-95"
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* WhatsApp Modal for this specific date & service */}
      {isWhatsAppOpen && (
        <WhatsAppModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          initialService={service}
          initialRoster={roster}
        />
      )}
    </>
  );
};
