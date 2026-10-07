'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Kanji, L } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { getStats } from '@/lib/srs'

const LEVELS = [['N5', '入門', 'var(--ok)', '日月火'], ['N4', '初級', '#8fb4ff', '会社駅'], ['N3', '中級', '#f4c95d', '政治経'], ['N2', '中上級', 'var(--acc)', '維持環']]

export default function Home() {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const [kotd, setKotd] = useState<Kanji | null>(null)
  const [st, setSt] = useState<{ due: number; learned: number; streak: number } | null>(null)

  useEffect(() => { // same kanji all day, changes at midnight
    supabase.from('kanji').select('id,character,level,stroke_count,onyomi,kunyomi,meaning_en,meaning_ja,meaning_zh').eq('level', 'N5').order('id')
      .then(({ data }) => { if (data?.length) setKotd(data[Math.floor(Date.now() / 86400000) % data.length] as unknown as Kanji) })
  }, [])
  useEffect(() => { if (user) getStats(user.id).then(setSt); else setSt(null) }, [user])

  const stat = (label: string, v: number | undefined, unit: string, color: string) => (
    <div className="card stat"><span className="m">{label}</span><b style={{ color }}>{v ?? '–'} <small className="m">{unit}</small></b></div>
  )
  return (
    <>
      <div className="hero">
        <div>
          <span className="chip" style={{ color: 'var(--ok)' }}>{t('tag')}</span>
          <h1>{t('h1a')}<br /><span className="acc">{t('h1b')}</span></h1>
          <p className="m" style={{ fontSize: 17, maxWidth: 480 }}>{t('sub')}</p>
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <Link className="btn" href={user ? '/quiz?review=1' : '/login'}>{t('startReview')}</Link>
            <Link className="btn ghost" href="/quiz">{t('tryQuiz')}</Link>
          </div>
        </div>
        <Link href={kotd ? `/kanji/${kotd.id}` : '/dictionary'} className="card" style={{ textAlign: 'center', position: 'relative' }}>
          <span className="chip" style={{ position: 'absolute', left: 18, top: 18, color: '#f4c95d' }}>{t('kotd')}</span>
          <div className="k" style={{ fontSize: 140, lineHeight: 1.2, marginTop: 26 }}>{kotd?.character ?? '…'}</div>
          {kotd && <>
            <div style={{ fontSize: 22 }}>{[kotd.onyomi, kotd.kunyomi].map(r => (r || '').split(';')[0]).filter(Boolean).join(' ・ ')}</div>
            <div className="m">{L(kotd, 'meaning', lang)}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              <span className="chip">{kotd.level}</span><span className="chip">{kotd.stroke_count}{t('strokes')}</span></div>
          </>}
        </Link>
      </div>
      <div className="stats">
        {stat(t('dueToday'), st?.due, t('cards'), 'var(--ok)')}
        {stat(t('streak'), st?.streak, t('days'), 'var(--acc)')}
        {stat(t('learned'), st?.learned, t('kanjiUnit'), '#f4c95d')}
      </div>
      {!user && <p className="m"><Link href="/login" className="acc">{t('login')}</Link>：{t('loginHint')}</p>}
      <h2 style={{ margin: '32px 0 14px' }}>{t('browse')}</h2>
      <div className="lv">
        {LEVELS.map(([l, name, c, ex]) => (
          <Link key={l} href={`/dictionary?level=${l}`} className="card">
            <div style={{ fontSize: 30, fontWeight: 700, color: c }}>{l}</div>
            <div className="k" style={{ fontSize: 26, margin: '6px 0' }}>{ex}</div><span className="chip">{name}</span>
          </Link>
        ))}
        <div className="card" style={{ opacity: .7 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--no)' }}>N1</div>
          <div className="k" style={{ fontSize: 26, margin: '6px 0' }}>憂鬱薔</div><span className="chip" style={{ color: '#f4c95d' }}>{t('soon')}</span>
        </div>
      </div>
    </>
  )
}
