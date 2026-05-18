import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn('⚠️  Variables Supabase manquantes dans .env — vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder-anon-key',
  {
    auth: {
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: true,
    },
  }
);
