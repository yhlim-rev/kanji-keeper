'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Kanji, Word, Sentence, L } from '@/lib/supabase'
import { useI18n, LangPills } from '@/lib/i18n'

type Full = Kanji & { words: Word[]; sentences: Sentence[] }

export default function KanjiPage() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useI18n()
  const [k, setK] = useState<Full | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    supabase.from('kanji').select('*, words(*), sentences(*)').eq('id', id).single()
      .then(({ data, error }) => (error ? setErr(true) : setK(data as unknown as Full)))
  }, [id])

  if (err) return <p className="m">{t('err')}</p>
  if (!k) return <p className="m">{t('load')}</p>

  const sents = [...k.sentences].sort((a, b) => a.id - b.id)
  return (
    <>
      <div className="row"><Link href="/dictionary" className="m">{t('back')}</Link><LangPills /></div>
      <div className="two">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="k" style={{ fontSize: 150, lineHeight: 1.15 }}>{k.character}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="chip">{k.level}</span>
            <span className="chip">{k.stroke_count} {t('strokes')}</span>
            <span className="chip">{k.radical}</span>
          </div>
        </div>
        <div className="stack">
          <div className="card sec s1">
            <h2 style={{ marginTop: 0 }}>{t('meaning')}</h2>
            <p style={{ fontSize: 24, margin: '0 0 12px' }}>{L(k, 'meaning', lang)}</p>
            <p className="m" style={{ margin: 0 }}><b className="c-on">{t('on')}</b>: {k.onyomi.replaceAll(';', '、')}</p>
            <p className="m" style={{ margin: 0 }}><b className="c-kun">{t('kun')}</b>: {k.kunyomi ? k.kunyomi.replaceAll(';', '、') : '–'}</p>
          </div>
          <div className="card sec s2"><h2 style={{ marginTop: 0 }}>{t('tip')}</h2><p style={{ margin: 0 }}>{L(k, 'explanation', lang)}</p></div>
          <div className="card sec s3">
            <h2 style={{ marginTop: 0 }}>{t('words')}</h2>
            {k.words.map(w => (
              <p key={w.id} style={{ margin: '6px 0' }}>
                <span style={{ fontSize: 20 }}>{w.word}</span> <span className="m">{w.reading} — {L(w, 'meaning', lang)}</span>
              </p>
            ))}
          </div>
          <div className="card sec s4">
            <h2 style={{ marginTop: 0 }}>{t('sents')}</h2>
            {sents.map(s => (
              <div key={s.id} style={{ margin: '10px 0' }}>
                <div style={{ fontSize: 18 }}>{s.japanese}</div>
                <div className="m" style={{ fontSize: 14 }}>{s.reading}</div>
                {lang !== 'ja' && <div className="m">{lang === 'zh' ? s.translation_zh : s.translation_en}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
