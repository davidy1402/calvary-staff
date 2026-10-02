import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useChurch } from '../context/ChurchContext';
import { generateWhatsAppRosterText } from '../utils/whatsappFormatter';
import { getUpcomingServiceDate, formatDateLabel } from '../utils/dateUtils';
import { ChevronLeft, Copy, Check, Send } from 'lucide-react';
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
        label: `${dateVal} (${formatDateLabel(dateVal).split('（')[1]?.replace('）', '') || ''})`,
      };
    });
  }, [targetService.weekday]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (initialRoster?.date) return initialRoster.date;
    return getUpcomingServiceDate(targetService.weekday, 0);
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isOpen) return null;

  // Find roster or fallback to skeleton
  const rosterKey = `${selectedDateStr}_${targetService.id}`;
  const targetRoster: ServiceRoster = churchState.rosters[rosterKey] || {
    id: rosterKey,
    serviceId: targetService.id,
    date: selectedDateStr,
    assignments: {},
  };

  const formattedText = generateWhatsAppRosterText(
    churchState.churchName,
    targetService,
    targetRoster,
    churchState.roles,
    churchState.coworkers
  );

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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg mx-auto rounded-t-[28px] rounded-b-none shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Native iOS Grab Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center bg-white shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* iOS Top Navigation Bar (Only ONE close button: < 返回) */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 active:opacity-60 -ml-1 py-1 px-2 font-medium text-sm rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
            <span>{t('back', language)}</span>
          </button>

          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {t('whatsappNotification', language)}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              {targetService.name}
            </p>
          </div>

          <div className="w-12" />
        </div>

        {/* Service & Date Pickers */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/70 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {churchState.services.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {t('dateSelector', language)}
              </label>
              <select
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {dateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Text Preview Box */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-all shadow-inner border border-slate-800">
            {formattedText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-2.5 shrink-0 shadow-2xs pb-8 sm:pb-4">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
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
      </div>
    </div>,
    document.body
  );
};
