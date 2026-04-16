import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isMock = !supabaseUrl || !supabaseAnonKey;

// In mock mode export a harmless dummy so imports don't crash
export const supabase = isMock
  ? {
      auth: {
        signOut: () => {},
        getSession: () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    }
  : createClient(supabaseUrl, supabaseAnonKey);
