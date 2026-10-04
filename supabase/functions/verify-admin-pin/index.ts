import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, createOpaqueToken, pinMatchesConfiguredHash, sha256Base64Url } from '../_shared/admin.ts';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { pin } = await request.json();
    if (typeof pin !== 'string' || !/^\d{4,12}$/.test(pin)) return json({ error: 'Invalid credentials' }, 401);

    if (!await pinMatchesConfiguredHash(pin)) return json({ error: 'Invalid credentials' }, 401);

    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceRoleKey) throw new Error('Supabase service configuration is unavailable');

    const token = createOpaqueToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
    const { error } = await admin.from('admin_sessions').insert({
      token_hash: await sha256Base64Url(token),
      expires_at: expiresAt,
    });
    if (error) throw error;

    return json({ token, expiresAt });
  } catch (error) {
    console.error('Admin PIN verification failed', error);
    return json({ error: 'Admin verification unavailable' }, 503);
  }
});
