import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Admin client — service role key, bypasses RLS
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Regular client — anon key, used for signUp/signIn so Supabase enforces email confirmation
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
