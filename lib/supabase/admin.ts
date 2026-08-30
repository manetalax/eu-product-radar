import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret?.startsWith('sb_secret_')) throw new Error('Falta configurar SUPABASE_SECRET_KEY en Netlify.');
  const { url } = supabaseConfig();
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
