import React from 'react';
import { CalendarDays, Clock, MapPin, Music, Shirt, Sparkles, Wine, X } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { SongPreviewLink } from './SongPreviewLink';
import { formatDateLabel } from '../utils/dateUtils';
import { getSeniorCareDetailRows, isRedundantServiceTheme } from '../utils/seniorCare';
import type { Language } from '../utils/i18n';
import type { ServiceDefinition, ServiceRoster } from '../types';

interface SeniorCareHomeDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roster: ServiceRoster;
  service: ServiceDefinition;
  language: Language;
}

const detailIcons = [CalendarDays, Clock, MapPin];

export const SeniorCareHomeDetailSheet: React.FC<SeniorCareHomeDetailSheetProps> = ({
  isOpen,
  onClose,
  roster,
  service,
  language,
}) => {
  const detailRows = getSeniorCareDetailRows({
    serviceDate: formatDateLabel(roster.date),
    serviceTime: service.time,
    rehearsalTime: service.rehearsalTime,
    venue: service.venue,
    theme: roster.theme && !isRedundantServiceTheme(roster.theme, service.name) ? roster.theme : undefined,
    speaker: roster.speaker,
  }, language);
  const specialEvent = roster.specialEvents?.[0];
  const SpecialEventIcon = specialEvent?.includes('服装') ? Shirt : specialEvent?.includes('圣餐') ? Wine : Sparkles;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="senior-care-detail-title"
      className="bg-slate-50 dark:bg-black"
      maxHeight="94dvh"
    >
      <div className="flex max-h-[91dvh] min-h-0 flex-col">
        <header className="shrink-0 border-b-2 border-slate-200 px-5 pb-5 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="senior-care-detail-title" className="break-words text-2xl font-extrabold leading-8 text-slate-950 dark:text-white">
                {service.name}
              </h2>
              {specialEvent && (
                <div className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-purple-50 px-3 text-base font-extrabold text-purple-800 dark:bg-purple-950/40 dark:text-purple-200">
                  <SpecialEventIcon size={19} strokeWidth={2.25} aria-hidden="true" />
                  <span>{specialEvent.replace(/^服装要求[:：\s]*/, '')}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-3 text-base font-extrabold text-slate-700 transition-colors hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <X size={21} strokeWidth={2.25} aria-hidden="true" />
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <dl className="divide-y-2 divide-slate-200 rounded-2xl border-2 border-slate-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {detailRows.map(({ label, value }, index) => {
              const iconIndex = index > 1 ? index - 1 : index;
              const Icon = detailIcons[iconIndex];
              return (
                <div key={label} className="flex items-start gap-3 py-4 first:pt-4">
                  {index === 0 ? <CalendarDays size={23} strokeWidth={2.2} className="mt-0.5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" /> : index === 1 ? <Clock size={23} strokeWidth={2.2} className="mt-0.5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" /> : Icon ? <Icon size={23} strokeWidth={2.2} className="mt-0.5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" /> : <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-700 dark:bg-blue-300" aria-hidden="true" />}
                  <div className="min-w-0">
                    <dt className="text-base font-extrabold text-blue-900 dark:text-blue-300">{label}</dt>
                    <dd className={`mt-1 font-bold text-slate-950 dark:text-white ${index === 0 ? 'whitespace-nowrap text-base leading-7 sm:text-lg' : 'break-words text-xl leading-8'}`}>{value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>

          {roster.songs && roster.songs.length > 0 && (
            <section className="mt-6" aria-labelledby="senior-care-song-list-title">
              <div className="flex items-center gap-2 text-xl font-extrabold text-slate-950 dark:text-white">
                <Music size={24} strokeWidth={2.25} className="text-blue-700 dark:text-blue-300" aria-hidden="true" />
                <h3 id="senior-care-song-list-title">{language === 'zh' ? '敬拜赞美诗歌' : 'Worship songs'}</h3>
              </div>
              <ol className="mt-3 divide-y-2 divide-slate-200 rounded-2xl border-2 border-slate-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {roster.songs.map((song, index) => (
                  <li key={song.id || `${song.title}-${index}`} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 py-4">
                    <span className="pt-0.5 text-lg font-extrabold text-blue-800 dark:text-blue-300">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="break-words text-xl font-extrabold leading-8 text-slate-950 dark:text-white">{song.title}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-semibold leading-6 text-slate-700 dark:text-zinc-300">
                          {song.key && <span>{language === 'zh' ? `Key: ${song.key}` : `Key: ${song.key}`}</span>}
                          {song.category && <span>{song.category}</span>}
                        </div>
                        <SongPreviewLink title={song.title} youtubeUrl={song.youtubeUrl} language={language} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
