// Cliente Supabase sin Realtime para evitar errores de WebSocket
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Cliente Supabase completamente sin Realtime
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  // Sin configuración de realtime para evitar WebSocket
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

// Deshabilitar Realtime después de crear el cliente
if (supabase.realtime) {
  supabase.realtime.disconnect();
}
