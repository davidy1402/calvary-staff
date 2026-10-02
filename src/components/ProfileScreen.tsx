import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Languages,
  Camera,
  RotateCcw,
  X,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { CoworkerManagerModal } from './CoworkerManagerModal';
import { compressAvatarImage } from '../utils/imageUtils';
import { t } from '../utils/i18n';

export const ProfileScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    currentUserId,
    setCurrentUserId,
    updateCurrentUserAvatar,
    language,
    setLanguage,
  } = useChurch();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCoworkersOpen, setIsCoworkersOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarLetter =
    currentUser?.name?.trim()?.[0] || (language === 'zh' ? '服' : 'V');

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressAvatarImage(file);
      updateCurrentUserAvatar(compressedBase64);
    } catch (err) {
      console.error('Failed to compress/save avatar', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要恢复默认文字头像吗？')) {
      updateCurrentUserAvatar('');
    }
  };

  return (
    <div className="space-y-4 animate-slide-up pb-8">
      {/* Centered AppBar */}
      <div className="bg-white border-b border-slate-200/80 -mx-4 -mt-4 px-4 py-3.5 mb-2 sticky top-0 z-20 shadow-2xs">
        <h1 className="text-base font-bold text-slate-900 text-center">
          {t('settingsTitle', language)}
        </h1>
      </div>

      {/* Volunteer Identity Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Camera Icon Overlay */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('changeAvatar', language)}
              className="relative w-14 h-14 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer block border-2 border-white shadow-xs"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 text-blue-900 flex items-center justify-center text-xl font-black">
                  {avatarLetter}
                </div>
              )}

              {/* Camera Hover/Touch Overlay */}
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} strokeWidth={2.2} />
              </div>
            </button>

            {/* Camera badge bottom right */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('changeAvatar', language)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-2xs cursor-pointer active:scale-95 transition-transform"
            >
              <Camera size={12} strokeWidth={2.5} />
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                {currentUser?.name || (language === 'zh' ? '加略山服侍人员' : 'Calvary Volunteer')}
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

            {/* Remove custom avatar action (only shown when custom photo exists) */}
            {currentUser?.avatar && (
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-[10px] font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={10} strokeWidth={2} />
                  <span>{t('removeAvatar', language)}</span>
                </button>
              </div>
            )}
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
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {/* WhatsApp Export */}
        <div
          onClick={() => setIsWhatsAppOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100"
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

        {/* Volunteer Directory */}
        <div
          onClick={() => setIsCoworkersOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100"
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
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors active:bg-slate-100"
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
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 flex items-center justify-between gap-3">
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

      {/* WhatsApp Bottom Sheet Modal */}
      {isWhatsAppOpen && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}

      {/* Volunteer Directory Bottom Sheet Modal */}
      {isCoworkersOpen && (
        <CoworkerManagerModal
          isOpen={true}
          onClose={() => setIsCoworkersOpen(false)}
        />
      )}

      {/* Service Settings True Bottom Sheet */}
      {isServicesOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/45 backdrop-blur-xs animate-backdrop"
          onClick={() => setIsServicesOpen(false)}
        >
          <div
            className="bg-slate-50 w-full max-w-lg mx-auto rounded-t-[28px] rounded-b-none shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Native iOS Grab Handle */}
            <div className="w-full pt-3 pb-1 flex justify-center bg-white shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* iOS Top Navigation Bar */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsServicesOpen(false)}
                className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 active:opacity-60 -ml-1 py-1 px-2 font-medium text-sm rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} strokeWidth={2.2} />
                <span>{t('back', language)}</span>
              </button>

              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {t('serviceSettingsModalTitle', language)}
              </h2>

              <button
                type="button"
                onClick={() => setIsServicesOpen(false)}
                aria-label="关闭"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            {/* Service Cards List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3 pb-8 sm:pb-6">
              {churchState.services.map((svc) => (
                <div
                  key={svc.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{svc.name}</span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {svc.time}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={13} strokeWidth={1.75} className="text-slate-400 shrink-0" />
                      <span>
                        <strong className="font-semibold text-slate-700">{t('rehearsalTime', language)}:</strong>{' '}
                        {svc.rehearsalTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} strokeWidth={1.75} className="text-slate-400 shrink-0" />
                      <span>
                        <strong className="font-semibold text-slate-700">{t('venue', language)}:</strong>{' '}
                        {svc.venue}
                      </span>
                    </div>
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
