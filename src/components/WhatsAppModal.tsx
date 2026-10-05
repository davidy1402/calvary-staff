import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  generateWhatsAppRosterText,
  generateWhatsAppSetlistText,
  generateWhatsAppRundownText,
  type WhatsAppTemplateType,
} from '../utils/whatsappFormatter';
import { getUpcomingServiceDate, formatDateLabel } from '../utils/dateUtils';
import { Copy, Check, Send, Users, Music, Clock } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { t } from '../utils/i18n';
import type { ServiceDefinition, ServiceRoster } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceDefinition;
  initialRoster?: ServiceRoster;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  initialService,
  initialRoster,
}) => {
  const { churchState, activeService, language } = useChurch();
  const [copied, setCopied] = useState(false);
  const [templateType, setTemplateType] = useState<WhatsAppTemplateType>('roster');

  // Allow selecting service and date dynamically inside modal
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService?.id || activeService.id
  );

  const targetService = useMemo(() => {
    return (
      churchState.services.find((s) => s.id === selectedServiceId) ||
      initialService ||
      activeService
    );
  }, [churchState.services, selectedServiceId, initialService, activeService]);

  // Compute 4 upcoming date options for this service
  const dateOptions = useMemo(() => {
    return [0, 1, 2, 3].map((offset) => {
      const dateVal = getUpcomingServiceDate(targetService.weekday, offset);
      return {
        value: dateVal,
        label: formatDateLabel(dateVal, language),
      };
    });
  }, [targetService.weekday, language]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (initialRoster?.date) return initialRoster.date;
    return getUpcomingServiceDate(targetService.weekday, 0);
  });

  // Find roster or fallback to skeleton
  const rosterKey = `${selectedDateStr}_${targetService.id}`;
  const targetRoster: ServiceRoster = useMemo(() => {
    return (
      churchState.rosters[rosterKey] || {
        id: rosterKey,
        serviceId: targetService.id,
        date: selectedDateStr,
        assignments: {},
      }
    );
  }, [churchState.rosters, rosterKey, targetService.id, selectedDateStr]);

  const formattedText = useMemo(() => {
    if (templateType === 'setlist') {
      return generateWhatsAppSetlistText(churchState.churchName, targetService, targetRoster);
    }
    if (templateType === 'rundown') {
      return generateWhatsAppRundownText(targetService, targetRoster, churchState.coworkers);
    }
    return generateWhatsAppRosterText(
      churchState.churchName,
      targetService,
      targetRoster,
      churchState.roles,
      churchState.coworkers
    );
  }, [templateType, churchState, targetService, targetRoster]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;

  const templates: { id: WhatsAppTemplateType; label: string; icon: React.ReactNode }[] = [
    { id: 'roster', label: language === 'zh' ? '服侍人员' : 'Roster', icon: <Users size={12} strokeWidth={2} /> },
    { id: 'setlist', label: language === 'zh' ? '赞美歌单' : 'Setlist', icon: <Music size={12} strokeWidth={2} /> },
    { id: 'rundown', label: language === 'zh' ? '崇拜流程' : 'Rundown', icon: <Clock size={12} strokeWidth={2} /> },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="bg-slate-50 dark:bg-black" maxHeight="88vh">
      {/* Header matching CoworkerManagerModal style */}
      <div className="px-5 pt-2 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
              {t('whatsappNotification', language)}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              {targetService.name} ({targetRoster?.date ? formatDateLabel(targetRoster.date, language) : selectedDateStr})
            </p>
          </div>
        </div>
      </div>

      {/* Service & Date Pickers + Template Tabs (No bar background) */}
      <div className="px-5 py-2 space-y-2.5 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              {t('serviceSelector', language)}
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedServiceId(newId);
                const newSvc = churchState.services.find((s) => s.id === newId);
                if (newSvc) {
                  setSelectedDateStr(getUpcomingServiceDate(newSvc.weekday, 0));
                }
              }}
              className="w-full text-xs font-semibold text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {churchState.services.map((svc) => (
                <option key={svc.id} value={svc.id} className="dark:bg-zinc-800 dark:text-zinc-100">
                  {svc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              {t('dateSelector', language)}
            </label>
            <select
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-zinc-800 dark:text-zinc-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template Segmented Tabs */}
        <div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 dark:bg-zinc-800 rounded-xl border border-slate-300/50 dark:border-zinc-700">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateType(tpl.id)}
                className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  templateType === tpl.id
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {tpl.icon}
                <span>{tpl.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Text Preview Box */}
      <div className="px-5 py-2 overflow-y-auto flex-1">
        <div className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 p-4 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-all border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          {formattedText}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 py-3.5 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-2.5 shrink-0 shadow-2xs pb-8 sm:pb-4">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 border border-transparent dark:border-zinc-700'
          }`}
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>{t('copiedAll', language)}</span>
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={1.75} />
              <span>{t('copyAllText', language)}</span>
            </>
          )}
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Send size={14} strokeWidth={1.75} />
          <span>{t('openWhatsApp', language)}</span>
        </a>
      </div>
    </BottomSheet>
  );
};
