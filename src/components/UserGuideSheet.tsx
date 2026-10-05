import React from 'react';
import { CheckCircle2, CircleHelp, X } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import type { Language } from '../utils/i18n';

interface UserGuideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  seniorCare?: boolean;
}

export const UserGuideSheet: React.FC<UserGuideSheetProps> = ({ isOpen, onClose, language, seniorCare = false }) => {
  const steps = language === 'zh'
    ? [
        ['选择姓名', '点击首页右上方的头像，选择您的名字。'],
        ['查看我的服事', '首页会显示您的日期、岗位、集合时间和地点。'],
        ['打开服事详情', '点击一项服事，可查看备注并存入手机日历。'],
      ]
    : [
        ['Choose your name', 'Tap your avatar on the Home page and select your name.'],
        ['Check My Duties', 'Home shows your date, role, rehearsal time, and venue.'],
        ['Open the details', 'Tap a duty to read notes or add it to your phone calendar.'],
      ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} labelledBy="user-guide-title" maxHeight={seniorCare ? '90dvh' : '80dvh'}>
      <section className={`${seniorCare ? 'px-6 pt-3 pb-8' : 'px-5 pt-2 pb-7'}`} aria-describedby="user-guide-description">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`${seniorCare ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0`}>
              <CircleHelp size={seniorCare ? 26 : 22} strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <h2 id="user-guide-title" className={`${seniorCare ? 'text-2xl' : 'text-xl'} font-extrabold text-slate-900 dark:text-zinc-100`}>
                {language === 'zh' ? '使用指南' : 'Quick Guide'}
              </h2>
              <p id="user-guide-description" className={`mt-0.5 ${seniorCare ? 'text-base leading-6' : 'text-sm'} text-slate-600 dark:text-zinc-300`}>
                {language === 'zh' ? '三步查看您的服事安排。' : 'Three simple steps to find your duties.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`${seniorCare ? 'min-w-14 min-h-14 text-lg' : 'min-w-11 min-h-11'} -mr-2 -mt-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors`}
            aria-label={language === 'zh' ? '关闭使用指南' : 'Close quick guide'}
          >
            <X size={seniorCare ? 26 : 22} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <ol className={`${seniorCare ? 'mt-7 space-y-6' : 'mt-6 space-y-4'}`}>
          {steps.map(([title, description], index) => (
            <li key={title} className={`flex items-start ${seniorCare ? 'gap-4' : 'gap-3'}`}>
              <span className={`${seniorCare ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'} mt-0.5 rounded-full bg-blue-700 dark:bg-blue-500 text-white shrink-0 flex items-center justify-center font-extrabold`} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className={`${seniorCare ? 'text-xl' : 'text-base'} font-bold text-slate-900 dark:text-zinc-100`}>{title}</h3>
                <p className={`mt-0.5 ${seniorCare ? 'text-base leading-7' : 'text-sm leading-6'} text-slate-600 dark:text-zinc-300`}>{description}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onClose}
          className={`mt-6 ${seniorCare ? 'min-h-14 text-lg rounded-2xl' : 'min-h-12 text-base rounded-xl'} w-full bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold transition-colors flex items-center justify-center gap-2`}
        >
          <CheckCircle2 size={seniorCare ? 24 : 20} strokeWidth={2} aria-hidden="true" />
          {language === 'zh' ? '我明白了' : 'Got it'}
        </button>
      </section>
    </BottomSheet>
  );
};
