import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChurchState, ServiceRoster, Coworker, ServiceDefinition } from '../types';
import { INITIAL_STATE } from '../data/initialData';
import { getUpcomingServiceDate } from '../utils/dateUtils';

interface ChurchContextType {
  churchState: ChurchState;
  activeService: ServiceDefinition;
  activeServiceId: string;
  setActiveServiceId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentRoster: ServiceRoster | undefined;
  assignCoworker: (roleId: string, coworkerId: string) => void;
  removeAssignment: (roleId: string, coworkerId: string) => void;
  updateRosterMeta: (patch: { theme?: string; speaker?: string; notes?: string }) => void;
  addCoworker: (coworker: Omit<Coworker, 'id'>) => void;
  updateCoworker: (coworker: Coworker) => void;
  deleteCoworker: (id: string) => void;
  getCoworkerConflictRoles: (coworkerId: string) => string[];
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

  const [activeServiceId, setActiveServiceId] = useState<string>(
    churchState.services[0]?.id || 'sun_mandarin'
  );

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

  const ensureRoster = (state: ChurchState): { state: ChurchState; roster: ServiceRoster } => {
    const existing = state.rosters[rosterKey];
    if (existing) {
      return { state, roster: existing };
    }
    const newRoster: ServiceRoster = {
      id: rosterKey,
      serviceId: activeServiceId,
      date: selectedDate,
      assignments: {},
      updatedAt: new Date().toISOString(),
    };
    return {
      state: {
        ...state,
        rosters: {
          ...state.rosters,
          [rosterKey]: newRoster,
        },
      },
      roster: newRoster,
    };
  };

  const assignCoworker = (roleId: string, coworkerId: string) => {
    setChurchState((prev) => {
      const { state, roster } = ensureRoster(prev);
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
          [rosterKey]: updatedRoster,
        },
      };
    });
  };

  const removeAssignment = (roleId: string, coworkerId: string) => {
    setChurchState((prev) => {
      const roster = prev.rosters[rosterKey];
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
          [rosterKey]: updatedRoster,
        },
      };
    });
  };

  const updateRosterMeta = (patch: { theme?: string; speaker?: string; notes?: string }) => {
    setChurchState((prev) => {
      const { state, roster } = ensureRoster(prev);
      const updatedRoster: ServiceRoster = {
        ...roster,
        ...patch,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        rosters: {
          ...state.rosters,
          [rosterKey]: updatedRoster,
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

  const deleteCoworker = (id: string) => {
    setChurchState((prev) => ({
      ...prev,
      coworkers: prev.coworkers.filter((cw) => cw.id !== id),
    }));
  };

  const getCoworkerConflictRoles = (coworkerId: string): string[] => {
    if (!currentRoster) return [];
    const rolesAssigned: string[] = [];
    for (const [roleId, ids] of Object.entries(currentRoster.assignments)) {
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
        assignCoworker,
        removeAssignment,
        updateRosterMeta,
        addCoworker,
        updateCoworker,
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
