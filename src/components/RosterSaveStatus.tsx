import { useChurch } from '../context/ChurchContext';

export const RosterSaveStatus = () => {
  const { syncStatus, localSaveStatus, retryRosterSync, language } = useChurch();
  const failed = localSaveStatus === 'error' || syncStatus === 'error';
  const text = language === 'zh'
    ? localSaveStatus === 'error' ? '未能保存，请重试'
      : syncStatus === 'offline' ? '已保存到此设备'
      : syncStatus === 'connecting' ? '已保存到此设备，正在同步'
      : syncStatus === 'error' ? '已保存到此设备，云端同步失败'
      : '已同步到云端'
    : localSaveStatus === 'error' ? 'Could not save. Please retry.'
      : syncStatus === 'offline' ? 'Saved on this device'
      : syncStatus === 'connecting' ? 'Saved on this device. Syncing.'
      : syncStatus === 'error' ? 'Saved on this device. Cloud sync failed.'
      : 'Synced to cloud';
  return (
    <div className="flex items-center justify-between gap-2 text-xs leading-relaxed" role="status">
      <span className={failed ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-zinc-400'}>{text}</span>
      {failed && <button type="button" onClick={() => void retryRosterSync()} className="min-h-11 px-2 shrink-0 font-semibold text-blue-700 dark:text-blue-400">{language === 'zh' ? '重试' : 'Retry'}</button>}
    </div>
  );
};

export const RosterUndoNotice = ({ inline = false }: { inline?: boolean }) => {
  const { canUndoRosterChange, undoRosterChange, language } = useChurch();
  if (!canUndoRosterChange) return null;
  return (
    <div className={`${inline ? 'shrink-0 mx-4 my-2 animate-fade-in' : 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm'} bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl px-4 py-1 flex items-center justify-between gap-3 shadow-md`} role="status">
      <span className="text-sm">{language === 'zh' ? '已更新服事表' : 'Roster updated'}</span>
      <button type="button" onClick={undoRosterChange} className="min-h-11 px-2 font-semibold text-sm">{language === 'zh' ? '撤销' : 'Undo'}</button>
    </div>
  );
};
