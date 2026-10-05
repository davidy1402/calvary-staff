import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  Languages,
  Camera,
  Sun,
  Moon,
  Sparkles,
  Heart,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { CoworkerManagerModal } from './CoworkerManagerModal';
import { ServiceManagerModal } from './ServiceManagerModal';
import { LatestUpdateModal } from './LatestUpdateModal';
import { AppHeader } from './AppHeader';
import { CURRENT_VERSION } from '../data/updates';
import { t } from '../utils/i18n';
import { BottomPullEasterEgg } from './BottomPullEasterEgg';
import { CoordinatorPinPopover } from './CoordinatorPinPopover';
import { AvatarCropperModal } from './AvatarCropperModal';
import { SeniorCareSettingsScreen } from './SeniorCareSettingsScreen';

interface ProfileScreenProps {
  onOpenUpdates?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenUpdates }) => {
  const {
    currentUser,
    isEditMode,
    updateCurrentUserAvatar,
    updateCoworker,
    language,
    setLanguage,
    isDarkMode,
    themeMode,
    setThemeMode,
    isElderMode,
    setIsElderMode,
    setIsIdentityModalOpen,
  } = useChurch();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCoworkersOpen, setIsCoworkersOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const avatarLetter =
    currentUser?.name?.trim()?.[0] || (language === 'zh' ? '服' : 'V');

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    e.target.value = '';
  };

  if (isElderMode) return <SeniorCareSettingsScreen />;

  return (
    <div className="min-h-full pb-8">
      <AppHeader title={t('settingsTitle', language)} action={<CoordinatorPinPopover />}>

        {/* Cloud Sync Status Indicator (Only display when active) */}
        {/* {syncStatus !== 'offline' && (
          <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500 shadow-2xs'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span>
              {syncStatus === 'synced'
                ? (language === 'zh' ? '云端同步' : 'Synced')
                : (language === 'zh' ? '连接中' : 'Connecting')}
            </span>
          </div>
        )} */}
      </AppHeader>

      {/* Screen Body Content */}
      <div className="px-4 md:px-6 pt-4 space-y-4 md:space-y-6 animate-slide-up">

      {/* Volunteer identity */}
      <div>
        {/* Volunteer Identity Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl p-4 md:p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar with Camera Icon Overlay */}
            <div className="relative group shrink-0">
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-xs">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 dark:bg-zinc-800 text-blue-900 dark:text-blue-200 flex items-center justify-center text-xl md:text-2xl font-black">
                    {avatarLetter}
                  </div>
                )}

              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t('changeAvatar', language)}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-2xs cursor-pointer active:scale-95 transition-transform"
              >
                <Camera size={13} strokeWidth={2.5} />
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
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-zinc-100">
                  {currentUser?.name || (language === 'zh' ? 'CCCJB Connect 服侍人员' : 'CCCJB Connect Volunteer')}
                </h2>
                {currentUser?.englishName && (
                  <span className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 font-medium">({currentUser.englishName})</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[11px] md:text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-zinc-700">
                  {currentUser?.cellGroup || '大专'}
                </span>
                <span className="text-[11px] md:text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {t('coworker', language)}
                </span>
                {currentUser?.id !== 'cw_guest' && (
                  <button
                    type="button"
                    onClick={() => {
                      const input = window.prompt(
                        language === 'zh'
                          ? '请输入您的生日日期 (例如：10-30 或 1998-10-30)'
                          : 'Enter your birthday (e.g. 10-30 or 1998-10-30)',
                        currentUser?.birthday || ''
                      );
                      if (input !== null && currentUser) {
                        updateCoworker({ ...currentUser, birthday: input.trim() });
                      }
                    }}
                    className="text-[11px] md:text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                    title={language === 'zh' ? '修改我的生日' : 'Edit birthday'}
                  >
                    <span>🎂</span>
                    <span>{currentUser?.birthday || (language === 'zh' ? '填写生日' : 'Set Birthday')}</span>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Switch Identity Action */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs md:text-sm text-slate-500 dark:text-zinc-400">
            <span className="font-medium text-slate-600 dark:text-zinc-300">
              {language === 'zh' ? '当前身份:' : t('switchCoworkerIdentity', language)}
            </span>
            <button
              type="button"
              onClick={() => setIsIdentityModalOpen(true)}
              className="text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700/80 border border-blue-200/80 dark:border-zinc-700 rounded-xl px-3 py-1.5 press-feedback cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>{currentUser?.name || (language === 'zh' ? '选择姓名' : 'Select Name')}</span>
              <ChevronRight size={13} className="text-blue-500 shrink-0" />
            </button>
          </div>
        </div>

      </div>

      {/* Ministry & Coordination Tools */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
        {/* WhatsApp Export */}
        <div
          onClick={() => setIsWhatsAppOpen(true)}
          className="press-feedback p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {t('shareWhatsAppTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('shareWhatsAppDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>

        {/* Volunteer Directory */}
        <div
          onClick={() => setIsCoworkersOpen(true)}
          className="press-feedback p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {t('coworkerDirectoryTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('coworkerDirectoryDesc', language)} 
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>

        {/* Service Settings */}
        <div
          onClick={() => setIsServicesOpen(true)}
          className="press-feedback p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {t('serviceSettingsTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('serviceSettingsDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>

        {/* Latest Updates & Changelog */}
        <div
          onClick={() => {
            if (onOpenUpdates) {
              onOpenUpdates();
            } else {
              setIsUpdatesOpen(true);
            }
          }}
          className="press-feedback p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles size={17} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {language === 'zh' ? '最新更新与版本说明' : 'Latest Updates'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-zinc-700">
                  v{CURRENT_VERSION.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {language === 'zh' ? '查看系统近期改动与新功能记录' : 'View recent changelog and new features'}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>
      </div>

      {/* Appearance & Language Settings Grid on iPad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appearance / Dark Mode Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 md:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              {isDarkMode ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-zinc-100">
                {language === 'zh' ? '外观显示' : 'Appearance'}
              </h3>
              {/* <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 truncate">
                {themeMode === 'system'
                  ? (language === 'zh'
                      ? `跟随设备 (${isDarkMode ? '深色' : '浅色'})`
                      : `System (${isDarkMode ? 'Dark' : 'Light'})`)
                  : isDarkMode
                  ? (language === 'zh' ? '已锁定深色模式' : 'Locked to Dark')
                  : (language === 'zh' ? '已锁定浅色模式' : 'Locked to Light')}
              </p> */}
            </div>
          </div>

          {/* 3-segment switch: 跟随设备 | 浅色 | 深色 */}
          <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center shrink-0 border border-slate-200/60 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={`px-2 md:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'system'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'zh' ? '自动' : 'Auto'}
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`px-2 md:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'zh' ? '浅色' : 'Light'}
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`px-2 md:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'zh' ? '深色' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Language Preference Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 md:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Languages size={18} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-zinc-100">
                {t('language', language)}
              </h3>
              {/* <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400">
                {t('languageDesc', language)}
              </p> */}
            </div>
          </div>

          {/* Segmented Control for Language */}
          <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center shrink-0 border border-slate-200/60 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setLanguage('zh')}
              className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                language === 'zh'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 md:p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Heart size={21} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-zinc-100">
                {t('elderMode', language)}
              </h3>
              <p className="mt-0.5 text-xs md:text-sm leading-5 text-slate-600 dark:text-zinc-300">
                {t('elderModeDesc', language)}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isElderMode}
            aria-label={t('elderMode', language)}
            onClick={() => setIsElderMode(!isElderMode)}
            className={`min-w-14 min-h-11 p-1 rounded-full transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              isElderMode ? 'bg-blue-700 dark:bg-blue-500' : 'bg-slate-200 dark:bg-zinc-700'
            }`}
          >
            <span className={`block w-9 h-9 rounded-full bg-white shadow-sm transition-transform ${isElderMode ? 'translate-x-3' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Subtle Warm Footnote */}
      <div className="text-center pt-3 space-y-1">
        <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('churchFooterName', language)}</p>
        <p className="text-[10px] text-slate-300 dark:text-zinc-600">v{CURRENT_VERSION.version} ({CURRENT_VERSION.releaseDate})</p>
      </div>

      {/* Secret Pull-Down Bottom Easter Egg */}
      <BottomPullEasterEgg
        language={language}
        disabled={isWhatsAppOpen || isCoworkersOpen || isServicesOpen || isUpdatesOpen}
      />

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

      {/* Service Settings Bottom Sheet Modal */}
      {isServicesOpen && (
        <ServiceManagerModal
          isOpen={true}
          onClose={() => setIsServicesOpen(false)}
        />
      )}

      {/* Latest Updates Changelog Modal */}
      {isUpdatesOpen && (
        <LatestUpdateModal
          isOpen={true}
          onClose={() => setIsUpdatesOpen(false)}
        />
      )}
      <AvatarCropperModal
        file={avatarFile}
        language={language}
        onClose={() => setAvatarFile(null)}
        onCrop={(avatar) => {
          updateCurrentUserAvatar(avatar);
          setAvatarFile(null);
        }}
      />
      </div>
    </div>
  );
};
