import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isLocalDev = import.meta.env.DEV

// Check if Supabase is configured
export const isSupabaseConfigured = !isLocalDev
  && !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url')

// Create client only if configured (avoid errors on missing config)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
