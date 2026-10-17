import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.ts'

// Retrieve environment variables with fallback support for Vite and Next.js naming conventions
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-supabase-publishable-key'
)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Stardewpedia] Supabase environment variables are missing or default. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.'
  )
}

// Fallback dummy URL and key to prevent createClient throwing synchronous errors during initial dev
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-anon-key'

/**
 * Primary Supabase client for client-side interactions.
 * Uses the publishable/anon key with Row Level Security (RLS) enforcement.
 */
export const supabase = createClient<Database>(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Scoped query helper for the 'game' schema (items, crops, fish, villagers).
 */
export const gameClient = supabase.schema('game')

/**
 * Scoped query helper for the 'app' schema (profiles, farms, progress, plans).
 */
export const appClient = supabase.schema('app')
