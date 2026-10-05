export interface ElderModeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const ELDER_MODE_STORAGE_KEY = 'calvary_elder_mode';

export const getStoredElderMode = (storage: ElderModeStorage): boolean =>
  storage.getItem(ELDER_MODE_STORAGE_KEY) === 'true';

export const saveElderMode = (storage: ElderModeStorage, enabled: boolean): void => {
  storage.setItem(ELDER_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
};
