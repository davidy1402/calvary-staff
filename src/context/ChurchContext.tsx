import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ChurchState,
  ServiceDefinition,
  ServiceRoster,
  Coworker,
  UserMode,
  ConflictItem,
  WorshipSong,
} from '../types';
import {
  INITIAL_STATE,
  INITIAL_ROLES,
  INITIAL_COWORKERS,
  INITIAL_SERVICES,
  INITIAL_ROSTERS,
} from '../data/initialData';
import { getUpcomingServiceDate } from '../utils/dateUtils';
import type { Language } from '../utils/i18n';

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
  toggleDarkMode: () => void;

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

  exportBackup: () => void;
  importBackup: (jsonText: string) => boolean;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'calvary_staff_roster_data_v7';

const normalizeGroup = (grp: string): string => {
  if (grp.includes('牧者') || grp.includes('教牧')) return '牧者';
  if (grp.includes('职青') || grp.includes('社青') || grp.includes('约书亚') || grp.includes('大卫')) return '职青';
  if (grp.includes('大专') || grp.includes('Fire4J')) return '大专';
  if (grp.includes('青少')) return '青少年';
  if (grp.includes('同工') || grp.includes('敬拜') || grp.includes('影音') || grp.includes('宣教')) return '同工';
  return grp || '同工';
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

  // Ensure all initial coworkers exist and normalize group names to 职青/大专/青少年/牧者/同工
  const initialCoworkerMap = new Map(INITIAL_COWORKERS.map((c) => [c.id, c]));
  const mergedCoworkers = saved.coworkers.map((cw) => {
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

  // Ensure all initial services have updated categories
  const mergedServices = INITIAL_SERVICES.map((initSvc) => {
    const found = saved.services.find((s) => s.id === initSvc.id);
    return found ? { ...initSvc, ...found, categoryIds: initSvc.categoryIds } : initSvc;
  });

  // Normalize song categories, clean placeholder notes, strip presider, and ensure YouTube links
  const cleanedSavedRosters: Record<string, ServiceRoster> = {};
  for (const [key, roster] of Object.entries(saved.rosters || {})) {
    // Remove presider assignment
    const assignments = { ...roster.assignments };
    delete assignments['presider'];

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

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calvary_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('calvary_theme', 'dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#000000');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('calvary_theme', 'light');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#1e3a8a');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

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
    return localStorage.getItem('calvary_current_user_id') || 'cw_selena';
  });

  const activeService =
    churchState.services.find((s) => s.id === activeServiceId) || churchState.services[0];

  const currentUser = churchState.coworkers.find((c) => c.id === currentUserId);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getUpcomingServiceDate(activeService.weekday);
  });

  // When active service changes, update date to the next occurrence of that service's weekday
  useEffect(() => {
    setSelectedDate(getUpcomingServiceDate(activeService.weekday));
  }, [activeServiceId, activeService.weekday]);

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(churchState));
    } catch (e) {
      console.error('Failed to save church roster data', e);
    }
  }, [churchState]);

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

  const assignCoworker = (
    roleId: string,
    coworkerId: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const targetDate = customDate || selectedDate;
      const targetSvcId = customServiceId || activeServiceId;
      const { state, roster, key } = ensureRoster(prev, targetDate, targetSvcId);

      const currentList = roster.assignments[roleId] || [];
      if (currentList.includes(coworkerId)) return prev;

      const updatedRoster: ServiceRoster = {
        ...roster,
        assignments: {
          ...roster.assignments,
          [roleId]: [...currentList, coworkerId],
        },
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        rosters: {
          ...state.rosters,
          [key]: updatedRoster,
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
    setChurchState((prev) => {
      const key = `${customDate || selectedDate}_${customServiceId || activeServiceId}`;
      const roster = prev.rosters[key];
      if (!roster) return prev;

      const currentList = roster.assignments[roleId] || [];
      const updatedList = currentList.filter((id) => id !== coworkerId);

      const updatedRoster: ServiceRoster = {
        ...roster,
        assignments: {
          ...roster.assignments,
          [roleId]: updatedList,
        },
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        rosters: {
          ...prev.rosters,
          [key]: updatedRoster,
        },
      };
    });
  };

  const updateRosterMeta = (
    meta: Partial<Pick<ServiceRoster, 'theme' | 'speaker' | 'notes'>>,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const targetDate = customDate || selectedDate;
      const targetSvcId = customServiceId || activeServiceId;
      const { state, roster, key } = ensureRoster(prev, targetDate, targetSvcId);

      const updatedRoster: ServiceRoster = {
        ...roster,
        ...meta,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        rosters: {
          ...state.rosters,
          [key]: updatedRoster,
        },
      };
    });
  };

  const updateDutyNote = (
    roleId: string,
    note: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const targetDate = customDate || selectedDate;
      const targetSvcId = customServiceId || activeServiceId;
      const { state, roster, key } = ensureRoster(prev, targetDate, targetSvcId);

      const updatedRoster: ServiceRoster = {
        ...roster,
        dutyNotes: {
          ...(roster.dutyNotes || {}),
          [roleId]: note.trim(),
        },
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        rosters: {
          ...state.rosters,
          [key]: updatedRoster,
        },
      };
    });
  };

  const addSpecialEvent = (
    event: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    const cleanEvent = event.trim();
    if (!cleanEvent) return;

    setChurchState((prev) => {
      const targetDate = customDate || selectedDate;
      const targetSvcId = customServiceId || activeServiceId;
      const { state, roster, key } = ensureRoster(prev, targetDate, targetSvcId);

      const currentEvents = roster.specialEvents || [];
      if (currentEvents.includes(cleanEvent)) return prev;

      const updatedRoster: ServiceRoster = {
        ...roster,
        specialEvents: [...currentEvents, cleanEvent],
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        rosters: {
          ...state.rosters,
          [key]: updatedRoster,
        },
      };
    });
  };

  const removeSpecialEvent = (
    event: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const key = `${customDate || selectedDate}_${customServiceId || activeServiceId}`;
      const roster = prev.rosters[key];
      if (!roster || !roster.specialEvents) return prev;

      const updatedRoster: ServiceRoster = {
        ...roster,
        specialEvents: roster.specialEvents.filter((e) => e !== event),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        rosters: {
          ...prev.rosters,
          [key]: updatedRoster,
        },
      };
    });
  };

  const addSong = (
    song: Omit<WorshipSong, 'id'>,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const targetDate = customDate || selectedDate;
      const targetSvcId = customServiceId || activeServiceId;
      const { state, roster, key } = ensureRoster(prev, targetDate, targetSvcId);

      const existingSongs = roster.songs || [];
      const newSong: WorshipSong = {
        ...song,
        id: `song_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      };

      const updatedRoster: ServiceRoster = {
        ...roster,
        songs: [...existingSongs, newSong],
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        rosters: {
          ...state.rosters,
          [key]: updatedRoster,
        },
      };
    });
  };

  const updateSong = (
    songId: string,
    updates: Partial<WorshipSong>,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const key = `${customDate || selectedDate}_${customServiceId || activeServiceId}`;
      const roster = prev.rosters[key];
      if (!roster || !roster.songs) return prev;

      const updatedRoster: ServiceRoster = {
        ...roster,
        songs: roster.songs.map((s) => (s.id === songId ? { ...s, ...updates } : s)),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        rosters: {
          ...prev.rosters,
          [key]: updatedRoster,
        },
      };
    });
  };

  const removeSong = (
    songId: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const key = `${customDate || selectedDate}_${customServiceId || activeServiceId}`;
      const roster = prev.rosters[key];
      if (!roster || !roster.songs) return prev;

      const updatedRoster: ServiceRoster = {
        ...roster,
        songs: roster.songs.filter((s) => s.id !== songId),
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        rosters: {
          ...prev.rosters,
          [key]: updatedRoster,
        },
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
  };

  const updateCoworker = (coworker: Coworker) => {
    setChurchState((prev) => ({
      ...prev,
      coworkers: prev.coworkers.map((cw) => (cw.id === coworker.id ? coworker : cw)),
    }));
  };

  const updateCurrentUserAvatar = (avatarDataUrl: string) => {
    if (!currentUser) return;
    updateCoworker({ ...currentUser, avatar: avatarDataUrl });
  };

  const deleteCoworker = (id: string) => {
    setChurchState((prev) => ({
      ...prev,
      coworkers: prev.coworkers.filter((cw) => cw.id !== id),
    }));
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

  const resetToDefault = () => {
    if (window.confirm('确定要恢复初始示例数据吗？本地已录入的更改将被替换。')) {
      setChurchState(INITIAL_STATE);
      localStorage.removeItem(STORAGE_KEY);
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
        language,
        setLanguage,
        toggleLanguage,
        isDarkMode,
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
