import React from 'react';
import { Heart, Languages, Moon, Sun, Users } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { useChurch } from '../context/ChurchContext';
import { getSeniorCareThemeSelection } from '../utils/seniorCare';

export const SeniorCareSettingsScreen: React.FC = () => {
  const {
    currentUser,
    language,
    setLanguage,
    themeMode,
    isDarkMode,
    setThemeMode,
    setIsElderMode,
    setIsIdentityModalOpen,
  } = useChurch();
  const selectedButton = 'bg-blue-800 text-white';
  const unselectedButton = 'border-2 border-slate-300 text-slate-800 dark:border-zinc-700 dark:text-zinc-100';

  const themeOptions = [
    { id: 'light' as const, label: language === 'zh' ? '浅色' : 'Light', icon: Sun },
    { id: 'dark' as const, label: language === 'zh' ? '深色' : 'Dark', icon: Moon },
  ];
  const selectedTheme = getSeniorCareThemeSelection(themeMode, isDarkMode);

  return (
    <div className="min-h-full pb-6">
      <AppHeader title={language === 'zh' ? '设置与帮助' : 'Settings & Help'} seniorCare />

      <main className="px-5 pt-5 space-y-5 senior-care-content">
        <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-full bg-blue-100 text-2xl font-extrabold text-blue-900 flex items-center justify-center dark:bg-zinc-800 dark:text-blue-200" aria-hidden="true">
              {currentUser?.name?.trim()[0] || '同'}
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-blue-900 dark:text-blue-300">{language === 'zh' ? '当前服侍人员' : 'Current volunteer'}</p>
              <h2 className="mt-1 break-words text-xl font-extrabold text-slate-950 dark:text-white">{currentUser?.name || (language === 'zh' ? '尚未选择' : 'Not selected')}</h2>
            </div>
          </div>
          <button type="button" onClick={() => setIsIdentityModalOpen(true)} className="mt-5 min-h-14 w-full rounded-2xl border-2 border-blue-800 bg-white px-4 text-lg font-extrabold text-blue-800 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:bg-zinc-900 dark:text-blue-300 dark:hover:bg-zinc-800 flex items-center justify-center gap-2">
            <Users size={22} strokeWidth={2.25} aria-hidden="true" />
            {language === 'zh' ? '更换服侍人员' : 'Change volunteer'}
          </button>
        </section>

        <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Languages size={26} className="text-blue-800 dark:text-blue-300" aria-hidden="true" />
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">{language === 'zh' ? '界面语言' : 'Language'}</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" aria-pressed={language === 'zh'} onClick={() => setLanguage('zh')} className={`min-h-14 rounded-2xl text-lg font-extrabold ${language === 'zh' ? selectedButton : unselectedButton}`}>中文</button>
            <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')} className={`min-h-14 rounded-2xl text-lg font-extrabold ${language === 'en' ? selectedButton : unselectedButton}`}>English</button>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">{language === 'zh' ? '显示外观' : 'Display appearance'}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {themeOptions.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" aria-pressed={selectedTheme === id} onClick={() => setThemeMode(id)} className={`min-h-14 rounded-2xl px-3 text-lg font-extrabold flex items-center justify-center gap-2 ${selectedTheme === id ? selectedButton : unselectedButton}`}>
                <Icon size={22} strokeWidth={2.25} aria-hidden="true" />{label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-3">
            <Heart size={28} className="mt-0.5 shrink-0 text-blue-800 dark:text-blue-300" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">{language === 'zh' ? '长者关怀模式已开启' : 'Senior Care Mode is on'}</h2>
              <p className="mt-2 text-base leading-7 text-slate-700 dark:text-zinc-200">{language === 'zh' ? '此模式会保留重点服侍资料，并使用更大的文字和按钮。' : 'This mode keeps serving information clear with larger text and buttons.'}</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsElderMode(false)} className="mt-5 min-h-14 w-full rounded-2xl border-2 border-slate-400 bg-white px-4 text-lg font-extrabold text-slate-900 transition-colors hover:bg-slate-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
            {language === 'zh' ? '关闭长者关怀模式' : 'Turn off Senior Care Mode'}
          </button>
        </section>
      </main>
    </div>
  );
};
