import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChurchState, ServiceRoster, Coworker, ServiceDefinition } from '../types';
import { INITIAL_STATE } from '../data/initialData';
import { getUpcomingServiceDate } from '../utils/dateUtils';
import type { Language } from '../utils/i18n';

interface ChurchContextType {
  churchState: ChurchState;
  activeService: ServiceDefinition;
  activeServiceId: string;
  setActiveServiceId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentRoster: ServiceRoster | undefined;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  currentUser: Coworker | undefined;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  toggleEditMode: () => void;
  getRostersForService: (serviceId: string) => ServiceRoster[];
  getUserSeasonAssignments: (coworkerId?: string) => Array<{
    roster: ServiceRoster;
    service: ServiceDefinition;
    roles: string[];
  }>;
  assignCoworker: (roleId: string, coworkerId: string, customDate?: string, customServiceId?: string) => void;
  removeAssignment: (roleId: string, coworkerId: string, customDate?: string, customServiceId?: string) => void;
  updateRosterMeta: (patch: { theme?: string; speaker?: string; notes?: string }, customDate?: string, customServiceId?: string) => void;
  addSpecialEvent: (eventName: string, customDate?: string, customServiceId?: string) => void;
  removeSpecialEvent: (eventName: string, customDate?: string, customServiceId?: string) => void;
  addCoworker: (coworker: Omit<Coworker, 'id'>) => void;
  updateCoworker: (coworker: Coworker) => void;
  updateCurrentUserAvatar: (avatarDataUrl: string) => void;
  deleteCoworker: (id: string) => void;
  getCoworkerConflictRoles: (coworkerId: string, customDate?: string, customServiceId?: string) => string[];
  exportBackup: () => void;
  importBackup: (jsonText: string) => boolean;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'calvary_staff_roster_data_v1';

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [churchState, setChurchState] = useState<ChurchState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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

  const [activeServiceId, setActiveServiceId] = useState<string>(
    churchState.services[0]?.id || 'sun_mandarin'
  );

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('calvary_current_user_id') || 'cw_01';
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  useEffect(() => {
    localStorage.setItem('calvary_current_user_id', currentUserId);
  }, [currentUserId]);

  const currentUser =
    churchState.coworkers.find((c) => c.id === currentUserId) || churchState.coworkers[0];

  const activeService =
    churchState.services.find((s) => s.id === activeServiceId) || churchState.services[0];

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getUpcomingServiceDate(activeService.weekday);
  });

  // When active service changes, update date to the next occurrence of that service's weekday
  useEffect(() => {
    setSelectedDate(getUpcomingServiceDate(activeService.weekday));
  }, [activeServiceId]);

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
    const list = Object.values(churchState.rosters).filter((r) => r.serviceId === serviceId);
    return list.sort((a, b) => a.date.localeCompare(b.date));
  };

  const getUserSeasonAssignments = (coworkerId = currentUserId) => {
    const results: Array<{
      roster: ServiceRoster;
      service: ServiceDefinition;
      roles: string[];
    }> = [];

    const roleMap = new Map(churchState.roles.map((r) => [r.id, r.name]));
    const serviceMap = new Map(churchState.services.map((s) => [s.id, s]));

    // Sort all rosters by date
    const allRosters = Object.values(churchState.rosters).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    for (const r of allRosters) {
      const assignedRoles: string[] = [];
      for (const [roleId, ids] of Object.entries(r.assignments)) {
        if (ids.includes(coworkerId)) {
          const roleName = roleMap.get(roleId) || roleId;
          assignedRoles.push(roleName);
        }
      }

      if (assignedRoles.length > 0) {
        const svc = serviceMap.get(r.serviceId);
        if (svc) {
          results.push({
            roster: r,
            service: svc,
            roles: assignedRoles,
          });
        }
      }
    }

    return results;
  };

  const ensureRoster = (
    state: ChurchState,
    targetDate = selectedDate,
    targetServiceId = activeServiceId
  ): { state: ChurchState; roster: ServiceRoster; key: string } => {
    const key = `${targetDate}_${targetServiceId}`;
    const existing = state.rosters[key];
    if (existing) {
      return { state, roster: existing, key };
    }
    const newRoster: ServiceRoster = {
      id: key,
      serviceId: targetServiceId,
      date: targetDate,
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
    patch: { theme?: string; speaker?: string; notes?: string },
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const { state, roster, key } = ensureRoster(
        prev,
        customDate || selectedDate,
        customServiceId || activeServiceId
      );
      const updatedRoster: ServiceRoster = {
        ...roster,
        ...patch,
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
    eventName: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    if (!eventName.trim()) return;
    setChurchState((prev) => {
      const { state, roster, key } = ensureRoster(
        prev,
        customDate || selectedDate,
        customServiceId || activeServiceId
      );
      const events = roster.specialEvents || [];
      if (events.includes(eventName.trim())) return prev;

      const updatedRoster: ServiceRoster = {
        ...roster,
        specialEvents: [...events, eventName.trim()],
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
    eventName: string,
    customDate?: string,
    customServiceId?: string
  ) => {
    setChurchState((prev) => {
      const key = `${customDate || selectedDate}_${customServiceId || activeServiceId}`;
      const roster = prev.rosters[key];
      if (!roster || !roster.specialEvents) return prev;

      const updatedRoster: ServiceRoster = {
        ...roster,
        specialEvents: roster.specialEvents.filter((e) => e !== eventName),
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
    const newId = `cw_${Date.now()}`;
    const newCoworker: Coworker = {
      ...coworkerData,
      id: newId,
    };
    setChurchState((prev) => ({
      ...prev,
      coworkers: [newCoworker, ...prev.coworkers],
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

  const getCoworkerConflictRoles = (
    coworkerId: string,
    customDate?: string,
    customServiceId?: string
  ): string[] => {
    const key = `${customDate || selectedDate}_${customServiceId || activeServiceId}`;
    const targetRoster = churchState.rosters[key];
    if (!targetRoster) return [];
    const rolesAssigned: string[] = [];
    for (const [roleId, ids] of Object.entries(targetRoster.assignments)) {
      if (ids.includes(coworkerId)) {
        const roleDef = churchState.roles.find((r) => r.id === roleId);
        if (roleDef) rolesAssigned.push(roleDef.name);
      }
    }
    return rolesAssigned;
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
        isEditMode,
        setIsEditMode,
        toggleEditMode,
        getRostersForService,
        getUserSeasonAssignments,
        assignCoworker,
        removeAssignment,
        updateRosterMeta,
        addSpecialEvent,
        removeSpecialEvent,
        addCoworker,
        updateCoworker,
        updateCurrentUserAvatar,
        deleteCoworker,
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
