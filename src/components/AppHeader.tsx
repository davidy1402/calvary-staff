import React from 'react';
import { ChurchLogo } from './ChurchLogo';
import { getAppHeaderAppearance } from '../utils/appHeader';

interface AppHeaderProps {
  title: string;
  seniorCare?: boolean;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, seniorCare = false, action, children }) => {
  const appearance = getAppHeaderAppearance(seniorCare);

  return (
    <header className={`app-header-safe bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 ${appearance.paddingClass} sticky top-0 z-30 shadow-2xs`}>
      <div className="flex min-h-10 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ChurchLogo className={`${appearance.logoClass} object-contain shrink-0`} />
          <div className="min-w-0 text-left">
            <p className={`${appearance.brandClass} font-bold leading-5 tracking-wide text-blue-800 dark:text-blue-300`}>CCCJB Connect</p>
            <h1 className={`${appearance.titleClass} truncate font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white`}>{title}</h1>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </header>
  );
};
