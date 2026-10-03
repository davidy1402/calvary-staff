import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Languages,
  Camera,
  RotateCcw,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { CoworkerManagerModal } from './CoworkerManagerModal';
import { BottomSheet } from './BottomSheet';
import { compressAvatarImage } from '../utils/imageUtils';
import { t } from '../utils/i18n';

export const ProfileScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    currentUserId,
    setCurrentUserId,
    userMode,
    setUserMode,
    updateCurrentUserAvatar,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
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
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 -mx-4 -mt-4 px-4 py-2.5 mb-2 sticky top-0 z-20 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CCCJB" className="w-7 h-7 object-contain shrink-0 dark:hidden" />
          <img src="/logo-white.png" alt="CCCJB" className="w-7 h-7 object-contain shrink-0 hidden dark:block" />
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            CCCJB {t('settingsTitle', language)}
          </h1>
        </div>
      </div>

      {/* Volunteer Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Camera Icon Overlay */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('changeAvatar', language)}
              className="relative w-14 h-14 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer block border-2 border-white dark:border-slate-800 shadow-xs"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center text-xl font-black">
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
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-2xs cursor-pointer active:scale-95 transition-transform"
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
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {currentUser?.name || (language === 'zh' ? 'CCCJB 服事同工' : 'CCCJB Volunteer')}
              </h2>
              {currentUser?.englishName && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({currentUser.englishName})</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60">
                {currentUser?.cellGroup || 'Fire4J'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-300">{t('switchCoworkerIdentity', language)}:</span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[190px] truncate"
          >
            {churchState.coworkers.map((cw) => (
              <option key={cw.id} value={cw.id} className="dark:bg-slate-800 dark:text-slate-100">
                {cw.name} ({cw.cellGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode & Permission Card (Diana & Selena's permission protection) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {language === 'zh' ? '操作模式' : 'Mode'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'zh' ? '只读防误触，开启后可安排服事' : 'Toggle read-only or edit access'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setUserMode('member')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              userMode === 'member'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-blue-200 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">
                {language === 'zh' ? '只读模式' : 'Read-only'}
              </span>
              {userMode === 'member' && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'zh' ? '仅查看服事安排，防止误触' : 'Read-only view, safe from accidental changes'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setUserMode('editor')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              userMode === 'editor'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-blue-200 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">
                {language === 'zh' ? '编辑模式' : 'Editor Mode'}
              </span>
              {userMode === 'editor' && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'zh' ? '可安排人员与修改聚会主题' : 'Assign members and edit themes'}
            </p>
          </button>
        </div>
      </div>

      {/* Ministry & Coordination Tools */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {/* WhatsApp Export */}
        <div
          onClick={() => setIsWhatsAppOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('shareWhatsAppTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('shareWhatsAppDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-slate-500 shrink-0" />
        </div>

        {/* Volunteer Directory */}
        <div
          onClick={() => setIsCoworkersOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('coworkerDirectoryTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('coworkerDirectoryDesc', language)} ({churchState.coworkers.length})
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-slate-500 shrink-0" />
        </div>

        {/* Service Settings */}
        <div
          onClick={() => setIsServicesOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('serviceSettingsTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('serviceSettingsDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Appearance / Dark Mode Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            {isDarkMode ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {language === 'zh' ? '外观显示' : 'Appearance'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isDarkMode
                ? (language === 'zh' ? '已开启深色夜间模式' : 'Dark mode enabled')
                : (language === 'zh' ? '当前为浅色白底模式' : 'Light mode enabled')}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`w-12 h-7 rounded-full transition-colors duration-200 relative p-0.5 cursor-pointer ${
            isDarkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
          aria-label={language === 'zh' ? '切换深浅色外观' : 'Toggle theme'}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-xs transition-transform duration-200 flex items-center justify-center ${
              isDarkMode ? 'translate-x-5 text-blue-600' : 'translate-x-0 text-amber-500'
            }`}
          >
            {isDarkMode ? <Moon size={12} strokeWidth={2.2} /> : <Sun size={12} strokeWidth={2.2} />}
          </div>
        </button>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Languages size={17} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t('language', language)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('languageDesc', language)}
            </p>
          </div>
        </div>

        {/* Segmented Control for Language */}
        <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center shrink-0 border border-slate-200/60 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'zh'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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

      {/* Service Settings Bottom Sheet with drag-to-dismiss and exit animation */}
      <BottomSheet
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        className="bg-slate-50"
        maxHeight="85vh"
      >
        {/* Sheet Title */}
        <div className="px-4 pb-2.5 pt-0.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-center shrink-0">
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            {t('serviceSettingsModalTitle', language)}
          </h2>
        </div>

        {/* Service Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 pb-8 sm:pb-6">
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
      </BottomSheet>
    </div>
  );
};
