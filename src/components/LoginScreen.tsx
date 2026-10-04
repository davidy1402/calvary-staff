import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import { ChurchLogo } from './ChurchLogo';
import {
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
  { code: '+1', country: 'USA', flag: '🇺🇸' },
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
      setSmsCode('123456');
    }, 300);
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
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      const matched =
        churchState.coworkers.find(
          (c) => c.phone && c.phone.replace(/[\s-]/g, '').includes(cleanPhone)
        ) ||
        churchState.coworkers.find((c) => c.id === 'cw_david') ||
        churchState.coworkers[0];

      login('phone', matched);
    }, 300);
  };

  const handleQuickCoworkerLogin = (coworkerId: string) => {
    const user = churchState.coworkers.find((c) => c.id === coworkerId);
    if (user) {
      setIsLoading(true);
      setTimeout(() => {
        login('phone', user);
      }, 200);
    }
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('guest');
    }, 200);
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

        {/* Phone Number Login Form */}
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

          {/* Verification Code Box */}
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
                  <span>{language === 'zh' ? '填入测试验证码 123456' : 'Fill demo code 123456'}</span>
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

        {/* Quick Co-worker Experience Demo Chips */}
        <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2.5">
            <Users size={13} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
            <span>{language === 'zh' ? '快捷体验指定同工身份:' : 'Quick Demo As Co-worker:'}</span>
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
