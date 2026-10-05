import { useChurch } from '../context/ChurchContext';
import { getRosterSyncFeedback } from '../utils/rosterSyncFeedback';

export const RosterSaveStatus = () => {
  const { syncStatus, localSaveStatus, retryRosterSync, language } = useChurch();
  const feedback = getRosterSyncFeedback(localSaveStatus, syncStatus, language);
  if (!feedback) return null;

  return (
    <div className="flex items-center justify-between gap-2 text-xs leading-relaxed" role="status">
      <span className="text-rose-700 dark:text-rose-400">{feedback.message}</span>
      {feedback.canRetry && <button type="button" onClick={() => void retryRosterSync()} className="min-h-11 px-2 shrink-0 font-semibold text-blue-700 dark:text-blue-400">{language === 'zh' ? '重试' : 'Retry'}</button>}
    </div>
  );
};

export const RosterUndoNotice = () => {
  const { churchState, canUndoRosterChange, undoRosterChange, language } = useChurch();
  if (!canUndoRosterChange) return null;
  const rosterRevision = Object.values(churchState.rosters).map((roster) => roster.updatedAt || '').join('|');
  return (
    <div key={rosterRevision} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl px-4 py-1 flex items-center justify-between gap-3 shadow-md" role="status" style={{ animation: 'fadeIn 180ms ease-out 500ms both' }}>
      <span className="text-sm">{language === 'zh' ? '已更新侍奉表' : 'Roster updated'}</span>
      <button type="button" onClick={undoRosterChange} className="min-h-11 px-2 font-semibold text-sm">{language === 'zh' ? '撤销' : 'Undo'}</button>
    </div>
  );
};
