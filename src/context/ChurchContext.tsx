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

const STORAGE_KEY = 'calvary_staff_roster_data_v4';

const mergeStateWithInitial = (saved: ChurchState): ChurchState => {
  // Ensure all initial roles exist
  const existingRoleIds = new Set(saved.roles.map((r) => r.id));
  const mergedRoles = [
    ...saved.roles,
    ...INITIAL_ROLES.filter((r) => !existingRoleIds.has(r.id)),
  ];

  // Ensure all initial coworkers exist
  const existingCoworkerIds = new Set(saved.coworkers.map((c) => c.id));
  const mergedCoworkers = [
    ...saved.coworkers,
    ...INITIAL_COWORKERS.filter((c) => !existingCoworkerIds.has(c.id)),
  ];

  // Ensure all initial services have updated categories
  const mergedServices = INITIAL_SERVICES.map((initSvc) => {
    const found = saved.services.find((s) => s.id === initSvc.id);
    return found ? { ...initSvc, ...found, categoryIds: initSvc.categoryIds } : initSvc;
  });

  return {
    ...saved,
    churchName: INITIAL_STATE.churchName,
    shortName: INITIAL_STATE.shortName,
    services: mergedServices,
    roles: mergedRoles,
    coworkers: mergedCoworkers,
    rosters: {
      ...INITIAL_ROSTERS,
      ...saved.rosters,
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
