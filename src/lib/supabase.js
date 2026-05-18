import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.error('❌ VITE_SUPABASE_URL manquante ou invalide:', supabaseUrl);
}
if (!supabaseAnon || supabaseAnon.includes('placeholder')) {
  console.error('❌ VITE_SUPABASE_ANON_KEY manquante ou invalide');
}

console.log('🔗 Supabase URL:', supabaseUrl || 'NON DÉFINIE');

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

