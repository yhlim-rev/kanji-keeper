'use client'
import { useEffect, useState } from 'react'
import { supabase, Kanji, L } from '@/lib/supabase'
import { useI18n, LangPills } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { saveResult, pickReview } from '@/lib/srs'

// fwd: kanji shown, pick the meaning | rev: meaning shown, pick the kanji | read: kanji shown, pick the reading
type Kind = 'fwd' | 'rev' | 'read'
type Opt = { k: Kanji; reading?: string } // k = the kanji this option belongs to
type Q = { k: Kanji; kind: Kind; opts: Opt[] }
const COLS = 'id,character,level,onyomi,kunyomi,meaning_en,meaning_ja,meaning_zh'

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const clean = (r: string) => r.replace(/-/g, '').replace(/\./g, '・') // やす.む -> やす・む
const list = (s: string | null) => (s ?? '').split(';').filter(Boolean).map(clean)
const readings = (k: Kanji) => [...list(k.onyomi), ...list(k.kunyomi)]

function build(k: Kanji, pool: Kanji[], kind: Kind): Q {
  const others = shuffle(pool.filter(x => x.id !== k.id))
  if (kind === 'read') {
    const types = [list(k.onyomi).length && 'on', list(k.kunyomi).length && 'kun'].filter(Boolean) as ('on' | 'kun')[]
    const type = shuffle(types)[0]
    const pick = (x: Kanji) => list(type === 'on' ? x.onyomi : x.kunyomi)[0]
    const own = new Set(readings(k)) // a wrong option must not be a valid reading of this kanji
    const seen = new Set<string>()
    const wrong: Opt[] = []
    for (const o of others) {
      const r = pick(o)
      if (r && !own.has(r) && !seen.has(r)) { seen.add(r); wrong.push({ k: o, reading: r }) }
      if (wrong.length === 3) break
    }
    if (wrong.length === 3) return { k, kind, opts: shuffle([{ k, reading: pick(k) }, ...wrong]) }
    kind = 'fwd' // not enough distinct readings in this level, fall back to a meaning question
  }
  return { k, kind, opts: shuffle([{ k }, ...others.slice(0, 3).map(o => ({ k: o }))]) }
}

export default function Quiz() {
  const { t, lang } = useI18n()
  const [level, setLevel] = useState('N5')
  const [n, setN] = useState(10)
  const [mode, setMode] = useState<'meaning' | 'reading' | 'mixed'>('mixed')
  const [qs, setQs] = useState<Q[] | null>(null)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null) // index of the chosen option
  const [score, setScore] = useState(0)
  const [err, setErr] = useState(false)
  const { user } = useAuth()

  async function start() {
    setErr(false)
    const { data, error } = await supabase.from('kanji')
      .select('id,character,level,onyomi,kunyomi,meaning_en,meaning_ja,meaning_zh').eq('level', level)
    if (error || !data || data.length < 4) return setErr(true)
    const pool = data as unknown as Kanji[]
    const kinds: Kind[] = mode === 'meaning' ? ['fwd', 'rev'] : mode === 'reading' ? ['read'] : ['fwd', 'rev', 'read']
    setQs(shuffle(pool).slice(0, Math.min(n, pool.length)).map(k => build(k, pool, shuffle(kinds)[0])))
    setI(0); setPicked(null); setScore(0)
  }

  // /quiz?review=1 : today's review (due cards first, then new kanji), answers are saved for spaced repetition
  async function startReview() {
    if (!user) return
    const [{ data: all }, { data: prog }] = await Promise.all([
      supabase.from('kanji').select(COLS).order('id'),
      supabase.from('user_progress').select('kanji_id,due_at').eq('user_id', user.id)])
    if (!all || all.length < 4) return setErr(true)
    const pool = all as unknown as Kanji[]
    setLevel('復習')
    setQs(pickReview(pool, prog ?? [], 10).map(k => build(k, pool, shuffle<Kind>(['fwd', 'rev', 'read'])[0])))
    setI(0); setPicked(null); setScore(0)
  }
  useEffect(() => {
    if (user && new URLSearchParams(window.location.search).get('review')) startReview()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!qs) return (
    <>
      <h1>{t('quiz')}</h1>
      <div className="card stack">
        <label>{t('level')} <select value={level} onChange={e => setLevel(e.target.value)}>
          {['N5', 'N4', 'N3', 'N2'].map(l => <option key={l}>{l}</option>)}</select></label>
        <label>{t('count')} <select value={n} onChange={e => setN(+e.target.value)}>
          {[5, 10, 20, 50].map(c => <option key={c}>{c}</option>)}</select></label>
        <label>{t('mode')} <select value={mode} onChange={e => setMode(e.target.value as typeof mode)}>
          <option value="mixed">{t('mMixed')}</option>
          <option value="meaning">{t('mMeaning')}</option>
          <option value="reading">{t('mReading')}</option></select></label>
        <LangPills />
        <button className="btn" onClick={start}>{t('start')}</button>
        {err && <p className="m">{t('err')}</p>}
      </div>
    </>
  )

  if (i >= qs.length) return (
    <div className="card stack">
      <h1 style={{ margin: 0 }}>{t('score')}: {score} / {qs.length}</h1>
      <button className="btn" onClick={() => setQs(null)}>{t('again')}</button>
    </div>
  )

  const q = qs[i]
  const done = picked !== null
  const isRight = (o: Opt) => o.k.id === q.k.id
  const label = (o: Opt) => q.kind === 'rev' ? o.k.character : q.kind === 'fwd' ? L(o.k, 'meaning', lang) : o.reading
  const why = (o: Opt) => q.kind === 'read'
    ? `${o.reading} → ${o.k.character} (${L(o.k, 'meaning', lang)})${isRight(o) ? ` · ${readings(o.k).join('、')}` : ''}`
    : `${o.k.character} = ${L(o.k, 'meaning', lang)} (${readings(o.k).join('、')})`
  const cls = (o: Opt, idx: number) => (!done ? '' : isRight(o) ? 'ok' : idx === picked ? 'no' : '')

  return (
    <>
      <div className="row"><span className="chip">{level}</span><span className="m">{i + 1} / {qs.length}</span></div>
      <h2 style={{ fontSize: 28 }}>{q.kind === 'rev' ? t('rev', { m: L(q.k, 'meaning', lang) }) : q.kind === 'read' ? t('rd') : t('fwd')}</h2>
      {q.kind !== 'rev' && <div className="k" style={{ fontSize: 96, lineHeight: 1.2 }}>{q.k.character}</div>}
      <div className="opts">
        {q.opts.map((o, idx) => (
          <button key={idx} disabled={done} className={`card opt ${cls(o, idx)}`}
            style={q.kind === 'rev' ? { fontSize: 40, fontFamily: 'var(--serif)' } : { fontSize: 22 }}
            onClick={() => { setPicked(idx); if (isRight(o)) setScore(s => s + 1); if (user) saveResult(user.id, q.k.id, isRight(o)) }}>
            {label(o)}{done && (isRight(o) ? ' ✓' : idx === picked ? ' ✕' : '')}
          </button>
        ))}
      </div>
      {done && (
        <div className="card stack" aria-live="polite">
          <b style={{ color: isRight(q.opts[picked!]) ? 'var(--ok)' : 'var(--no)' }}>{isRight(q.opts[picked!]) ? t('right') : t('wrong')}</b>
          {q.opts.map((o, idx) => (
            <div key={idx} className="m"><span style={{ color: isRight(o) ? 'var(--ok)' : 'var(--no)' }}>
              {isRight(o) ? '✓' : '✕'}</span> {why(o)}</div>
          ))}
          <button className="btn" onClick={() => { setI(i + 1); setPicked(null) }}>{i + 1 === qs.length ? t('finish') : t('next')}</button>
        </div>
      )}
    </>
  )
}
