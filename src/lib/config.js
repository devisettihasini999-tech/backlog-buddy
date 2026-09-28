// Public app configuration.
// The Supabase *publishable* key is designed to be exposed to browsers.
// The service-role key is NEVER used by the client — only by server-side scripts.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jcltcmildaclwjkxgrgu.supabase.co'

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_oQ3QJgOLqZj6cWQ8oU_EYg_h6zayHTv'

export const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'buddy123'

export const APP_NAME = 'Backlog Buddy'
export const TAGLINE = 'Prepare Smart. Clear Your Backlogs.'
