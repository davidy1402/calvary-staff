import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { t } from '../utils/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const AddToHomeCard: React.FC = () => {
  const { language } = useChurch();
  const [dismissed, setDismissed] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('calvary_add_to_home_dismissed') === 'true';
    setDismissed(isDismissed);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('calvary_add_to_home_dismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowIosSteps((prev) => !prev);
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs mb-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <Smartphone size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {t('addToHomeTitle', language)}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {t('addToHomeDesc', language)}
          </p>

          {showIosSteps && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 w-4">1.</span>
                <span>
                  {t('iosStep1', language)}{' '}
                  <Share size={13} strokeWidth={2} className="inline text-blue-600 align-middle -mt-0.5" />
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 w-4">2.</span>
                <span>{t('iosStep2', language)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 w-4">3.</span>
                <span>{t('iosStep3', language)}</span>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
            >
              {t('dismissPrompt', language)}
            </button>
            <button
              type="button"
              onClick={handleInstall}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
            >
              <PlusSquare size={14} strokeWidth={2} />
              <span>
                {deferredPrompt
                  ? t('installToPhone', language)
                  : showIosSteps
                  ? t('hideInstallSteps', language)
                  : t('viewInstallSteps', language)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
