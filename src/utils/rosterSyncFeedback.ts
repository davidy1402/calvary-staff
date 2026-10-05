export type LocalSaveStatus = 'saved' | 'error';
export type SyncStatus = 'offline' | 'connecting' | 'synced' | 'error';

export interface RosterSyncFeedback {
  message: string;
  canRetry: boolean;
}

export const getRosterSyncFeedback = (
  localSaveStatus: LocalSaveStatus,
  syncStatus: SyncStatus,
  language: 'zh' | 'en',
): RosterSyncFeedback | null => {
  if (localSaveStatus === 'error') {
    return {
      message: language === 'zh' ? '未能保存，请重试' : 'Could not save. Please retry.',
      canRetry: true,
    };
  }

  if (syncStatus === 'error') {
    return {
      message: language === 'zh' ? '云端同步失败，请重试' : 'Cloud sync failed. Please retry.',
      canRetry: true,
    };
  }

  return null;
};
