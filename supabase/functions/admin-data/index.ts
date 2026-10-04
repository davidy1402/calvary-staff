import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, sha256Base64Url } from '../_shared/admin.ts';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const writableTables = new Set(['coworkers', 'services', 'rosters']);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const token = request.headers.get('x-admin-session');
    if (!token) return json({ error: 'Unauthorized' }, 401);
    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceRoleKey) throw new Error('Supabase service configuration is unavailable');
    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
    const { data: session, error: sessionError } = await admin
      .from('admin_sessions')
      .select('token_hash')
      .eq('token_hash', await sha256Base64Url(token))
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return json({ error: 'Unauthorized' }, 401);

    const body = await request.json();
    const table = body.table;
    if (typeof table !== 'string' || !writableTables.has(table)) return json({ error: 'Invalid table' }, 400);

    if (body.action === 'upsert' && Array.isArray(body.records) && body.records.length > 0) {
      const { error } = await admin.from(table).upsert(body.records);
      if (error) throw error;
      return json({ ok: true });
    }

    if (body.action === 'delete' && table === 'coworkers' && typeof body.id === 'string') {
      const { error } = await admin.from('coworkers').delete().eq('id', body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: 'Invalid operation' }, 400);
  } catch (error) {
    console.error('Admin data operation failed', error);
    return json({ error: 'Admin operation unavailable' }, 503);
  }
});
