import { supabase } from './supabase';

export interface AdminSession {
  token: string;
  expiresAt: string;
}

const ADMIN_SESSION_KEY = 'calvary_admin_session';

export const isAdminSessionActive = (session: AdminSession | null): session is AdminSession => {
  if (!session?.token || !session.expiresAt) return false;
  const expiresAt = Date.parse(session.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
};

export const loadAdminSession = (): AdminSession | null => {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (isAdminSessionActive(session)) return session;
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // Treat malformed or unavailable local storage as a signed-out state.
  }
  return null;
};

const saveAdminSession = (session: AdminSession) => {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const clearAdminSession = () => {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // No action needed when storage is unavailable.
  }
};

export const getAdminSessionToken = (): string | null => {
  const session = loadAdminSession();
  return session?.token ?? null;
};

export const startAdminSession = async (
  pin: string,
): Promise<{ session?: AdminSession; error?: string }> => {
  if (!supabase) {
    return { error: '管理验证尚未配置。' };
  }

  const { data, error } = await supabase.functions.invoke<AdminSession>('verify-admin-pin', {
    body: { pin },
  });

  if (error || !data || !isAdminSessionActive(data)) {
    return { error: 'PIN 不正确或管理验证暂时无法使用。' };
  }

  saveAdminSession(data);
  return { session: data };
};
