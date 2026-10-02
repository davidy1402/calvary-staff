import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  X,
  Languages,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { CoworkerManagerModal } from './CoworkerManagerModal';
import { t } from '../utils/i18n';

export const ProfileScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    currentUserId,
    setCurrentUserId,
    language,
    setLanguage,
  } = useChurch();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCoworkersOpen, setIsCoworkersOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const avatarLetter =
    currentUser?.name?.trim()?.[0] || (language === 'zh' ? '同' : 'V');

  return (
    <div className="space-y-4 animate-slide-up pb-6">
      {/* Centered AppBar */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3.5 mb-2 sticky top-0 z-20 shadow-2xs">
        <h1 className="text-base font-bold text-slate-900 text-center">
          {t('settingsTitle', language)}
        </h1>
      </div>

      {/* Volunteer Identity Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xl font-black shrink-0 shadow-2xs">
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                {currentUser?.name || (language === 'zh' ? '加略山同工' : 'Calvary Volunteer')}
              </h2>
              {currentUser?.englishName && (
                <span className="text-xs text-slate-500 font-medium">({currentUser.englishName})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {currentUser?.cellGroup || '青年牧区'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {t('coworker', language)}
              </span>
            </div>
          </div>
        </div>

        {/* Switch Identity Dropdown */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-600">{t('switchCoworkerIdentity', language)}:</span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[190px] truncate"
          >
            {churchState.coworkers.map((cw) => (
              <option key={cw.id} value={cw.id}>
                {cw.name} ({cw.cellGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ministry & Coordination Tools */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {/* WhatsApp Export */}
        <div
          onClick={() => setIsWhatsAppOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {t('shareWhatsAppTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('shareWhatsAppDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 shrink-0" />
        </div>

        {/* Coworker Directory */}
        <div
          onClick={() => setIsCoworkersOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {t('coworkerDirectoryTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('coworkerDirectoryDesc', language)} ({churchState.coworkers.length})
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 shrink-0" />
        </div>

        {/* Service Settings */}
        <div
          onClick={() => setIsServicesOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {t('serviceSettingsTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('serviceSettingsDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Languages size={17} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900">
              {t('language', language)}
            </h3>
            <p className="text-[11px] text-slate-500">
              {t('languageDesc', language)}
            </p>
          </div>
        </div>

        {/* Segmented Control for Language */}
        <div className="bg-slate-100 p-0.5 rounded-xl flex items-center shrink-0 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'zh'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Subtle Warm Footnote */}
      <div className="text-center pt-3 space-y-1">
        <p className="text-xs text-slate-400 font-medium">{t('churchFooterName', language)}</p>
        <p className="text-[10px] text-slate-300">v1.2</p>
      </div>

      {/* WhatsApp Modal */}
      {isWhatsAppOpen && <WhatsAppModal isOpen={true} onClose={() => setIsWhatsAppOpen(false)} />}

      {/* Coworker Modal */}
      {isCoworkersOpen && <CoworkerManagerModal isOpen={true} onClose={() => setIsCoworkersOpen(false)} />}

      {/* Service Settings Modal */}
      {isServicesOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {t('serviceSettingsModalTitle', language)}
              </h2>
              <button
                type="button"
                onClick={() => setIsServicesOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {churchState.services.map((svc) => (
                <div key={svc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{svc.name}</span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {svc.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock size={12} strokeWidth={1.75} />
                    <span>{t('rehearsalTime', language)}: {svc.rehearsalTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={12} strokeWidth={1.75} />
                    <span>{t('venue', language)}: {svc.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
