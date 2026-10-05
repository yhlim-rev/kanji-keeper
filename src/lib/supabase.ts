import { createClient } from '@supabase/supabase-js'

// =====================================================================
// 1. PASTE YOUR SUPABASE DETAILS HERE  (Supabase dashboard > Project Settings > API)
//    You can either replace the two PASTE_... texts below, or put the
//    values in .env.local (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
// =====================================================================

// Project URL, looks like https://abcdefgh.supabase.co
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'PASTE_YOUR_PROJECT_URL_HERE'

// The public key (called "anon" or "publishable"). It is safe in the browser because
// Row Level Security protects your data. NEVER paste the secret / service_role key here.
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'PASTE_YOUR_ANON_PUBLIC_KEY_HERE'

// false until both values above are filled in (the app then shows a setup banner)
export const isConfigured = SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('PASTE')

export const supabase = createClient(
  isConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isConfigured ? SUPABASE_ANON_KEY : 'placeholder'
)

export type Lang = 'en' | 'ja' | 'zh'
export type Kanji = {
  id: number; character: string; level: string; stroke_count: number; radical: string
  onyomi: string; kunyomi: string
  meaning_en: string; meaning_ja: string; meaning_zh: string
  explanation_en: string; explanation_ja: string; explanation_zh: string
}
export type Word = { id: number; word: string; reading: string; meaning_en: string; meaning_ja: string; meaning_zh: string }
export type Sentence = { id: number; japanese: string; reading: string; translation_en: string; translation_zh: string }

// pick a field in the chosen language, falling back to English
export const L = (o: object, field: string, lang: Lang): string => {
  const r = o as Record<string, string | null | undefined>
  return r[`${field}_${lang}`] || r[`${field}_en`] || ''
}
