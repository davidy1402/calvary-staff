import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  Download,
  Upload,
  RotateCcw,
  ChevronRight,
  Clock,
  MapPin,
  X,
  CheckCircle2,
  Languages,
  ShieldCheck,
  HardDrive,
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
    exportBackup,
    importBackup,
    resetToDefault,
    language,
    setLanguage,
  } = useChurch();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCoworkersOpen, setIsCoworkersOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackup(text);
      if (success) {
        setBackupNotice(t('backupNoticeSuccess', language));
      } else {
        alert(t('backupNoticeFail', language));
      }
      setTimeout(() => setBackupNotice(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const avatarLetter =
    currentUser?.name?.trim()?.[0] || (language === 'zh' ? '同' : 'V');

  return (
    <div className="space-y-4 animate-slide-up pb-4">
      {/* Centered AppBar (Clean, uncluttered) */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3.5 mb-2 sticky top-0 z-20 shadow-2xs">
        <h1 className="text-base font-bold text-slate-900 text-center">
          {t('settingsTitle', language)}
        </h1>
      </div>

      {/* SECTION 1: Volunteer Identity Card */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          {t('sectionVolunteer', language)}
        </div>
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
      </div>

      {/* SECTION 2: Ministry & Sharing Tools */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          {t('sectionMinistry', language)}
        </div>
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
      </div>

      {/* SECTION 3: System Preferences */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          {t('sectionSystem', language)}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Language Row with Segmented Control */}
          <div className="p-3.5 flex items-center justify-between gap-3">
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

          {/* Backup & Restore */}
          <div
            onClick={() => setIsBackupOpen(true)}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Download size={17} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {t('backupRestoreTitle', language)}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t('backupRestoreDesc', language)}
                </p>
              </div>
            </div>
            <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* SECTION 4: About & System Health */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          {t('sectionAbout', language)}
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <HardDrive size={14} strokeWidth={1.75} className="text-slate-400" />
              <span>{t('storageMode', language)}</span>
            </span>
            <span className="font-semibold text-slate-900">{t('localStorageMode', language)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} strokeWidth={1.75} className="text-emerald-600" />
              <span>{t('systemVersion', language)}</span>
            </span>
            <span className="font-mono text-slate-500">v1.2.0 (2026/10/02)</span>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            {t('offlineStatus', language)}
          </p>
        </div>
      </div>

      {/* Version Footer */}
      <div className="text-center pt-2 text-xs text-slate-400">
        <p className="text-[11px] text-slate-400">{t('churchFooterName', language)}</p>
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

      {/* Backup & Restore Modal */}
      {isBackupOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {t('backupModalTitle', language)}
              </h2>
              <button
                type="button"
                onClick={() => setIsBackupOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('backupDescText', language)}
              </p>

              {backupNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} strokeWidth={2} />
                  <span>{backupNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={exportBackup}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Download size={14} strokeWidth={2} />
                  <span>{t('exportBackupBtn', language)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Upload size={14} strokeWidth={2} />
                  <span>{t('importBackupBtn', language)}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} strokeWidth={2} />
                  <span>{t('restoreDefaultBtn', language)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
