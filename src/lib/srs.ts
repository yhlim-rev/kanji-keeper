import { supabase, Kanji } from './supabase'

const DAY = 86400000
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Spaced repetition (SM-2 style): right answer = longer gap, wrong answer = back to tomorrow.
export async function saveResult(userId: string, kanjiId: number, ok: boolean) {
  const { data } = await supabase.from('user_progress').select('*').eq('user_id', userId).eq('kanji_id', kanjiId).maybeSingle()
  const c = data ?? { ease: 2.5, interval_days: 0, repetitions: 0, times_correct: 0, times_wrong: 0 }
  const reps = ok ? c.repetitions + 1 : 0
  const ease = ok ? c.ease : Math.max(1.3, c.ease - 0.2)
  const interval = !ok || reps === 1 ? 1 : reps === 2 ? 3 : Math.round(c.interval_days * ease)
  await supabase.from('user_progress').upsert({
    user_id: userId, kanji_id: kanjiId, ease, repetitions: reps, interval_days: interval,
    due_at: new Date(Date.now() + interval * DAY).toISOString(),
    times_correct: c.times_correct + (ok ? 1 : 0), times_wrong: c.times_wrong + (ok ? 0 : 1),
  })
  await supabase.from('study_days').upsert({ user_id: userId, day: ymd(new Date()) })
}

// Today's review: due cards first, then new kanji (lowest id = N5 first)
export function pickReview(pool: Kanji[], prog: { kanji_id: number; due_at: string }[], n = 10): Kanji[] {
  const byId = new Map(pool.map(k => [k.id, k])), seen = new Set(prog.map(p => p.kanji_id)), now = Date.now()
  const due = prog.filter(p => new Date(p.due_at).getTime() <= now).sort((a, b) => a.due_at.localeCompare(b.due_at))
    .map(p => byId.get(p.kanji_id)).filter(Boolean) as Kanji[]
  return [...due, ...pool.filter(k => !seen.has(k.id))].slice(0, n)
}

// Numbers for the home page: due today, learned (answered right twice in a row), streak in days
export async function getStats(userId: string) {
  const [p, d] = await Promise.all([
    supabase.from('user_progress').select('repetitions,due_at').eq('user_id', userId),
    supabase.from('study_days').select('day').eq('user_id', userId).order('day', { ascending: false }).limit(400),
  ])
  const rows = p.data ?? [], now = Date.now()
  const days = new Set((d.data ?? []).map(r => r.day as string))
  const dt = new Date()
  if (!days.has(ymd(dt))) dt.setDate(dt.getDate() - 1) // a streak survives until the end of today
  let streak = 0
  while (days.has(ymd(dt))) { streak++; dt.setDate(dt.getDate() - 1) }
  return { due: rows.filter(r => new Date(r.due_at).getTime() <= now).length, learned: rows.filter(r => r.repetitions >= 2).length, streak }
}
