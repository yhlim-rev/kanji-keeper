'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Kanji, L } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'

const LEVELS = ['N5', 'N4', 'N3', 'N2']

export default function Dictionary() {
  const { t, lang } = useI18n()
  const [level, setLevel] = useState('N5')
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Kanji[] | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => { // /dictionary?level=N4
    const l = new URLSearchParams(window.location.search).get('level')
    if (l && LEVELS.includes(l)) setLevel(l)
  }, [])

  useEffect(() => {
    setRows(null); setErr(false)
    supabase.from('kanji')
      .select('id,character,level,onyomi,kunyomi,meaning_en,meaning_ja,meaning_zh')
      .eq('level', level).order('id')
      .then(({ data, error }) => (error ? setErr(true) : setRows(data as unknown as Kanji[])))
  }, [level])

  const s = q.trim().toLowerCase()
  const list = (rows ?? []).filter(k =>
    !s || [k.character, k.onyomi, k.kunyomi, k.meaning_en, k.meaning_ja, k.meaning_zh].join(' ').toLowerCase().includes(s))

  return (
    <>
      <h1>{t('dict')}</h1>
      <div className="row">
        <input aria-label={t('search')} placeholder={t('search')} value={q} onChange={e => setQ(e.target.value)} />
        <div className="pill" role="group" aria-label={t('level')}>
          {LEVELS.map(l => <button key={l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>{l}</button>)}
          <button disabled title={t('soon')}>N1 · {t('soon')}</button>
        </div>
      </div>
      {err && <p className="m">{t('err')}</p>}
      {!err && !rows && <p className="m">{t('load')}</p>}
      {rows && !list.length && <p className="m">{t('empty')}</p>}
      <div className="grid">
        {list.map(k => (
          <Link key={k.id} href={`/kanji/${k.id}`} className="card tile">
            <div className="k" style={{ fontSize: 44, lineHeight: 1.2 }}>{k.character}</div>
            <div>{(k.kunyomi || k.onyomi || '').split(';')[0]}</div>
            <div className="m" style={{ fontSize: 13 }}>{L(k, 'meaning', lang)}</div>
          </Link>
        ))}
      </div>
    </>
  )
}
