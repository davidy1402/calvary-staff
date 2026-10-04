import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  Languages,
  Camera,
  RotateCcw,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { CoworkerManagerModal } from './CoworkerManagerModal';
import { ServiceManagerModal } from './ServiceManagerModal';
import { LatestUpdateModal } from './LatestUpdateModal';
import { ChurchLogo } from './ChurchLogo';
import { CURRENT_VERSION } from '../data/updates';
import { compressAvatarImage } from '../utils/imageUtils';
import { t } from '../utils/i18n';
import { BottomPullEasterEgg } from './BottomPullEasterEgg';

interface ProfileScreenProps {
  onOpenUpdates?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenUpdates }) => {
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
    themeMode,
    setThemeMode,
  } = useChurch();

  const handleSwitchToEditor = () => {
    if (userMode === 'editor') return;
    const pin = window.prompt(language === 'zh' ? '请输入统筹管理 4 位 PIN 码' : 'Enter 4-digit coordinator PIN');
    if (pin === '2026' || pin === '1402' || pin === '1234') {
      setUserMode('editor');
    } else if (pin !== null) {
      alert(language === 'zh' ? 'PIN 码错误' : 'Incorrect PIN');
    }
  };

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCoworkersOpen, setIsCoworkersOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

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
    <div className="min-h-full pb-8">
      {/* Centered AppBar */}
      <header className="app-header-safe bg-white dark:bg-black border-b border-slate-200/80 dark:border-zinc-800 px-4 pb-3 sticky top-0 z-30 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChurchLogo className="w-7 h-7 object-contain shrink-0" />
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            CCCJB Connect {t('settingsTitle', language)}
          </h1>
        </div>
      </header>

      {/* Screen Body Content */}
      <div className="px-4 pt-4 space-y-4 animate-slide-up">

      {/* Volunteer Identity Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Camera Icon Overlay */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('changeAvatar', language)}
              className="relative w-14 h-14 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer block border-2 border-white dark:border-zinc-800 shadow-xs"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 dark:bg-zinc-800 text-blue-900 dark:text-zinc-100 flex items-center justify-center text-xl font-black">
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
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-2xs cursor-pointer active:scale-95 transition-transform"
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
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {currentUser?.name || (language === 'zh' ? 'CCCJB Connect 服事同工' : 'CCCJB Connect Volunteer')}
              </h2>
              {currentUser?.englishName && (
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">({currentUser.englishName})</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-zinc-700">
                {currentUser?.cellGroup || '大专'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
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
        <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="font-medium text-slate-600 dark:text-zinc-300">
            {language === 'zh' ? '当前同工身份:' : t('switchCoworkerIdentity', language)}
          </span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[190px] truncate"
          >
            {churchState.coworkers.map((cw) => (
              <option key={cw.id} value={cw.id} className="dark:bg-zinc-800 dark:text-zinc-100">
                {cw.name} ({cw.cellGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Management Access Row */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {language === 'zh' ? '排班管理权限' : 'Schedule Access'}
              </h3>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  userMode === 'editor'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                }`}
              >
                {userMode === 'editor'
                  ? (language === 'zh' ? '已开启编辑' : 'Unlocked')
                  : (language === 'zh' ? '只读中' : 'Locked')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
              {userMode === 'editor'
                ? (language === 'zh' ? '可安排同工与修改聚会主题' : 'Can assign roles and edit themes')
                : (language === 'zh' ? '默认只读防误触，需管理员 PIN 解锁' : 'Read-only, enter PIN to edit')}
            </p>
          </div>
        </div>

        {userMode === 'editor' ? (
          <button
            type="button"
            onClick={() => setUserMode('member')}
            className="text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-700 transition-colors shrink-0 cursor-pointer"
          >
            {language === 'zh' ? '切换只读' : 'Lock'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSwitchToEditor}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-xl border border-blue-200/80 dark:border-zinc-700 transition-colors shrink-0 cursor-pointer"
          >
            {language === 'zh' ? '解锁编辑' : 'Unlock'}
          </button>
        )}
      </div>

      {/* Ministry & Coordination Tools */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
        {/* WhatsApp Export */}
        <div
          onClick={() => setIsWhatsAppOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
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
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
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
                {t('coworkerDirectoryDesc', language)} ({churchState.coworkers.length})
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>

        {/* Service Settings */}
        <div
          onClick={() => setIsServicesOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
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
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
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

      {/* Appearance / Dark Mode Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            {isDarkMode ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              {language === 'zh' ? '外观显示' : 'Appearance'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {themeMode === 'system'
                ? (language === 'zh'
                    ? `跟随设备 (${isDarkMode ? '深色' : '浅色'})`
                    : `System (${isDarkMode ? 'Dark' : 'Light'})`)
                : isDarkMode
                ? (language === 'zh' ? '已锁定深色模式' : 'Locked to Dark')
                : (language === 'zh' ? '已锁定浅色模式' : 'Locked to Light')}
            </p>
          </div>
        </div>

        {/* 3-segment switch: 跟随设备 | 浅色 | 深色 */}
        <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center shrink-0 border border-slate-200/60 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setThemeMode('system')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Languages size={17} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              {t('language', language)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {t('languageDesc', language)}
            </p>
          </div>
        </div>

        {/* Segmented Control for Language */}
        <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center shrink-0 border border-slate-200/60 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Subtle Warm Footnote */}
      <div className="text-center pt-3 space-y-1">
        <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('churchFooterName', language)}</p>
        <p className="text-[10px] text-slate-300 dark:text-zinc-600">v{CURRENT_VERSION.version} ({CURRENT_VERSION.releaseDate})</p>
      </div>

      {/* Secret Pull-Down Bottom Easter Egg */}
      <BottomPullEasterEgg language={language} />

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
      </div>
    </div>
  );
};
