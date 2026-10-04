import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ChurchState,
  ServiceDefinition,
  ServiceRoster,
  Coworker,
  UserMode,
  ConflictItem,
  WorshipSong,
  ThemeMode,
} from '../types';
import {
  INITIAL_STATE,
  INITIAL_ROLES,
  INITIAL_COWORKERS,
  INITIAL_SERVICES,
  INITIAL_ROSTERS,
} from '../data/initialData';
import { RosterSyncQueue } from '../utils/rosterSyncQueue';
import { getUpcomingServiceDate } from '../utils/dateUtils';
import type { Language } from '../utils/i18n';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchRemoteChurchData,
  seedRemoteDatabase,
  upsertRemoteRoster,
  upsertRemoteCoworker,
  deleteRemoteCoworker,
  upsertRemoteService,
  subscribeToRealtimeChanges,
} from '../lib/supabaseSync';

interface ChurchContextType {
  churchState: ChurchState;
  activeService: ServiceDefinition;
  activeServiceId: string;
  setActiveServiceId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentRoster?: ServiceRoster;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  currentUser?: Coworker;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;

  // Authentication State
  isAuthenticated: boolean;
  authMethod: string;
  login: (method: 'google' | 'apple' | 'phone' | 'guest', coworker?: Coworker) => void;
  logout: () => void;

  // Role and Permission Modes (Member Read-Only vs Editor Mode)
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  toggleUserMode: () => void;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  toggleEditMode: () => void;

  getRostersForService: (serviceId: string) => ServiceRoster[];
  getUserSeasonAssignments: (coworkerId?: string) => Array<{
    roster: ServiceRoster;
    service: ServiceDefinition;
    roles: string[];
  }>;
  assignCoworker: (
    roleId: string,
    coworkerId: string,
    customDate?: string,
    customServiceId?: string
  ) => void;
  removeAssignment: (
    roleId: string,
    coworkerId: string,
    customDate?: string,
    customServiceId?: string
  ) => void;
  updateRosterMeta: (
    meta: Partial<Pick<ServiceRoster, 'theme' | 'speaker' | 'notes'>>,
    customDate?: string,
    customServiceId?: string
  ) => void;
  updateDutyNote: (
    roleId: string,
    note: string,
    customDate?: string,
    customServiceId?: string
  ) => void;
  addSpecialEvent: (
    event: string,
    customDate?: string,
    customServiceId?: string
  ) => void;
  removeSpecialEvent: (
    event: string,
    customDate?: string,
    customServiceId?: string
  ) => void;
  addSong: (
    song: Omit<WorshipSong, 'id'>,
    customDate?: string,
    customServiceId?: string
  ) => void;
  updateSong: (
    songId: string,
    updates: Partial<WorshipSong>,
    customDate?: string,
    customServiceId?: string
  ) => void;
  removeSong: (
    songId: string,
    customDate?: string,
    customServiceId?: string
  ) => void;
  addCoworker: (coworker: Omit<Coworker, 'id'>) => void;
  updateCoworker: (coworker: Coworker) => void;
  updateCurrentUserAvatar: (avatarDataUrl: string) => void;
  deleteCoworker: (id: string) => void;

  // Cross-department and Cross-service conflict detection
  getCoworkerDateConflicts: (coworkerId: string, date: string) => ConflictItem[];
  getCoworkerConflictRoles: (
    coworkerId: string,
    customDate?: string,
    customServiceId?: string
  ) => string[];

  updateService: (service: ServiceDefinition) => void;

  // Supabase cloud sync state
  syncStatus: 'offline' | 'connecting' | 'synced' | 'error';
  isCloudConnected: boolean;
  localSaveStatus: 'saved' | 'error';
  retryRosterSync: () => Promise<void>;
  undoRosterChange: () => void;
  canUndoRosterChange: boolean;

  // Identity selection onboarding
  isIdentityModalOpen: boolean;
  setIsIdentityModalOpen: (open: boolean) => void;
  hasClaimedIdentity: boolean;
  selectIdentity: (coworkerId: string) => void;

  exportBackup: () => void;
  importBackup: (jsonText: string) => boolean;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'calvary_staff_roster_data_v9';

const normalizeGroup = (grp: string): string => {
  if (!grp) return '同工';
  if (grp.includes('牧者') || grp.includes('教牧')) return '牧者';
  if (grp.includes('职青') || grp.includes('社青') || grp.includes('约书亚') || grp.includes('大卫')) return '职青';
  if (grp.includes('大专') || grp.includes('Fire4J') || grp.includes('Ignite') || grp.includes('青年')) return '大专';
  if (grp.includes('青少')) return '青少年';
  if (grp.includes('同工') || grp.includes('敬拜') || grp.includes('影音') || grp.includes('宣教') || grp.includes('保罗')) return '同工';
  return '同工';
};

const normalizeSongs = (songs?: WorshipSong[]): WorshipSong[] | undefined => {
  if (!songs) return undefined;
  return songs.map((s) => {
    let newCategory = s.category;
    if (s.category === '赞美') newCategory = '快歌';
    if (s.category === '敬拜') newCategory = '慢歌';

    let newNotes = s.notes;
    if (
      s.notes === '轻快进门' ||
      s.notes === '渐强祷告' ||
      s.notes === '配合呼召'
    ) {
      newNotes = undefined;
    }

    return {
      ...s,
      category: newCategory,
      notes: newNotes,
    };
  });
};

const mergeStateWithInitial = (saved: ChurchState): ChurchState => {
  // Ensure all initial roles exist, remove obsolete 'presider' (主席/司会), and update role titles
  const initialRoleMap = new Map(INITIAL_ROLES.map((r) => [r.id, r]));
  const mergedRoles = saved.roles
    .filter((r) => r.id !== 'presider')
    .map((r) => {
      const init = initialRoleMap.get(r.id);
      if (init) {
        return { ...r, name: init.name, shortName: init.shortName };
      }
      return r;
    });

  const existingRoleIds = new Set(mergedRoles.map((r) => r.id));
  for (const r of INITIAL_ROLES) {
    if (!existingRoleIds.has(r.id)) {
      mergedRoles.push(r);
    }
  }

  // Ensure all initial coworkers exist, purge legacy mock demo ids (cw_01 to cw_12), and strictly normalize groups
  const isLegacyMockId = (id: string) => /^cw_\d{2}$/.test(id);
  const initialCoworkerMap = new Map(INITIAL_COWORKERS.map((c) => [c.id, c]));
  const mergedCoworkers = saved.coworkers
    .filter((cw) => !isLegacyMockId(cw.id))
    .map((cw) => {
      const init = initialCoworkerMap.get(cw.id);
      const newGroup = init ? init.cellGroup : normalizeGroup(cw.cellGroup);
      const cleanQualified = (cw.qualifiedRoleIds || []).filter((rId) => rId !== 'presider');
      return {
        ...cw,
        cellGroup: newGroup,
        qualifiedRoleIds: cleanQualified,
      };
    });

  const existingCoworkerIds = new Set(mergedCoworkers.map((c) => c.id));
  for (const c of INITIAL_COWORKERS) {
    if (!existingCoworkerIds.has(c.id)) {
      mergedCoworkers.push(c);
    }
  }

  // Map legacy mock IDs in roster assignments to real CCCJB members
  const legacyIdRemap: Record<string, string> = {
    cw_01: 'cw_david',
    cw_02: 'cw_pastor_huang',
    cw_03: 'cw_qiuyi',
    cw_04: 'cw_wentian',
    cw_05: 'cw_yongyi',
    cw_06: 'cw_diana',
    cw_07: 'cw_selena',
    cw_08: 'cw_zongyan',
    cw_09: 'cw_wenhui',
    cw_10: 'cw_jiakai',
    cw_11: 'cw_baozhen',
    cw_12: 'cw_diana',
  };

  // Ensure all initial services have updated categories and normalized names (Fire4J)
  const mergedServices = INITIAL_SERVICES.map((initSvc) => {
    const found = saved.services?.find((s) => s.id === initSvc.id);
    if (found) {
      let name = found.name;
      let shortName = found.shortName;
      let time = found.time;
      let rehearsalTime = found.rehearsalTime;
      if (name.includes('青年崇拜') || name.includes('Ignite')) {
        name = 'Fire4J';
        shortName = 'Fire4J';
      }
      if (initSvc.id === 'sun_mandarin' && (time.includes('8:30') || time.includes('11:00 AM'))) {
        time = '10:30 AM';
        rehearsalTime = '9:30 AM 彩排调音';
      }
      return {
        ...initSvc,
        ...found,
        name,
        shortName,
        time,
        rehearsalTime,
        categoryIds: initSvc.categoryIds,
      };
    }
    return initSvc;
  });

  // Normalize song categories, clean placeholder notes, strip presider, and ensure YouTube links
  const cleanedSavedRosters: Record<string, ServiceRoster> = {};
  for (const [key, roster] of Object.entries(saved.rosters || {})) {
    // Remove presider assignment and remap legacy mock IDs
    const assignments: Record<string, string[]> = {};
    for (const [rId, ids] of Object.entries(roster.assignments || {})) {
      if (rId === 'presider') continue;
      const remappedIds = ids
        .map((id) => legacyIdRemap[id] || id)
        .filter((id) => existingCoworkerIds.has(id));
      if (remappedIds.length > 0) {
        assignments[rId] = remappedIds;
      }
    }

    // Enrich songs with YouTube URLs from INITIAL_ROSTERS
    const initRoster = INITIAL_ROSTERS[key];
    let songs = normalizeSongs(roster.songs);

    if (initRoster?.songs && initRoster.songs.length > 0) {
      const hasAnyYoutube = songs?.some((s) => !!s.youtubeUrl);
      if (!hasAnyYoutube || !songs || songs.length === 0) {
        songs = initRoster.songs;
      } else {
        // Match by title to inject youtubeUrl if missing
        const titleToUrl = new Map(initRoster.songs.map((s) => [s.title, s.youtubeUrl]));
        songs = songs.map((s) => ({
          ...s,
          youtubeUrl: s.youtubeUrl || titleToUrl.get(s.title),
        }));
      }
    }

    cleanedSavedRosters[key] = {
      ...roster,
      assignments,
      songs,
      speaker: roster.speaker === '讲员' ? '当天讲员' : roster.speaker,
    };
  }

  return {
    ...saved,
    churchName: INITIAL_STATE.churchName,
    shortName: INITIAL_STATE.shortName,
    services: mergedServices,
    roles: mergedRoles,
    coworkers: mergedCoworkers,
    rosters: {
      ...INITIAL_ROSTERS,
      ...cleanedSavedRosters,
    },
  };
};

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [churchState, setChurchState] = useState<ChurchState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return mergeStateWithInitial(JSON.parse(stored));
      }
      const storedV6 = localStorage.getItem('calvary_staff_roster_data_v6');
      if (storedV6) {
        return mergeStateWithInitial(JSON.parse(storedV6));
      }
      const storedV5 = localStorage.getItem('calvary_staff_roster_data_v5');
      if (storedV5) {
        return mergeStateWithInitial(JSON.parse(storedV5));
      }
      const storedV4 = localStorage.getItem('calvary_staff_roster_data_v4');
      if (storedV4) {
        return mergeStateWithInitial(JSON.parse(storedV4));
      }
      // Also check v1 migration
      const storedV1 = localStorage.getItem('calvary_staff_roster_data_v1');
      if (storedV1) {
        return mergeStateWithInitial(JSON.parse(storedV1));
      }
    } catch (e) {
      console.error('Failed to load stored church roster data', e);
    }
    return INITIAL_STATE;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('calvary_staff_lang') as Language) || 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('calvary_staff_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  // Dark/Light Appearance State (Auto-follow Device / System Scheme)
  const getSystemPrefersDark = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calvary_theme_mode');
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved as ThemeMode;
      }
    }
    return 'system'; // Default: Automatically follow device!
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calvary_theme_mode');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return getSystemPrefersDark();
    }
    return false;
  });

  // Automatically listen and react to device dark/light scheme changes in real-time
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyThemeMode = () => {
      if (themeMode === 'system') {
        setIsDarkMode(mediaQuery.matches);
      } else if (themeMode === 'dark') {
        setIsDarkMode(true);
      } else if (themeMode === 'light') {
        setIsDarkMode(false);
      }
    };

    applyThemeMode();

    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [themeMode]);

  // Synchronize root HTML class and dynamic theme-color meta tag
  useEffect(() => {
    const themeColor = isDarkMode ? '#000000' : '#ffffff';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute('content', themeColor));
  }, [isDarkMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('calvary_theme_mode', mode);
    if (mode === 'system') {
      setIsDarkMode(getSystemPrefersDark());
    } else {
      setIsDarkMode(mode === 'dark');
    }
  };

  const toggleDarkMode = () => {
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  // User Mode (Member Read-Only vs Editor Mode)
  const [userMode, setUserModeState] = useState<UserMode>(() => {
    return (localStorage.getItem('calvary_user_mode') as UserMode) || 'member';
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    return userMode === 'editor';
  });

  const setUserMode = (mode: UserMode) => {
    setUserModeState(mode);
    setIsEditMode(mode === 'editor');
    localStorage.setItem('calvary_user_mode', mode);
  };

  const toggleUserMode = () => {
    setUserMode(userMode === 'member' ? 'editor' : 'member');
  };

  const toggleEditMode = () => {
    const nextEdit = !isEditMode;
    setIsEditMode(nextEdit);
    setUserModeState(nextEdit ? 'editor' : 'member');
    localStorage.setItem('calvary_user_mode', nextEdit ? 'editor' : 'member');
  };

  const [activeServiceId, setActiveServiceId] = useState<string>(
    churchState.services[0]?.id || 'sun_mandarin'
  );

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlUserId = params.get('user') || params.get('u');
      if (urlUserId) {
        localStorage.setItem('calvary_current_user_id', urlUserId);
        return urlUserId;
      }
      const urlName = params.get('name');
      if (urlName) {
        const query = urlName.trim().toLowerCase();
        const found = INITIAL_COWORKERS.find(
          (c) =>
            c.name.toLowerCase() === query ||
            c.englishName.toLowerCase() === query ||
            c.id.toLowerCase() === query
        );
        if (found) {
          localStorage.setItem('calvary_current_user_id', found.id);
          return found.id;
        }
      }
    } catch {
      // Non-browser fallback
    }

    const savedId = localStorage.getItem('calvary_current_user_id');
    if (savedId && !savedId.startsWith('cw_0')) {
      return savedId;
    }
    return 'cw_selena';
  });

  // Automatically persist current identity to localStorage
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('calvary_current_user_id', currentUserId);
    }
  }, [currentUserId]);

  const [hasClaimedIdentity, setHasClaimedIdentity] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('user') || params.get('u') || params.get('name')) {
        return true;
      }
      return Boolean(localStorage.getItem('calvary_current_user_id'));
    } catch {
      return true;
    }
  });

  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState<boolean>(() => {
    return !hasClaimedIdentity;
  });

  const selectIdentity = (coworkerId: string) => {
    setCurrentUserId(coworkerId);
    setHasClaimedIdentity(true);
    setIsIdentityModalOpen(false);
    localStorage.setItem('calvary_current_user_id', coworkerId);
  };

  const activeService =
    churchState.services.find((s) => s.id === activeServiceId) || churchState.services[0];

  const currentUser: Coworker =
    churchState.coworkers.find((c) => c.id === currentUserId) ||
    (currentUserId === 'cw_guest'
      ? {
          id: 'cw_guest',
          name: language === 'zh' ? '主内肢体' : 'Guest',
          englishName: 'Guest',
          phone: '',
          cellGroup: language === 'zh' ? '访客' : 'Visitor',
          qualifiedRoleIds: [],
          active: true,
        }
      : churchState.coworkers[0]);

  // Authentication State (Google, Apple, Phone)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('calvary_is_authenticated') === 'true';
  });

  const [authMethod, setAuthMethod] = useState<string>(() => {
    return localStorage.getItem('calvary_auth_method') || 'phone';
  });

  const login = (method: 'google' | 'apple' | 'phone' | 'guest', coworker?: Coworker) => {
    setIsAuthenticated(true);
    setAuthMethod(method);
    localStorage.setItem('calvary_is_authenticated', 'true');
    localStorage.setItem('calvary_auth_method', method);
    if (coworker) {
      setCurrentUserId(coworker.id);
      localStorage.setItem('calvary_current_user_id', coworker.id);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('calvary_is_authenticated', 'false');
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getUpcomingServiceDate(activeService.weekday);
  });

  // When active service changes, update date to the next occurrence of that service's weekday
  useEffect(() => {
    setSelectedDate(getUpcomingServiceDate(activeService.weekday));
  }, [activeServiceId, activeService.weekday]);

  const [localSaveStatus, setLocalSaveStatus] = useState<'saved' | 'error'>('saved');
  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(churchState));
      setLocalSaveStatus('saved');
    } catch (e) {
      setLocalSaveStatus('error');
      console.error('Failed to save church roster data', e);
    }
  }, [churchState]);

  const [syncStatus, setSyncStatus] = useState<'offline' | 'connecting' | 'synced' | 'error'>(() =>
    isSupabaseConfigured() ? 'connecting' : 'offline'
  );
  const churchStateRef = React.useRef(churchState);
  useEffect(() => { churchStateRef.current = churchState; }, [churchState]);
  const [undoEntry, setUndoEntry] = useState<{ before: ServiceRoster; after: ServiceRoster } | null>(null);
  useEffect(() => {
    if (!undoEntry) return;
    const timer = window.setTimeout(() => setUndoEntry(null), 10000);
    return () => window.clearTimeout(timer);
  }, [undoEntry]);

  const editedRosterIds = React.useRef(new Set<string>());
  const [rosterQueue] = useState(() => {
    let initial: ServiceRoster[] = [];
    try {
      const ids: unknown = JSON.parse(localStorage.getItem('calvary_pending_rosters') || '[]');
      if (Array.isArray(ids)) initial = ids.filter((id): id is string => typeof id === 'string')
        .map((id) => churchState.rosters[id]).filter(Boolean);
    } catch { /* Ignore invalid pending metadata, preserve roster data. */ }
    return new RosterSyncQueue({
      initial,
      write: upsertRemoteRoster,
      onStatus: setSyncStatus,
      onPending: (pending) => {
        try { localStorage.setItem('calvary_pending_rosters', JSON.stringify(pending.map((r) => r.id))); }
        catch { setLocalSaveStatus('error'); }
      },
    });
  });
  const retryRosterSync = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(churchStateRef.current));
      setLocalSaveStatus('saved');
    } catch { setLocalSaveStatus('error'); return; }
    if (!isSupabaseConfigured()) return;
    if (rosterQueue.snapshot().length) await rosterQueue.flush();
    else {
      setSyncStatus('connecting');
      const data = await fetchRemoteChurchData();
      setSyncStatus(data ? 'synced' : 'error');
    }
  };

  const persistRoster = (roster: ServiceRoster) => {
    editedRosterIds.current.add(roster.id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(churchStateRef.current));
      setLocalSaveStatus('saved');
    } catch { setLocalSaveStatus('error'); }
    if (isSupabaseConfigured()) void rosterQueue.enqueue(roster);
  };
  const canUndoRosterChange = !!undoEntry && (churchState.rosters[undoEntry.after.id] === undoEntry.after || Date.parse(churchState.rosters[undoEntry.after.id]?.updatedAt || '') === Date.parse(undoEntry.after.updatedAt || ''));
  const undoRosterChange = () => {
    if (!undoEntry) return;
    const current = churchStateRef.current.rosters[undoEntry.after.id];
    if (current !== undoEntry.after && Date.parse(current?.updatedAt || '') !== Date.parse(undoEntry.after.updatedAt || '')) return;
    const restored = { ...undoEntry.before, updatedAt: new Date().toISOString() };
    const next = { ...churchStateRef.current, rosters: { ...churchStateRef.current.rosters, [restored.id]: restored } };
    churchStateRef.current = next;
    setChurchState(next);
    setUndoEntry(null);
    persistRoster(restored);
  };

  // Initialize Supabase Cloud Sync & Realtime Listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    const initCloud = async () => {
      setSyncStatus('connecting');
      try {
        const remoteData = await fetchRemoteChurchData();
        if (!isMounted) return;

        if (remoteData) {
          const hasRemoteData =
            remoteData.coworkers.length > 0 ||
            remoteData.services.length > 0 ||
            Object.keys(remoteData.rosters).length > 0;

          if (!hasRemoteData) {
            // Cloud tables exist but are empty -> seed initial data automatically
            const seeded = await seedRemoteDatabase(churchStateRef.current);
            if (!seeded) { setSyncStatus('error'); return; }
          } else {
            // Remote has data -> merge into local state
            setChurchState((prev) => ({
              ...prev,
              coworkers: remoteData.coworkers.length > 0 ? remoteData.coworkers : prev.coworkers,
              services: remoteData.services.length > 0 ? remoteData.services : prev.services,
              rosters:
                Object.keys(remoteData.rosters).length > 0
                  ? { ...prev.rosters, ...Object.fromEntries(Object.entries(remoteData.rosters).filter(([id]) => !rosterQueue.has(id) && !editedRosterIds.current.has(id))) }
                  : prev.rosters,
            }));
          }
          setSyncStatus('synced');
          await rosterQueue.flush();
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Failed to sync with Supabase', err);
        if (isMounted) setSyncStatus('error');
      }
    };

    initCloud();

    // Real-time synchronization subscription
    const unsubscribe = subscribeToRealtimeChanges({
      onRosterChange: (updatedRoster) => {
        if (rosterQueue.has(updatedRoster.id)) return;
        setChurchState((prev) => ({
          ...prev,
          rosters: {
            ...prev.rosters,
            [updatedRoster.id]: updatedRoster,
          },
        }));
      },
      onCoworkerChange: (updatedCoworker) => {
        setChurchState((prev) => {
          const exists = prev.coworkers.some((c) => c.id === updatedCoworker.id);
          return {
            ...prev,
            coworkers: exists
              ? prev.coworkers.map((c) => (c.id === updatedCoworker.id ? updatedCoworker : c))
              : [...prev.coworkers, updatedCoworker],
          };
        });
      },
      onCoworkerDelete: (deletedCoworkerId) => {
        setChurchState((prev) => ({
          ...prev,
          coworkers: prev.coworkers.filter((c) => c.id !== deletedCoworkerId),
        }));
      },
      onServiceChange: (updatedService) => {
        setChurchState((prev) => ({
          ...prev,
          services: prev.services.map((s) => (s.id === updatedService.id ? updatedService : s)),
        }));
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [rosterQueue]);

  const rosterKey = `${selectedDate}_${activeServiceId}`;
  const currentRoster = churchState.rosters[rosterKey];

  const getRostersForService = (serviceId: string): ServiceRoster[] => {
    return Object.values(churchState.rosters)
      .filter((r) => r.serviceId === serviceId)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getUserSeasonAssignments = (coworkerId?: string) => {
    const targetId = coworkerId || currentUserId;
    if (!targetId) return [];

    const assignments: Array<{
      roster: ServiceRoster;
      service: ServiceDefinition;
      roles: string[];
    }> = [];

    const serviceMap = new Map(churchState.services.map((s) => [s.id, s]));
    const roleMap = new Map(churchState.roles.map((r) => [r.id, r]));

    const sortedRosters = Object.values(churchState.rosters).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    for (const roster of sortedRosters) {
      const myRoles: string[] = [];
      for (const [roleId, ids] of Object.entries(roster.assignments)) {
        if (ids.includes(targetId)) {
          const roleDef = roleMap.get(roleId);
          if (roleDef) {
            myRoles.push(roleDef.name);
          }
        }
      }

      if (myRoles.length > 0) {
        const service = serviceMap.get(roster.serviceId);
        if (service) {
          assignments.push({
            roster,
            service,
            roles: myRoles,
          });
        }
      }
    }

    return assignments;
  };

  const ensureRoster = (
    state: ChurchState,
    date: string,
    serviceId: string
  ): { state: ChurchState; roster: ServiceRoster; key: string } => {
    const key = `${date}_${serviceId}`;
    if (state.rosters[key]) {
      return { state, roster: state.rosters[key], key };
    }

    const newRoster: ServiceRoster = {
      id: key,
      serviceId,
      date,
      assignments: {},
      updatedAt: new Date().toISOString(),
    };

    return {
      state: {
        ...state,
        rosters: {
          ...state.rosters,
          [key]: newRoster,
        },
      },
      roster: newRoster,
      key,
    };
  };

  const mutateRoster = (
    targetDate: string,
    targetSvcId: string,
    updater: (roster: ServiceRoster) => ServiceRoster | null
  ) => {
    const prev = churchStateRef.current;
    const { state, roster, key } = ensureRoster(prev, targetDate, targetSvcId);
    const updated = updater(roster);
    if (!updated) return;
    const finalRoster = { ...updated, updatedAt: new Date().toISOString() };
    const next = { ...state, rosters: { ...state.rosters, [key]: finalRoster } };
    churchStateRef.current = next;
    setChurchState(next);
    setUndoEntry({ before: roster, after: finalRoster });
    persistRoster(finalRoster);
  };

  const assignCoworker = (
    roleId: string,
    coworkerId: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => {
      const currentList = roster.assignments[roleId] || [];
      if (currentList.includes(coworkerId)) return null;
      return {
        ...roster,
        assignments: {
          ...roster.assignments,
          [roleId]: [...currentList, coworkerId],
        },
      };
    });
  };

  const removeAssignment = (
    roleId: string,
    coworkerId: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => {
      const currentList = roster.assignments[roleId] || [];
      return {
        ...roster,
        assignments: {
          ...roster.assignments,
          [roleId]: currentList.filter((id) => id !== coworkerId),
        },
      };
    });
  };

  const updateRosterMeta = (
    meta: Partial<Pick<ServiceRoster, 'theme' | 'speaker' | 'notes'>>,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => ({
      ...roster,
      ...meta,
    }));
  };

  const updateDutyNote = (
    roleId: string,
    note: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => ({
      ...roster,
      dutyNotes: {
        ...(roster.dutyNotes || {}),
        [roleId]: note.trim(),
      },
    }));
  };

  const addSpecialEvent = (
    event: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    const cleanEvent = event.trim();
    if (!cleanEvent) return;
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => {
      const currentEvents = roster.specialEvents || [];
      if (currentEvents.includes(cleanEvent)) return null;
      return {
        ...roster,
        specialEvents: [...currentEvents, cleanEvent],
      };
    });
  };

  const removeSpecialEvent = (
    event: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => {
      if (!roster.specialEvents) return null;
      return {
        ...roster,
        specialEvents: roster.specialEvents.filter((e) => e !== event),
      };
    });
  };

  const addSong = (
    song: Omit<WorshipSong, 'id'>,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    const newSong: WorshipSong = {
      ...song,
      id: `song_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    mutateRoster(targetDate, targetSvcId, (roster) => ({
      ...roster,
      songs: [...(roster.songs || []), newSong],
    }));
  };

  const updateSong = (
    songId: string,
    updates: Partial<WorshipSong>,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => {
      if (!roster.songs) return null;
      return {
        ...roster,
        songs: roster.songs.map((s) => (s.id === songId ? { ...s, ...updates } : s)),
      };
    });
  };

  const removeSong = (
    songId: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    const targetDate = customDate || selectedDate;
    const targetSvcId = customServiceId || activeServiceId;
    mutateRoster(targetDate, targetSvcId, (roster) => {
      if (!roster.songs) return null;
      return {
        ...roster,
        songs: roster.songs.filter((s) => s.id !== songId),
      };
    });
  };

  const addCoworker = (coworkerData: Omit<Coworker, 'id'>) => {
    const newCoworker: Coworker = {
      ...coworkerData,
      id: `cw_${Date.now().toString(36)}`,
    };

    setChurchState((prev) => ({
      ...prev,
      coworkers: [...prev.coworkers, newCoworker],
    }));
    upsertRemoteCoworker(newCoworker);
  };

  const updateCoworker = (coworker: Coworker) => {
    setChurchState((prev) => ({
      ...prev,
      coworkers: prev.coworkers.map((cw) => (cw.id === coworker.id ? coworker : cw)),
    }));
    upsertRemoteCoworker(coworker);
  };

  const updateCurrentUserAvatar = (avatarDataUrl: string) => {
    if (!currentUser || currentUser.id === 'cw_guest') return;
    updateCoworker({ ...currentUser, avatar: avatarDataUrl });
  };

  const deleteCoworker = (id: string) => {
    setChurchState((prev) => ({
      ...prev,
      coworkers: prev.coworkers.filter((cw) => cw.id !== id),
    }));
    deleteRemoteCoworker(id);
  };

  // Cross-department and cross-service conflict detection
  const getCoworkerDateConflicts = (coworkerId: string, date: string): ConflictItem[] => {
    const conflicts: ConflictItem[] = [];
    const serviceMap = new Map(churchState.services.map((s) => [s.id, s]));
    const roleMap = new Map(churchState.roles.map((r) => [r.id, r]));

    for (const roster of Object.values(churchState.rosters)) {
      if (roster.date === date) {
        const service = serviceMap.get(roster.serviceId);
        const serviceName = service ? service.name : roster.serviceId;

        for (const [roleId, ids] of Object.entries(roster.assignments)) {
          if (ids.includes(coworkerId)) {
            const role = roleMap.get(roleId);
            conflicts.push({
              serviceId: roster.serviceId,
              serviceName,
              roleId,
              roleName: role ? role.name : roleId,
              date,
            });
          }
        }
      }
    }
    return conflicts;
  };

  const getCoworkerConflictRoles = (
    coworkerId: string,
    customDate?: string,
    _customServiceId?: string
  ): string[] => {
    const targetDate = customDate || selectedDate;
    const dateConflicts = getCoworkerDateConflicts(coworkerId, targetDate);
    return dateConflicts.map((c) => `${c.serviceName} / ${c.roleName}`);
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(churchState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `加略山社区教会_服事表备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.churchName && Array.isArray(parsed.services) && Array.isArray(parsed.coworkers)) {
        setChurchState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  };

  const updateService = (updatedService: ServiceDefinition) => {
    setChurchState((prev) => ({
      ...prev,
      services: prev.services.map((svc) =>
        svc.id === updatedService.id ? updatedService : svc
      ),
    }));
    upsertRemoteService(updatedService);
  };

  const resetToDefault = () => {
    if (window.confirm('确定要恢复初始示例数据吗？本地已录入的更改将被替换。')) {
      setChurchState(INITIAL_STATE);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('calvary_staff_roster_data_v8');
      localStorage.removeItem('calvary_staff_roster_data_v7');
      localStorage.removeItem('calvary_staff_roster_data_v6');
      localStorage.removeItem('calvary_staff_roster_data_v5');
      localStorage.removeItem('calvary_staff_roster_data_v4');
      localStorage.removeItem('calvary_staff_roster_data_v1');
    }
  };

  return (
    <ChurchContext.Provider
      value={{
        churchState,
        activeService,
        activeServiceId,
        setActiveServiceId,
        selectedDate,
        setSelectedDate,
        currentRoster,
        currentUserId,
        setCurrentUserId,
        currentUser,
        isAuthenticated,
        authMethod,
        login,
        logout,
        language,
        setLanguage,
        toggleLanguage,
        isDarkMode,
        themeMode,
        setThemeMode,
        toggleDarkMode,
        userMode,
        setUserMode,
        toggleUserMode,
        isEditMode,
        setIsEditMode,
        toggleEditMode,
        getRostersForService,
        getUserSeasonAssignments,
        assignCoworker,
        removeAssignment,
        updateRosterMeta,
        updateDutyNote,
        addSpecialEvent,
        removeSpecialEvent,
        addSong,
        updateSong,
        removeSong,
        addCoworker,
        updateCoworker,
        updateCurrentUserAvatar,
        deleteCoworker,
        updateService,
        syncStatus,
        localSaveStatus,
        retryRosterSync,
        undoRosterChange,
        canUndoRosterChange,
        isCloudConnected: syncStatus === 'synced',
        isIdentityModalOpen,
        setIsIdentityModalOpen,
        hasClaimedIdentity,
        selectIdentity,
        getCoworkerDateConflicts,
        getCoworkerConflictRoles,
        exportBackup,
        importBackup,
        resetToDefault,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};
