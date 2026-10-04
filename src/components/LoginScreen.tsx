import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import { ChurchLogo } from './ChurchLogo';
import {
  Phone,
  ArrowRight,
  Sun,
  Moon,
  Languages,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
];

export const LoginScreen: React.FC = () => {
  const {
    churchState,
    login,
    language,
    toggleLanguage,
    isDarkMode,
    toggleDarkMode,
  } = useChurch();

  const [activeTab, setActiveTab] = useState<'quick' | 'phone'>('quick');
  const [selectedCountry, setSelectedCountry] = useState('+60');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: number | null = null;
    if (countdown > 0) {
      timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.trim().length < 7) {
      setErrorMessage(
        language === 'zh'
          ? '请输入有效的手机号码'
          : 'Please enter a valid phone number'
      );
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCodeSent(true);
      setCountdown(60);
      setSmsCode('123456'); // Auto pre-fill default test code for convenience
    }, 400);
  };

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      handleSendCode();
      return;
    }
    if (smsCode.trim() !== '123456' && smsCode.trim().length !== 6) {
      setErrorMessage(
        language === 'zh' ? '验证码格式错误或已过期' : 'Invalid verification code'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Find matching coworker by phone or default to first
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      const matched = churchState.coworkers.find(
        (c) => c.phone && c.phone.replace(/[\s-]/g, '').includes(cleanPhone)
      ) || churchState.coworkers.find((c) => c.id === 'cw_david') || churchState.coworkers[0];

      login('phone', matched);
    }, 350);
  };

  const handleThirdPartyLogin = (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setTimeout(() => {
      const defaultUser =
        churchState.coworkers.find((c) => c.id === 'cw_david') ||
        churchState.coworkers[0];
      login(provider, defaultUser);
    }, 400);
  };

  const handleQuickCoworkerLogin = (coworkerId: string) => {
    const user = churchState.coworkers.find((c) => c.id === coworkerId);
    if (user) {
      setIsLoading(true);
      setTimeout(() => {
        login('phone', user);
      }, 300);
    }
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('guest');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-blue-100 dark:selection:bg-zinc-800 transition-colors duration-200">
      {/* Top Bar with Language and Theme Toggles */}
      <header className="app-header-safe px-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChurchLogo className="w-8 h-8 object-contain shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            CCCJB Connect
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-8 px-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
            aria-label="切换语言"
          >
            <Languages size={13} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
            <span>{language === 'zh' ? 'EN' : '中文'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
            aria-label="切换深浅外观"
          >
            {isDarkMode ? (
              <Sun size={14} strokeWidth={2} className="text-amber-400" />
            ) : (
              <Moon size={14} strokeWidth={2} className="text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-sm w-full mx-auto px-5 py-6 flex flex-col justify-center animate-slide-up">
        {/* Church Identity Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 shadow-md mb-3 border border-white/20">
            <ChurchLogo className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {language === 'zh' ? '新山加略山社区教会' : 'Calvary Community Church JB'}
          </h1>
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider mt-0.5">
            CCCJB Connect
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">
            {language === 'zh'
              ? '同工服事与排班协作平台'
              : 'Volunteer & Service Roster Platform'}
          </p>
        </div>

        {/* Login Method Segmented Control */}
        <div className="bg-slate-200/70 dark:bg-zinc-900 p-1 rounded-xl flex items-center mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('quick');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {language === 'zh' ? '快捷账号登录' : 'Quick Sign-in'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {language === 'zh' ? '手机号码登录' : 'Phone Number'}
          </button>
        </div>

        {/* Tab 1: Google & Apple Quick Sign-in */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleThirdPartyLogin('google')}
              className="w-full h-13 rounded-2xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-100 font-bold text-sm flex items-center justify-center gap-3 shadow-2xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{language === 'zh' ? '使用 Google 账号继续' : 'Continue with Google'}</span>
            </button>

            {/* Apple Sign In Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleThirdPartyLogin('apple')}
              className="w-full h-13 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-bold text-sm flex items-center justify-center gap-3 shadow-2xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-5.44-8.47-9.68-18.06-12.72-28.77-3.04-10.7-4.56-20.93-4.56-30.68 0-14.34 3.73-26.04 11.19-35.1 7.46-9.06 16.74-13.68 27.84-13.88 5.01 0 10.45 1.25 16.32 3.74 5.88 2.49 9.5 3.79 10.88 3.89 1.63-.22 5.54-1.63 11.74-4.23 6.19-2.6 11.68-3.79 16.48-3.58 12.39.65 22.38 5.17 29.98 13.56-10.87 6.63-16.19 15.98-15.98 28.04.22 9.56 3.97 17.61 11.25 24.13 4.24 3.8 8.97 6.57 14.19 8.31-2.17 6.41-4.78 12.98-7.83 19.72zM119.22 31.84c0-7.72 2.76-14.89 8.27-21.52 5.52-6.63 12.28-10.32 20.28-11.08.33 1.09.49 2.12.49 3.1 0 7.61-2.93 14.94-8.8 22-5.87 7.07-12.82 10.92-20.85 11.57-.22-1.09-.33-2.12-.39-4.07z" />
              </svg>
              <span>{language === 'zh' ? '通过 Apple 登录' : 'Sign in with Apple'}</span>
            </button>

            <div className="relative py-2 flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-zinc-800 w-full absolute" />
              <span className="bg-slate-50 dark:bg-black px-3 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 relative z-10">
                {language === 'zh' ? '或者' : 'or'}
              </span>
            </div>

            {/* Switch to phone trigger */}
            <button
              type="button"
              onClick={() => setActiveTab('phone')}
              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Phone size={15} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
              <span>{language === 'zh' ? '使用手机号码与验证码登录' : 'Sign in with phone number'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Phone Number Login Form */}
        {activeTab === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-3.5">
            {/* Country and Phone input group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                {language === 'zh' ? '手机号码' : 'Phone Number'}
              </label>
              <div className="flex rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-colors">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 px-3 py-3 border-r border-slate-200 dark:border-zinc-700 outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="012-345 6789"
                  className="flex-1 px-3 py-3 text-sm font-medium bg-transparent text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Verification Code Box (Visible once sent or always visible) */}
            {codeSent && (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {language === 'zh' ? '短信验证码' : 'Verification Code'}
                  </label>
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleSendCode}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 disabled:text-slate-400 dark:disabled:text-zinc-500 cursor-pointer"
                  >
                    {countdown > 0
                      ? `${countdown}s ${language === 'zh' ? '后重新获取' : 'resend'}`
                      : language === 'zh'
                      ? '重新获取'
                      : 'Resend'}
                  </button>
                </div>
                <div className="flex rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs focus-within:border-blue-600 dark:focus-within:border-blue-500">
                  <input
                    type="text"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="123456"
                    className="flex-1 px-3 py-3 text-base tracking-widest font-mono font-bold bg-transparent text-slate-900 dark:text-zinc-100 placeholder:text-slate-300 dark:placeholder:text-zinc-600 outline-none text-center"
                  />
                </div>

                {/* Instant Fill Helper Badge */}
                <div className="mt-1.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSmsCode('123456')}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <CheckCircle2 size={11} />
                    <span>{language === 'zh' ? '测试环境一键填入验证码 (123456)' : 'Auto-fill demo code (123456)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 mt-2"
            >
              <span>{codeSent ? (language === 'zh' ? '登录进入系统' : 'Sign In') : (language === 'zh' ? '获取短信验证码' : 'Send Verification Code')}</span>
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </form>
        )}

        {/* Quick Co-worker Experience Demo Chips */}
        <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2.5">
            <Users size={13} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
            <span>{language === 'zh' ? '快捷体验指定同工身份 (免密测试):' : 'Quick Demo As Co-worker:'}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'cw_david', name: 'David' },
              { id: 'cw_selena', name: 'Selena' },
              { id: 'cw_diana', name: 'Diana' },
              { id: 'cw_qiuyi', name: '秋仪' },
              { id: 'cw_kaiyue', name: '凯曰' },
            ].map((cw) => (
              <button
                key={cw.id}
                type="button"
                onClick={() => handleQuickCoworkerLogin(cw.id)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-slate-700 hover:text-blue-700 dark:text-zinc-300 dark:hover:text-blue-300 text-xs font-semibold border border-slate-200/60 dark:border-zinc-700/60 active:scale-95 transition-all cursor-pointer"
              >
                {cw.name}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Access Link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 underline cursor-pointer"
          >
            {language === 'zh' ? '以访客身份浏览排班表' : 'Browse schedules as Guest'}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-400 dark:text-zinc-600 pb-safe-bottom">
        <p>新山加略山社区教会 · CCCJB Connect</p>
      </footer>
    </div>
  );
};
