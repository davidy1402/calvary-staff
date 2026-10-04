import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Coworker,
  ServiceDefinition,
  ServiceRoster,
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

export interface RemoteData {
  coworkers: Coworker[];
  services: ServiceDefinition[];
  rosters: Record<string, ServiceRoster>;
}

// Fetch all cloud data
export const fetchRemoteChurchData = async (): Promise<RemoteData | null> => {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const [coworkersRes, servicesRes, rostersRes] = await Promise.all([
      supabase.from('coworkers').select('*'),
      supabase.from('services').select('*'),
      supabase.from('rosters').select('*'),
    ]);

    if (coworkersRes.error || servicesRes.error || rostersRes.error) {
      console.warn('Supabase fetch error:', {
        cwErr: coworkersRes.error,
        svcErr: servicesRes.error,
        rstErr: rostersRes.error,
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

    return { coworkers, services, rosters: rostersRecord };
  } catch (err) {
    console.error('Failed to load from Supabase:', err);
    return null;
  }
};

// Seed remote DB with local initialState if cloud is completely empty
export const seedRemoteDatabase = async (initialState: ChurchState): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured()) return false;

  try {
    const dbCoworkers = initialState.coworkers.map(coworkerToDB);
    const dbServices = initialState.services.map(serviceToDB);
    const dbRosters = Object.values(initialState.rosters).map(rosterToDB);

    if (dbCoworkers.length > 0) {
      await supabase.from('coworkers').upsert(dbCoworkers);
    }
    if (dbServices.length > 0) {
      await supabase.from('services').upsert(dbServices);
    }
    if (dbRosters.length > 0) {
      await supabase.from('rosters').upsert(dbRosters);
    }

    return true;
  } catch (err) {
    console.error('Failed to seed Supabase database:', err);
    return false;
  }
};

// Upsert single roster
export const upsertRemoteRoster = async (roster: ServiceRoster): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('rosters').upsert(rosterToDB(roster));
    if (error) console.error('Failed to upsert roster to Supabase:', error);
    return !error;
  } catch (e) {
    console.error('Supabase roster upsert error:', e);
    return false;
  }
};

// Upsert single coworker
export const upsertRemoteCoworker = async (coworker: Coworker): Promise<void> => {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    const dbRow = coworkerToDB(coworker);
    const { error } = await supabase.from('coworkers').upsert(dbRow);
    if (error) console.error('Failed to upsert coworker to Supabase:', error);
  } catch (e) {
    console.error('Supabase coworker upsert error:', e);
  }
};

// Delete coworker
export const deleteRemoteCoworker = async (coworkerId: string): Promise<void> => {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('coworkers').delete().eq('id', coworkerId);
    if (error) console.error('Failed to delete coworker from Supabase:', error);
  } catch (e) {
    console.error('Supabase coworker delete error:', e);
  }
};

// Upsert service
export const upsertRemoteService = async (service: ServiceDefinition): Promise<void> => {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    const dbRow = serviceToDB(service);
    const { error } = await supabase.from('services').upsert(dbRow);
    if (error) console.error('Failed to upsert service to Supabase:', error);
  } catch (e) {
    console.error('Supabase service upsert error:', e);
  }
};

// Subscribe to real-time changes
export interface RealtimeHandlers {
  onRosterChange: (roster: ServiceRoster) => void;
  onCoworkerChange: (coworker: Coworker) => void;
  onCoworkerDelete: (coworkerId: string) => void;
  onServiceChange: (service: ServiceDefinition) => void;
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
