import { supabase, isSupabaseConfigured } from './supabase';
import { getAdminSessionToken } from './adminSession';
import type {
  Coworker,
  ServiceDefinition,
  ServiceRoster,
  ServiceException,
  ChurchState,
  RoleCategoryId,
  WorshipSong,
} from '../types';

interface DBCoworker {
  id: string;
  name: string;
  english_name: string | null;
  phone: string | null;
  cell_group: string;
  qualified_role_ids: string[];
  notes: string | null;
  active: boolean;
  avatar: string | null;
  birthday: string | null;
  updated_at: string;
}

interface DBService {
  id: string;
  name: string;
  short_name: string;
  weekday: number;
  time: string;
  rehearsal_time: string;
  venue: string;
  category_ids: RoleCategoryId[];
  updated_at: string;
}

interface DBRoster {
  id: string;
  service_id: string;
  date: string;
  assignments: Record<string, string[]>;
  songs: WorshipSong[] | null;
  duty_notes: Record<string, string> | null;
  special_events: string[] | null;
  theme: string | null;
  speaker: string | null;
  notes: string | null;
  updated_at: string;
}

interface DBServiceException {
  id: string;
  service_id: string;
  date: string;
  status: 'cancelled' | 'notice';
  note: string | null;
  updated_at: string;
}

export const dbToCoworker = (db: DBCoworker): Coworker => ({
  id: db.id,
  name: db.name,
  englishName: db.english_name || '',
  phone: db.phone || '',
  cellGroup: db.cell_group || '同工',
  qualifiedRoleIds: Array.isArray(db.qualified_role_ids) ? db.qualified_role_ids : [],
  notes: db.notes || undefined,
  active: db.active ?? true,
  avatar: db.avatar || undefined,
  birthday: db.birthday || undefined,
});

export const coworkerToDB = (cw: Coworker): DBCoworker => ({
  id: cw.id,
  name: cw.name,
  english_name: cw.englishName || null,
  phone: cw.phone || null,
  cell_group: cw.cellGroup,
  qualified_role_ids: cw.qualifiedRoleIds || [],
  notes: cw.notes || null,
  active: cw.active,
  avatar: cw.avatar || null,
  birthday: cw.birthday || null,
  updated_at: new Date().toISOString(),
});

export const dbToService = (db: DBService): ServiceDefinition => ({
  id: db.id,
  name: db.name,
  shortName: db.short_name,
  weekday: db.weekday,
  time: db.time,
  rehearsalTime: db.rehearsal_time,
  venue: db.venue,
  categoryIds: Array.isArray(db.category_ids) ? db.category_ids : [],
});

export const serviceToDB = (s: ServiceDefinition): DBService => ({
  id: s.id,
  name: s.name,
  short_name: s.shortName,
  weekday: s.weekday,
  time: s.time,
  rehearsal_time: s.rehearsalTime,
  venue: s.venue,
  category_ids: s.categoryIds || [],
  updated_at: new Date().toISOString(),
});

export const dbToRoster = (db: DBRoster): ServiceRoster => ({
  id: db.id,
  serviceId: db.service_id,
  date: db.date,
  assignments: typeof db.assignments === 'object' && db.assignments !== null ? db.assignments : {},
  songs: Array.isArray(db.songs) ? db.songs : undefined,
  dutyNotes: typeof db.duty_notes === 'object' && db.duty_notes !== null ? db.duty_notes : undefined,
  specialEvents: Array.isArray(db.special_events) ? db.special_events : undefined,
  theme: db.theme || undefined,
  speaker: db.speaker || undefined,
  notes: db.notes || undefined,
  updatedAt: db.updated_at || new Date().toISOString(),
});

export const rosterToDB = (r: ServiceRoster): DBRoster => ({
  id: r.id,
  service_id: r.serviceId,
  date: r.date,
  assignments: r.assignments || {},
  songs: r.songs || null,
  duty_notes: r.dutyNotes || null,
  special_events: r.specialEvents || null,
  theme: r.theme || null,
  speaker: r.speaker || null,
  notes: r.notes || null,
  updated_at: r.updatedAt || new Date().toISOString(),
});

export const dbToServiceException = (db: DBServiceException): ServiceException => ({
  id: db.id,
  serviceId: db.service_id,
  date: db.date,
  status: db.status === 'cancelled' ? 'cancelled' : 'notice',
  note: db.note || undefined,
  updatedAt: db.updated_at || new Date().toISOString(),
});

export const serviceExceptionToDB = (exception: ServiceException): DBServiceException => ({
  id: exception.id,
  service_id: exception.serviceId,
  date: exception.date,
  status: exception.status,
  note: exception.note || null,
  updated_at: exception.updatedAt || new Date().toISOString(),
});

export interface RemoteData {
  coworkers: Coworker[];
  services: ServiceDefinition[];
  rosters: Record<string, ServiceRoster>;
  serviceExceptions: Record<string, ServiceException>;
}

const writeAdminData = async (body: Record<string, unknown>): Promise<boolean> => {
  const sessionToken = getAdminSessionToken();
  if (!supabase || !isSupabaseConfigured() || !sessionToken) return false;
  try {
    const { data, error } = await supabase.functions.invoke<{ ok?: boolean }>('admin-data', {
      body,
      headers: { 'x-admin-session': sessionToken },
    });
    if (error || !data?.ok) {
      console.error('Admin data write failed', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Admin data write failed', error);
    return false;
  }
};

// Fetch all cloud data
export const fetchRemoteChurchData = async (): Promise<RemoteData | null> => {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const [coworkersRes, servicesRes, rostersRes, exceptionsRes] = await Promise.all([
      supabase.from('coworkers').select('*'),
      supabase.from('services').select('*'),
      supabase.from('rosters').select('*'),
      supabase.from('service_exceptions').select('*'),
    ]);

    if (coworkersRes.error || servicesRes.error || rostersRes.error || exceptionsRes.error) {
      console.warn('Supabase fetch error:', {
        cwErr: coworkersRes.error,
        svcErr: servicesRes.error,
        rstErr: rostersRes.error,
        exceptionErr: exceptionsRes.error,
      });
      return null;
    }

    const coworkers = (coworkersRes.data as DBCoworker[]).map(dbToCoworker);
    const services = (servicesRes.data as DBService[]).map(dbToService);
    const rostersRecord: Record<string, ServiceRoster> = {};
    for (const rawRoster of (rostersRes.data as DBRoster[])) {
      const roster = dbToRoster(rawRoster);
      rostersRecord[roster.id] = roster;
    }

    const serviceExceptions: Record<string, ServiceException> = {};
    for (const rawException of (exceptionsRes.data as DBServiceException[])) {
      const exception = dbToServiceException(rawException);
      serviceExceptions[exception.id] = exception;
    }

    return { coworkers, services, rosters: rostersRecord, serviceExceptions };
  } catch (err) {
    console.error('Failed to load from Supabase:', err);
    return null;
  }
};

// Seed remote DB with local initialState if cloud is completely empty
export const seedRemoteDatabase = async (initialState: ChurchState): Promise<boolean> => {
  const writes = [
    writeAdminData({ action: 'upsert', table: 'coworkers', records: initialState.coworkers.map(coworkerToDB) }),
    writeAdminData({ action: 'upsert', table: 'services', records: initialState.services.map(serviceToDB) }),
    writeAdminData({ action: 'upsert', table: 'rosters', records: Object.values(initialState.rosters).map(rosterToDB) }),
  ];
  const initialExceptions = Object.values(initialState.serviceExceptions || {});
  if (initialExceptions.length > 0) {
    writes.push(writeAdminData({ action: 'upsert', table: 'service_exceptions', records: initialExceptions.map(serviceExceptionToDB) }));
  }
  const results = await Promise.all(writes);
  return results.every(Boolean);
};

// Upsert single roster
export const upsertRemoteRoster = async (roster: ServiceRoster): Promise<boolean> => {
  return writeAdminData({ action: 'upsert', table: 'rosters', records: [rosterToDB(roster)] });
};

// Upsert single coworker
export const upsertRemoteCoworker = async (coworker: Coworker): Promise<boolean> => {
  return writeAdminData({ action: 'upsert', table: 'coworkers', records: [coworkerToDB(coworker)] });
};

// Delete coworker
export const deleteRemoteCoworker = async (coworkerId: string): Promise<boolean> => {
  return writeAdminData({ action: 'delete', table: 'coworkers', id: coworkerId });
};

// Upsert service
export const upsertRemoteService = async (service: ServiceDefinition): Promise<boolean> => {
  return writeAdminData({ action: 'upsert', table: 'services', records: [serviceToDB(service)] });
};

export const upsertRemoteServiceException = async (exception: ServiceException): Promise<boolean> => {
  return writeAdminData({ action: 'upsert', table: 'service_exceptions', records: [serviceExceptionToDB(exception)] });
};

export const deleteRemoteServiceException = async (exceptionId: string): Promise<boolean> => {
  return writeAdminData({ action: 'delete', table: 'service_exceptions', id: exceptionId });
};

// Subscribe to real-time changes
export interface RealtimeHandlers {
  onRosterChange: (roster: ServiceRoster) => void;
  onCoworkerChange: (coworker: Coworker) => void;
  onCoworkerDelete: (coworkerId: string) => void;
  onServiceChange: (service: ServiceDefinition) => void;
  onServiceExceptionChange: (exception: ServiceException) => void;
  onServiceExceptionDelete: (exceptionId: string) => void;
}

export const subscribeToRealtimeChanges = (handlers: RealtimeHandlers): (() => void) => {
  if (!supabase || !isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('cccjb-realtime-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rosters' },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = dbToRoster(payload.new as DBRoster);
          handlers.onRosterChange(updated);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'service_exceptions' },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          handlers.onServiceExceptionChange(dbToServiceException(payload.new as DBServiceException));
        } else if (payload.eventType === 'DELETE') {
          handlers.onServiceExceptionDelete((payload.old as { id: string }).id);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'coworkers' },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = dbToCoworker(payload.new as DBCoworker);
          handlers.onCoworkerChange(updated);
        } else if (payload.eventType === 'DELETE') {
          handlers.onCoworkerDelete((payload.old as { id: string }).id);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'services' },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updated = dbToService(payload.new as DBService);
          handlers.onServiceChange(updated);
        }
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
};
