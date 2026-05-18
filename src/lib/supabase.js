import { createClient } from '@supabase/supabase-js';

// VITE_ vars are PUBLIC by design (Vercel warns about this explicitly).
// Fallback values are safe to hardcode for the anon/publishable key.
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://mekajxpzcwwnsnxiscns.supabase.co';
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MYlqjgNzQdTMPzMUFqHI8Q_EIV0mDgd';

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
});
