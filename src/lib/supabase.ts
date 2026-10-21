import { createClient } from '@supabase/supabase-js';

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.trim() !== '' && 
  supabaseKey.trim() !== '' &&
  !supabaseUrl.includes('YOUR_')
);

// If configured, instantiate the official client; otherwise create a dummy client or null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const supabaseConfig = {
  url: supabaseUrl,
  hasKey: Boolean(supabaseKey),
  isConfigured: isSupabaseConfigured,
};
