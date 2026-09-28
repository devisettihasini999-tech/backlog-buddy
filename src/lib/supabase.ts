import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase connection for Backlog Buddy.
 *
 * The publishable (anon) key is designed to ship in the browser.
 * Table schema lives in /supabase/schema.sql — paste it once into the
 * Supabase SQL Editor and the app switches from demo data to live data
 * automatically (see fetchRemoteDataset).
 */
export const SUPABASE_URL =
  (import.meta.env?.VITE_SUPABASE_URL as string | undefined) ??
  'https://jcltcmildaclwjkxgrgu.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  'sb_publishable_oQ3QJgOLqZj6cWQ8oU_EYg_h6zayHTv';

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export type RemoteStatus = 'checking' | 'demo' | 'connected' | 'error';

let cachedStatus: RemoteStatus = 'checking';

export function remoteStatus(): RemoteStatus {
  return cachedStatus;
}

/**
 * Tries to load the full dataset from Supabase tables. Returns null when the
 * schema is not installed yet (demo mode) or on any error — callers fall back
 * to the built-in sample dataset so the UX is always complete.
 */
export async function fetchRemoteDataset(): Promise<{
  branches?: Record<string, unknown>[];
  subjects?: Record<string, unknown>[];
  papers?: Record<string, unknown>[];
  questions?: Record<string, unknown>[];
  materials?: Record<string, unknown>[];
} | null> {
  try {
    const sb = supabase();
    const [branches, subjects, papers, questions, materials] = await Promise.all([
      sb.from('branches').select('*').limit(200),
      sb.from('subjects').select('*').limit(1000),
      sb.from('question_papers').select('*').limit(2000),
      sb.from('questions').select('*').limit(5000),
      sb.from('study_materials').select('*').limit(2000),
    ]);
    const anyError =
      branches.error || subjects.error || papers.error || questions.error || materials.error;
    if (anyError) {
      cachedStatus = branches.error?.code === 'PGRST205' ? 'demo' : 'demo';
      return null;
    }
    if (!subjects.data || subjects.data.length === 0) {
      cachedStatus = 'demo';
      return null;
    }
    cachedStatus = 'connected';
    return {
      branches: branches.data ?? [],
      subjects: subjects.data ?? [],
      papers: papers.data ?? [],
      questions: questions.data ?? [],
      materials: materials.data ?? [],
    };
  } catch {
    cachedStatus = 'demo';
    return null;
  }
}
